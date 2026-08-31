"""
LexiMind Secure — AI Engine
Abstract interface + two implementations:
  1. OpenRouterAIEngine  — calls OpenRouter /chat/completions (active when API key set)
  2. RuleBasedAIEngine   — keyword/pattern matching (fallback when no API key)

The engine is resolved at call time via get_engine(), so you can set the API key
in .env and immediately get real AI responses without changing any other code.

To add a real LLM later (e.g., Google Gemini, Anthropic):
  - Implement AIEngine ABC
  - Return it from get_engine() based on a settings flag
"""
import abc
import json
import re
import logging
from typing import Optional

logger = logging.getLogger("apps.ai.engine")


# ─────────────────────────────────────────────────────────────────────────────
# Abstract interface
# ─────────────────────────────────────────────────────────────────────────────

class AIEngine(abc.ABC):

    @abc.abstractmethod
    def summarize_document(self, document) -> dict:
        """Return DocumentInsight dict."""
        ...

    @abc.abstractmethod
    def answer_case_question(self, case, question: str, history: list) -> dict:
        """Return {"answer": str, "sources": [str]}."""
        ...

    @abc.abstractmethod
    def semantic_search(self, query: str, case=None) -> list:
        """Return list of search result dicts."""
        ...

    @abc.abstractmethod
    def detect_contradictions(self, case) -> list:
        """Return list of contradiction dicts."""
        ...


# ─────────────────────────────────────────────────────────────────────────────
# OpenRouter Implementation
# ─────────────────────────────────────────────────────────────────────────────

class OpenRouterAIEngine(AIEngine):
    """
    Uses OpenRouter (https://openrouter.ai) with any free model.
    Default: meta-llama/llama-3.1-8b-instruct:free
    No external SDK needed — pure urllib calls via openrouter.py client.
    """

    SYSTEM_PROMPT = (
        "You are LexiMind, an AI assistant embedded in a government-grade legal investigation platform. "
        "You analyze case documents and answer questions accurately and concisely. "
        "You only use information from the provided documents. "
        "Respond in a professional, factual tone. "
        "Format your responses as plain text or minimal JSON when asked."
    )

    def _call(self, messages: list, max_tokens: int = 800) -> str:
        from .openrouter import chat_completion
        return chat_completion(messages, max_tokens=max_tokens, temperature=0.1)

    def _build_doc_context(self, document) -> str:
        """Build a context string from the document's extracted text."""
        text = getattr(document, "extracted_text", "") or ""
        if not text:
            return f"[Document: {document.name} — no extracted text available]"
        # Truncate to ~3000 chars to stay within token limits for free models
        return text[:3000]

    def _build_case_context(self, case) -> str:
        """Aggregate extracted text from all case documents."""
        from apps.documents.models import Document
        docs = Document.objects.filter(case=case).exclude(extracted_text="")[:8]
        parts = []
        for doc in docs:
            parts.append(f"=== {doc.name} ===\n{doc.extracted_text[:800]}")
        return "\n\n".join(parts) if parts else "[No document text available for this case]"

    def summarize_document(self, document) -> dict:
        context = self._build_doc_context(document)
        prompt = f"""Analyze the following legal document and respond with ONLY valid JSON matching this schema:
{{
  "summary": "<2-3 sentence summary of the document>",
  "entities": {{
    "people": ["<name>"],
    "organizations": ["<org>"],
    "locations": ["<location>"],
    "phones": ["<phone>"],
    "caseRefs": ["<case-id>"]
  }},
  "importantDates": [
    {{"date": "<DD MMM YYYY>", "event": "<what happened>", "source": "{document.name}"}}
  ],
  "findings": ["<key finding 1>", "<key finding 2>"]
}}

Document text:
{context}"""

        try:
            raw = self._call([
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ], max_tokens=1200)

            # Extract JSON from the response (handle markdown code blocks)
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                data = json.loads(raw)

            return {
                "summary": data.get("summary", ""),
                "entities": data.get("entities", {"people": [], "organizations": [], "locations": [], "phones": [], "caseRefs": []}),
                "importantDates": data.get("importantDates", []),
                "findings": data.get("findings", []),
                "relatedDocs": [],
            }
        except Exception as exc:
            logger.warning("OpenRouter summarize failed, falling back: %s", exc)
            return _rule_based_fallback().summarize_document(document)

    def answer_case_question(self, case, question: str, history: list) -> dict:
        context = self._build_case_context(case)

        # Build conversation history for multi-turn support
        messages = [{"role": "system", "content": self.SYSTEM_PROMPT}]
        # Add recent history (last 6 messages to stay within token limits)
        for msg in history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("text", "")})

        messages.append({
            "role": "user",
            "content": (
                f"Using ONLY the following case documents for {case.case_id}, "
                f"answer this question: {question}\n\n"
                f"Case Documents:\n{context}\n\n"
                f"Also list the document names you used as sources (as a JSON array at the end, "
                f'like: SOURCES: ["doc1.pdf", "doc2.pdf"])'
            ),
        })

        try:
            raw = self._call(messages, max_tokens=800)

            # Extract sources from the response
            sources = []
            sources_match = re.search(r'SOURCES:\s*(\[.*?\])', raw, re.DOTALL | re.IGNORECASE)
            if sources_match:
                try:
                    sources = json.loads(sources_match.group(1))
                    raw = raw[:sources_match.start()].strip()
                except json.JSONDecodeError:
                    pass

            # If no explicit sources, extract document names mentioned in the answer
            if not sources:
                from apps.documents.models import Document
                docs = Document.objects.filter(case=case).values_list("name", flat=True)
                sources = [d for d in docs if d.lower() in raw.lower()][:3]

            return {"answer": raw, "sources": sources}

        except Exception as exc:
            logger.warning("OpenRouter Q&A failed, falling back: %s", exc)
            return _rule_based_fallback().answer_case_question(case, question, history)

    def semantic_search(self, query: str, case=None) -> list:
        """Search documents using OpenRouter for relevance scoring."""
        from apps.documents.models import Document
        qs = Document.objects.exclude(extracted_text="")
        if case:
            qs = qs.filter(case=case)
        docs = list(qs[:10])

        if not docs:
            return _rule_based_fallback().semantic_search(query, case)

        doc_summaries = "\n".join(
            f"[{doc.short_id}] {doc.name} ({doc.case.case_id}): {doc.extracted_text[:200]}"
            for doc in docs
        )

        try:
            raw = self._call([
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": (
                    f"Given this search query: \"{query}\"\n\n"
                    f"From these documents, return the 3-4 most relevant ones as JSON array:\n"
                    f"{doc_summaries}\n\n"
                    f'Format: [{{"document": "<name>", "caseId": "<id>", "entity": "<key entity>", '
                    f'"context": "<relevant excerpt>", "date": "<date>", "type": "<type>", "source": "<source>"}}]'
                )},
            ], max_tokens=600)

            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return _rule_based_fallback().semantic_search(query, case)

        except Exception as exc:
            logger.warning("OpenRouter search failed, falling back: %s", exc)
            return _rule_based_fallback().semantic_search(query, case)

    def detect_contradictions(self, case) -> list:
        context = self._build_case_context(case)
        try:
            raw = self._call([
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": (
                    f"Analyze these documents from case {case.case_id} for contradictions or inconsistencies.\n\n"
                    f"{context}\n\n"
                    f"Return JSON array of contradictions found:\n"
                    f'[{{"title": "...", "statements": [{{"source": "...", "claim": "..."}}], '
                    f'"finding": "...", "status": "Requires Human Review"}}]'
                )},
            ], max_tokens=800)

            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return []

        except Exception as exc:
            logger.warning("OpenRouter contradiction detection failed, falling back: %s", exc)
            return _rule_based_fallback().detect_contradictions(case)


# ─────────────────────────────────────────────────────────────────────────────
# Rule-Based Fallback (no API key required)
# ─────────────────────────────────────────────────────────────────────────────

class RuleBasedAIEngine(AIEngine):
    """
    Keyword/entity matching engine — works without any API key.
    Used automatically when OPENROUTER_API_KEY is not set.
    Results are plausible but not LLM-quality.
    """

    ENTITY_PATTERNS = {
        "phones": r'\+?\d[\d\s\-\(\)]{8,}\d',
        "case_refs": r'CASE-\d{4}-\d{4}',
        "dates": r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}',
    }

    def summarize_document(self, document) -> dict:
        text = document.extracted_text or ""
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 30]
        summary = ". ".join(sentences[:3]) + "." if sentences else f"Document: {document.name}"

        phones = re.findall(self.ENTITY_PATTERNS["phones"], text)
        case_refs = re.findall(self.ENTITY_PATTERNS["case_refs"], text)

        # Extract capitalized multi-word phrases as potential names/orgs
        names = list(set(re.findall(r'(?:[A-Z][a-z]+\s+){1,3}[A-Z][a-z]+', text)))[:5]

        return {
            "summary": summary[:500],
            "entities": {
                "people": names[:3],
                "organizations": names[3:5],
                "locations": [],
                "phones": phones[:2],
                "caseRefs": list(set(case_refs)),
            },
            "importantDates": [],
            "findings": [sentences[i] for i in range(min(2, len(sentences))) if i > 0],
            "relatedDocs": [],
        }

    def answer_case_question(self, case, question: str, history: list) -> dict:
        from apps.documents.models import Document
        docs = Document.objects.filter(case=case).exclude(extracted_text="")
        q_lower = question.lower()

        relevant_docs = []
        relevant_text = ""

        for doc in docs:
            text = doc.extracted_text.lower()
            keywords = [w for w in q_lower.split() if len(w) > 3]
            if any(kw in text for kw in keywords):
                relevant_docs.append(doc.name)
                # Find the most relevant sentence
                for sentence in doc.extracted_text.split("."):
                    if any(kw in sentence.lower() for kw in keywords):
                        relevant_text += sentence.strip() + ". "
                        break

        if relevant_text:
            answer = (
                f"Based on the authorized documents attached to {case.case_id}: "
                f"{relevant_text.strip()}"
            )
        else:
            answer = (
                f"Based on the authorized documents attached to {case.case_id}, "
                f"the relevant details are drawn from the case's uploaded evidence "
                f"and cross-referenced automatically. No specific match found for your query."
            )

        return {
            "answer": answer,
            "sources": relevant_docs[:3] if relevant_docs else ["Case documents"],
        }

    def semantic_search(self, query: str, case=None) -> list:
        from apps.documents.models import Document
        qs = Document.objects.select_related("case").exclude(extracted_text="")
        if case:
            qs = qs.filter(case=case)

        results = []
        q_lower = query.lower()
        keywords = [w for w in q_lower.split() if len(w) > 3]

        for doc in qs[:20]:
            text = doc.extracted_text
            text_lower = text.lower()
            if not any(kw in text_lower for kw in keywords):
                continue
            # Find context snippet
            for sentence in text.split("."):
                if any(kw in sentence.lower() for kw in keywords):
                    results.append({
                        "document": doc.name,
                        "caseId": doc.case.case_id,
                        "entity": keywords[0].title() if keywords else "—",
                        "context": f"…{sentence.strip()[:200]}…",
                        "date": doc.uploaded_at.strftime("%d %b %Y"),
                        "type": doc.type,
                        "source": doc.case.case_id,
                    })
                    break
            if len(results) >= 4:
                break
        return results

    def detect_contradictions(self, case) -> list:
        # Without an LLM, return empty — can't reliably detect contradictions rule-based
        return []


# ─────────────────────────────────────────────────────────────────────────────
# Engine resolver — called by views
# ─────────────────────────────────────────────────────────────────────────────

_engine_cache: Optional[AIEngine] = None


def _rule_based_fallback() -> RuleBasedAIEngine:
    return RuleBasedAIEngine()


def get_engine() -> AIEngine:
    """
    Returns the configured AI engine:
      - OpenRouterAIEngine if OPENROUTER_API_KEY is set
      - RuleBasedAIEngine  if not (automatic fallback, zero config required)
    Cached per process.
    """
    global _engine_cache
    if _engine_cache is not None:
        return _engine_cache

    from .openrouter import is_configured
    if is_configured():
        logger.info("Using OpenRouterAIEngine (model: %s)", _get_model())
        _engine_cache = OpenRouterAIEngine()
    else:
        logger.warning(
            "OPENROUTER_API_KEY not set — using RuleBasedAIEngine. "
            "Set OPENROUTER_API_KEY in .env to enable real AI responses."
        )
        _engine_cache = RuleBasedAIEngine()
    return _engine_cache


def _get_model() -> str:
    from django.conf import settings
    return settings.OPENROUTER_MODEL


def reset_engine_cache():
    """Call this in tests to reset the singleton between test cases."""
    global _engine_cache
    _engine_cache = None

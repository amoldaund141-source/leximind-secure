"""
LexiMind Secure — AI Intelligence Views
All endpoints route through get_engine() which returns OpenRouterAIEngine
when OPENROUTER_API_KEY is set, else RuleBasedAIEngine automatically.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsActiveUser
from apps.cases.models import Case
from apps.documents.models import Document
from .models import (
    DocumentInsight, CaseQAThread, CaseQAMessage,
    Contradiction, TimelineEvent, KnowledgeGraphNode, KnowledgeGraphEdge,
)
from .serializers import (
    DocumentInsightSerializer, QAMessageSerializer,
    ContradictionSerializer, TimelineEventSerializer, KnowledgeGraphSerializer,
)
from .services.engine import get_engine

logger = logging.getLogger("apps.ai")


def _get_doc_or_404(doc_id):
    try:
        return Document.objects.get(short_id=doc_id)
    except Document.DoesNotExist:
        return None


def _get_case_or_404(case_id):
    try:
        return Case.objects.get(case_id=case_id)
    except Case.DoesNotExist:
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def document_insights(request, doc_id):
    """GET /api/ai/documents/{id}/insights/"""
    doc = _get_doc_or_404(doc_id)
    if not doc:
        return Response({"detail": "Document not found.", "code": "not_found"}, status=404)

    insight = DocumentInsight.objects.filter(document=doc).first()
    if not insight:
        try:
            engine = get_engine()
            data = engine.summarize_document(doc)
            insight = DocumentInsight.objects.create(
                document=doc,
                summary=data.get("summary", ""),
                entities=data.get("entities", {}),
                important_dates=data.get("importantDates", []),
                findings=data.get("findings", []),
                related_doc_names=data.get("relatedDocs", []),
            )
        except Exception as exc:
            logger.error("Failed to generate insight for %s: %s", doc_id, exc)
            return Response({"detail": "AI insight generation failed.", "code": "ai_error"}, status=500)

    return Response(DocumentInsightSerializer(insight).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveUser])
def analyze_document(request, doc_id):
    """POST /api/ai/documents/{id}/analyze/ — regenerate insights."""
    doc = _get_doc_or_404(doc_id)
    if not doc:
        return Response({"detail": "Document not found.", "code": "not_found"}, status=404)

    try:
        engine = get_engine()
        data = engine.summarize_document(doc)
        insight, _ = DocumentInsight.objects.update_or_create(
            document=doc,
            defaults={
                "summary": data.get("summary", ""),
                "entities": data.get("entities", {}),
                "important_dates": data.get("importantDates", []),
                "findings": data.get("findings", []),
                "related_doc_names": data.get("relatedDocs", []),
            },
        )
        from apps.audit.utils import log_event, AuditEvent
        log_event(AuditEvent.AI_ANALYSIS_COMPLETE, request.user, f"{doc.name} — {doc.case.case_id}")
        return Response(DocumentInsightSerializer(insight).data)
    except Exception as exc:
        logger.error("Analyze failed for %s: %s", doc_id, exc)
        return Response({"detail": str(exc), "code": "ai_error"}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def case_qa_thread(request, case_id):
    """GET /api/ai/cases/{caseId}/qa/"""
    case = _get_case_or_404(case_id)
    if not case:
        return Response({"detail": "Case not found.", "code": "not_found"}, status=404)

    thread, created = CaseQAThread.objects.get_or_create(case=case)
    if created:
        CaseQAMessage.objects.create(
            thread=thread,
            role="assistant",
            text=(
                f"I'm ready to answer questions about {case_id}, grounded only in the "
                f"authorized documents attached to this case. Ask about people, evidence, timelines, or connections."
            ),
            sources=[],
        )

    messages = CaseQAMessage.objects.filter(thread=thread).order_by("created_at")
    return Response(QAMessageSerializer(messages, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveUser])
def case_qa_ask(request, case_id):
    """
    POST /api/ai/cases/{caseId}/qa/ask/
    Body: {question}
    Returns: {answer, sources}  ← exact shape matching askCaseQuestion() in api.js
    Powered by OpenRouter when OPENROUTER_API_KEY is set.
    """
    case = _get_case_or_404(case_id)
    if not case:
        return Response({"detail": "Case not found.", "code": "not_found"}, status=404)

    question = request.data.get("question", "").strip()
    if not question:
        return Response({"detail": "question is required.", "code": "missing_param"}, status=400)

    thread, _ = CaseQAThread.objects.get_or_create(case=case)
    CaseQAMessage.objects.create(thread=thread, role="user", text=question, sources=[])

    history = list(
        CaseQAMessage.objects.filter(thread=thread)
        .order_by("created_at")
        .values("role", "text")[:20]
    )

    try:
        engine = get_engine()
        result = engine.answer_case_question(case, question, history)
    except Exception as exc:
        logger.error("Q&A failed for %s: %s", case_id, exc)
        result = {
            "answer": "I encountered an error processing your question. Please try again.",
            "sources": [],
        }

    CaseQAMessage.objects.create(
        thread=thread,
        role="assistant",
        text=result["answer"],
        sources=result.get("sources", []),
    )

    return Response({"answer": result["answer"], "sources": result.get("sources", [])})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def semantic_search(request):
    """GET /api/ai/search/?q=...&caseId=..."""
    query = request.query_params.get("q", "").strip()
    case_id = request.query_params.get("caseId")

    if not query:
        return Response([])

    case = _get_case_or_404(case_id) if case_id else None

    try:
        engine = get_engine()
        results = engine.semantic_search(query, case)
    except Exception as exc:
        logger.error("Search failed: %s", exc)
        results = []

    return Response(results)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def search_prompts(request):
    """GET /api/ai/search/prompts/ — static quick prompts matching SEARCH_QUICK_PROMPTS."""
    return Response([
        "Show all documents mentioning this suspect.",
        "What evidence connects Person A and Person B?",
        "What events occurred between 10 January and 15 January?",
        "Show all documents related to this location.",
        "Which documents refer to the same phone number?",
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def case_contradictions(request, case_id):
    """GET /api/ai/cases/{caseId}/contradictions/"""
    case = _get_case_or_404(case_id)
    if not case:
        return Response({"detail": "Case not found.", "code": "not_found"}, status=404)
    contradictions = Contradiction.objects.filter(case=case)
    return Response(ContradictionSerializer(contradictions, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def case_timeline(request, case_id):
    """GET /api/ai/cases/{caseId}/timeline/"""
    case = _get_case_or_404(case_id)
    if not case:
        return Response({"detail": "Case not found.", "code": "not_found"}, status=404)
    events = TimelineEvent.objects.filter(case=case).order_by("id")
    return Response(TimelineEventSerializer(events, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def case_knowledge_graph(request, case_id):
    """GET /api/ai/cases/{caseId}/knowledge-graph/ → {nodes, edges}"""
    case = _get_case_or_404(case_id)
    if not case:
        return Response({"detail": "Case not found.", "code": "not_found"}, status=404)
    data = KnowledgeGraphSerializer(case).data
    return Response(data)

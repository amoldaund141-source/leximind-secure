"""
LexiMind Secure — Text Extraction + Classification
Primary: pypdf for text-based PDFs.
Optional OCR: uncomment pytesseract block below (requires OS packages).
"""
import io
import logging

logger = logging.getLogger("apps.documents.extraction")


def extract_text(file_bytes: bytes, filename: str, mime_type: str = "") -> str:
    try:
        if filename.lower().endswith(".pdf") or mime_type == "application/pdf":
            return _extract_pdf(file_bytes)
        elif filename.lower().endswith(".csv") or mime_type == "text/csv":
            return file_bytes.decode("utf-8", errors="replace")
        elif filename.lower().endswith(".txt"):
            return file_bytes.decode("utf-8", errors="replace")
        return ""
    except Exception as exc:
        logger.warning("Text extraction failed for %s: %s", filename, exc)
        return ""


def _extract_pdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        logger.warning("pypdf extraction failed: %s", exc)
        # To enable OCR: uncomment below and install pytesseract + pdf2image
        # from pdf2image import convert_from_bytes
        # import pytesseract
        # images = convert_from_bytes(file_bytes)
        # return "\n".join(pytesseract.image_to_string(img) for img in images)
        return ""


def classify_document(text: str, filename: str) -> str:
    """Rule-based classifier — swap body for an ML model call when ready."""
    fname = filename.lower()
    text_lower = text.lower()
    if "fir" in fname or "first information" in text_lower:
        return "First Information Report"
    if "witness" in fname or "witness statement" in text_lower:
        return "Witness Statement"
    if "bank" in fname or "transaction" in fname or "financial" in text_lower:
        return "Financial Record"
    if "sale_deed" in fname or "property" in fname or "deed" in text_lower:
        return "Property Document"
    if "police_report" in fname or "incident report" in text_lower:
        return "Police Report"
    if "log" in fname or "access_log" in fname or fname.endswith(".csv"):
        return "Digital Evidence Export"
    if "invoice" in fname or "ledger" in fname:
        return "Financial Record"
    return "Document"

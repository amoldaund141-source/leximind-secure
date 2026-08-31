from django.db import models
from django.conf import settings


class DocumentInsight(models.Model):
    document = models.OneToOneField("documents.Document", on_delete=models.CASCADE, related_name="insight")
    summary = models.TextField(blank=True)
    entities = models.JSONField(default=dict)
    important_dates = models.JSONField(default=list)
    findings = models.JSONField(default=list)
    related_doc_names = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ai_document_insight"


class CaseQAThread(models.Model):
    case = models.OneToOneField("cases.Case", on_delete=models.CASCADE, related_name="qa_thread")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_qa_thread"


class CaseQAMessage(models.Model):
    thread = models.ForeignKey(CaseQAThread, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=20)  # "user" | "assistant"
    text = models.TextField()
    sources = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_qa_message"
        ordering = ["created_at"]


class Contradiction(models.Model):
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="contradictions")
    title = models.CharField(max_length=300)
    statements = models.JSONField(default=list)
    finding = models.TextField()
    status = models.CharField(max_length=30, default="Requires Human Review")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_contradiction"


class TimelineEvent(models.Model):
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="timeline_events")
    date = models.CharField(max_length=20)  # "08 Aug" — display string
    event = models.TextField()
    source = models.CharField(max_length=200)
    related_entity = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = "ai_timeline_event"
        ordering = ["id"]


class KnowledgeGraphNode(models.Model):
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="kg_nodes")
    node_id = models.CharField(max_length=20)  # "n1", "n2" ...
    type = models.CharField(max_length=30)     # person|organization|location|evidence|document|phone|case
    label = models.CharField(max_length=200)

    class Meta:
        db_table = "ai_kg_node"


class KnowledgeGraphEdge(models.Model):
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="kg_edges")
    source_node = models.CharField(max_length=20)
    target_node = models.CharField(max_length=20)
    relation = models.CharField(max_length=100)

    class Meta:
        db_table = "ai_kg_edge"

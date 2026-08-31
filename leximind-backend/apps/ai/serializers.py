from rest_framework import serializers
from .models import DocumentInsight, CaseQAMessage, Contradiction, TimelineEvent, KnowledgeGraphNode, KnowledgeGraphEdge


class DocumentInsightSerializer(serializers.ModelSerializer):
    """
    Matches AI_INSIGHTS[docId] shape from mockData.js:
    {summary, entities, importantDates, findings, relatedDocs}
    """
    importantDates = serializers.JSONField(source="important_dates")
    relatedDocs = serializers.JSONField(source="related_doc_names")

    class Meta:
        model = DocumentInsight
        fields = ["summary", "entities", "importantDates", "findings", "relatedDocs"]


class QAMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseQAMessage
        fields = ["id", "role", "text", "sources", "created_at"]


class ContradictionSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    class Meta:
        model = Contradiction
        fields = ["id", "title", "statements", "finding", "status"]

    def get_id(self, obj):
        return f"cx{obj.id}"


class TimelineEventSerializer(serializers.ModelSerializer):
    relatedEntity = serializers.CharField(source="related_entity")

    class Meta:
        model = TimelineEvent
        fields = ["date", "event", "source", "relatedEntity"]


class KnowledgeGraphSerializer(serializers.Serializer):
    """Returns {nodes: [...], edges: [...]} matching KNOWLEDGE_GRAPH shape."""
    nodes = serializers.SerializerMethodField()
    edges = serializers.SerializerMethodField()

    def get_nodes(self, case):
        return [
            {"id": n.node_id, "type": n.type, "label": n.label}
            for n in KnowledgeGraphNode.objects.filter(case=case)
        ]

    def get_edges(self, case):
        return [
            {"source": e.source_node, "target": e.target_node, "relation": e.relation}
            for e in KnowledgeGraphEdge.objects.filter(case=case)
        ]

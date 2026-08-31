from django.urls import path
from . import views

urlpatterns = [
    # Document insights
    path("documents/<str:doc_id>/insights/", views.document_insights, name="ai-doc-insights"),
    path("documents/<str:doc_id>/analyze/", views.analyze_document, name="ai-doc-analyze"),

    # Case Q&A
    path("cases/<str:case_id>/qa/", views.case_qa_thread, name="ai-case-qa"),
    path("cases/<str:case_id>/qa/ask/", views.case_qa_ask, name="ai-case-qa-ask"),

    # Search
    path("search/", views.semantic_search, name="ai-search"),
    path("search/prompts/", views.search_prompts, name="ai-search-prompts"),

    # Contradictions, timeline, knowledge graph
    path("cases/<str:case_id>/contradictions/", views.case_contradictions, name="ai-contradictions"),
    path("cases/<str:case_id>/timeline/", views.case_timeline, name="ai-timeline"),
    path("cases/<str:case_id>/knowledge-graph/", views.case_knowledge_graph, name="ai-knowledge-graph"),
]

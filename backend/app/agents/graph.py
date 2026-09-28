"""
LangGraph Workflow Engine for Minbar AI
Orchestrates the 4-Agent State Machine with feedback loops and verification barriers.
"""

from typing import TypedDict, Dict, Any, List, Optional
from langgraph.graph import StateGraph, START, END
import uuid

from app.agents.agents import (
    KhutbahStructurer,
    VerifiedCitationRetrieverAgent,
    RhetoricalSynthesizer,
    TheologicalLinguisticAuditor
)
from app.engine.retriever import VerifiedCitationRetriever
from app.db.database import save_sermon_to_db


class KhutbahGraphState(TypedDict):
    request: Dict[str, Any]
    blueprint: Dict[str, Any]
    citations: Dict[str, List[Dict[str, Any]]]
    blocks: List[Dict[str, Any]]
    audits: List[Any]
    verification_status: str
    iteration: int
    final_sermon: Optional[Dict[str, Any]]


# Initialize shared retriever engine
shared_retriever = VerifiedCitationRetriever()
retriever_agent = VerifiedCitationRetrieverAgent(shared_retriever)


def planner_node(state: KhutbahGraphState) -> Dict[str, Any]:
    """Agent 1 Node: Generates the structured sermon blueprint."""
    req = state["request"]
    blueprint = KhutbahStructurer.generate_blueprint(req)
    return {
        "blueprint": blueprint,
        "iteration": state.get("iteration", 0) + 1
    }


def retriever_node(state: KhutbahGraphState) -> Dict[str, Any]:
    """Agent 2 Node: Fetches verified citations deterministically."""
    blueprint = state["blueprint"]
    citations = retriever_agent.fetch_citations_for_blueprint(blueprint)
    return {"citations": citations}


def synthesizer_node(state: KhutbahGraphState) -> Dict[str, Any]:
    """Agent 3 Node: Synthesizes classical Arabic eloquence with embedded markers."""
    req = state.get("request", {})
    blueprint = state["blueprint"]
    citations = state["citations"]

    provider = req.get("model_provider", "builtin")
    api_key = req.get("api_key")
    custom_model = req.get("custom_model_name")
    
    remote_res = None
    if provider in ["gemini", "ollama"]:
        try:
            from app.engine.llm_adapter import LLMAdapter
            remote_res = LLMAdapter.generate_sermon_content(
                theme=req.get("theme", ""),
                sermon_type=req.get("sermon_type", "jumuah"),
                duration=req.get("target_duration_minutes", 15),
                audience=req.get("audience_profile", "عامة المسلمين"),
                tone=req.get("tone", "موعظة ترقق القلوب"),
                verified_citations=citations,
                model_provider=provider,
                api_key=api_key,
                custom_model=custom_model
            )
        except Exception as e:
            print(f"[graph.py] LLMAdapter error: {e}. Falling back to RhetoricalSynthesizer.")

    if remote_res and "blocks" in remote_res and len(remote_res["blocks"]) > 0:
        raw_blocks = remote_res["blocks"]
        sermon_id = str(uuid.uuid4())
        blocks = []
        for i, b in enumerate(raw_blocks):
            blocks.append({
                "id": str(uuid.uuid4()),
                "sermon_id": sermon_id,
                "order_index": i + 1,
                "block_type": b.get("block_type", "thematic_exposition"),
                "title_ar": b.get("title_ar", f"مقطع {i+1}"),
                "content_ar": b.get("content_ar", ""),
                "verified": False,
                "verification_score": 0.0,
                "citation_source_type": None
            })
    else:
        blocks = RhetoricalSynthesizer.synthesize_sermon(blueprint, citations)

    return {"blocks": blocks}


def auditor_node(state: KhutbahGraphState) -> Dict[str, Any]:
    """Agent 4 Node: Deterministically verifies sacred citations and audits theology."""
    blocks = state["blocks"]
    audited_blocks, audits, status = TheologicalLinguisticAuditor.audit_sermon_blocks(
        blocks,
        shared_retriever
    )
    
    # Calculate word count and estimated delivery minutes
    all_text = " ".join([b.get("content_ar", "") for b in audited_blocks])
    word_count = len(all_text.split())
    # 95 words per minute average deliberate pulpit delivery
    est_duration = round(word_count / 95.0, 1)

    req = state["request"]
    sermon_id = audited_blocks[0].get("sermon_id", str(uuid.uuid4())) if audited_blocks else str(uuid.uuid4())

    final_sermon = {
        "id": sermon_id,
        "title": f"خطبة الجمعة: {req.get('theme')}",
        "theme": req.get("theme"),
        "target_duration_minutes": req.get("target_duration_minutes", 15),
        "sermon_type": req.get("sermon_type", "jumuah"),
        "audience_profile": req.get("audience_profile", "جمهور عام متنوع"),
        "tone": req.get("tone", "موعظة ترقق القلوب"),
        "theological_creed": "Ahl al-Sunnah wal-Jama'ah",
        "verification_status": status,
        "word_count": word_count,
        "estimated_delivery_minutes": est_duration,
        "blueprint": state["blueprint"],
        "blocks": audited_blocks,
        "audits": [a.model_dump() if hasattr(a, "model_dump") else a for a in audits]
    }

    # Persist to database
    save_sermon_to_db(final_sermon, audited_blocks)

    return {
        "blocks": audited_blocks,
        "audits": audits,
        "verification_status": status,
        "final_sermon": final_sermon
    }


def should_continue(state: KhutbahGraphState) -> str:
    """Conditional Edge: If deviations detected and under max retries, loop back to synthesis."""
    status = state.get("verification_status", "fully_verified")
    iteration = state.get("iteration", 1)
    
    if status == "flagged_deviations" and iteration < 2:
        return "synthesizer"
    return END


def create_khutbah_graph():
    """Builds and compiles the LangGraph StateGraph."""
    workflow = StateGraph(KhutbahGraphState)

    workflow.add_node("planner", planner_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.add_node("auditor", auditor_node)

    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "retriever")
    workflow.add_edge("retriever", "synthesizer")
    workflow.add_edge("synthesizer", "auditor")
    workflow.add_conditional_edges("auditor", should_continue, {
        "synthesizer": "synthesizer",
        END: END
    })

    return workflow.compile()


# Compiled Singleton instance
minbar_graph = create_khutbah_graph()


def execute_sermon_pipeline(request_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Runs the complete multi-agent pipeline and returns the final verified sermon."""
    initial_state: KhutbahGraphState = {
        "request": request_dict,
        "blueprint": {},
        "citations": {},
        "blocks": [],
        "audits": [],
        "verification_status": "pending",
        "iteration": 0,
        "final_sermon": None
    }
    output = minbar_graph.invoke(initial_state)
    return output.get("final_sermon", {})

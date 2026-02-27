from services.graph_service import GraphService
import networkx as nx
from typing import List, Dict, Any

class RiskService:
    def __init__(self, graph_service: GraphService):
        self.gs = graph_service

    def detect_circular_trading(self, gstin: str) -> List[List[str]]:
        """
        Detects if the given GSTIN is involved in any circular trading loops.
        We create a projected graph of Taxpayer -> Taxpayer where an edge exists
        if Taxpayer 1 supplied to Taxpayer 2.
        Then we look for cycles involving `gstin`.
        """
        # Create a taxpayer-only directed graph
        taxpayer_graph = nx.DiGraph()
        for u, v, attrs in self.gs.g.edges(data=True):
            if attrs.get("relation") == "SUPPLIED_BY":
                # u is Taxpayer, v is Invoice
                supplier = u
                # Find who purchased this invoice
                purchasers = [p for inv, p, p_attrs in self.gs.g.edges(v, data=True) if p_attrs.get("relation") == "PURCHASED_BY"]
                for p in purchasers:
                    taxpayer_graph.add_edge(supplier, p)

        target_node = f"Taxpayer:{gstin}"
        if target_node not in taxpayer_graph.nodes:
            return []

        # Find cycles
        try:
            cycles = list(nx.simple_cycles(taxpayer_graph))
            # Filter cycles that include our target GSTIN
            relevant_cycles = [cycle for cycle in cycles if target_node in cycle]
            return relevant_cycles
        except nx.NetworkXNoCycle:
            return []

    def calculate_risk_propagation(self) -> Dict[str, float]:
        """
        Uses PageRank-like algorithm to propagate risk through the supply chain.
        Returns a dictionary mapping Taxpayer ID to their propagated risk score.
        """
        taxpayer_graph = nx.DiGraph()
        
        # Build the graph of risk flow. Risk flows from Supplier -> Buyer.
        # But for PageRank, "importance" flows along edges. So if A supplies B,
        # B's risk increases if A is risky. 
        # Edge: B -> A (so A's risk flows to B in standard PageRank formulation, wait actually PR flows A->B if edge is A->B).
        # We want risk to flow from Supplier to Buyer.
        for u, v, attrs in self.gs.g.edges(data=True):
            if attrs.get("relation") == "SUPPLIED_BY":
                supplier = u
                purchasers = [p for inv, p, p_attrs in self.gs.g.edges(v, data=True) if p_attrs.get("relation") == "PURCHASED_BY"]
                for buyer in purchasers:
                    # Risk flows from supplier to buyer
                    taxpayer_graph.add_edge(supplier, buyer)

        if len(taxpayer_graph.nodes) == 0:
            return {}

        # Initialize base risk (personalization vector for PageRank)
        base_risk = {}
        for node in taxpayer_graph.nodes:
            ndata = self.gs.get_node(node)
            base_risk[node] = ndata.get("risk_score", 0.1) if ndata else 0.1
            
        # Normalize personalization
        total_risk = sum(base_risk.values())
        if total_risk > 0:
            personalization = {k: v / total_risk for k, v in base_risk.items()}
        else:
            personalization = None

        pr_scores = nx.pagerank(taxpayer_graph, alpha=0.85, personalization=personalization, weight=None)
        
        # Scale back up
        max_pr = max(pr_scores.values()) if pr_scores else 1.0
        scaled_scores = {k: (v / max_pr) * 100 for k, v in pr_scores.items()}
        return scaled_scores

    def get_top_risky_vendors(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns the top N vendors by risk score."""
        scores = self.calculate_risk_propagation()
        sorted_vendors = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [{"gstin": k.split(":")[1], "propagated_risk_score": v} for k, v in sorted_vendors[:limit]]

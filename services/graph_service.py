import networkx as nx
import logging

logger = logging.getLogger(__name__)

# Singleton Graph instance for the application
# In a real distributed system, this would be Neo4j or ArangoDB.
# For this hackathon/demo, we use an in-memory NetworkX DiGraph.
gst_graph = nx.DiGraph()

class GraphService:
    def __init__(self, graph: nx.DiGraph = gst_graph):
        self.g = graph

    def clear_graph(self):
        """Clear the entire graph (useful for testing)"""
        self.g.clear()

    def add_taxpayer(self, gstin: str, attributes: dict = None):
        if attributes is None:
            attributes = {}
        attributes.update({"type": "Taxpayer", "gstin": gstin})
        self.g.add_node(f"Taxpayer:{gstin}", **attributes)

    def add_invoice(self, invoice_id: str, supplier_gstin: str, buyer_gstin: str, period: str, attributes: dict = None):
        if attributes is None:
            attributes = {}
        attributes.update({
            "type": "Invoice",
            "invoice_id": invoice_id,
            "period": period,
            "financial_value": attributes.get("tax_value", 0.0)
        })
        node_id = f"Invoice:{invoice_id}"
        self.g.add_node(node_id, **attributes)
        
        # Ensure taxpayers exist
        self.add_taxpayer(supplier_gstin)
        self.add_taxpayer(buyer_gstin)
        
        # Create relationships
        self.g.add_edge(f"Taxpayer:{supplier_gstin}", node_id, relation="SUPPLIED_BY")
        self.g.add_edge(node_id, f"Taxpayer:{buyer_gstin}", relation="PURCHASED_BY")

    def add_gstr1_entry(self, invoice_id: str, supplier_gstin: str, period: str, attributes: dict = None):
        if attributes is None:
            attributes = {}
        node_id = f"GSTR1:{supplier_gstin}:{period}:{invoice_id}"
        attributes.update({"type": "GSTR1", "period": period})
        self.g.add_node(node_id, **attributes)
        
        # Edge from Invoice to GSTR1
        self.g.add_edge(f"Invoice:{invoice_id}", node_id, relation="REPORTED_IN")
        self.g.add_edge(f"Taxpayer:{supplier_gstin}", node_id, relation="FILED_BY")

    def add_gstr2b_entry(self, invoice_id: str, buyer_gstin: str, period: str, attributes: dict = None):
        if attributes is None:
            attributes = {}
        node_id = f"GSTR2B:{buyer_gstin}:{period}:{invoice_id}"
        attributes.update({"type": "GSTR2B", "period": period})
        self.g.add_node(node_id, **attributes)
        
        # Edge from Invoice to GSTR2B
        self.g.add_edge(f"Invoice:{invoice_id}", node_id, relation="REFLECTED_IN")
        self.g.add_edge(node_id, f"Taxpayer:{buyer_gstin}", relation="CLAIMED_IN")

    def add_purchase_register_entry(self, invoice_id: str, buyer_gstin: str, period: str, attributes: dict = None):
        if attributes is None:
            attributes = {}
        node_id = f"PR:{buyer_gstin}:{period}:{invoice_id}"
        attributes.update({"type": "PurchaseRegister", "period": period})
        self.g.add_node(node_id, **attributes)
        
        self.g.add_edge(f"Invoice:{invoice_id}", node_id, relation="RECORDED_IN_PR")

    def add_einvoice_entry(self, irn: str, invoice_id: str, attributes: dict = None):
        if attributes is None:
            attributes = {}
        node_id = f"EInvoice:{irn}"
        attributes.update({"type": "EInvoice", "irn": irn})
        self.g.add_node(node_id, **attributes)
        
        self.g.add_edge(f"Invoice:{invoice_id}", node_id, relation="GENERATED_IRN")

    def get_subgraph_for_invoice(self, invoice_id: str, depth: int = 3) -> nx.DiGraph:
        """Extract a local centered subgraph around the invoice for targeted analysis."""
        node_id = f"Invoice:{invoice_id}"
        if not self.g.has_node(node_id):
            return nx.DiGraph() # return empty
        
        # Compute ego graph undirected to capture incoming and outgoing relationships
        ego = nx.ego_graph(self.g.to_undirected(), node_id, radius=depth)
        # Return the directed subgraph representing these nodes
        return self.g.subgraph(ego.nodes())
        
    def get_node(self, node_id: str) -> dict:
        if self.g.has_node(node_id):
            return self.g.nodes[node_id]
        return None
        
    def get_edge_data(self, source: str, target: str) -> dict:
        if self.g.has_edge(source, target):
            return self.g.edges[source, target]
        return None

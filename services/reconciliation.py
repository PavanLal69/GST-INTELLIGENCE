from services.graph_service import GraphService
import networkx as nx
from typing import List
from models.schemas import MismatchOutput

class ReconciliationEngine:
    def __init__(self, graph_service: GraphService):
        self.gs = graph_service

    def reconcile_invoice(self, invoice_id: str) -> List[MismatchOutput]:
        """
        Runs multi-hop traversal to validate an invoice across GST datasets.
        Returns a list of mismatches. If empty, the invoice is fully compliant.
        """
        mismatches = []
        node_id = f"Invoice:{invoice_id}"
        
        invoice_data = self.gs.get_node(node_id)
        if not invoice_data:
            mismatches.append(MismatchOutput(
                root_cause="Missing Invoice",
                traversal_path=[node_id],
                financial_exposure=0.0,
                risk_severity="Critical",
                supporting_evidence={"message": "Invoice ID not found in the graph."}
            ))
            return mismatches

        financial_val = invoice_data.get("financial_value", 0.0)
        period = invoice_data.get("period", "unknown")

        subgraph = self.gs.get_subgraph_for_invoice(invoice_id, depth=2)
        
        # 1. Check if Reported in GSTR-1
        # Traversal: Invoice -> REPORTED_IN -> GSTR1
        gstr1_nodes = [v for u, v, attrs in subgraph.edges(data=True) if attrs.get("relation") == "REPORTED_IN" and u == node_id]
        if not gstr1_nodes:
            # Check who the supplier is
            supplier_nodes = [u for u, v, attrs in subgraph.edges(data=True) if attrs.get("relation") == "SUPPLIED_BY" and v == node_id]
            supplier_id = supplier_nodes[0] if supplier_nodes else "Unknown_Supplier"
            
            mismatches.append(MismatchOutput(
                root_cause="Invoice not in supplier GSTR-1",
                traversal_path=[node_id, supplier_id, f"GSTR1 (Missing for {period})"],
                financial_exposure=financial_val,
                risk_severity="High",
                supporting_evidence={"invoice_id": invoice_id, "supplier": supplier_id, "period": period}
            ))
            
        # 2. Check if Reflected in GSTR-2B
        gstr2b_nodes = [v for u, v, attrs in subgraph.edges(data=True) if attrs.get("relation") == "REFLECTED_IN" and u == node_id]
        if not gstr2b_nodes:
            mismatches.append(MismatchOutput(
                root_cause="Invoice not reflected in GSTR-2B",
                traversal_path=[node_id, f"GSTR2B (Missing for {period})"],
                financial_exposure=financial_val,
                risk_severity="Medium",
                supporting_evidence={"invoice_id": invoice_id}
            ))

        # 3. Check for E-Invoice Generation (if applicable, assuming all need it for this demo)
        einvoice_nodes = [v for u, v, attrs in subgraph.edges(data=True) if attrs.get("relation") == "GENERATED_IRN" and u == node_id]
        if not einvoice_nodes:
             mismatches.append(MismatchOutput(
                root_cause="IRN Missing / No E-Invoice",
                traversal_path=[node_id, "EInvoice (Missing)"],
                financial_exposure=financial_val,
                risk_severity="Medium",
                supporting_evidence={"invoice_id": invoice_id}
            ))
        else:
            # IRN value check
            for enode in einvoice_nodes:
                enode_data = self.gs.get_node(enode)
                if enode_data and enode_data.get("tax_value", 0.0) != financial_val:
                     mismatches.append(MismatchOutput(
                        root_cause="IRN Tax Value Mismatch",
                        traversal_path=[node_id, enode],
                        financial_exposure=abs(financial_val - enode_data.get("tax_value", 0.0)),
                        risk_severity="High",
                        supporting_evidence={"invoice_tax": financial_val, "einvoice_tax": enode_data.get("tax_value", 0.0)}
                    ))

        return mismatches

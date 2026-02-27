from typing import List
from models.schemas import MismatchOutput

class AuditGenerator:
    @staticmethod
    def generate_audit_trail(invoice_id: str, mismatches: List[MismatchOutput], vendor_risk_data: dict, cycles: list) -> str:
        if not mismatches and not cycles:
            return f"Invoice {invoice_id} is fully compliant and verified across all graph edges. Vendor risk is {vendor_risk_data.get('risk_bucket')}."

        explanations = []
        explanations.append(f"Audit Intelligence Report for Invoice {invoice_id}:")
        
        # Mismatch Explanations
        if mismatches:
            explanations.append("\nDetermininstic Mismatches Detected:")
            for i, mm in enumerate(mismatches, 1):
                path_str = " -> ".join(mm.traversal_path)
                explanations.append(
                    f"  {i}. {mm.root_cause}. "
                    f"Financial Exposure: ₹{mm.financial_exposure}. "
                    f"Risk Severity: {mm.risk_severity}. "
                    f"Traversal Path: {path_str}."
                )

        # Graph Enhancements
        explanations.append("\nGraph Pattern Analysis:")
        if cycles:
            explanations.append(
                f"  - CRITICAL: Supplier involved in circular trading loops: {len(cycles)} cycle(s) detected. "
                "This subgraph is flagged for immediate review."
            )
        else:
             explanations.append("  - No circular trading structures detected in the immediate ego-graph.")

        # ML Risk
        score = vendor_risk_data.get('compliance_risk_score')
        bucket = vendor_risk_data.get('risk_bucket')
        explanations.append("\nPredictive Vendor Compliance:")
        explanations.append(
            f"  - The supplier has a propagated computed risk score of {score}/100 ({bucket} Risk), "
            f"influenced by {vendor_risk_data.get('feature_importance', {}).get('network_risk_propagation', 0)*100}% network topology."
        )

        return "\n".join(explanations)

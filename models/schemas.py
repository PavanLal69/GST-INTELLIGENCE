from typing import Literal, Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import date

# Base Models representing Graph Nodes

class Taxpayer(BaseModel):
    gstin: str
    business_name: Optional[str] = None
    constitution: Optional[str] = None
    risk_score: float = 0.0

class Invoice(BaseModel):
    invoice_id: str
    supplier_gstin: str
    buyer_gstin: str
    date: str
    total_value: float
    tax_value: float
    period: str
    irn: Optional[str] = None

class GSTR1Record(BaseModel):
    invoice_id: str
    supplier_gstin: str
    buyer_gstin: str
    period: str
    tax_value: float

class GSTR2BRecord(BaseModel):
    invoice_id: str
    supplier_gstin: str
    buyer_gstin: str
    period: str
    itc_available: float

class PurchaseRegisterEntry(BaseModel):
    invoice_id: str
    supplier_gstin: str
    buyer_gstin: str
    period: str
    tax_paid: float

class EInvoiceRecord(BaseModel):
    irn: str
    invoice_id: str
    supplier_gstin: str
    buyer_gstin: str
    tax_value: float
    date: str

class EWayBillRecord(BaseModel):
    ewb_no: str
    irn: Optional[str] = None
    invoice_id: str
    supplier_gstin: str
    buyer_gstin: str

class MismatchOutput(BaseModel):
    root_cause: str
    traversal_path: List[str]
    financial_exposure: float
    risk_severity: Literal["Low", "Medium", "High", "Critical"]
    supporting_evidence: Dict[str, Any]

class AuditTrailResponse(BaseModel):
    invoice_id: str
    explanation: str
    mismatches: List[MismatchOutput]
    total_exposure: float
    overall_risk: str

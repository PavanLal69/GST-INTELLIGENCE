from fastapi import APIRouter, HTTPException, Depends
from typing import List, Union
from models.schemas import GSTR1Record, GSTR2BRecord, PurchaseRegisterEntry, EInvoiceRecord, EWayBillRecord, Invoice
from services.graph_service import GraphService, gst_graph

router = APIRouter(prefix="/ingest", tags=["ingestion"])

def get_graph_service() -> GraphService:
    return GraphService(gst_graph)

@router.post("/invoice", description="Ingest base invoice data")
def ingest_invoice(invoices: List[Invoice], gs: GraphService = Depends(get_graph_service)):
    for inv in invoices:
        gs.add_invoice(
            invoice_id=inv.invoice_id,
            supplier_gstin=inv.supplier_gstin,
            buyer_gstin=inv.buyer_gstin,
            period=inv.period,
            attributes={"tax_value": inv.tax_value, "total_value": inv.total_value, "date": inv.date}
        )
    return {"status": "success", "count": len(invoices)}

@router.post("/gstr1", description="Ingest GSTR-1 records (Supplier side)")
def ingest_gstr1(records: List[GSTR1Record], gs: GraphService = Depends(get_graph_service)):
    for rec in records:
        gs.add_gstr1_entry(
            invoice_id=rec.invoice_id,
            supplier_gstin=rec.supplier_gstin,
            period=rec.period,
            attributes={"tax_value": rec.tax_value}
        )
    return {"status": "success", "count": len(records)}

@router.post("/gstr2b", description="Ingest GSTR-2B records (Buyer side auto-populated)")
def ingest_gstr2b(records: List[GSTR2BRecord], gs: GraphService = Depends(get_graph_service)):
    for rec in records:
        gs.add_gstr2b_entry(
            invoice_id=rec.invoice_id,
            buyer_gstin=rec.buyer_gstin,
            period=rec.period,
            attributes={"itc_available": rec.itc_available}
        )
    return {"status": "success", "count": len(records)}

@router.post("/purchase_register", description="Ingest Purchase Register (Buyer's internal books)")
def ingest_pr(records: List[PurchaseRegisterEntry], gs: GraphService = Depends(get_graph_service)):
    for rec in records:
        gs.add_purchase_register_entry(
            invoice_id=rec.invoice_id,
            buyer_gstin=rec.buyer_gstin,
            period=rec.period,
            attributes={"tax_paid": rec.tax_paid}
        )
    return {"status": "success", "count": len(records)}

@router.post("/einvoice", description="Ingest e-Invoice data")
def ingest_einvoice(records: List[EInvoiceRecord], gs: GraphService = Depends(get_graph_service)):
    for rec in records:
        gs.add_einvoice_entry(
            irn=rec.irn,
            invoice_id=rec.invoice_id,
            attributes={"tax_value": rec.tax_value, "date": rec.date, "supplier_gstin": rec.supplier_gstin, "buyer_gstin": rec.buyer_gstin}
        )
    return {"status": "success", "count": len(records)}

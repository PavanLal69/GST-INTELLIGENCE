import requests
import time

BASE_URL = "http://localhost:8000"

def run_demo():
    print("Checking if server is up...")
    try:
        requests.get(f"{BASE_URL}/")
    except requests.exceptions.ConnectionError:
        print("Server is not running. Start with: uvicorn main:app --reload")
        return

    print("--- 🚀 Generating Graph Data for GST Hackathon Demo 🚀 ---")

    # We will create a circular trading loop: A -> B -> C -> A
    # A = GSTIN_A (Defaulter)
    # B = GSTIN_B (Intermediary)
    # C = GSTIN_C (Intermediary)
    
    invoices = [
        # A supplies B (Amount: 500000)
        {"invoice_id": "INV-AB-1", "supplier_gstin": "GSTIN_A", "buyer_gstin": "GSTIN_B", "date": "2024-09-01", "total_value": 500000, "tax_value": 90000, "period": "2024-09"},
        # B supplies C (Amount: 500000)
        {"invoice_id": "INV-BC-1", "supplier_gstin": "GSTIN_B", "buyer_gstin": "GSTIN_C", "date": "2024-09-02", "total_value": 500000, "tax_value": 90000, "period": "2024-09"},
        # C supplies A (Amount: 500000) -> Forms the loop
        {"invoice_id": "INV-CA-1", "supplier_gstin": "GSTIN_C", "buyer_gstin": "GSTIN_A", "date": "2024-09-03", "total_value": 500000, "tax_value": 90000, "period": "2024-09"},
        
        # Normal Invoice: B supplies legitimate buyer D
        {"invoice_id": "INV-BD-1", "supplier_gstin": "GSTIN_B", "buyer_gstin": "GSTIN_D", "date": "2024-09-05", "total_value": 100000, "tax_value": 18000, "period": "2024-09"}
    ]

    requests.post(f"{BASE_URL}/ingest/invoice", json=invoices)
    print("✅ Ingested base invoices")

    # A files GSTR1 for INV-AB-1 (Wait, A is a defaulter, maybe A doesn't file GSTR-3B, but files GSTR-1 to pass ITC)
    gstr1_records = [
        {"invoice_id": "INV-AB-1", "supplier_gstin": "GSTIN_A", "buyer_gstin": "GSTIN_B", "tax_value": 90000, "period": "2024-09"},
        {"invoice_id": "INV-BC-1", "supplier_gstin": "GSTIN_B", "buyer_gstin": "GSTIN_C", "tax_value": 90000, "period": "2024-09"},
        {"invoice_id": "INV-CA-1", "supplier_gstin": "GSTIN_C", "buyer_gstin": "GSTIN_A", "tax_value": 90000, "period": "2024-09"},
        # IMPORTANT: Missing GSTR-1 for INV-BD-1 (to create a mismatch)
    ]
    requests.post(f"{BASE_URL}/ingest/gstr1", json=gstr1_records)
    print("✅ Ingested GSTR-1 records")

    # Auto-populated GSTR-2B
    gstr2b_records = [
        {"invoice_id": "INV-AB-1", "supplier_gstin": "GSTIN_A", "buyer_gstin": "GSTIN_B", "itc_available": 90000, "period": "2024-09"},
        {"invoice_id": "INV-BC-1", "supplier_gstin": "GSTIN_B", "buyer_gstin": "GSTIN_C", "itc_available": 90000, "period": "2024-09"},
        {"invoice_id": "INV-CA-1", "supplier_gstin": "GSTIN_C", "buyer_gstin": "GSTIN_A", "itc_available": 90000, "period": "2024-09"},
    ]
    requests.post(f"{BASE_URL}/ingest/gstr2b", json=gstr2b_records)
    print("✅ Ingested GSTR-2B records")
    
    # E-Invoices
    einvoice_records = [
        {"irn": "IRN123", "invoice_id": "INV-AB-1", "supplier_gstin": "GSTIN_A", "buyer_gstin": "GSTIN_B", "tax_value": 90000, "date": "2024-09-01"},
        {"irn": "IRN124", "invoice_id": "INV-BC-1", "supplier_gstin": "GSTIN_B", "buyer_gstin": "GSTIN_C", "tax_value": 90000, "date": "2024-09-02"},
        {"irn": "IRN125", "invoice_id": "INV-CA-1", "supplier_gstin": "GSTIN_C", "buyer_gstin": "GSTIN_A", "tax_value": 90000, "date": "2024-09-03"},
        # No IRN for INV-BD-1 (creating another mismatch)
    ]
    requests.post(f"{BASE_URL}/ingest/einvoice", json=einvoice_records)
    print("✅ Ingested E-Invoice records")
    print("\n--- 🧠 Running Agent Orchestrator to Analyze Invoice INV-BD-1 ---")
    
    result = requests.post(f"{BASE_URL}/analyze-invoice", json={
        "invoice_id": "INV-BD-1",
        "period": "2024-09"
    })
    
    if result.status_code == 200:
        data = result.json()
        print("\n" + "="*80)
        print("AGENT ORCHESTRATOR OUTPUT")
        print("="*80)
        print(data["explanation"])
        print("\nDetailed Mismatches Formatted JSON:")
        for m in data.get("mismatches", []):
            print(f" - {m['root_cause']} -> Exposure: Rs. {m['financial_exposure']} (Severity: {m['risk_severity']})")
            print(f"   Path: {' -> '.join(m['traversal_path'])}")
    else:
        print("Error analyzing:", result.text)

if __name__ == "__main__":
    run_demo()

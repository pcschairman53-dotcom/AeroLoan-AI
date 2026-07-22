import os
from datetime import datetime
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.services.google_sheet_service import save_application, save_prediction_history

app = FastAPI(title="Loan Approval AI", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanRequest(BaseModel):
    gender: str
    married: str
    education: str
    self_employed: str
    applicant_income: float
    coapplicant_income: float
    loan_amount: float
    credit_history: float
    dependents: Optional[str] = "0"
    property_area: Optional[str] = "Urban"
    loan_amount_term: Optional[float] = 360
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class LoanResponse(BaseModel):
    status: str
    probability: float
    confidence: str
    risk_level: str
    reason: str
    recommendation: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Loan Approval AI Backend"}

@app.post("/predict", response_model=LoanResponse)
def predict_loan(request: LoanRequest):
    # Core Loan Underwriting Decision Logic
    total_income = request.applicant_income + request.coapplicant_income
    debt_to_income = (request.loan_amount * 1000) / (total_income * 12) if total_income > 0 else 1.0

    if request.credit_history == 1 and debt_to_income < 5.0:
        status = "Approved"
        probability = 0.88
        confidence = "High"
        risk_level = "Low"
        reason = "Strong credit history and acceptable debt-to-income ratio."
        recommendation = "Proceed with loan disbursement."
    else:
        status = "Rejected"
        probability = 0.25
        confidence = "High"
        risk_level = "High"
        reason = "Sub-optimal credit history or high requested loan relative to income."
        recommendation = "Manual underwriter review required."

    response = LoanResponse(
        status=status,
        probability=probability,
        confidence=confidence,
        risk_level=risk_level,
        reason=reason,
        recommendation=recommendation
    )

    # Append to Google Sheets after successful prediction
    try:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Prepare application payload matching exact Google Sheets mapping
        app_payload = {
            "created_at": current_time,
            "gender": request.gender,
            "married": request.married,
            "dependents": request.dependents or "0",
            "education": request.education,
            "self_employed": request.self_employed,
            "credit_history": request.credit_history,
            "property_area": request.property_area or "Urban",
            "loan_amount_term": request.loan_amount_term if request.loan_amount_term is not None else 360,
            "applicant_income": request.applicant_income,
            "coapplicant_income": request.coapplicant_income,
            "loan_amount": request.loan_amount,
            "prediction": status
        }

        # Save to 'Applications' sheet
        save_application(app_payload)

        # Save to 'Prediction History' sheet
        input_dict = request.dict()
        input_dict["created_at"] = current_time
        save_prediction_history(input_dict, status)

    except Exception as e:
        print(f"Non-blocking Google Sheets sync error: {e}")

    # Return prediction result unchanged
    return response

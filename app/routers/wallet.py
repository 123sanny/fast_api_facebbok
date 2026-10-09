from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from database import get_db
from services.vault_service import (
    get_creator_vault_service,
    simulate_creator_star_tip_service,
    request_creator_withdrawal_service,
    purchase_stars_service
)

router = APIRouter(prefix="/wallet", tags=["Creator Vault & Wallet Economy"])


@router.get("/creator-vault/{user_id}")
def get_creator_vault(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve real dynamic Creator Star Vault summary, live balance, USD/INR conversion,
    verified achievements, recent live tips, and payout withdrawal history.
    """
    return get_creator_vault_service(db=db, user_id=user_id)


@router.post("/creator-vault/simulate-tip")
def simulate_star_tip(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Simulate +200 (or custom) Star Tip sent to creator's database StarWallet.
    """
    user_id = int(payload.get("user_id", 1))
    stars_amount = int(payload.get("stars_amount", 200))
    sender_name = payload.get("sender_name", "Nexoria Fan Supporter")
    note = payload.get("note", "Loved your content! Keep shining ⭐")

    return simulate_creator_star_tip_service(
        db=db,
        user_id=user_id,
        stars_amount=stars_amount,
        sender_name=sender_name,
        note=note
    )


@router.post("/creator-vault/purchase-stars")
def purchase_stars_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Purchase and recharge Creator Stars with UPI / QR / Card payment.
    Directly credits the user's database StarWallet and records in ledger.
    """
    user_id = int(payload.get("user_id", 1))
    res = purchase_stars_service(db=db, user_id=user_id, payload=payload)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Star purchase failed"))
    return res


@router.post("/creator-vault/withdraw")
def request_vault_withdrawal(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Submit a payout / cashout withdrawal request to convert Stars to INR/USD.
    """
    user_id = int(payload.get("user_id", 1))
    res = request_creator_withdrawal_service(db=db, user_id=user_id, payload=payload)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Withdrawal failed"))
    return res

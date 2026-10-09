from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ==================== Payment Methods ====================
class PaymentMethodCreate(BaseModel):
    type: str  # card, paypal, upi, bank_account
    provider: Optional[str] = None  # visa, mastercard, stripe, razorpay, paypal
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    paypal_email: Optional[str] = None
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_last4: Optional[str] = None
    billing_name: Optional[str] = None
    is_default: Optional[bool] = False


class PaymentMethodOut(BaseModel):
    id: int
    user_id: int
    type: str
    provider: Optional[str] = None
    card_last4: Optional[str] = None
    card_brand: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    paypal_email: Optional[str] = None
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_last4: Optional[str] = None
    billing_name: Optional[str] = None
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Star Wallet ====================
class StarWalletOut(BaseModel):
    id: int
    user_id: int
    balance: int
    total_earned: int
    total_spent: int
    total_tipped: int
    is_frozen: bool
    biometric_enabled: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class SetWalletPinRequest(BaseModel):
    pin: str
    confirm_pin: str


class VerifyWalletPinRequest(BaseModel):
    pin: str


# ==================== Transactions & Stars ====================
class BuyStarsRequest(BaseModel):
    stars_amount: int
    fiat_amount: float
    currency: Optional[str] = "USD"
    payment_method_id: Optional[int] = None


class TipCreatorRequest(BaseModel):
    creator_id: int
    stars_amount: int
    note: Optional[str] = None


class TipPostRequest(BaseModel):
    post_id: int
    stars_amount: int
    message: Optional[str] = None


class StarTransactionOut(BaseModel):
    id: int
    wallet_id: int
    sender_id: Optional[int] = None
    receiver_id: Optional[int] = None
    type: str
    stars_amount: int
    fiat_amount: float
    currency: str
    status: str
    payment_method_id: Optional[int] = None
    reference_id: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Creator Subscriptions ====================
class CreatorSubscriptionCreate(BaseModel):
    creator_id: int
    plan_tier: Optional[str] = "supporter"
    monthly_stars: Optional[int] = 100


class CreatorSubscriptionOut(BaseModel):
    id: int
    subscriber_id: int
    creator_id: int
    plan_tier: str
    monthly_stars: int
    status: str
    start_date: datetime
    renews_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Shipping Address ====================
class ShippingAddressCreate(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: Optional[str] = "United States"
    is_default: Optional[bool] = False


class ShippingAddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None


class ShippingAddressOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Orders ====================
class OrderCreate(BaseModel):
    item_title: str
    item_type: str  # stars_pack, digital_product, merch, subscription
    total_amount: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    stars_cost: Optional[int] = 0
    seller_id: Optional[int] = None
    shipping_address_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    order_number: str
    buyer_id: int
    seller_id: Optional[int] = None
    item_title: str
    item_type: str
    total_amount: float
    currency: str
    stars_cost: int
    status: str
    shipping_address_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

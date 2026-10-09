from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float, Numeric
from sqlalchemy.orm import relationship
from database import Base
import datetime


class PaymentMethod(Base):
    """
    Saved payment methods (Credit/Debit Card, PayPal, UPI, Bank Account)
    """
    __tablename__ = "payment_methods"

    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type               = Column(String(30), nullable=False)  # card, paypal, upi, bank_account
    provider           = Column(String(50), nullable=True)   # visa, mastercard, stripe, razorpay, paypal
    card_last4         = Column(String(4), nullable=True)
    card_brand         = Column(String(30), nullable=True)
    exp_month          = Column(Integer, nullable=True)
    exp_year           = Column(Integer, nullable=True)
    paypal_email       = Column(String(150), nullable=True)
    upi_id             = Column(String(100), nullable=True)
    bank_name          = Column(String(100), nullable=True)
    bank_account_last4 = Column(String(8), nullable=True)
    billing_name       = Column(String(120), nullable=True)
    is_default         = Column(Boolean, default=False, nullable=False)
    created_at         = Column(DateTime, default=datetime.datetime.utcnow)

    user   = relationship("User", back_populates="payment_methods")
    orders = relationship("Order", back_populates="payment_method")


class StarWallet(Base):
    """
    Nexoria Stars Balance & In-App Economy Vault
    """
    __tablename__ = "star_wallets"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    balance           = Column(Integer, default=0, nullable=False)
    bonus_stars       = Column(Integer, default=0, nullable=False)  # Free registration / non-withdrawable bonus stars
    total_earned      = Column(Integer, default=0, nullable=False)
    total_spent       = Column(Integer, default=0, nullable=False)
    total_tipped      = Column(Integer, default=0, nullable=False)
    is_frozen         = Column(Boolean, default=False, nullable=False)
    pin_hash          = Column(String(255), nullable=True)
    biometric_enabled = Column(Boolean, default=False, nullable=False)
    failed_pin_attempts = Column(Integer, default=0, nullable=False)
    pin_locked_until  = Column(DateTime, nullable=True)
    updated_at        = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user         = relationship("User", back_populates="wallet")
    transactions = relationship("StarTransaction", back_populates="wallet", cascade="all, delete")


class StarTransaction(Base):
    """
    Immutable Star Transaction & Purchase Ledger
    """
    __tablename__ = "star_transactions"

    id                = Column(Integer, primary_key=True, index=True)
    wallet_id         = Column(Integer, ForeignKey("star_wallets.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    receiver_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    type              = Column(String(40), nullable=False)  # buy_stars, creator_tip, post_tip, subscription, payout, refund
    stars_amount      = Column(Integer, nullable=False)
    fiat_amount       = Column(Float, default=0.0)
    currency          = Column(String(10), default="USD")
    status            = Column(String(20), default="completed")  # pending, completed, failed, refunded
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True)
    reference_id      = Column(String(100), nullable=True)  # Payment Gateway transaction id
    note              = Column(String(255), nullable=True)
    created_at        = Column(DateTime, default=datetime.datetime.utcnow)

    wallet          = relationship("StarWallet", back_populates="transactions")
    sender          = relationship("User", foreign_keys=[sender_id], back_populates="sent_star_transactions")
    receiver        = relationship("User", foreign_keys=[receiver_id], back_populates="received_star_transactions")
    payment_method  = relationship("PaymentMethod")


class CreatorSubscription(Base):
    """
    Monthly Recurring Subscriptions to Content Creators
    """
    __tablename__ = "creator_subscriptions"

    id            = Column(Integer, primary_key=True, index=True)
    subscriber_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_tier     = Column(String(50), default="supporter")  # supporter, vip, elite
    monthly_stars = Column(Integer, nullable=False, default=100)
    status        = Column(String(20), default="active")     # active, paused, cancelled, expired
    start_date    = Column(DateTime, default=datetime.datetime.utcnow)
    renews_at     = Column(DateTime, nullable=True)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    subscriber = relationship("User", foreign_keys=[subscriber_id], back_populates="subscriptions_made")
    creator    = relationship("User", foreign_keys=[creator_id], back_populates="subscribers_received")


class ShippingAddress(Base):
    """
    User Saved Delivery Addresses for Physical Marketplace Orders
    """
    __tablename__ = "shipping_addresses"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name     = Column(String(120), nullable=False)
    phone         = Column(String(30), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city          = Column(String(100), nullable=False)
    state         = Column(String(100), nullable=False)
    postal_code   = Column(String(30), nullable=False)
    country       = Column(String(100), nullable=False, default="United States")
    is_default    = Column(Boolean, default=False, nullable=False)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    user   = relationship("User", back_populates="shipping_addresses")
    orders = relationship("Order", back_populates="shipping_address")


class Order(Base):
    """
    Orders for Digital Goods, Stars Bundles, and Physical Merchandise
    """
    __tablename__ = "orders"

    id                  = Column(Integer, primary_key=True, index=True)
    order_number        = Column(String(50), unique=True, nullable=False, index=True)
    buyer_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    seller_id           = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    item_title          = Column(String(200), nullable=False)
    item_type           = Column(String(40), nullable=False)  # stars_pack, digital_product, merch, subscription
    total_amount        = Column(Float, default=0.0)
    currency            = Column(String(10), default="USD")
    stars_cost          = Column(Integer, default=0)
    status              = Column(String(30), default="pending")  # pending, processing, shipped, delivered, cancelled, refunded
    shipping_address_id = Column(Integer, ForeignKey("shipping_addresses.id", ondelete="SET NULL"), nullable=True)
    payment_method_id   = Column(Integer, ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True)
    tracking_number     = Column(String(100), nullable=True)
    notes               = Column(Text, nullable=True)
    created_at          = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at          = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    buyer            = relationship("User", foreign_keys=[buyer_id], back_populates="orders_placed")
    seller           = relationship("User", foreign_keys=[seller_id], back_populates="orders_received")
    shipping_address = relationship("ShippingAddress", back_populates="orders")
    payment_method   = relationship("PaymentMethod", back_populates="orders")


class StarPurchaseRequest(Base):
    """
    User-submitted Star purchase request awaiting admin verification
    """
    __tablename__ = "star_purchase_requests"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stars_amount    = Column(Integer, nullable=False)
    amount_paid     = Column(Float, nullable=False)
    currency        = Column(String(10), default="INR")
    payment_method  = Column(String(50), default="UPI")  # UPI, Razorpay, Bank Transfer, Card
    transaction_ref = Column(String(100), nullable=False)  # UTR / Tx ID
    receipt_url     = Column(Text, nullable=True)  # Receipt screenshot
    status          = Column(String(30), default="pending")  # pending, approved, rejected
    admin_note      = Column(String(255), nullable=True)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at    = Column(DateTime, nullable=True)

    user = relationship("User")


class BlueTickRequest(Base):
    """
    User applications/purchases for Blue Tick Verification badge
    """
    __tablename__ = "blue_tick_requests"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name        = Column(String(120), nullable=False)
    category         = Column(String(60), default="Creator")  # Creator, Influencer, Business, Public Figure, VIP
    id_document_type = Column(String(60), default="Aadhaar Card")  # Aadhaar, PAN Card, Passport, Driving License
    id_document_url  = Column(Text, nullable=True)  # ID image/PDF
    payment_ref      = Column(String(100), nullable=True)  # UTR / Tx ID
    amount_paid      = Column(Float, default=499.0)  # INR
    currency         = Column(String(10), default="INR")
    status           = Column(String(30), default="pending")  # pending, approved, rejected
    admin_note       = Column(String(255), nullable=True)
    created_at       = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at      = Column(DateTime, nullable=True)

    user = relationship("User")


class StarCashoutRequest(Base):
    """
    User requests to convert Stars to INR cash (Payout / Redemption)
    Admin verifies, transfers money to User's UPI/Bank, and approves the cashout.
    """
    __tablename__ = "star_cashout_requests"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stars_amount        = Column(Integer, nullable=False)
    conversion_rate     = Column(Float, default=0.50)  # e.g. 1 Star = 0.50 INR
    inr_amount          = Column(Float, nullable=False)
    currency            = Column(String(10), default="INR")
    payout_method       = Column(String(50), default="UPI")  # UPI, Bank Transfer, Paytm, PhonePe
    upi_id              = Column(String(100), nullable=True)
    bank_name           = Column(String(100), nullable=True)
    account_number      = Column(String(100), nullable=True)
    ifsc_code           = Column(String(50), nullable=True)
    account_holder_name = Column(String(120), nullable=True)
    phone_number        = Column(String(30), nullable=True)
    status              = Column(String(30), default="pending")  # pending, paid, rejected
    admin_payout_ref    = Column(String(100), nullable=True)  # Bank/UPI UTR reference of payment by Admin
    admin_note          = Column(String(255), nullable=True)
    created_at          = Column(DateTime, default=datetime.datetime.utcnow)
    paid_at             = Column(DateTime, nullable=True)

    user = relationship("User")


class PinResetRequest(Base):
    """
    User requests to Reset / Forgot Payment Security PIN awaiting Admin verification and approval.
    """
    __tablename__ = "pin_reset_requests"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name        = Column(String(120), nullable=True)
    email            = Column(String(150), nullable=True)
    phone            = Column(String(30), nullable=True)
    reason           = Column(Text, nullable=True)
    status           = Column(String(30), default="pending")  # pending, approved, rejected, resolved
    admin_note       = Column(String(255), nullable=True)
    temp_reset_token = Column(String(100), nullable=True)
    created_at       = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at      = Column(DateTime, nullable=True)

    user = relationship("User")

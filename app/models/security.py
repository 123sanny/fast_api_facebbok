from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum


class GuardianStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVOKED = "revoked"


class AuditSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class Passkey(Base):
    """
    FIDO2 / WebAuthn Biometric & Hardware Passkey Credentials
    """
    __tablename__ = "passkeys"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    credential_id = Column(String(255), unique=True, nullable=False, index=True)
    public_key    = Column(Text, nullable=False)
    device_name   = Column(String(100), nullable=False, default="Device")
    aaguid        = Column(String(64), nullable=True)
    counter       = Column(Integer, default=0)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)
    last_used_at  = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="passkeys")


class BackupCode(Base):
    """
    10 Cold-Storage One-Time Recovery Codes for 2FA Fallback
    """
    __tablename__ = "backup_codes"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    code_hash  = Column(String(255), nullable=False)
    is_used    = Column(Boolean, default=False, nullable=False)
    used_at    = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="backup_codes")


class RecoveryGuardian(Base):
    """
    Trusted Social Recovery Guardians for Anti-Hack Account Restoral
    """
    __tablename__ = "recovery_guardians"

    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    guardian_user_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    guardian_email     = Column(String(150), nullable=False)
    guardian_name      = Column(String(100), nullable=True)
    status             = Column(String(20), default="pending")  # pending / approved / rejected / revoked
    security_threshold = Column(Integer, default=1)
    approved_at        = Column(DateTime, nullable=True)
    created_at         = Column(DateTime, default=datetime.datetime.utcnow)

    user     = relationship("User", foreign_keys=[user_id], back_populates="guardians")
    guardian = relationship("User", foreign_keys=[guardian_user_id])


class SecurityAuditLog(Base):
    """
    Real-time Anti-Hack Event Telemetry & Audit Logs
    """
    __tablename__ = "security_audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type  = Column(String(60), nullable=False)  # failed_login, passkey_used, password_changed, sim_swap_alert, suspicious_ip, new_device_login
    ip_address  = Column(String(60), nullable=True)
    user_agent  = Column(Text, nullable=True)
    location    = Column(String(120), nullable=True)
    severity    = Column(String(20), default="info")  # info, warning, critical
    details     = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="security_audit_logs")

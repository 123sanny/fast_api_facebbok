from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ==================== Password Management ====================
class ChangePasswordRequest(BaseModel):
    user_id: Optional[int] = None
    current_password: str
    new_password: str
    logout_other_devices: Optional[bool] = False


class ChangePasswordResponse(BaseModel):
    success: bool
    message: str


# ==================== Passkeys ====================
class PasskeyRegisterInitResponse(BaseModel):
    challenge: str
    rp_id: str
    rp_name: str
    user_id: str
    user_name: str
    user_display_name: str


class PasskeyCreate(BaseModel):
    credential_id: str
    public_key: str
    device_name: Optional[str] = "Hardware Security Key / Biometric"
    aaguid: Optional[str] = None


class PasskeyOut(BaseModel):
    id: int
    user_id: int
    credential_id: str
    device_name: str
    aaguid: Optional[str] = None
    created_at: datetime
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PasskeyAuthVerifyRequest(BaseModel):
    credential_id: str
    authenticator_data: str
    client_data_json: str
    signature: str


# ==================== TOTP 2FA ====================
class TotpSetupResponse(BaseModel):
    secret: str
    qr_code_uri: str
    manual_entry_key: str


class TotpVerifyRequest(BaseModel):
    code: str


# ==================== Cold-Storage Backup Codes ====================
class BackupCodesGenerateResponse(BaseModel):
    codes: List[str]
    message: str


class BackupCodeVerifyRequest(BaseModel):
    code: str


# ==================== Recovery Guardians ====================
class RecoveryGuardianCreate(BaseModel):
    guardian_email: EmailStr
    guardian_name: Optional[str] = None


class RecoveryGuardianOut(BaseModel):
    id: int
    user_id: int
    guardian_user_id: Optional[int] = None
    guardian_email: str
    guardian_name: Optional[str] = None
    status: str
    security_threshold: int
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RecoveryGuardianApprovalRequest(BaseModel):
    guardian_id: int
    action: str  # approve / reject / revoke


# ==================== Security Settings ====================
class SecuritySettingsUpdate(BaseModel):
    two_factor_enabled: Optional[bool] = None
    two_factor_method: Optional[str] = None
    sim_swap_protection_enabled: Optional[bool] = None
    biometric_lock_enabled: Optional[bool] = None
    anti_phishing_code: Optional[str] = None
    recovery_guardian_enabled: Optional[bool] = None
    login_alerts: Optional[bool] = None
    max_active_sessions: Optional[int] = None


class SecuritySettingsOut(BaseModel):
    id: int
    user_id: int
    two_factor_enabled: bool
    two_factor_method: Optional[str] = None
    sim_swap_protection_enabled: bool
    biometric_lock_enabled: bool
    anti_phishing_code: Optional[str] = None
    recovery_guardian_enabled: bool
    login_alerts: bool
    max_active_sessions: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Security Audit Logs ====================
class SecurityAuditLogOut(BaseModel):
    id: int
    user_id: int
    event_type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None
    severity: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

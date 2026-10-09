from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginSchema(BaseModel):
    email: str = Field(..., description="Email address or mobile phone number")
    password: str

class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(..., description="Email address or mobile phone number")
    channel: Optional[str] = Field("email", description="Channel: email, sms, or backup_code")

class ForgotPasswordResponse(BaseModel):
    status: str
    message: str
    masked_destination: str
    channel: str
    expires_in_seconds: int = 900
    user_avatar: Optional[str] = None
    user_name: Optional[str] = None

class VerifyResetCodeRequest(BaseModel):
    identifier: str
    code: str = Field(..., min_length=4, max_length=16, description="6-digit OTP or emergency backup code")

class VerifyResetCodeResponse(BaseModel):
    status: str
    message: str
    reset_token: str
    identifier: str

class ResetPasswordRequest(BaseModel):
    identifier: str
    reset_token: str
    new_password: str = Field(..., min_length=6, description="New strong password")

class ResetPasswordResponse(BaseModel):
    status: str
    message: str

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    first_name: Optional[str] = None
    surname: Optional[str] = None
    picture: Optional[str] = None
    google_id: Optional[str] = None
    token: Optional[str] = None

class GoogleAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: int
    first_name: str
    surname: str
    email: str
    profile_pic: Optional[str] = None
    auth_method: str = "google_oauth"
    message: str = "Google authentication successful"


class UserSessionOut(BaseModel):
    id: int
    user_id: int
    device: Optional[str] = "Web Browser"
    ip_address: Optional[str] = "127.0.0.1"
    created_at: Optional[object] = None

    class Config:
        from_attributes = True
from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    first_name: str
    surname: str
    dob: str
    mobile: str
    gender: str
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    id: int
    first_name: str
    surname: str
    email: str
    message: str

    class Config:
        from_attributes = True
        
        
from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    surname: str
    gender:  str
    phone:  int
    date_of_birth: str


class UserLogin(BaseModel):
    email: str
    password: str


class FriendRequestSchema(BaseModel):
    receiver: int


class MessageSchema(BaseModel):
    receiver: int
    message: str
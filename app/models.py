from sqlalchemy import Column, Integer, String ,Date
from app.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    surname = Column(String(50))
    email = Column(String(100), unique=True)
    password = Column(String(255))
    phone = Column(String(20))
    gender = Column(String(10))
    date_of_birth = Column(Date)

class FriendRequest(Base):

    __tablename__ = "friend_requests"

    id = Column(Integer, primary_key=True)
    sender = Column(Integer)
    receiver = Column(Integer)
    status = Column(String(20))


class Message(Base):

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    sender = Column(Integer)
    receiver = Column(Integer)
    message = Column(String(500))
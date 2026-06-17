from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models
from routers import auth, profile
# from routers import 

# from models.profile_photo import ProfilePhoto
app = FastAPI(title="Social Chat API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "Social Chat API running!"}
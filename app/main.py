import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
import models
from routers import auth, profile, security, support, ai, friends, chat, notifications, marketplace, hyperlocal, audio_lounge, stories, ads, settings, reels, admin, wallet, community_hub

app = FastAPI(title="Nexoria Social API", version="2.5.0")


# Mount Uploads directory for static avatar & cover serving
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "profile"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "cover"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "chat"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "stories"), exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "reels"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.3:3000",
        "*"
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
app.include_router(profile.posts_router)
app.include_router(security.router)
app.include_router(support.router)
app.include_router(ai.router)
app.include_router(friends.router)
app.include_router(chat.router)
app.include_router(notifications.router)
app.include_router(marketplace.router)
app.include_router(hyperlocal.router)
app.include_router(audio_lounge.router)
app.include_router(stories.router)
app.include_router(ads.router)
app.include_router(settings.router)
app.include_router(reels.router)
app.include_router(admin.router)
app.include_router(wallet.router)
app.include_router(community_hub.router)





@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Nexoria Social Cosmos",
        "version": "2.5.0",
        "biometrics_enabled": True
    }
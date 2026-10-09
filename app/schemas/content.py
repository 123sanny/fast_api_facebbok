from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ==================== POST TIPS ====================
class PostTipCreate(BaseModel):
    post_id: int
    stars_amount: int = 10
    message: Optional[str] = None


class PostTipOut(BaseModel):
    id: int
    post_id: int
    tipper_id: int
    stars_amount: int
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== REACTIONS ====================
class ReactionCreate(BaseModel):
    reaction_type: str = "like"  # like, love, care, haha, wow, sad, angry, fire, star
    post_id: Optional[int] = None
    reel_id: Optional[int] = None


class ReactionOut(BaseModel):
    id: int
    user_id: int
    reaction_type: str
    post_id: Optional[int] = None
    reel_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== COMMENTS ====================
class CommentCreate(BaseModel):
    content: str
    post_id: Optional[int] = None
    reel_id: Optional[int] = None
    parent_id: Optional[int] = None  # for threaded replies
    image_url: Optional[str] = None
    gif_url: Optional[str] = None


class CommentUpdate(BaseModel):
    content: str


class CommentReactionCreate(BaseModel):
    comment_id: int
    reaction_type: str = "like"


class CommentOut(BaseModel):
    id: int
    user_id: int
    post_id: Optional[int] = None
    reel_id: Optional[int] = None
    parent_id: Optional[int] = None
    content: str
    image_url: Optional[str] = None
    gif_url: Optional[str] = None
    created_at: datetime
    replies_count: Optional[int] = 0
    reactions_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ==================== POSTS ====================
class PostCreate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    feeling: Optional[str] = None
    location: Optional[str] = None
    privacy: Optional[str] = "public"
    is_pinned: Optional[bool] = False
    repost_of_id: Optional[int] = None
    language: Optional[str] = "en"
    tags: Optional[str] = None
    voice_caption: Optional[str] = None
    monetization_enabled: Optional[bool] = False
    paywall_stars: Optional[int] = 0
    # Music Attachment
    music_title: Optional[str] = None
    music_artist: Optional[str] = None
    music_url: Optional[str] = None
    music_cover: Optional[str] = None
    music_duration: Optional[int] = 30


class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    feeling: Optional[str] = None
    location: Optional[str] = None
    privacy: Optional[str] = None
    is_pinned: Optional[bool] = None
    tags: Optional[str] = None
    monetization_enabled: Optional[bool] = None
    paywall_stars: Optional[int] = None


class PostOut(BaseModel):
    id: int
    user_id: int
    content: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    feeling: Optional[str] = None
    location: Optional[str] = None
    privacy: str
    is_pinned: bool
    repost_of_id: Optional[int] = None
    truthguard_score: float
    is_deepfake: bool
    ai_summary: Optional[str] = None
    virality_score: float
    stars_earned: int
    language: str
    tags: Optional[str] = None
    voice_caption: Optional[str] = None
    monetization_enabled: bool
    paywall_stars: int
    music_title: Optional[str] = None
    music_artist: Optional[str] = None
    music_url: Optional[str] = None
    music_cover: Optional[str] = None
    music_duration: Optional[int] = 30
    created_at: datetime
    updated_at: datetime
    reactions_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    shares_count: Optional[int] = 0

    class Config:
        from_attributes = True



# ==================== REELS & WATCH VIDEOS ====================
class ReelCreate(BaseModel):
    user_id: int
    video_type: Optional[str] = "reel"  # 'reel' (9:16) or 'watch' (16:9)
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    audio_title: Optional[str] = "Original Audio"
    category: Optional[str] = "Trending"
    duration: Optional[int] = 15


class ReelReactRequest(BaseModel):
    user_id: int
    reaction_type: Optional[str] = "like"


class ReelCommentRequest(BaseModel):
    user_id: int
    content: str
    parent_id: Optional[int] = None


class ReelStarsRequest(BaseModel):
    user_id: int
    stars_amount: Optional[int] = 50
    message: Optional[str] = None


class WatchPartyChatRequest(BaseModel):
    user: str
    text: str
    party_id: Optional[str] = "general"


class ReelOut(BaseModel):
    id: int
    user_id: int
    video_type: Optional[str] = "reel"
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    audio_title: str
    category: Optional[str] = "Trending"
    duration: int
    views_count: int
    shares_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== STORIES ====================
class StoryCreate(BaseModel):
    user_id: Optional[int] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = "image"
    text_overlay: Optional[str] = None
    background_gradient: Optional[str] = None
    font_style: Optional[str] = "Clean"
    expires_at: Optional[datetime] = None
    # Music Attachment
    music_title: Optional[str] = None
    music_artist: Optional[str] = None
    music_url: Optional[str] = None
    music_cover: Optional[str] = None
    music_lyrics: Optional[str] = None
    music_sticker_style: Optional[str] = "sticker"


class StoryViewCreate(BaseModel):
    story_id: int
    reaction_emoji: Optional[str] = None


class StoryViewOut(BaseModel):
    id: int
    story_id: int
    viewer_id: int
    reaction_emoji: Optional[str] = None
    viewed_at: datetime

    class Config:
        from_attributes = True


class StoryOut(BaseModel):
    id: int
    user_id: int
    media_url: Optional[str] = None
    media_type: str
    text_overlay: Optional[str] = None
    background_gradient: Optional[str] = None
    font_style: Optional[str] = "Clean"
    expires_at: Optional[datetime] = None
    created_at: datetime
    views_count: Optional[int] = 0
    music_title: Optional[str] = None
    music_artist: Optional[str] = None
    music_url: Optional[str] = None
    music_cover: Optional[str] = None
    music_lyrics: Optional[str] = None
    music_sticker_style: Optional[str] = "sticker"

    class Config:
        from_attributes = True



# ==================== SHARES ====================
class ShareCreate(BaseModel):
    post_id: int
    quote_text: Optional[str] = None
    shared_to: Optional[str] = "timeline"


class ShareOut(BaseModel):
    id: int
    user_id: int
    post_id: int
    quote_text: Optional[str] = None
    shared_to: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== SAVED BOOKMARKS ====================
class SavedCollectionCreate(BaseModel):
    name: str
    privacy: Optional[str] = "only_me"


class SavedCollectionOut(BaseModel):
    id: int
    user_id: int
    name: str
    privacy: str
    created_at: datetime

    class Config:
        from_attributes = True


class SavedPostOut(BaseModel):
    id: int
    user_id: int
    post_id: int
    collection_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== POST TAGS ====================
class PostTagCreate(BaseModel):
    post_id: int
    tagged_user_id: int


class PostTagOut(BaseModel):
    id: int
    post_id: int
    tagged_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== STORIES & 24H STATUS ====================
class StoryCreate(BaseModel):
    user_id: int
    media_type: Optional[str] = "text"  # 'text' | 'photo' | 'image' | 'video'
    media_url: Optional[str] = None
    text_overlay: Optional[str] = None
    background_gradient: Optional[str] = "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)"
    font_style: Optional[str] = "Clean"


class StoryViewCreate(BaseModel):
    viewer_id: int
    reaction_emoji: Optional[str] = None  # ❤️, 😂, 🔥, 👍, 😍, ⭐


class StoryViewOut(BaseModel):
    id: int
    story_id: int
    viewer_id: int
    viewer_name: Optional[str] = None
    viewer_img: Optional[str] = None
    reaction_emoji: Optional[str] = None
    viewed_at: datetime

    class Config:
        from_attributes = True


class StoryOut(BaseModel):
    id: int
    user_id: int
    name: str
    username: Optional[str] = None
    user_img: Optional[str] = None
    media_url: Optional[str] = None
    media_type: str = "text"
    text_overlay: Optional[str] = None
    background_gradient: Optional[str] = None
    font_style: Optional[str] = "Clean"
    created_at: datetime
    expires_at: Optional[datetime] = None
    time_ago: Optional[str] = "Just now"
    views_count: int = 0
    has_viewed: bool = False
    is_own_story: bool = False
    is_friend_story: bool = True
    views: List[StoryViewOut] = []

    class Config:
        from_attributes = True


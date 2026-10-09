from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum


class ReactionType(str, enum.Enum):
    LIKE = "like"
    LOVE = "love"
    CARE = "care"
    HAHA = "haha"
    WOW = "wow"
    SAD = "sad"
    ANGRY = "angry"
    FIRE = "fire"
    STAR = "star"


class PostPrivacy(str, enum.Enum):
    PUBLIC = "public"
    FRIENDS = "friends"
    ONLY_ME = "only_me"
    CUSTOM = "custom"


class Post(Base):
    """
    Nexoria Feed Post with Multi-Media, AI Authenticity & Engagement
    """
    __tablename__ = "posts"

    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content              = Column(Text, nullable=True)
    image_url            = Column(Text, nullable=True)
    video_url            = Column(Text, nullable=True)
    feeling              = Column(String(50), nullable=True)
    location             = Column(String(100), nullable=True)
    privacy              = Column(String(20), default="public")  # public, friends, only_me, custom
    is_pinned            = Column(Boolean, default=False)
    repost_of_id         = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)

    # TruthGuard AI & Smart Studio Fields
    truthguard_score     = Column(Float, default=98.5)   # 0.0 - 100.0 Authenticity Score
    is_deepfake          = Column(Boolean, default=False)
    ai_summary           = Column(Text, nullable=True)
    virality_score       = Column(Float, default=0.0)
    stars_earned         = Column(Integer, default=0)
    language             = Column(String(20), default="en")
    tags                 = Column(Text, nullable=True)
    voice_caption        = Column(Text, nullable=True)
    monetization_enabled = Column(Boolean, default=False)
    # Music / Audio Attachment
    music_title          = Column(String(150), nullable=True)
    music_artist         = Column(String(150), nullable=True)
    music_url            = Column(Text, nullable=True)
    music_cover          = Column(Text, nullable=True)
    music_duration       = Column(Integer, default=30)
    # Ghost Protocol & Ephemeral Self-Destruct
    is_ghost             = Column(Boolean, default=False)
    ghost_alias          = Column(String(100), nullable=True)
    ghost_expire_hours   = Column(Integer, default=0)
    expire_at            = Column(DateTime, nullable=True)

    created_at           = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at           = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    author               = relationship("User", back_populates="posts")
    reactions            = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")
    likes                = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    comments             = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    shares               = relationship("Share", foreign_keys="Share.post_id", back_populates="post", cascade="all, delete-orphan")
    saved                = relationship("SavedPost", back_populates="post", cascade="all, delete-orphan")
    tips                 = relationship("PostTip", back_populates="post", cascade="all, delete-orphan")
    tagged_friends       = relationship("PostTag", back_populates="post", cascade="all, delete-orphan")
    original_post        = relationship("Post", remote_side=[id])


class Reel(Base):
    """
    Videos Hub (Short-form Vertical Reels & Long-form 16:9 Watch Videos)
    """
    __tablename__ = "reels"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    video_type    = Column(String(20), default="reel")  # 'reel' (9:16) or 'watch' (16:9)
    title         = Column(String(255), nullable=True)  # For Watch long-form videos
    description   = Column(Text, nullable=True)
    video_url     = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    caption       = Column(Text, nullable=True)
    audio_title   = Column(String(100), default="Original Audio")
    category      = Column(String(50), default="Trending")
    duration      = Column(Integer, default=15)  # seconds
    views_count   = Column(Integer, default=0)
    shares_count  = Column(Integer, default=0)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    creator   = relationship("User", back_populates="reels")
    reactions = relationship("Reaction", back_populates="reel", cascade="all, delete-orphan")
    comments  = relationship("Comment", back_populates="reel", cascade="all, delete-orphan")
    tips      = relationship("PostTip", back_populates="reel", cascade="all, delete-orphan")
    saved     = relationship("SavedPost", back_populates="reel", cascade="all, delete-orphan")


class Story(Base):
    """
    24-hour Disappearing Stories
    """
    __tablename__ = "stories"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    media_url           = Column(Text, nullable=True)
    media_type          = Column(String(20), default="image")  # image / video / text
    text_overlay        = Column(Text, nullable=True)
    background_gradient = Column(String(150), nullable=True)
    font_style          = Column(String(50), nullable=True, default="Clean")
    # Music / Audio Attachment
    music_title         = Column(String(150), nullable=True)
    music_artist        = Column(String(150), nullable=True)
    music_url           = Column(Text, nullable=True)
    music_cover         = Column(Text, nullable=True)
    music_lyrics        = Column(Text, nullable=True)
    music_sticker_style = Column(String(50), default="sticker")  # sticker, vinyl, lyrics, compact
    expires_at          = Column(DateTime, nullable=True)
    created_at          = Column(DateTime, default=datetime.datetime.utcnow)

    author = relationship("User", back_populates="stories")
    views  = relationship("StoryView", back_populates="story", cascade="all, delete-orphan")


class StoryView(Base):
    """
    Tracking Story Viewers and Quick Emoji Reactions
    """
    __tablename__ = "story_views"

    id             = Column(Integer, primary_key=True, index=True)
    story_id       = Column(Integer, ForeignKey("stories.id", ondelete="CASCADE"), nullable=False, index=True)
    viewer_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reaction_emoji = Column(String(20), nullable=True)  # quick reaction like ❤️, 😂, 🔥
    viewed_at      = Column(DateTime, default=datetime.datetime.utcnow)

    story  = relationship("Story", back_populates="views")
    viewer = relationship("User")


class Reaction(Base):
    """
    Facebook Multi-Reactions (Like, Love, Care, Haha, Wow, Sad, Angry, Fire, Star)
    """
    __tablename__ = "reactions"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id       = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    reel_id       = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=True, index=True)
    reaction_type = Column(String(20), default="like")  # like, love, care, haha, wow, sad, angry, fire, star
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reactions")
    post = relationship("Post", back_populates="reactions")
    reel = relationship("Reel", back_populates="reactions")


class Like(Base):
    """
    Standard Like compatibility table
    """
    __tablename__ = "likes"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")


class Comment(Base):
    """
    Multi-Level Nested Threaded Comments
    """
    __tablename__ = "comments"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    reel_id    = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=True, index=True)
    parent_id  = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    content    = Column(Text, nullable=False)
    image_url  = Column(Text, nullable=True)
    gif_url    = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user      = relationship("User", back_populates="comments")
    post      = relationship("Post", back_populates="comments")
    reel      = relationship("Reel", back_populates="comments")
    parent    = relationship("Comment", remote_side=[id], back_populates="replies")
    replies   = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")
    reactions = relationship("CommentReaction", back_populates="comment", cascade="all, delete-orphan")


class CommentReaction(Base):
    """
    Reactions on Comments
    """
    __tablename__ = "comment_reactions"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    comment_id    = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=False, index=True)
    reaction_type = Column(String(20), default="like")
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    user    = relationship("User")
    comment = relationship("Comment", back_populates="reactions")


class Share(Base):
    """
    Shares and Reposts to feed, groups, or messages
    """
    __tablename__ = "shares"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    quote_text = Column(Text, nullable=True)
    shared_to  = Column(String(30), default="timeline")  # timeline, group, message
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="shares")
    post = relationship("Post", foreign_keys=[post_id], back_populates="shares")


class SavedCollection(Base):
    """
    Organized Saved Bookmarks Folders / Collections
    """
    __tablename__ = "saved_collections"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name       = Column(String(100), nullable=False)
    privacy    = Column(String(20), default="only_me")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user        = relationship("User", back_populates="saved_collections")
    saved_posts = relationship("SavedPost", back_populates="collection", cascade="all, delete-orphan")


class SavedPost(Base):
    """
    Saved Posts & Reels / Bookmarks
    """
    __tablename__ = "saved_posts"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id       = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    reel_id       = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=True, index=True)
    collection_id = Column(Integer, ForeignKey("saved_collections.id", ondelete="SET NULL"), nullable=True)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    user       = relationship("User", back_populates="saved_posts")
    post       = relationship("Post", back_populates="saved")
    reel       = relationship("Reel", back_populates="saved")
    collection = relationship("SavedCollection", back_populates="saved_posts")


class PostTag(Base):
    """
    Friend Tagging in Posts
    """
    __tablename__ = "post_tags"

    id             = Column(Integer, primary_key=True, index=True)
    post_id        = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    tagged_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)

    post        = relationship("Post", back_populates="tagged_friends")
    tagged_user = relationship("User")


class PostTip(Base):
    """
    Community Star Tips awarded directly to a specific Post or Reel
    """
    __tablename__ = "post_tips"

    id           = Column(Integer, primary_key=True, index=True)
    post_id      = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    reel_id      = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=True, index=True)
    tipper_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stars_amount = Column(Integer, nullable=False, default=10)
    message      = Column(String(255), nullable=True)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    post   = relationship("Post", back_populates="tips")
    reel   = relationship("Reel", back_populates="tips")
    tipper = relationship("User", back_populates="post_tips")
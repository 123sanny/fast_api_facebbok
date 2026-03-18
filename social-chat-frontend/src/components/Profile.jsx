import React from "react";
import MenuIcons from "./MenuIcons";
import "./Profile.css";

function Profile() {
    const friends = [ { name: "Rohit Sharma", img: "https://i.pravatar.cc/150?img=1" }, { name: "Anjali Verma", img: "https://i.pravatar.cc/150?img=2" }, { name: "Amit Singh", img: "https://i.pravatar.cc/150?img=3" }, { name: "Priya Sharma", img: "https://i.pravatar.cc/150?img=4" }, { name: "Karan Jain", img: "https://i.pravatar.cc/150?img=5" }, { name: "Neha Gupta", img: "https://i.pravatar.cc/150?img=6" }, ];
  return (
    
    <div className="profiles">
        <div className="menu-icons">
            <MenuIcons />
</div>
      {/* Cover Photo */}
      <div className="cover">
        <img
          src="https://picsum.photos/800/300"
          alt="cover"
        />
      </div>

      {/* Profile Info */}
      <div className="profile-info">

        <img
          className="profile-pic"
          src="https://i.pravatar.cc/150"
          alt="profile"
        />

        <h2>Sanny Tiwari</h2>

        <p>5K followers · 4 following · 43 posts</p>

        <span className="bio">
          Digital creator · Delhi · Computer Science
        </span>

      </div>

      {/* Buttons */}
      <div className="profile-buttons">

        <button className="blue">
          Professional dashboard
        </button>

        <div className="small-btns">
          <button>Add to story</button>
          <button>Advertise</button>
        </div>

      </div>

      {/* Tabs */}
      <div className="tabs">
        <span className="active">All</span>
        <span>Reels</span>
        <span>Photos</span>
        <span>Events</span>
      </div>

      {/* Personal Details */}
     <div className="details">

        <h3>
            Personal details
            <span className="edit-icon">✏️</span>
        </h3>

        <p>📍 Delhi, India</p>
        <p>🏠 Deoria</p>
        <p>🎂 10 August 2002</p>

        </div>

      <div className="details">
        <h3>
          Education
          <span className="edit-icon">✏️</span>
        </h3>
        <p>🎓 Bachelor of Technology - Computer Science</p>
        <p>🏫 Delhi University</p>
        <p>📅 2020 - 2024</p>
      </div>
      {/* Friends Section */}
<div className="details friends-section">

  <div className="friends-header">
    <h3>Friends</h3>
    <span className="see-all">See all</span>
  </div>

  <div className="friends-row">
    {friends.map((friend, index) => (
      <div className="friend" key={index}>
        <img src={friend.img} alt={friend.name} />
        <p>{friend.name}</p>
        <span>5 mutual friends</span>
      </div>
    ))}
  </div>

</div>
{/* All Posts Section */}
<div className="all-posts">

  <div className="post-header">
    <h3>All posts</h3>
    <span className="filter">Filters</span>
  </div>

  <div className="post-input">
    <img
      src="https://i.pravatar.cc/150"
      alt="user"
    />

    <input
      type="text"
      placeholder="What's on your mind?"
    />

    <span className="photo-icon">🖼️</span>
  </div>

  <div className="post-actions">

    <button className="reel-btn">
      🎬 Reel
    </button>

    <button className="live-btn">
      🔴 Live
    </button>

  </div>

  <button className="manage-posts">
    💬 Manage posts
  </button>

</div>
{/* Posts Section */}
<div className="posts">

  {/* Post 1 */}
  <div className="post-card">

    <div className="post-top">

      <img 
        className="post-profile"
        src="https://i.pravatar.cc/150?img=10"
        alt="user"
      />

      <div className="post-user-info">
        <h4>Sanny Tiwari</h4>

        <div className="post-meta">
          <span>2d</span>
          <span>🎵 Tanux - Sare Vaade Jitenge</span>
          <span>🌍</span>
        </div>
      </div>

      <div className="post-menu">⋯</div>

    </div>

    <p className="post-text">
      Finding ticket to world cup 2026 ⚽🔥
    </p>

    <img 
      className="post-img"
      src="https://picsum.photos/500/300"
      alt="post"
    />

    <div className="post-actions">
      <button>👍 Like</button>
      <button>💬 Comment</button>
      <button>↗ Share</button>
    </div>

  </div>


  {/* Post 2 */}
  <div className="post-card">

    <div className="post-top">

      <img 
        className="post-profile"
        src="https://i.pravatar.cc/150?img=10"
        alt="user"
      />

      <div className="post-user-info">
        <h4>Sanny Tiwari</h4>

        <div className="post-meta">
          <span>1d</span>
          <span>🌍</span>
        </div>
      </div>

      <div className="post-menu">⋯</div>

    </div>

    <p className="post-text">
      Learning React everyday 🚀
    </p>

    <div className="post-actions">
      <button>👍 Like</button>
      <button>💬 Comment</button>
      <button>↗ Share</button>
    </div>

  </div>

</div>
    </div>
    

  );
}

export default Profile;
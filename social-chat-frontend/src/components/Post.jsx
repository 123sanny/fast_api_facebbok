import React from "react";
import "./Post.css";

function Post() {

  const posts = [
    {
      name: "Rk kardam",
      time: "1d",
      caption: "आज भीम आर्मी चीफ माननीय सांसद एडवोकेट चन्द्रशेखर आजाद जी...",
      profile: "https://i.pravatar.cc/40?img=8",
      image: "https://picsum.photos/500/400"
    },
    {
      name: "Sahil Paswan",
      time: "3h",
      caption: "Beautiful day with friends ❤️",
      profile: "https://i.pravatar.cc/40?img=9",
      image: "https://picsum.photos/500/401"
    }
  ];

  return (

    <div className="posts">

      {posts.map((post, index) => (

        <div className="post" key={index}>

          {/* Post Header */}
          <div className="post-header">

            <img
              className="post-profile"
              src={post.profile}
              alt=""
            />

            <div>
              <h4>{post.name}</h4>
              <span>{post.time}</span>
            </div>

          </div>

          {/* Caption */}
          <p className="caption">{post.caption}</p>

          {/* Image */}
          <img
            className="post-image"
            src={post.image}
            alt=""
          />

          {/* Actions */}
          <div className="post-actions">
            <span>👍 Like</span>
            <span>💬 Comment</span>
            <span>↗ Share</span>
          </div>

        </div>

      ))}

    </div>

  );
}

export default Post;
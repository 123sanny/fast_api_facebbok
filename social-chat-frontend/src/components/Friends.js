import React from "react";
import MenuIcons from "./MenuIcons";
import "./Friends.css";

function Friends() {

  const requests = [
    {
      id: 1,
      name: "حسام نبيل",
      time: "9w",
      img: "https://i.pravatar.cc/100",
      mutualText: null,
      mutualImg: null
    },
    {
      id: 2,
      name: "Naina Kumari",
      mutualText: "1 mutual friend",
      time: "1y",
      img: "https://i.pravatar.cc/101",
      mutualImg: "https://i.pravatar.cc/30"
    },
    {
      id: 3,
      name: "Shri Ram Prasad",
      mutualText: "2 mutual friends",
      time: "10w",
      img: "https://i.pravatar.cc/102",
      mutualImg: "https://i.pravatar.cc/31"
    },
    {
      id: 4,
      name: "Aftab Alam",
      mutualText: "2 mutual friends",
      time: "9w",
      img: "https://i.pravatar.cc/103",
      mutualImg: "https://i.pravatar.cc/32"
    }
  ];

  return (
    <div className="fb-container">

      <div className="menu-icons">
        <MenuIcons />
      </div>

      {/* Title */}
      <div className="title-row">
        <h2>Friend Requests <span>{requests.length}</span></h2>
        <a href="#">See all</a>
      </div>

      {/* Requests */}
      {requests.map((req) => (
        <div className="friend-card" key={req.id}>

          <img src={req.img} className="profiless" alt="profiless" />

          <div className="friend-info">

            <div className="name-row">
              <h4>{req.name}</h4>
              <span className="time">{req.time}</span>
            </div>

            {req.mutualText && (
              <div className="mutual">
                <img src={req.mutualImg} alt="mutual" />
                <span>{req.mutualText}</span>
              </div>
            )}

            <div className="buttons">
              <button className="confirm">Confirm</button>
              <button className="delete">Delete</button>
            </div>

          </div>

        </div>
      ))}

    </div>
  );
}

export default Friends;
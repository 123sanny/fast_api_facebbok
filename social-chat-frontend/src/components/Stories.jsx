import React from "react";
import "./Stories.css";

function Stories() {

  const stories = [
    {
      name: "Yugantak Prakash",
      img: "https://i.pravatar.cc/150?img=5"
    },
    {
      name: "Satish Gupta",
      img: "https://i.pravatar.cc/150?img=6"
    },
    {
      name: "Rohit",
      img: "https://i.pravatar.cc/150?img=7"
    }
  ];

  return (

    <div className="stories">

      {/* Create story */}
      <div className="story create">

        <img
          src="https://i.pravatar.cc/150"
          alt=""
        />

        <div className="plus">+</div>

        <p>Create Story</p>

      </div>


      {/* Other Stories */}
      {stories.map((story, index) => (

        <div className="story" key={index}>

          <img src={story.img} alt="" />

          <p>{story.name}</p>

        </div>

      ))}

    </div>

  );
}

export default Stories;
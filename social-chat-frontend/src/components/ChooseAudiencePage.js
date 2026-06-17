import React, { useState } from "react";
import { BsArrowLeft, BsThreeDotsVertical, BsChevronDown, BsGlobe2, BsStar } from "react-icons/bs";
import { FaUserFriends, FaUsers } from "react-icons/fa";
import "./css/ChooseAudiencePage.css";

const AUDIENCE_OPTIONS = [
  {
    id: "public",
    label: "Public",
    sub: "Anyone on or off Facebook",
    icon: <BsGlobe2 size={26} />,
  },
  {
    id: "friends_of_friends",
    label: "Friends of friends",
    sub: "Your friends of friends",
    icon: <FaUsers size={26} />,
  },
  {
    id: "friends",
    label: "Friends",
    sub: "Your friends on Facebook",
    icon: <FaUserFriends size={26} />,
  },
  {
    id: "close_friends",
    label: "Close friends",
    sub: <span className="cap-create-link">Create your list</span>,
    icon: <BsStar size={26} />,
  },
];

function ChooseAudiencePage({ initialValue = "public", onClose, onSave }) {
  const [selected, setSelected] = useState(initialValue);
  const [showAll, setShowAll] = useState(false);

  const visibleOptions = showAll ? AUDIENCE_OPTIONS : AUDIENCE_OPTIONS.slice(0, 4);

  const handleDone = () => {
    const found = AUDIENCE_OPTIONS.find(o => o.id === selected);
    onSave && onSave(found ? found.label : "Public");
    onClose();
  };

  return (
    <div className="cap-wrapper">

      {/* Header */}
      <div className="cap-header">
        <button className="cap-back" onClick={onClose}>
          <BsArrowLeft size={22} />
        </button>
        <div className="cap-header-right">
          <BsThreeDotsVertical size={20} />
        </div>
      </div>

      {/* Body */}
      <div className="cap-body">
        <h2 className="cap-title">Choose audience</h2>

        <div className="cap-list">
          {visibleOptions.map(option => (
            <div
              key={option.id}
              className="cap-item"
              onClick={() => setSelected(option.id)}
            >
              {/* Icon */}
              <div className="cap-item-icon">{option.icon}</div>

              {/* Text */}
              <div className="cap-item-text">
                <p className="cap-item-label">{option.label}</p>
                <p className="cap-item-sub">{option.sub}</p>
              </div>

              {/* Radio */}
              <div className={`cap-radio ${selected === option.id ? "selected" : ""}`}>
                {selected === option.id && <div className="cap-radio-dot" />}
              </div>
            </div>
          ))}

          {/* See all toggle */}
          {!showAll && (
            <div className="cap-see-all" onClick={() => setShowAll(true)}>
              <BsChevronDown size={18} />
              <span>See all</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="cap-footer">
        <button className="cap-done-btn" onClick={handleDone}>
          Done
        </button>
      </div>

    </div>
  );
}

export default ChooseAudiencePage;

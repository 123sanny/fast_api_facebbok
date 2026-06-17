import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import "./css/TimeManagement.css";

const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

const slides = [
  {
    title: "Average time per day",
    desc: "The average time that you spent per day using Facebook in the past 7 days. Learn more about",
    linkText: "balancing your time online.",
    time: "1h 48m",
    timeLabel: "daily average",
    color: "#1877f2",
    data: [60, 30, 50, 25, 45, 70, 20],
  },
  {
    title: "Daytime average",
    desc: "The amount of time you spent using Facebook during the daytime.",
    linkText: null,
    time: "1h 30m",
    timeLabel: "average from  07:00-22:00",
    color: "#1a3a6e",
    data: [55, 40, 48, 22, 50, 65, 30],
  },
  {
    title: "Nighttime average",
    desc: "The amount of time you spent using Facebook during the nighttime.",
    linkText: null,
    time: "18m",
    timeLabel: "average from  22:00-07:00",
    color: "#00a86b",
    data: [35, 10, 20, 8, 25, 55, 0],
  },
];

const BarChart = ({ data, color }) => {
  const max = Math.max(...data);
  return (
    <div className="tm-chart">
      {data.map((val, i) => (
        <div className="tm-bar-wrap" key={i}>
          <div
            className="tm-bar"
            style={{
              height: `${(val / max) * 80}px`,
              backgroundColor: color,
              opacity: val === max ? 1 : 0.5,
            }}
          ></div>
          <span className="tm-day">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

const TimeManagement = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const slide = slides[active];

  return (
    <div className="tm-container">

      {/* Header */}
      <div className="tm-header">
        <BsChevronLeft className="tm-back" onClick={() => navigate(-1)} />
      </div>
      <div className="tm-divider"></div>

      {/* Slide Content */}
      <div className="tm-content">
        <h2>Time management</h2>

        {/* Swipeable area */}
        <div className="tm-slide">
          <h3>{slide.title}</h3>
          <p className="tm-desc">
            {slide.desc}{" "}
            {slide.linkText && (
              <span className="tm-link">{slide.linkText}</span>
            )}
          </p>

          <div className="tm-stat">
            <span
              className="tm-dot"
              style={{ backgroundColor: slide.color }}
            ></span>
            <span className="tm-time" style={{ color: slide.color }}>
              {slide.time}
            </span>
            <span className="tm-time-label">{slide.timeLabel}</span>
          </div>

          {/* Bar Chart */}
          <BarChart data={slide.data} color={slide.color} />

          {/* Dots */}
          <div className="tm-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`tm-dot-indicator ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
              ></span>
            ))}
          </div>
        </div>

        {/* Manage your time */}
        <div className="tm-manage">
          <h3>Manage your time</h3>

          <div className="tm-manage-item">
            <div>
              <strong>Sleep mode</strong>
              <p>Off</p>
            </div>
            <BsChevronRight />
          </div>

          <div className="tm-divider"></div>

          <div className="tm-manage-item">
            <div>
              <strong>Daily limit</strong>
              <p>Off</p>
            </div>
            <BsChevronRight />
          </div>
        </div>
      </div>

    </div>
  );
};

export default TimeManagement;
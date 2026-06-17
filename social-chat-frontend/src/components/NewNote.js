import React, { useState, useRef } from 'react';
import { BsX, BsMusicNoteBeamed, BsEmojiSmile, BsChevronLeft, BsSearch, BsPlayFill, BsPauseFill } from "react-icons/bs";
import { HiOutlineGif } from "react-icons/hi2";
import "./css/NewNote.css";

const NewNote = ({ onClose }) => {
  const [noteText, setNoteText] = useState("");
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Mock Music Data
  const musicTracks = [
    { id: 1, title: "Lagan Lagi", artist: "Sukhwinder Singh", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", img: "https://picsum.photos/100/100?sig=10" },
    { id: 2, title: "Dhurandhar", artist: "Shashwat Sachdev", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", img: "https://picsum.photos/100/100?sig=11" },
  ];

  const handleSelectMusic = (track) => {
    setSelectedMusic(track);
    setShowMusicPicker(false);
    setIsPlaying(true);
    // Chota delay taaki audio source update ho jaye
    setTimeout(() => audioRef.current.play(), 100);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="new-note-overlay">
      <audio ref={audioRef} src={selectedMusic?.url} onEnded={() => setIsPlaying(false)} />

      {/* --- Music Playlist Overlay --- */}
      {showMusicPicker && (
        <div className="music-picker-screen">
          <div className="picker-header">
            <BsChevronLeft size={24} onClick={() => setShowMusicPicker(false)} />
            <div className="search-box">
              <BsSearch className="text-muted" />
              <input type="text" placeholder="Search music" />
            </div>
          </div>
          <div className="picker-body px-3">
            <p className="fw-bold mt-3">Suggested</p>
            {musicTracks.map((track) => (
              <div key={track.id} className="music-row" onClick={() => handleSelectMusic(track)}>
                <img src={track.img} alt="album" />
                <div className="music-meta">
                  <p className="mb-0 fw-bold">{track.title}</p>
                  <p className="mb-0 text-muted small">{track.artist}</p>
                </div>
                <BsPlayFill className="text-muted" size={24} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Main Note Header --- */}
      <div className="note-header">
        <BsX size={32} onClick={onClose} style={{ cursor: 'pointer' }} />
        <h5 className="mb-0 fw-bold">New note</h5>
        <button className={`share-btn ${noteText.length > 0 ? 'active' : ''}`} disabled={noteText.length === 0}>
          Share
        </button>
      </div>

      <div className="note-content-body">
        <div className="thought-container">
          {/* Selected Music Badge */}
          {selectedMusic && (
            <div className="music-tag-bubble animate-pop" onClick={togglePlay}>
              <BsMusicNoteBeamed className={`me-1 ${isPlaying ? 'music-spin' : ''}`} />
              <span>{selectedMusic.title}</span>
              <BsX className="ms-1" onClick={(e) => { e.stopPropagation(); setSelectedMusic(null); }} />
            </div>
          )}

          <div className="thought-bubble">
            <textarea
              placeholder="Share a thought..."
              maxLength="60"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>

          <div className="profile-wrapper">
            <img src="https://i.pravatar.cc/150?u=sanny" alt="profile" className="note-profile-img" />
          </div>
          <span className="char-count text-muted">{noteText.length}/60</span>
        </div>

        {/* Music Icon Click to open list */}
        <div className="note-actions d-flex justify-content-center gap-3 mt-4">
          <div 
            className={`action-circle ${selectedMusic ? 'active-icon' : ''}`} 
            onClick={() => setShowMusicPicker(true)}
          >
            <BsMusicNoteBeamed />
          </div>
          <div className="action-circle"><HiOutlineGif /></div>
          <div className="action-circle"><BsEmojiSmile /></div>
        </div>

        {/* Music Suggestions List (Bottom) */}
        {/* <div className="music-selection-list mt-5 px-3">
          {musicTracks.map(track => (
            <div key={track.id} className="music-card" onClick={() => handleSelectMusic(track)}>
              <img src={track.img} alt="album" />
              <div className="music-info">
                <h6 className="mb-0">{track.title}</h6>
                <small>♬ {track.artist}</small>
              </div>
            </div>
          ))}
        </div> */}
        {/* 4. Horizontal Music List (As per your request) */}
        <div className="music-horizontal-container mt-4">
          <div className="music-scroll-wrapper">
            {musicTracks.map((track) => (
              <div 
                key={track.id} 
                className={`music-horizontal-card ${selectedMusic?.id === track.id ? 'selected' : ''}`}
                onClick={() => setSelectedMusic(track)}
              >
                <img src={track.img} alt="album" />
                <div className="music-info-mini">
                  <h6>
                    {track.title} {track.explicit && <span className="explicit-badge">E</span>}
                  </h6>
                  <small>♬ {track.artist}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Footer Info Section */}
        <div className="note-footer-info mt-auto mb-4 px-4 text-center">
           <p className="text-muted mb-1" style={{fontSize: '13px'}}>
             Shared with <span className="fw-bold text-dark">Friends and connections</span> for <span className="fw-bold text-dark">24 hours</span>.
           </p>
           <span className="change-link fw-bold" style={{cursor: 'pointer', color: '#0866ff'}}>Change</span>
        </div>
      </div>
    </div>
  );
};

export default NewNote;
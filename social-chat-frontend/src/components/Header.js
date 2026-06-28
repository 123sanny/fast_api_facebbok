import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  BsPlusLg, BsSearch, BsMessenger, BsFileText,
  BsBook, BsCameraVideo, BsBroadcastPin, BsChatLeftText,
  BsChevronUp, BsChevronDown, BsImage, BsPersonPlus,
  BsEmojiSmile, BsArrowLeft, BsX, // BsX import karein cut symbol ke liye
  BsGeoAlt, BsCameraVideoFill, BsType, BsCameraFill,
  BsFlagFill,
  BsMusicNoteBeamed, BsWhatsapp, BsTelephoneFill,
  BsStars,
  BsFileEarmarkPlayFill,
} from "react-icons/bs";

import "./css/Header.css";
import Stories from "./Stories";
import Post from "./Post";
import PrivacyPages from "./PrivacyPages";
import CreateStory from "./CreateStory";
import ReelStory from "./ReelStory";
import NewNote from "./NewNote";

import SearchOverlay from "./SearchOverlay";





function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [showPostScreen, setShowPostScreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [postText, setPostText] = useState("");
  const [activePrivacyPage, setActivePrivacyPage] = useState(null); // 'public', 'instagram', 'ai' ya null
  // Nayi states preview ke liye
  const [selectedMedia, setSelectedMedia] = useState(null); // URL store karega
  const [mediaType, setMediaType] = useState(null); // 'image' ya 'video' store karega
  const [showStoryPage, setShowStoryPage] = useState(false);
  const [showReelPage, setShowReelPage] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const recentSearches = [
    { id: 1, name: "Vijay Sagar Azad", img: "https://i.pravatar.cc/150?u=1", online: true },
    { id: 2, name: "Settings", icon: "bi-gear", desc: "System preferences" }
  ];

  const suggested = [
    { id: 101, name: "Er AK Yadav", desc: "Suggested for you", img: "https://i.pravatar.cc/150?u=2" }
  ];
  // --- FUNCTIONS ---

  const handleReelClick = () => {
    const input = document.getElementById('reelCameraInput');
    if (input) { input.click(); }
  };

  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setIsLiveActive(true);
      setTimeout(() => {
        const videoElement = document.getElementById('livePreview');
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play();
        }
      }, 100);
    } catch (err) {
      alert("Camera open nahi ho raha.");
    }
  };

  const stopLiveStream = () => {
    const videoElement = document.getElementById('livePreview');
    if (videoElement && videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsLiveActive(false);
  };

  // Media Select Function (Image aur Video dono ke liye)
  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type.split('/')[0]; // 'image' ya 'video' nikalega
      const fileUrl = URL.createObjectURL(file);

      setSelectedMedia(fileUrl); // Preview URL set karein
      setMediaType(fileType); // Type set karein (image/video)
    }
  };

  // Media hatane ka function
  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaType(null);
  };

  return (
    <div className="header">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="topbar">
        <div className="left">
          <span className="menu" onClick={() => setOpen(true)}>☰</span>
          <h2 className="logo" onClick={() => navigate("/")}>Nexoria</h2>
        </div>

        <div className="right" style={{ position: 'relative', display: 'flex', gap: '10px' }}>
          <span className="icon-wrapper" onClick={() => setShowCreateModal(!showCreateModal)}>
            <BsPlusLg className="header-icon" />
          </span>
          <i className="bi bi-search" onClick={() => setIsSearching(true)}></i>

          {/* SEARCH COMPONENT KO YAHAN RAKHEIN */}
          <SearchOverlay
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            recentSearches={recentSearches}
            suggested={suggested}
          />
          <span className="icon-wrapper"><BsMessenger className="header-icon" /></span>

          {showCreateModal && (
            <div className="create-popup shadow">
              <h5 className="p-2 border-bottom">Create</h5>
              <div className="popup-item" onClick={() => { setShowPostScreen(true); setShowCreateModal(false); }}>
                <BsFileText className="me-2 text-primary" /> Post
              </div>
              <div className="popup-item" onClick={() => {
                setShowStoryPage(true);
              }}>
                <BsBook className="me-2 text-success" /> Story
              </div>

              {showStoryPage && <CreateStory onClose={() => setShowStoryPage(false)} />}

              <div className="popup-item" onClick={() => {
                setShowReelPage(true);
              }}>
                <BsBook className="me-2 text-success" /> Reel
              </div>

              {showReelPage && <ReelStory onClose={() => setShowReelPage(false)} />}
              {/* <div className="popup-item" onClick={handleReelClick}><BsCameraVideo className="me-2 text-danger" /> Reel</div> */}

              <div className="popup-item" onClick={startLiveStream}><BsBroadcastPin className="me-2 text-warning" /> Live</div>
              {/* <div className="popup-item"><BsChatLeftText className="me-2 text-info" /> Note</div> */}
              <div className="popup-item" onClick={() => setIsNoteOpen(true)}>
                <BsChatLeftText className="me-2 text-primary" />  Note
              </div>

              {isNoteOpen && <NewNote onClose={() => setIsNoteOpen(false)} />}
            </div>
          )}
        </div>
      </div>

      <div className="menu-icons">
        <NavLink to="/home"><i className="bi bi-house"></i></NavLink>
        <NavLink to="/reels"><i className="bi bi-play-btn"></i></NavLink>
        <NavLink to="/friends"><i className="bi bi-people"></i></NavLink>
        <NavLink to="/market"><i className="bi bi-shop"></i></NavLink>
        <NavLink to="/notifications"><i className="bi bi-bell"></i></NavLink>
        <NavLink to="/profile">
          <img className="header-profile" src="https://i.pravatar.cc/40" alt="profile" />
        </NavLink>
      </div>

      <div className="post-box">
        <img className="header-profile" src="https://i.pravatar.cc/40" alt="user" onClick={() => navigate("/profile")} />
        <input type="text" placeholder="What's on your mind?" />
        <span className="photo">🖼</span>
      </div>

      <Stories />
      <Post />

      {/* --- CREATE POST FULL SCREEN --- */}
      {showPostScreen && (
        <div className="create-post-full-screen">
          <div className="post-header">
            <div className="post-back-icon" onClick={() => setShowPostScreen(false)}>
              <BsArrowLeft size={24} />
            </div>
            <h5>Create post</h5>
            <button className={`post-btn-next ${(postText.trim() || selectedMedia) ? 'active' : ''}`}>
              Next
            </button>
          </div>

          <div className="post-body-container" style={{ overflowY: 'auto', flex: 1 }}>
            <div className="post-user-info p-3">
              <img src="https://i.pravatar.cc/40" alt="user" className="rounded-circle me-2" />
              <div>
                <h6>Sanny Tiwari</h6>
                <div className="post-privacy-badges">
                  <span className="badge-item" onClick={() => setActivePrivacyPage('public')}>
                    <i className="bi bi-globe-americas me-1"></i> Public
                    <i className="bi bi-caret-down-fill ms-1" style={{ fontSize: '10px' }}></i>
                  </span>


                  <span className="badge-item" onClick={() => setActivePrivacyPage('instagram')}>
                    <i className="bi bi-instagram me-1"></i> Off <i className="bi bi-caret-down-fill ms-1" style={{ fontSize: '10px' }}></i>
                  </span>

                  <span className="badge-item" onClick={() => setActivePrivacyPage('ai')}>
                    <i className="bi bi-plus-lg me-1"></i> AI label off <i className="bi bi-caret-down-fill ms-1" style={{ fontSize: '10px' }}></i>
                  </span>
                </div>
              </div>
            </div>

            {/* --- PRIVACY SELECTION PAGES --- */}
            {/* {activePrivacyPage && (
                      <div className="privacy-overlay-wrapper">
                        <PrivacyPages 
                            type={activePrivacyPage} 
                            onClose={() => setActivePrivacyPage(null)} 
                        />
                      </div>
                    )} */}
            {activePrivacyPage && (
              <div className={activePrivacyPage === 'public' ? "" : "privacy-overlay-wrapper"}>
                <PrivacyPages
                  type={activePrivacyPage}
                  onClose={() => setActivePrivacyPage(null)}
                />
              </div>
            )}


            <textarea
              className="post-textarea"
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            ></textarea>

            {/* Media Preview Window (Image aur Video ke liye) */}
            {selectedMedia && (
              <div className="post-media-preview-wrapper p-2">

                {/* Cut Symbol - Ab ye image ke upar aayega */}
                <span className="remove-media-icon" onClick={removeMedia}>
                  <BsX size={20} />
                </span>

                {/* Condition: Image dikhao ya Video */}
                {mediaType === 'image' ? (
                  <img src={selectedMedia} alt="Selected" className="preview-media-content" />
                ) : (
                  <video src={selectedMedia} controls className="preview-media-content" autoPlay loop muted></video>
                )}
              </div>
            )}
          </div>

          {/* Options Bottom List */}
          <div className={`post-options-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="expand-trigger" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <BsChevronDown /> : <BsChevronUp />}
            </div>

            <div className="post-options-list">
              {/* Media Upload Trigger (accept add kiya hai image aur video dono ke liye) */}
              <input type="file" id="postMediaInput" hidden onChange={handleMediaUpload} accept="image/*,video/*" />
              <div className="opt-item" onClick={() => document.getElementById('postMediaInput').click()}>
                <BsImage className="opt-icon text-success" /> Photo/video
              </div>

              {/* Baaki items... */}
              <div className="opt-item"><BsPersonPlus className="opt-icon text-primary" /> Tag people</div>
              <div className="opt-item"><BsEmojiSmile className="opt-icon text-warning" /> Feeling/activity</div>

              {isExpanded && (
                <>
                  <div className="opt-item"><BsGeoAlt className="opt-icon text-danger" /> Check in</div>
                  <div className="opt-item"><BsCameraVideoFill className="opt-icon text-danger" /> Live video</div>
                  <div className="opt-item"><BsType className="opt-icon text-info" /> Background colour</div>
                  <div className="opt-item"><BsCameraFill className="opt-icon text-primary" /> Camera</div>
                  <div className="opt-item"><BsFileEarmarkPlayFill className="opt-icon text-success" /> GIF</div>
                  <div className="opt-item"><BsFlagFill className="opt-icon text-info" /> Life update</div>
                  <div className="opt-item"><BsMusicNoteBeamed className="opt-icon" style={{ color: '#f35e21' }} /> Music</div>
                  <div className="opt-item"><BsWhatsapp className="opt-icon text-success" /> Get WhatsApp messages</div>
                  <div className="opt-item"><BsTelephoneFill className="opt-icon text-primary" /> Get Calls</div>
                  <div className="opt-item"><BsStars className="opt-icon" style={{ color: '#a033ff' }} /> AI images</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Open Page In Publi Insta */}

    </div>
  );
}

export default Header;
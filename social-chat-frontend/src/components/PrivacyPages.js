import React, { useState, useEffect } from 'react';
import { 
  BsArrowLeft, BsGlobeAmericas, BsPeopleFill, 
  BsPersonDashFill, BsPersonFill, BsLockFill, 
  BsInstagram
} from "react-icons/bs";
import { getActiveUserId, getActiveUserHandle, getUserStorageItem } from "../services/profileApi";
import { fetchPrivacySettingsApi, updatePrivacySettingsApi } from "../services/settingsApi";
import "./css/PrivacyPages.css";

const PrivacyPages = ({ type, onClose }) => {
  const currentUserId = getActiveUserId();
  const userHandle = getActiveUserHandle();
  const userAvatar = getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId);

  const [selectedAudience, setSelectedAudience] = useState("Public");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadAudience = async () => {
      try {
        const res = await fetchPrivacySettingsApi(currentUserId);
        if (res && res.who_can_see_posts) {
          setSelectedAudience(res.who_can_see_posts);
        }
      } catch (err) {
        console.warn("Could not load audience from backend:", err);
      }
    };
    loadAudience();
  }, [currentUserId]);

  if (!type) return null;

  const handleDoneAudience = async () => {
    if (setAsDefault) {
      setIsSaving(true);
      try {
        await updatePrivacySettingsApi(currentUserId, { who_can_see_posts: selectedAudience });
      } catch (err) {
        console.warn("Could not save default audience:", err);
      } finally {
        setIsSaving(false);
      }
    }
    if (onClose) onClose(selectedAudience);
  };

  // --- 1. AUDIENCE PAGE (FULL SCREEN) ---
  if (type === 'public' || type === 'instagram') {
    return (
      <div className="privacy-full-screen">
        {/* Header Section */}
        <div className="privacy-header border-bottom">
          <span onClick={onClose} className="post-back-arrow" style={{cursor:'pointer'}}><BsArrowLeft size={22} /></span>
          <h5 className="mb-0 ms-3">
            {type === 'public' ? "Who can see your post?" : "Sharing to Instagram"}
          </h5>
        </div>

        <div className="p-3">
          {/* Public Audience Content */}
          {type === 'public' && (
            <>
              <p className="text-muted small">
                Your post will appear in Feed, on your profile and in search results.
                <br /><br />
                Your default audience is set to <b>{selectedAudience}</b>, but you can change the audience of this specific post.
              </p>
              <div className="audience-list mt-3">
                {[
                  { title: "Public", desc: "Anyone on or off Nexoria", icon: <BsGlobeAmericas /> },
                  { title: "Friends", desc: "Your friends on Nexoria", icon: <BsPeopleFill /> },
                  { title: "Friends except...", desc: "Don't show to some friends", icon: <BsPersonDashFill /> },
                  { title: "Specific friends", desc: "Only show to some friends", icon: <BsPersonFill /> },
                  { title: "Only me", desc: "Only me", icon: <BsLockFill /> }
                ].map(opt => (
                  <div 
                    key={opt.title}
                    className="d-flex align-items-center justify-content-between py-3"
                    onClick={() => setSelectedAudience(opt.title)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="audience-icon-circle me-3">{opt.icon}</div>
                      <div>
                        <h6 className="mb-0 fw-bold">{opt.title}</h6>
                        <small className="text-muted d-block">{opt.desc}</small>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="audience" 
                      className="form-check-input" 
                      checked={selectedAudience === opt.title} 
                      onChange={() => setSelectedAudience(opt.title)} 
                      style={{width: '22px', height: '22px'}} 
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Instagram Full Screen Content */}
          {type === 'instagram' && (
            <div className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <div className="position-relative me-3">
                    <img src={userAvatar} className="rounded-circle" alt="user" style={{width:'45px', height:'45px'}} />
                    <BsInstagram className="position-absolute bottom-0 end-0 bg-white rounded-circle text-danger" style={{fontSize: '14px', padding:'1px'}} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{userHandle}</h6>
                    <small className="text-muted">Instagram · Public</small>
                  </div>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" style={{width: '45px', height: '24px', cursor:'pointer'}} />
                </div>
              </div>
              <div className="mb-4">
                  <h6 className="fw-bold mb-1">Audience</h6>
                  <p className="text-muted small">Your Instagram account is <b>Public</b>.</p>
                  <h6 className="fw-bold mb-1 mt-3">Where your post can appear</h6>
                  <p className="text-muted small">Feed, your profile and in other places across Instagram</p>
              </div>
              <div className="border-top pt-3 text-center mt-5">
                 <p className="small text-muted mb-0">
                   <span className="text-primary fw-bold">∞ Nexoria</span><br/>
                   To change your settings, go to <span style={{ color: "var(--color-primary)", cursor: "pointer", textDecoration: "underline" }}>Accounts Centre</span>.
                 </p>
              </div>
            </div>
          )}

          {/* Bottom Done Button for Full Screen */}
          {type === 'public' && (
            <div className="mt-4 pt-4">
              <div className="d-flex align-items-center mb-3">
                <input 
                  type="checkbox" 
                  className="form-check-input me-2" 
                  id="setDefault" 
                  checked={setAsDefault} 
                  onChange={(e) => setSetAsDefault(e.target.checked)} 
                />
                <label htmlFor="setDefault" className="text-muted small" style={{ cursor: "pointer" }}>Save as default audience in settings database.</label>
              </div>
              <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold" onClick={handleDoneAudience} disabled={isSaving}>
                {isSaving ? "Saving..." : "Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 2 & 3. BOTTOM SHEETS (AI & Instagram) ---
  // Ye overlay (transparent background) ke andar hain
  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle"></div>

        {/* AI Label Content - Bilkul image jaisa text */}
        {type === 'ai' && (
          <div className="p-2">
            <h5 className="text-center fw-bold mb-4">Labelling your content</h5>
            <div className="d-flex justify-content-between align-items-start">
              <div className="ai-info">
                <h6 className="fw-bold mb-1">Add AI label</h6>
                <p className="text-muted small">
                  We require you to label certain realistic content that's made with AI. 
                  <span className="ms-1" style={{ color: "var(--color-primary)", cursor: "pointer", textDecoration: "underline" }}>Learn more</span>
                </p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input p-2" type="checkbox" style={{width: '45px', height: '24px', cursor:'pointer'}} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const AudienceOption = ({ icon, title, desc, selected }) => (
  <div className="d-flex align-items-center justify-content-between py-3">
    <div className="d-flex align-items-center">
      <div className="audience-icon-circle me-3">{icon}</div>
      <div>
        <h6 className="mb-0 fw-bold">{title}</h6>
        {desc && <small className="text-muted d-block">{desc}</small>}
      </div>
    </div>
    <input type="radio" name="audience" className="form-check-input" defaultChecked={selected} style={{width: '22px', height: '22px'}} />
  </div>
);

export default PrivacyPages;
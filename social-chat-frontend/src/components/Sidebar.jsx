import React, { useState } from "react";
import "./Sidebar.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { 
  FaPenToSquare, 
  FaThreads, 
  FaInstagram, 
  FaRobot, 
  FaFacebookMessenger, 
  FaWhatsapp ,
  FaCircleCheck, // 👈 Ye missing tha
  FaPlus,        // 👈 Ye missing tha
  FaMeta         // 👈 Ye missing tha
} from "react-icons/fa6";

function Sidebar({ open, setOpen }) {
    const [showMore, setShowMore] = useState(false); // 🔥 ye missing tha

    const [showProfileModal, setShowProfileModal] = useState(false);
    return (
        <>
            {/* Overlay */}
            {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

            {/* Sidebar */}
            <div className={`sidebar ${open ? "active" : ""}`}>

                <div className="profile-cards" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>

                    <div className="profile-top">
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="profile"
                            className="profile-img"
                        />

                        <span className="profile-name">Sanny Tiwari</span>
                        <i className="bi bi-chevron-down arrow ms-auto"></i>

                    </div>

                    <div className="divider"></div>

                    <div className="create-page">
                        <div className="page-icon"></div>
                        <span>Create Facebook Page</span>
                    </div>

                </div>
                {/* 🔥 Shortcuts Section */}

                <div className="shortcuts">

                    <h4>Your shortcuts</h4>

                    {/* Skeleton boxes */}
                    <div className="shortcut-skeleton">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

                    {/* Grid Menu */}
                    <div className="shortcut-grid">

                        <div className="box">
                            <span>👥</span>
                            <p>Friends (233 online)</p>
                        </div>

                        <div className="box">
                            <span>📊</span>
                            <p>Professional dashboard</p>
                        </div>

                        <div className="box">
                            <span>⏱</span>
                            <p>Memories</p>
                        </div>

                        <div className="box">
                            <span>🔖</span>
                            <p>Saved</p>
                        </div>

                        {/* 👇 Hidden items */}
                        {showMore && (
                            <>
                                <div className="box">
                                    <span>🌐</span>
                                    <p>Groups</p>
                                </div>

                                <div className="box">
                                    <span>🎬</span>
                                    <p>Reels</p>
                                </div>

                                <div className="box">
                                    <span>🏪</span>
                                    <p>Marketplace</p>
                                </div>

                                <div className="box">
                                    <span>📡</span>
                                    <p>Feeds</p>
                                </div>
                            </>
                        )}

                    </div>

                    {/* 🔥 Button */}
                    <button
                        className="see-more"
                        onClick={() => setShowMore(!showMore)}
                    >
                        {showMore ? "See less" : "See more"}
                    </button>



                </div>

                    {/* 🔥 ALL SECTIONS */}
                    <div className="accordion" id="mainAccordion">

                        {/* Help */}
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                               <button
                            className="accordion-button collapsed section-header"
                            data-bs-toggle="collapse"
                            data-bs-target="#helpCollapse"
                            >
                           <i className="bi bi-question-circle me-2" style={{ fontSize: '1.2rem' }}></i>
    
                            <span className="flex-grow-1 text-start">Help and support</span>
                            
                            <i className="bi bi-chevron-down arrow ms-auto"></i>
                            </button>
                            </h2>

                            <div
                                id="helpCollapse"
                                className="accordion-collapse collapse"
                                data-bs-parent="#mainAccordion"
                            >
                                <div className="accordion-body">
                                    <p>Help Center</p>
                                    <p>Support Inbox</p>
                                    <p>Report a problem</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button collapsed"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#settingsCollapse"
                                >
                                  <i class="bi bi-gear me-3 fs-4"></i> <span class="flex-grow-1">Settings and privacy</span>
                                   <i className="bi bi-chevron-down arrow ms-auto"></i>

                                </button>
                            </h2>

                            <div
                                id="settingsCollapse"
                                className="accordion-collapse collapse"
                                data-bs-parent="#mainAccordion"
                            >
                                <div className="accordion-body">
                                    <p>Settings</p>
                                    <p>Privacy Checkup</p>
                                    <p>Activity Log</p>
                                </div>
                            </div>
                        </div>

                        {/* Professional */}
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button collapsed"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#proCollapse"
                                >
                                   <i class="bi bi-grid-1x2 me-3 fs-4"></i> <span class="flex-grow-1">Professional access</span>
                                     <i className="bi bi-chevron-down arrow ms-auto"></i>

                                </button>
                            </h2>

                            <div
                                id="proCollapse"
                                className="accordion-collapse collapse"
                                data-bs-parent="#mainAccordion"
                            >
                                <div className="accordion-body">
                                    <div className="verified-card">
                                        <img src="https://img.freepik.com/free-vector/blue-check-mark-badge_78370-699.jpg" />
                                        <div>
                                            <h4>Meta Verified</h4>
                                            <p>Build trust with a verified badge.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Also from Meta */}
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button collapsed"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#metaCollapse"
                                >
                                    <i class="bi bi-grid-3x3-gap me-3 fs-4"></i> <span class="flex-grow-1">Also from Meta</span>
                                    <i className="bi bi-chevron-down arrow ms-auto"></i>

                                </button>
                            </h2>

                            <div
                                id="metaCollapse"
                                className="accordion-collapse collapse"
                                data-bs-parent="#mainAccordion"
                            >
                                <div className="accordion-body">
                                   <p><FaPenToSquare className="me-2" /> Edits</p>
                                    <p><FaThreads className="me-2" /> Threads</p>
                                    <p><FaInstagram className="me-2" /> Instagram</p>
                                    <p><FaRobot className="me-2" /> Chat with AIs</p>
                                    <p><FaFacebookMessenger className="me-2" /> Messenger</p>
                                    <p><FaWhatsapp className="me-2" /> WhatsApp</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Logout */}
                    <button className="see-more">Logout</button>


{showProfileModal && (
                <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-handle"></div>
                        
                        {/* Current Profile */}
                        <div className="modal-profile-item active-profile">
                            <img src="https://i.pravatar.cc/40" alt="user" />
                            <span className="flex-grow-1">Sanny Tiwari</span>
                            <FaCircleCheck className="text-primary" />
                        </div>

                        <div className="modal-profile-item">
                            <div className="modal-icon-circle"><FaPlus /></div>
                            <span>Create Facebook Page</span>
                        </div>

                        <p className="modal-label">Your Instagram profile</p>

                        {/* Instagram Account */}
                        <div className="modal-profile-item ig-item">
                            <div className="ig-avatar-container">
                                <img src="https://i.pravatar.cc/40" alt="ig" />
                                <FaInstagram className="ig-mini-badge" />
                            </div>
                            <div className="flex-grow-1">
                                <div className="ig-name">sanny.tiwari.355</div>
                                <div className="ig-notif text-danger">● 2 notifications</div>
                            </div>
                            <span className="text-muted">•••</span>
                        </div>

                        <button className="btn-accounts">Go to Accounts Centre</button>

                        <div className="meta-footer">
                            <FaMeta className="meta-icon" /> <span>Meta</span>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}

export default Sidebar;
import React, { useState } from "react";
import "./css/Sidebar.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ReportModal from "./ReportModal";
import { useTranslation } from "react-i18next";



import NexoriaAI from "./NexoriaAI";
import CreatorVaultModal from "./CreatorVaultModal";
import { NavLink } from "react-router-dom";


import {
    FaPenToSquare,
    FaRobot,
    FaCircleCheck,
    FaPlus,
    FaCalendarDays,
    FaBolt,
    FaCompass,
    FaComments
} from "react-icons/fa6";
import {
    BsPeopleFill,
    BsBarChartLineFill,
    BsClockHistory,
    BsBookmarkFill,
    BsGlobe,
    BsPlayBtn,
    BsShop,
    BsFlagFill,
    BsRss,
    BsLifePreserver,
    BsMegaphone,
    BsPersonCircle,
    BsExclamationTriangle,
    BsLock,
    BsClock,
    BsGearFill,
    BsPhone,

    BsMoonStarsFill,
    BsCreditCard,
    BsTranslate,
    BsGlobe2,
    BsShieldFillCheck,
    BsStarFill
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { getActiveUserId, getActiveUserName, getActiveUserHandle, getUserStorageItem } from "../services/profileApi";

function Sidebar({ open, setOpen }) {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);
    const [showNexoriaAI, setShowNexoriaAI] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showCreatorVaultModal, setShowCreatorVaultModal] = useState(false);
    const navigate = useNavigate();

    const activeUserId = getActiveUserId();
    const [sidebarName, setSidebarName] = useState(() => getActiveUserName());
    const [sidebarHandle, setSidebarHandle] = useState(() => getActiveUserHandle());
    const [sidebarAvatar, setSidebarAvatar] = useState(() => getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeUserId}`, activeUserId));

    React.useEffect(() => {
        const handleProfileUpdate = () => {
            const currentId = getActiveUserId();
            setSidebarAvatar(getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentId}`, currentId));
            setSidebarName(getActiveUserName());
            setSidebarHandle(getActiveUserHandle());
        };
        window.addEventListener("profile-updated", handleProfileUpdate);
        return () => window.removeEventListener("profile-updated", handleProfileUpdate);
    }, []);

    const handleLogout = async () => {

        const token = localStorage.getItem(
            "access_token"
        );

        try {
            await fetch(
                "http://localhost:8000/auth/logout",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (err) {
            console.log(err);
        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("first_name");
        localStorage.clear();

        navigate("/login", {
            replace: true
        });
    };

    return (
        <>
            {/* Overlay */}
            {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

            {/* Sidebar */}
            <div className={`sidebar ${open ? "active" : ""}`}>

                <div className="profile-cards" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>

                    <div className="profile-top">
                        <img
                            src={sidebarAvatar}
                            alt="profile"
                            className="profile-img"
                        />

                        <span className="profile-name">{sidebarName}</span>
                        <i className="bi bi-chevron-down arrow ms-auto"></i>

                    </div>

                    <div className="divider"></div>

                    <div className="create-page">
                        <div className="page-icon"></div>
                        <span>Create Nexoria Page</span>
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
                        <div className="box" onClick={() => { navigate('/friends'); setOpen(false); }}>
                            <BsPeopleFill className="shortcut-icon" style={{ color: '#1877f2' }} />
                            <p>{t("friends")}</p>
                        </div>

                        <div className="box" onClick={() => { navigate('/profile'); setOpen(false); }}>
                            <BsBarChartLineFill className="shortcut-icon" style={{ color: '#14B8A6' }} />
                            <p>Professional dashboard</p>
                        </div>
                        <div className="box" onClick={() => { navigate('/edit-profile'); setOpen(false); }}>
                            <BsClockHistory className="shortcut-icon" style={{ color: '#6C5CE7' }} />
                            <p>Edit Profile</p>
                        </div>
                        <div className="box" onClick={() => { navigate('/memories'); setOpen(false); }}>
                            <BsClockHistory className="shortcut-icon" style={{ color: '#6C5CE7' }} />
                            <p>Memories</p>
                        </div>

                        {/* 👇 Hidden items */}
                        {showMore && (
                            <>
                                <div className="box" onClick={() => { navigate('/saved'); setOpen(false); }}>
                                    <BsBookmarkFill className="shortcut-icon" style={{ color: '#C13584' }} />
                                    <p>{t("saved")}</p>
                                </div>
                                <div className="box" onClick={() => { navigate('/friends'); setOpen(false); }}>
                                    <BsGlobe className="shortcut-icon" style={{ color: '#1877f2' }} />
                                    <p>{t("friends")}</p>
                                </div>

                                <div className="box" onClick={() => { navigate('/reels'); setOpen(false); }}>
                                    <BsPlayBtn className="shortcut-icon" style={{ color: '#F02849' }} />
                                    <p>{t("reels")}</p>
                                </div>

                                <div className="box" onClick={() => { navigate('/market'); setOpen(false); }}>
                                    <BsShop className="shortcut-icon" style={{ color: '#00a884' }} />
                                    <p>{t("marketplace")}</p>
                                </div>
                                <div className="box" onClick={() => { navigate('/pages'); setOpen(false); }}>
                                    <BsFlagFill className="shortcut-icon" style={{ color: '#F35369' }} />
                                    <p>Pages</p>
                                </div>
                                <div className="box" onClick={() => { navigate('/events'); setOpen(false); }}>
                                    <FaCalendarDays className="shortcut-icon" style={{ color: '#F35369' }} />
                                    <p>Events</p>
                                </div>
                                <div className="box" onClick={() => { navigate('/feeds'); setOpen(false); }}>
                                    <BsRss className="shortcut-icon" style={{ color: '#2bb673' }} />
                                    <p>{t("feeds") || "Feeds"}</p>
                                </div>
                                <div className="box" onClick={() => { navigate('/watch'); setOpen(false); }}>
                                    <BsRss className="shortcut-icon" style={{ color: '#F7B928' }} />
                                    <p>{t("watch_feed")}</p>
                                </div>
                                <div className="box" onClick={() => { setShowCreatorVaultModal(true); setOpen(false); }}>
                                    <BsStarFill className="shortcut-icon" style={{ color: '#F7B928' }} />
                                    <p>Creator Vault</p>
                                </div>
                                <div className="box" onClick={() => { navigate('/support'); setOpen(false); }}>
                                    <BsLifePreserver className="shortcut-icon" style={{ color: '#14B8A6' }} />
                                    <p>Support</p>
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

                                <p onClick={() => setShowNexoriaAI(true)} style={{ cursor: "pointer" }}>
                                    <FaRobot className="me-2" style={{ color: '#00D2FF' }} />
                                    Nexoria Quantum AI Assistant
                                </p>

                                <NavLink to="/support" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <p style={{ cursor: "pointer" }}>
                                        <i className="bi bi-life-preserver me-2" style={{ color: '#14B8A6' }}></i>
                                        Support
                                    </p>
                                </NavLink>


                                <p onClick={() => setShowReportModal(true)} style={{ cursor: "pointer" }}>
                                    <BsExclamationTriangle className="me-2" style={{ color: '#F7B928' }} />
                                    Report a problem
                                </p>

                                {showReportModal && (
                                    <ReportModal onClose={() => setShowReportModal(false)} />
                                )}

                                <NavLink to="/terms_policies" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <p style={{ cursor: "pointer" }}>
                                        <i className="bi bi-life-preserver me-2" style={{ color: '#14B8A6' }}></i>
                                        Terms And Policy
                                    </p>
                                </NavLink>

                                {/* <p>
                                    <BsShieldCheck className="me-2" style={{ color: '#6C5CE7' }} />
                                    Terms And Policy
                                </p> */}
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
                                <i className="bi bi-gear me-3 fs-4"></i> <span className="flex-grow-1">{t("settings")}</span>
                                <i className="bi bi-chevron-down arrow ms-auto"></i>

                            </button>
                        </h2>

                        <div
                            id="settingsCollapse"
                            className="accordion-collapse collapse"
                            data-bs-parent="#mainAccordion"
                        >
                            <div className="accordion-body">
                                {/* Settings */}
                                <NavLink to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsGearFill /></div>
                                        <span>{t("settings")}</span>
                                    </div>
                                </NavLink>

                                {/* Security & Anti-Hack Shield */}
                                <NavLink to="/security" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon text-success"><BsShieldFillCheck /></div>
                                        <span>{t("security_shield")}</span>
                                    </div>
                                </NavLink>

                                {/* Privacy Checkup */}
                                <NavLink to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsLock /></div>
                                        <span>{t("privacy_checkup")}</span>
                                    </div>
                                </NavLink>

                                <NavLink to="/time-management" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsClock /></div>
                                        <span>{t("time_management")}</span>
                                    </div>
                                </NavLink>

                                {/* Device Request */}
                                <NavLink to="/device-login" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsPhone /></div>
                                        <span>{t("device_request")}</span>
                                    </div>
                                </NavLink>

                                {/* Recent ad activity */}
                                <NavLink to="/ad-activity" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsMegaphone /></div>
                                        <span>{t("recent_ad_activity")}</span>
                                    </div>
                                </NavLink>

                                {/* Link history */}
                                <NavLink to="/orders-payments" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsCreditCard /></div>
                                        <span>{t("orders_payments")}</span>
                                    </div>
                                </NavLink>

                                {/* Dark Mode */}
                                <NavLink to="/darkmodepage" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsMoonStarsFill /></div>
                                        <span>{t("dark_mode")}</span>
                                    </div>
                                </NavLink>

                                {/* Language */}
                                <NavLink to="/languagepage" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsTranslate /></div>
                                        <span>{t("language")}</span>
                                    </div>
                                </NavLink>
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
                                <i className="bi bi-grid-1x2 me-3 fs-4"></i> <span className="flex-grow-1">Professional access</span>
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
                                    <img src="https://img.freepik.com/free-vector/blue-check-mark-badge_78370-699.jpg" alt="Nexoria Verified badge" />
                                    <div>
                                        <h4>Nexoria Verified</h4>
                                        <p>Build trust with a verified badge.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* More from Nexoria */}
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button collapsed"
                                data-bs-toggle="collapse"
                                data-bs-target="#metaCollapse"
                            >
                                <i className="bi bi-grid-3x3-gap me-3 fs-4"></i> <span className="flex-grow-1">More from Nexoria</span>
                                <i className="bi bi-chevron-down arrow ms-auto"></i>

                            </button>
                        </h2>

                        <div
                            id="metaCollapse"
                            className="accordion-collapse collapse"
                            data-bs-parent="#mainAccordion"
                        >
                            <div className="accordion-body">
                                <p onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("open-pulse-lounge")); }} style={{ cursor: "pointer" }}>
                                    <span className="me-2">🎙️</span> <strong>Pulse Lounge</strong> (3D Audio)
                                </p>
                                <p onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("open-creator-vault")); }} style={{ cursor: "pointer" }}>
                                    <span className="me-2">⭐</span> <strong>Star Vault</strong> (Creator Tips)
                                </p>
                                <p onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("open-zen-player")); }} style={{ cursor: "pointer" }}>
                                    <span className="me-2">🎧</span> <strong>Zen Audio Sanctuary</strong>
                                </p>
                                <p><FaPenToSquare className="me-2" /> Nexoria Creator Studio</p>
                                <p><FaBolt className="me-2 text-warning" /> Nexoria Pulse (Micro-posts)</p>
                                <p><FaCompass className="me-2 text-danger" /> Nexoria Lens (Visual Hub)</p>
                                <p onClick={() => setShowNexoriaAI(true)} style={{ cursor: "pointer" }}><FaRobot className="me-2 text-info" /> Nexoria Quantum AI</p>
                                <p><FaComments className="me-2 text-primary" /> Nexoria Connect (E2EE Chat)</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Logout */}
                <button className="see-more" onClick={handleLogout}>{t("logout")}</button>


                {showProfileModal && (
                    <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
                        <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-handle"></div>

                            {/* Current Profile */}
                            <div className="modal-profile-item active-profile">
                                <img src={sidebarAvatar} alt="user" />
                                <span className="flex-grow-1">{sidebarName}</span>
                                <FaCircleCheck className="text-primary" />
                            </div>

                            <div className="modal-profile-item">
                                <div className="modal-icon-circle"><FaPlus /></div>
                                <span>Create Nexoria Page</span>
                            </div>

                            <p className="modal-label">Your Nexoria Lens profile</p>

                            {/* Connected Lens Account */}
                            <div className="modal-profile-item ig-item">
                                <div className="ig-avatar-container">
                                    <img src={sidebarAvatar} alt="ig" />
                                    <FaCompass className="ig-mini-badge text-warning" />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="ig-name">{sidebarHandle}</div>
                                    <div className="ig-notif text-success">● Synced with Nexoria</div>
                                </div>
                                <span className="text-muted">•••</span>
                            </div>

                            <button className="btn-accounts" onClick={() => navigate("/settings")}>Go to Nexoria Identity Centre</button>

                            <div className="meta-footer">
                                <BsGlobe2 className="meta-icon" /> <span>Nexoria Ecosystem</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showNexoriaAI && (
                <NexoriaAI onClose={() => setShowNexoriaAI(false)} />
            )}
            {showCreatorVaultModal && (
                <CreatorVaultModal onClose={() => setShowCreatorVaultModal(false)} />
            )}
        </>
    );
}

export default Sidebar;
import React, { useState } from "react";
import "./css/Sidebar.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ReportModal from "./ReportModal";
import { useTranslation } from "react-i18next";



import Meta from "./Meta";
import { NavLink } from "react-router-dom";


import {
    FaPenToSquare,
    FaThreads,
    FaInstagram,
    FaRobot,
    FaFacebookMessenger,
    FaWhatsapp,
    FaCircleCheck,
    FaPlus,
    FaMeta,
    FaCalendarDays,

} from "react-icons/fa6";
import {
    BsPeopleFill,
    BsBarChartLineFill,
    BsClockHistory,
    BsBookmarkFill,
    BsGlobe,
    BsPlayBtn,
    BsShop,
    BsRss,
    BsController,
    BsFlag,
    BsHandIndexThumb,
    BsLifePreserver,
    BsLightningChargeFill,
    BsMegaphone,
    BsPersonCircle,
    BsTagFill,
    BsExclamationTriangle,
    BsLock,
    BsClock,
    BsGearFill,
    BsPhone,

    BsMoonStarsFill,
    BsCreditCard,
    BsTranslate

} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
function Sidebar({ open, setOpen }) {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);
    const [showMeta, setShowMeta] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const navigate = useNavigate();

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
                            <BsPeopleFill className="shortcut-icon" style={{ color: '#1877F2' }} />
                            <p>{t("Friends (233 online)")}</p>
                        </div>

                        <div className="box">
                            <BsBarChartLineFill className="shortcut-icon" style={{ color: '#45BD62' }} />
                            <p>{t("Professional dashboard")}</p>
                        </div>
                        <div className="box">
                            <BsClockHistory className="shortcut-icon" style={{ color: '#1877F2' }} />
                            <p>{t("Edits")}</p>
                        </div>
                        <div className="box">
                            <BsClockHistory className="shortcut-icon" style={{ color: '#1877F2' }} />
                            <p>{t("Memories")}</p>
                        </div>



                        {/* 👇 Hidden items */}
                        {showMore && (
                            <>
                                <div className="box">
                                    <BsBookmarkFill className="shortcut-icon" style={{ color: '#C13584' }} />
                                    <p>Saved</p>
                                </div>
                                <div className="box">
                                    <BsGlobe className="shortcut-icon" style={{ color: '#1877F2' }} />
                                    <p>Groups</p>
                                </div>

                                <div className="box">
                                    <BsPlayBtn className="shortcut-icon" style={{ color: '#F02849' }} />
                                    <p>Reels</p>
                                </div>

                                <div className="box">
                                    <BsShop className="shortcut-icon" style={{ color: '#1877F2' }} />
                                    <p>Marketplace</p>
                                </div>
                                <div className="box">
                                    <BsMegaphone className="shortcut-icon" style={{ color: '#1877F2' }} />
                                    <p>Add Center </p>
                                </div>
                                <div className="box">
                                    <BsPersonCircle className="shortcut-icon" style={{ color: '#9739E3' }} />
                                    <p>Avatar </p>
                                </div>
                                <div className="box">
                                    <FaCalendarDays className="shortcut-icon" style={{ color: '#F35369' }} />
                                    <p>Events </p>
                                </div>
                                <div className="box">
                                    <BsRss className="shortcut-icon" style={{ color: '#F7B928' }} />
                                    <p>Feeds</p>
                                </div>
                                <div className="box">
                                    <BsTagFill className="shortcut-icon" style={{ color: '#000000' }} />
                                    <p>Finds</p>
                                </div>
                                <div className="box">
                                    <BsController className="shortcut-icon" style={{ color: '#1877F2' }} />
                                    <p>Games</p>
                                </div>
                                <div className="box">
                                    <BsLightningChargeFill className="shortcut-icon" style={{ color: '#FFD700' }} />
                                    <p>Nexoria Chat</p>
                                </div>
                                <div className="box">
                                    <BsFlag className="shortcut-icon" style={{ color: '#F56040' }} />
                                    <p>Pages</p>
                                </div>
                                <div className="box">
                                    <BsHandIndexThumb className="shortcut-icon" style={{ color: '#1877F2' }} />
                                    <p>Pokes</p>
                                </div>
                                <div className="box">
                                    <BsLifePreserver className="shortcut-icon" style={{ color: '#45BD62' }} />
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

                                <p onClick={() => setShowMeta(true)} style={{ cursor: "pointer" }}>
                                    <FaRobot className="me-2" style={{ color: '#00D2FF' }} />
                                    Meta AI support assistant
                                </p>

                                <NavLink to="/support" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <p style={{ cursor: "pointer" }}>
                                        <i className="bi bi-life-preserver me-2" style={{ color: '#45BD62' }}></i>
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
                                        <i className="bi bi-life-preserver me-2" style={{ color: '#45BD62' }}></i>
                                        Terms And Policy
                                    </p>
                                </NavLink>

                                {/* <p>
                                    <BsShieldCheck className="me-2" style={{ color: '#1877F2' }} />
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
                                {/* Settings */}
                                <NavLink to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <p style={{ cursor: "pointer" }}>
                                        <BsGearFill className="me-2" /> Settings
                                    </p>
                                </NavLink>


                                {/* Privacy Checkup */}
                                <NavLink to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsLock /></div>
                                        <span>Privacy Checkup</span>
                                    </div>
                                </NavLink>

                                <NavLink to="/time-management" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="sp2-item">
                                        <div className="sp2-item-icon"><BsClock /></div>
                                        <span>Time management</span>
                                    </div>
                                </NavLink>
                                {/* Device Request */}
                                <p>
                                    <NavLink to="/device-login" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="sp2-item">
                                            <div className="sp2-item-icon"><BsPhone /></div>
                                            <span>Device Request</span>
                                        </div>
                                    </NavLink>
                                </p>

                                {/* Recent ad activity */}
                                <p>
                                    <NavLink to="/ad-activity" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="sp2-item">
                                            <div className="sp2-item-icon"><BsMegaphone /></div>
                                            <span>Recent ad activity</span>
                                        </div>
                                    </NavLink>
                                </p>

                                {/* Link history */}
                                <p>
                                    <NavLink to="/orders-payments" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="sp2-item">
                                            <div className="sp2-item-icon"><BsCreditCard /></div>
                                            <span>Order and Payments</span>
                                        </div>
                                    </NavLink>
                                </p>

                                {/* Dark Mode */}
                                <p>
                                    <NavLink to="/darkmodepage" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="sp2-item">
                                            <div className="sp2-item-icon"><BsMoonStarsFill /></div>
                                            <span>Dark Mode</span>
                                        </div>
                                    </NavLink>
                                    {/* <BsMoonStarsFill className="me-2" /> Dark Mode */}
                                </p>


                                {/* Language */}
                                <p>
                                    <NavLink to="/languagepage" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="sp2-item">
                                            <div className="sp2-item-icon"><BsTranslate /></div>
                                            <span>Language</span>
                                        </div>
                                    </NavLink>

                                </p>
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
                                    <img src="https://img.freepik.com/free-vector/blue-check-mark-badge_78370-699.jpg" alt="Meta Verified badge" />
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
                <button className="see-more" onClick={handleLogout}>Logout</button>


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
            {showMeta && (
                <Meta onClose={() => setShowMeta(false)} />
            )}
        </>
    );
}

export default Sidebar;
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    BsPencilFill, BsChevronUp, BsChevronDown,
    BsGeoAlt, BsCameraFill, BsArrowLeft,
    BsLockFill, BsShieldCheck,
} from "react-icons/bs";
import {
    FaGraduationCap, FaMusic, FaTv, FaFilm, FaGamepad,
    FaTshirt, FaBriefcase, FaHome, FaCalendarAlt, FaGlobe,
    FaLink, FaUsers, FaPercentage, FaAt, FaPhoneAlt,
    FaHeart, FaTree, FaMars, FaCommentDots, FaMagic,
    FaSchool, FaStar, FaEnvelope, FaPhotoVideo,
} from "react-icons/fa";
import "./css/EditProfile.css";

// Sub-pages
import CoverBottomSheet from "./CoverBottomSheet";
import FullScreenCover from "./FullScreenCover";
import ChooseCoverPhoto from "./ChooseCoverPhoto";
import DragToAdjust from "./DragToAdjust";
import BioEditPage from "./BioEditPage";
import PinnedDetailsPage from "./PinnedDetailsPage";
import AiCreatorPage from "./AiCreatorPage";
import CategoryPage from "./CategoryPage";
import SimpleTextFieldPage from "./SimpleTextFieldPage";
import DateOfBirthPage from "./DateOfBirthPage";
import StatusPage from "./StatusPage";
import FamilyBottomSheet from "./FamilyBottomSheet";
import FamilyMemberPage from "./FamilyMemberPage";
import PetPage from "./PetPage";
import GenderPage from "./GenderPage";
import LanguagesPage from "./LanguagesPage";
import LinksPage from "./LinksPage";
import CommunitiesPage from "./CommunitiesPage";
import PhonePage from "./PhonePage";
import EmailPage from "./EmailPage";
import EducationPage from "./EducationPage";
import WorkPage from "./WorkPage";
import ChooseAudiencePage from "./ChooseAudiencePage";
import MediaKitPage from "./MediaKitPage";

const PROFILE_PIC = "https://i.pravatar.cc/150";

/* ── Collapsible Section ── */
function Section({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="ep-section">
            <div className="ep-section-header" onClick={() => setOpen(!open)}>
                <h3>{title}</h3>
                {open ? <BsChevronUp className="ep-toggle-icon" /> : <BsChevronDown className="ep-toggle-icon" />}
            </div>
            {open && <div className="ep-section-body">{children}</div>}
        </div>
    );
}

/* ── Item Row ── */
function Item({ icon, mainText, subText, showEdit = false, onClick }) {
    return (
        <div className="ep-item" onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
            <div className="ep-item-left">
                <span className="ep-item-icon">{icon}</span>
                <div className="ep-item-text">
                    <span className="ep-item-main">{mainText}</span>
                    {subText && <span className="ep-item-sub">{subText}</span>}
                </div>
            </div>
            {showEdit && <button className="ep-edit-btn"><BsPencilFill size={15} /></button>}
        </div>
    );
}

function EditProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Cover
    const [showCoverMenu, setShowCoverMenu] = useState(false);
    const [coverImg, setCoverImg] = useState("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800");
    const [showFullCover, setShowFullCover] = useState(false);
    const [showChooseCover, setShowChooseCover] = useState(false);
    const [dragImage, setDragImage] = useState(null);

    // Intro
    const [showBioEdit, setShowBioEdit] = useState(false);
    const [bio, setBio] = useState("");
    const [showPinnedDetails, setShowPinnedDetails] = useState(false);
    const [pinnedDetails, setPinnedDetails] = useState(["category", "city", "education"]);

    // Category
    const [showAiCreator, setShowAiCreator] = useState(false);
    const [aiCreator, setAiCreator] = useState("No");
    const [showCategoryPage, setShowCategoryPage] = useState(false);
    const [categories, setCategories] = useState(["Digital creator"]);

    // Personal details
    const [showLocation, setShowLocation] = useState(false);
    const [location, setLocation] = useState("Delhi, India");
    const [locationPrivacy, setLocationPrivacy] = useState("Public");
    const [showHometown, setShowHometown] = useState(false);
    const [hometown, setHometown] = useState("Deoria");
    const [hometownPrivacy, setHometownPrivacy] = useState("Public");
    const [showDob, setShowDob] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [status, setStatus] = useState("");
    const [statusPrivacy, setStatusPrivacy] = useState("Friends");
    const [showFamilySheet, setShowFamilySheet] = useState(false);
    const [showFamilyMember, setShowFamilyMember] = useState(false);
    const [showPet, setShowPet] = useState(false);
    const [showGender, setShowGender] = useState(false);
    const [showLanguages, setShowLanguages] = useState(false);

    // Education
    const [showEducation, setShowEducation] = useState(false);

    // Work
    const [showWork, setShowWork] = useState(false);

    // Links
    const [showLinks, setShowLinks] = useState(false);

    // Communities
    const [showCommunities, setShowCommunities] = useState(false);

    // Contact info
    const [showPhone, setShowPhone] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
     const [showMediaKit, setShowMediaKit] = useState(false);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDragImage(URL.createObjectURL(file));
        e.target.value = "";
    };

    return (
        <div className="ep-container">

            {/* HEADER */}
            <div className="ep-header">
                <BsArrowLeft size={22} onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
                <h2>Edit profile</h2>
                <div className="ep-header-space" />
            </div>

            {/* COVER */}
            <div className="ep-cover-section">
                <div className="ep-cover-wrapper">
                    <img src={coverImg} alt="Cover" className="ep-cover-img" />
                    <div className="ep-camera-btn ep-cover-cam" onClick={() => setShowCoverMenu(true)}>
                        <BsCameraFill size={16} />
                    </div>
                </div>
                <div className="ep-avatar-wrapper">
                    <img src={PROFILE_PIC} alt="Profile" className="ep-avatar-img" />
                    <button className="ep-camera-btn ep-avatar-cam"><BsCameraFill size={14} /></button>
                </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

            {/* BODY */}
            <div className="ep-body">

                {/* INTRO */}
                <Section title="Intro">
                    <Item
                        icon={<span>👋</span>}
                        mainText={bio ? <span className="ep-bold">{bio}</span> : <span className="ep-muted-text">About you</span>}
                        subText={bio ? <><FaGlobe className="ep-inline-icon" /> Public</> : undefined}
                        onClick={() => setShowBioEdit(true)}
                    />
                    <div className="ep-item ep-item-align-start" onClick={() => setShowPinnedDetails(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon">📌</span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">Pinned details</span>
                                <span className="ep-item-sub ep-no-icon">Digital creator · Delhi, India · Computer Science and Engineering</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* CATEGORY */}
                <Section title="Category">
                    <div className="ep-item" onClick={() => setShowCategoryPage(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaTv size={22} /></span>
                            <span className="ep-item-main ep-bold">{categories.join(" · ")}</span>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <div className="ep-item" onClick={() => setShowAiCreator(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaMagic size={20} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">AI creator</span>
                                <span className="ep-item-sub ep-no-icon ep-muted-text">{aiCreator}</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* PERSONAL DETAILS */}
                <Section title="Personal details">
                    <Item icon={<BsGeoAlt size={22} />} mainText={<strong>{location}</strong>} subText={<><FaGlobe className="ep-inline-icon" /> {locationPrivacy}</>} onClick={() => setShowLocation(true)} />
                    <Item icon={<FaHome size={20} />} mainText={<strong>{hometown}</strong>} subText={<><FaGlobe className="ep-inline-icon" /> {hometownPrivacy}</>} onClick={() => setShowHometown(true)} />
                    <Item icon={<FaSchool size={20} />} mainText={<span className="ep-muted-text">Secondary school or college</span>} />
                    <div className="ep-item" onClick={() => setShowEducation(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaGraduationCap size={22} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">Studied at Computer Science and Engineering</span>
                                <span className="ep-item-sub"><FaGlobe className="ep-inline-icon" /> Public</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <div className="ep-item" onClick={() => setShowDob(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaCalendarAlt size={20} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">10 August <FaUsers className="ep-inline-icon" /> 2002 <FaUsers className="ep-inline-icon" /></span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <Item icon={<FaHeart size={20} />} mainText={status ? <span className="ep-bold">{status}</span> : <span className="ep-muted-text">Relationship status</span>} subText={status ? statusPrivacy : undefined} onClick={() => setShowStatus(true)} />
                    <Item icon={<FaTree size={20} />} mainText={<span className="ep-muted-text">Family</span>} onClick={() => setShowFamilySheet(true)} />
                    <div className="ep-item" onClick={() => setShowGender(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaMars size={20} /></span>
                            <span className="ep-item-main ep-bold">Male 🔒</span>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <div className="ep-item" onClick={() => setShowLanguages(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaCommentDots size={20} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">English · Hindi</span>
                                <span className="ep-item-sub"><FaUsers className="ep-inline-icon" /> Your friends</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* WORK */}
                <Section title="Work">
                    <Item icon={<FaBriefcase size={20} />} mainText={<span className="ep-muted-text">Work experience</span>} onClick={() => setShowWork(true)} />
                </Section>

                {/* EDUCATION */}
                <Section title="Education">
                    <Item icon={<FaSchool size={20} />} mainText={<span className="ep-muted-text">Secondary school or college</span>} />
                    <div className="ep-item" onClick={() => setShowEducation(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaGraduationCap size={22} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">Studied at Computer Science and Engineering</span>
                                <span className="ep-item-sub"><FaGlobe className="ep-inline-icon" /> Public</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* HOBBIES */}
                <Section title="Hobbies">
                    <Item icon={<FaStar size={20} />} mainText={<span className="ep-muted-text">Hobbies</span>} />
                </Section>

                {/* INTERESTS */}
                <Section title="Interests">
                    <Item icon={<FaMusic size={20} />} mainText={<span className="ep-muted-text">Music</span>} showEdit />
                    <Item icon={<FaTv size={20} />} mainText={<span className="ep-muted-text">TV programmes</span>} showEdit />
                    <Item icon={<FaFilm size={20} />} mainText={<span className="ep-muted-text">Films</span>} showEdit />
                    <Item icon={<FaGamepad size={20} />} mainText={<span className="ep-muted-text">Games</span>} showEdit />
                    <Item icon={<FaTshirt size={20} />} mainText={<span className="ep-muted-text">Sports teams and athletes</span>} showEdit />
                </Section>

                {/* TRAVEL */}
                <Section title="Travel">
                    <Item icon={<BsGeoAlt size={22} />} mainText={<span className="ep-muted-text">Places</span>} showEdit />
                </Section>

                {/* COMMUNITIES */}
                <Section title="Communities">
                    <Item icon={<FaUsers size={20} />} mainText={<span className="ep-muted-text">Facebook groups</span>} onClick={() => setShowCommunities(true)} />
                </Section>

                {/* OFFERS */}
                <Section title="Offers">
                    <Item icon={<FaPercentage size={20} />} mainText={<span className="ep-muted-text">Promotions or affiliate links</span>} />
                </Section>

                {/* LINKS */}
                <Section title="Links">
                    <div className="ep-item" onClick={() => setShowLinks(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaLink size={20} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">Links</span>
                                <span className="ep-item-sub ep-no-icon ep-link-text">linkedin.com/in/sanny-tiwari-28945b240</span>
                                <span className="ep-item-sub"><FaUsers className="ep-inline-icon" /> Your friends</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* CONTACT INFO */}
                <Section title="Contact info">
                    <Item icon={<FaAt size={20} />} mainText={<span className="ep-muted-text">Social media</span>} />
                    <div className="ep-item" onClick={() => setShowPhone(true)} style={{ cursor: "pointer" }}>
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaPhoneAlt size={20} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">096702 52272</span>
                                <span className="ep-item-sub"><BsLockFill className="ep-inline-icon" /> Only me</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <Item icon={<FaEnvelope size={20} />} mainText={<span className="ep-muted-text">Add email address</span>} onClick={() => setShowEmail(true)} />
                    <Item icon={<FaPhotoVideo size={20} />} mainText={<span className="ep-muted-text">Media kit</span>}  onClick={() => setShowMediaKit(true)}  />
                </Section>

                {/* BADGES */}
                <Section title="Badges">
                    <div className="ep-item">
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><BsShieldCheck size={22} /></span>
                            <span className="ep-item-main ep-muted-text">You haven't earned any badges this week.</span>
                        </div>
                    </div>
                </Section>

            </div>

            {/* ===== ALL SUB-PAGES ===== */}
            <CoverBottomSheet isOpen={showCoverMenu} onClose={() => setShowCoverMenu(false)}
                onSeeCover={() => { setShowCoverMenu(false); setShowFullCover(true); }}
                onUpload={() => { setShowCoverMenu(false); fileInputRef.current.click(); }}
                onChoose={() => { setShowCoverMenu(false); setShowChooseCover(true); }} />

            {showFullCover && <FullScreenCover coverImg={coverImg} onClose={() => setShowFullCover(false)} />}
            {showChooseCover && <ChooseCoverPhoto onClose={() => setShowChooseCover(false)} onSelect={img => setCoverImg(img)} profilePic={PROFILE_PIC} />}
            {dragImage && <DragToAdjust image={dragImage} profilePic={PROFILE_PIC} onSave={img => setCoverImg(img)} onClose={() => setDragImage(null)} />}

            {showBioEdit && <BioEditPage initialBio={bio} onClose={() => setShowBioEdit(false)} onSave={b => { setBio(b); setShowBioEdit(false); }} />}
            {showPinnedDetails && <PinnedDetailsPage initialSelected={pinnedDetails} onClose={() => setShowPinnedDetails(false)} onSave={s => { setPinnedDetails(s); setShowPinnedDetails(false); }} />}
            {showAiCreator && <AiCreatorPage initialValue={aiCreator} onClose={() => setShowAiCreator(false)} onSave={v => { setAiCreator(v); setShowAiCreator(false); }} />}
            {showCategoryPage && <CategoryPage initialSelected={categories} onClose={() => setShowCategoryPage(false)} onSave={c => { setCategories(c); setShowCategoryPage(false); }} />}

            {showLocation && <SimpleTextFieldPage title="Location" label="Location" initialValue={location} initialPrivacy={locationPrivacy} onClose={() => setShowLocation(false)} onSave={(v, p) => { setLocation(v); setLocationPrivacy(p); setShowLocation(false); }} />}
            {showHometown && <SimpleTextFieldPage title="Hometown" label="Hometown" initialValue={hometown} initialPrivacy={hometownPrivacy} onClose={() => setShowHometown(false)} onSave={(v, p) => { setHometown(v); setHometownPrivacy(p); setShowHometown(false); }} />}
            {showDob && <DateOfBirthPage monthDay="10 August" year="2002" onClose={() => setShowDob(false)} onSave={() => setShowDob(false)} />}
            {showStatus && <StatusPage initialStatus={status} initialPrivacy={statusPrivacy} onClose={() => setShowStatus(false)} onSave={(s, p) => { setStatus(s); setStatusPrivacy(p); setShowStatus(false); }} />}

            <FamilyBottomSheet isOpen={showFamilySheet} onClose={() => setShowFamilySheet(false)}
                onFamilyMember={() => { setShowFamilySheet(false); setShowFamilyMember(true); }}
                onPet={() => { setShowFamilySheet(false); setShowPet(true); }} />
            {showFamilyMember && <FamilyMemberPage onClose={() => setShowFamilyMember(false)} onSave={() => setShowFamilyMember(false)} />}
            {showPet && <PetPage onClose={() => setShowPet(false)} onSave={() => setShowPet(false)} />}

            {showGender && <GenderPage onClose={() => setShowGender(false)} onSave={() => setShowGender(false)} />}
            {showLanguages && <LanguagesPage onClose={() => setShowLanguages(false)} onSave={() => setShowLanguages(false)} />}
            {showEducation && <EducationPage onClose={() => setShowEducation(false)} onSave={() => setShowEducation(false)} />}
            {showWork && <WorkPage onClose={() => setShowWork(false)} onSave={() => setShowWork(false)} />}
            {showLinks && <LinksPage onClose={() => setShowLinks(false)} onSave={() => setShowLinks(false)} />}
            {showCommunities && <CommunitiesPage onClose={() => setShowCommunities(false)} />}
            {showPhone && <PhonePage onClose={() => setShowPhone(false)} onSave={() => setShowPhone(false)} />}
            {showEmail && <EmailPage onClose={() => setShowEmail(false)} onSave={() => setShowEmail(false)} />}
            {showMediaKit && (<MediaKitPage onClose={() => setShowMediaKit(false)} onSave={() => setShowMediaKit(false)} />)}
        </div>
    );
}

export default EditProfile;
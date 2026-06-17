import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    BsPencilFill,
    BsChevronUp,
    BsChevronDown,
    BsGeoAlt,
    BsCameraFill,
    BsArrowLeft,
} from "react-icons/bs";
import {
    FaGraduationCap,
    FaMusic,
    FaTv,
    FaFilm,
    FaGamepad,
    FaTshirt,
    FaBriefcase,
    FaHome,
    FaCalendarAlt,
    FaGlobe,
    FaLink,
    FaUsers,
    FaPercentage,
    FaAt,
    FaPhoneAlt,
    FaHeart,
    FaTree,
    FaMars,
    FaCommentDots,
    FaMagic,
    FaSchool,
    FaStar,
} from "react-icons/fa";
import "./css/EditProfile.css";
import CoverBottomSheet from "./CoverBottomSheet";
import FullScreenCover from "./FullScreenCover";
import ChooseCoverPhoto from "./ChooseCoverPhoto";
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

// "Pinned details" row mein dikhane wale labels - PinnedDetailsPage ke
// AVAILABLE_DETAILS ke ids se match honi chahiye
const PINNED_LABELS = [
    { id: "category", label: "Digital creator" },
    { id: "city", label: "Delhi" },
    { id: "education", label: "Computer Science and Engineering" },
];

/* Collapsible Section */
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

/* Single row item */
function Item({ icon, mainText, subText, showEdit = false, muted = false, onClick }) {

    return (
        <div
            className={`ep-item ${muted ? "ep-muted" : ""}`}
            onClick={onClick}
            style={onClick ? { cursor: "pointer" } : undefined}
        >
            <div className="ep-item-left">
                <span className="ep-item-icon">{icon}</span>
                <div className="ep-item-text">
                    <span className="ep-item-main">{mainText}</span>
                    {subText && (
                        <span className="ep-item-sub">
                            <FaGlobe className="ep-inline-icon" /> {subText}
                        </span>
                    )}
                </div>
            </div>


        </div>
    );
}

function EditProfile({ showEdit = false } = {}) {
    const navigate = useNavigate();
    const [showCoverMenu, setShowCoverMenu] = useState(false);

    const [coverImg, setCoverImg] = useState(
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
    );

    const [showFullCover, setShowFullCover] = useState(false);

    const [showChooseCover, setShowChooseCover] = useState(false);

    const [dragImage, setDragImage] = useState(null); // Upload ke baad drag

    // Bio (Intro -> "About you") ke liye
    const [showBioEdit, setShowBioEdit] = useState(false);
    const [bio, setBio] = useState("");

    // Pinned details (Intro -> "Pinned details")
    const [showPinnedDetails, setShowPinnedDetails] = useState(false);
    const [pinnedDetails, setPinnedDetails] = useState(["category", "city", "education"]);

    // AI creator (Category -> "AI creator")
    const [showAiCreator, setShowAiCreator] = useState(false);
    const [aiCreator, setAiCreator] = useState("No");

    // Category (Category -> "Digital creator")
    const [showCategoryPage, setShowCategoryPage] = useState(false);
    const [categories, setCategories] = useState(["Digital creator"]);

    // Location (Personal details -> "Delhi, India")
    const [showLocation, setShowLocation] = useState(false);
    const [location, setLocation] = useState("Delhi, India");
    const [locationPrivacy, setLocationPrivacy] = useState("Public");

    // Hometown (Personal details -> "Deoria")
    const [showHometown, setShowHometown] = useState(false);
    const [hometown, setHometown] = useState("Deoria");
    const [hometownPrivacy, setHometownPrivacy] = useState("Public");
    //family 
    const [showFamilySheet, setShowFamilySheet] = useState(false);
    const [showFamilyMember, setShowFamilyMember] = useState(false);
    const [showPet, setShowPet] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);


    // Date of birth (Personal details -> "10 August · 2002")
    const [showDob, setShowDob] = useState(false);
    const [dobMonthDayPrivacy, setDobMonthDayPrivacy] = useState("Friends");
    const [dobYearPrivacy, setDobYearPrivacy] = useState("Friends");

    // Relationship status (Personal details -> "Relationship status")
    const [showStatus, setShowStatus] = useState(false);
    const [status, setStatus] = useState("");
    const [statusPrivacy, setStatusPrivacy] = useState("Friends");

    const PROFILE_PIC = "https://i.pravatar.cc/150";
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDragImage(URL.createObjectURL(file));
        e.target.value = "";
    };

    const [showGender, setShowGender] = useState(false);
const [showLanguages, setShowLanguages] = useState(false);
const [showLinks, setShowLinks] = useState(false);
const [showCommunities, setShowCommunities] = useState(false);
    return (
        <div className="ep-container">

            {/* ===== STICKY HEADER ===== */}
            <div className="ep-header">
                < BsArrowLeft
                    onClick={() => navigate(-1)}
                    style={{ cursor: "pointer" }}
                />

                <h2>Edit profile</h2>

                {/* Empty div title ko center rakhne ke liye */}
                <div className="ep-header-space"></div>
            </div>

            {/* ===== COVER + PROFILE PIC ===== */}
            <div className="ep-cover-section">
                <div className="ep-cover-wrapper">
                    <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
                        alt="Cover"
                        className="ep-cover-img"
                    />
                    {showEdit && (
                        <div className="cover-camera" onClick={() => setShowCoverMenu(true)}>
                            <BsCameraFill />
                        </div>
                    )}
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />

                    <CoverBottomSheet
                        isOpen={showCoverMenu}
                        onClose={() => setShowCoverMenu(false)}
                        onUpload={() => { setShowCoverMenu(false); fileInputRef.current.click(); }}
                        onChoose={() => { setShowCoverMenu(false); setShowChooseCover(true); }}
                        showSeeCover={false}

                    />

                    {/* FULLSCREEN COVER VIEWER */}
                    {showFullCover && (
                        <FullScreenCover
                            coverImg={coverImg}
                            onClose={() => setShowFullCover(false)}
                        />
                    )}

                    {/* CHOOSE COVER PHOTO PAGE */}
                    {showChooseCover && (
                        <ChooseCoverPhoto
                            onClose={() => setShowChooseCover(false)}
                            onSelect={(img) => setCoverImg(img)}
                            profilePic={PROFILE_PIC}
                        />
                    )}


                    {/* DRAG TO ADJUST — Upload ke baad */}
                </div>

                {/* Profile pic overlapping */}
                <div className="ep-avatar-wrapper">
                    <img
                        src="https://i.pravatar.cc/150"
                        alt="Profile"
                        className="ep-avatar-img"
                    />
                    <button className="ep-camera-btn ep-avatar-cam">
                        <BsCameraFill size={14} />
                    </button>
                </div>
            </div>

            {/* ===== SCROLLABLE CONTENT ===== */}
            <div className="ep-body">

                {/* INTRO */}
                <Section title="Intro">
                    <Item
                        icon={<span>👋</span>}
                        mainText={
                            bio
                                ? <span className="ep-bold">{bio}</span>
                                : <span className="ep-muted-text">About you</span>
                        }
                        subText={bio ? "Public" : undefined}
                        onClick={() => setShowBioEdit(true)}
                    />
                    <div
                        className="ep-item ep-item-align-start"
                        onClick={() => setShowPinnedDetails(true)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><span>📌</span></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">Pinned details</span>
                                <span className="ep-item-sub ep-no-icon">
                                    {PINNED_LABELS
                                        .filter((p) => pinnedDetails.includes(p.id))
                                        .map((p) => p.label)
                                        .join(" · ")}
                                </span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* CATEGORY */}
                <Section title="Category">
                    <div
                        className="ep-item"
                        onClick={() => setShowCategoryPage(true)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaTv size={22} /></span>
                            <span className="ep-item-main ep-bold">{categories.join(" · ")}</span>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <div
                        className="ep-item"
                        onClick={() => setShowAiCreator(true)}
                        style={{ cursor: "pointer" }}
                    >
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
                    <Item
                        icon={<BsGeoAlt size={22} />}
                        mainText={
                            location
                                ? <strong>{location}</strong>
                                : <span className="ep-muted-text">Current city</span>
                        }
                        subText={location ? locationPrivacy : undefined}
                        onClick={() => setShowLocation(true)}
                    />
                    <Item
                        icon={<FaHome size={20} />}
                        mainText={
                            hometown
                                ? <strong>{hometown}</strong>
                                : <span className="ep-muted-text">Hometown</span>
                        }
                        subText={hometown ? hometownPrivacy : undefined}
                        onClick={() => setShowHometown(true)}
                    />
                    <Item icon={<FaSchool size={20} />} mainText={<span className="ep-muted-text">Secondary school or college</span>} />
                    <div className="ep-item">
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaGraduationCap size={22} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">Studied at Computer Science and Engineering</span>
                                <span className="ep-item-sub"><FaGlobe className="ep-inline-icon" /> Public</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <div
                        className="ep-item"
                        onClick={() => setShowDob(true)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaCalendarAlt size={20} /></span>
                            <div className="ep-item-text">
                                <span className="ep-item-main ep-bold">
                                    10 August <FaUsers className="ep-inline-icon" /> 2002 <FaUsers className="ep-inline-icon" />
                                </span>
                            </div>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                    <Item
                        icon={<FaHeart size={20} />}
                        mainText={
                            status
                                ? <span className="ep-bold">{status}</span>
                                : <span className="ep-muted-text">Relationship status</span>
                        }
                        subText={status ? statusPrivacy : undefined}
                        onClick={() => setShowStatus(true)}
                    />

                    <Item
                        icon={<FaTree size={20} />}
                        mainText={<span className="ep-muted-text">Family</span>}
                        onClick={() => setShowFamilySheet(true)}
                    />
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

                {/* LINKS */}
                <Section title="Links">
                    <div className="ep-item">
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaLink size={20} /></span>
                            <div className="ep-item-text" onClick={() => setShowLinks(true)} style={{ cursor: "pointer" }}>
                                <span className="ep-item-main ep-bold">Links</span>
                                <span className="ep-item-sub ep-no-icon ep-link-text">
                                    linkedin.com/in/sanny-tiwari-28945b240
                                </span>
                                <span className="ep-item-sub"><FaUsers className="ep-inline-icon" /> Your friends</span>
                            </div>
                        </div>
                        <button className="ep-edit-btn" onClick={() => setShowLinks(true)} style={{ cursor: "pointer" }}><BsPencilFill size={15} /></button>
                    </div>
                </Section>

                {/* COMMUNITIES */}
                <Section title="Communities" >
                    <Item icon={<FaUsers size={20} />} mainText={<span className="ep-muted-text" onClick={() => setShowCommunities(true)} style={{ cursor: "pointer" }}>Facebook groups</span>} />
                </Section>

                {/* OFFERS */}
                <Section title="Offers">
                    <Item icon={<FaPercentage size={20} />} mainText={<span className="ep-muted-text">Promotions or affiliate links</span>} />
                </Section>

                {/* WORK */}
                <Section title="Work">
                    <Item icon={<FaBriefcase size={20} />} mainText={<span className="ep-muted-text">Work experience</span>} />
                </Section>

                {/* CONTACT INFO */}
                <Section title="Contact info">
                    <Item icon={<FaAt size={20} />} mainText={<span className="ep-muted-text">Social media</span>} />
                    <div className="ep-item">
                        <div className="ep-item-left">
                            <span className="ep-item-icon"><FaPhoneAlt size={20} /></span>
                            <span className="ep-item-main ep-bold">096702 52272</span>
                        </div>
                        <button className="ep-edit-btn"><BsPencilFill size={15} /></button>
                    </div>
                </Section>

            </div>

            {/* ===== BIO EDITOR (About you click) ===== */}
            {showBioEdit && (
                <BioEditPage
                    initialBio={bio}
                    onClose={() => setShowBioEdit(false)}
                    onSave={(newBio) => {
                        setBio(newBio);
                        setShowBioEdit(false);
                    }}
                />
            )}

            {/* ===== PINNED DETAILS (Pinned details click) ===== */}
            {showPinnedDetails && (
                <PinnedDetailsPage
                    initialSelected={pinnedDetails}
                    onClose={() => setShowPinnedDetails(false)}
                    onSave={(newSelected) => {
                        setPinnedDetails(newSelected);
                        setShowPinnedDetails(false);
                    }}
                />
            )}

            {/* ===== AI CREATOR (AI creator click) ===== */}
            {showAiCreator && (
                <AiCreatorPage
                    initialValue={aiCreator}
                    onClose={() => setShowAiCreator(false)}
                    onSave={(newValue) => {
                        setAiCreator(newValue);
                        setShowAiCreator(false);
                    }}
                />
            )}

            {/* ===== CATEGORY (Digital creator click) ===== */}
            {showCategoryPage && (
                <CategoryPage
                    initialSelected={categories}
                    onClose={() => setShowCategoryPage(false)}
                    onSave={(newCategories) => {
                        setCategories(newCategories);
                        setShowCategoryPage(false);
                    }}
                />
            )}

            {/* ===== LOCATION (Current city click) ===== */}
            {showLocation && (
                <SimpleTextFieldPage
                    title="Location"
                    label="Location"
                    initialValue={location}
                    initialPrivacy={locationPrivacy}
                    onClose={() => setShowLocation(false)}
                    onSave={(value, privacy) => {
                        setLocation(value);
                        setLocationPrivacy(privacy);
                        setShowLocation(false);
                    }}
                />
            )}

            {/* ===== HOMETOWN click ===== */}
            {showHometown && (
                <SimpleTextFieldPage
                    title="Hometown"
                    label="Hometown"
                    initialValue={hometown}
                    initialPrivacy={hometownPrivacy}
                    onClose={() => setShowHometown(false)}
                    onSave={(value, privacy) => {
                        setHometown(value);
                        setHometownPrivacy(privacy);
                        setShowHometown(false);
                    }}
                />
            )}

            {/* // Family */}
            {/* ===== HOMETOWN click ===== */}
            {/* {showFamily && (
                <SimpleTextFieldPage
                    title="Hometown"
                    label="Hometown"
                    initialValue={showFamily}
                    initialPrivacy={FamilyPrivacy}
                    onClose={() => setShowFamily(false)}
                    onSave={(value, privacy) => {
                        setFamily(value);
                        setFamilyPrivacy(privacy);
                        setShowFamily(false);
                    }}
                />
            )} */}

            {/* ===== DATE OF BIRTH click ===== */}
            {showDob && (
                <DateOfBirthPage
                    monthDay="10 August"
                    year="2002"
                    initialMonthDayPrivacy={dobMonthDayPrivacy}
                    initialYearPrivacy={dobYearPrivacy}
                    onClose={() => setShowDob(false)}
                    onSave={(monthDayPrivacy, yearPrivacy) => {
                        setDobMonthDayPrivacy(monthDayPrivacy);
                        setDobYearPrivacy(yearPrivacy);
                        setShowDob(false);
                    }}
                />
            )}

            {/* ===== RELATIONSHIP STATUS click ===== */}
            {showStatus && (
                <StatusPage
                    initialStatus={status}
                    initialPrivacy={statusPrivacy}
                    onClose={() => setShowStatus(false)}
                    onSave={(newStatus, newPrivacy) => {
                        setStatus(newStatus);
                        setStatusPrivacy(newPrivacy);
                        setShowStatus(false);
                    }}
                />
            )}

            <FamilyBottomSheet
                isOpen={showFamilySheet}
                onClose={() => setShowFamilySheet(false)}
                onFamilyMember={() => { setShowFamilySheet(false); setShowFamilyMember(true); }}
                onPet={() => { setShowFamilySheet(false); setShowPet(true); }}
            />

            {showFamilyMember && (
                <FamilyMemberPage
                    onClose={() => setShowFamilyMember(false)}
                    onSave={(data) => { setFamilyMembers(prev => [...prev, data]); setShowFamilyMember(false); }}
                />
            )}

            {showPet && (
                <PetPage
                    onClose={() => setShowPet(false)}
                    onSave={(data) => { setShowPet(false); }}
                />
            )}


            {showGender && (
            <GenderPage
                onClose={() => setShowGender(false)}
                onSave={(data) => setShowGender(false)}
            />
            )}
             {showLanguages && <LanguagesPage onClose={() => setShowLanguages(false)} />}
                {showLinks && <LinksPage onClose={() => setShowLinks(false)} />}
                {showCommunities && <CommunitiesPage onClose={() => setShowCommunities(false)} />}
        </div>
    );
}

export default EditProfile;
import React, { useState } from "react";
import { FaUsers } from "react-icons/fa";
import { BsChevronRight, BsCheck2 } from "react-icons/bs";
import "./css/DateOfBirthPage.css";

const PRIVACY_OPTIONS = ["Public", "Friends", "Only me"];

function PrivacyPill({ value, onChange }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="dob-pill-wrap">
            <button className="dob-pill" onClick={() => setOpen((v) => !v)} type="button">
                <FaUsers /> {value}
                <span className="dob-pill-caret">▾</span>
            </button>
            {open && (
                <div className="dob-pill-menu">
                    {PRIVACY_OPTIONS.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            className="dob-pill-option"
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                        >
                            <span>{opt}</span>
                            {value === opt && <BsCheck2 />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function DateOfBirthPage({
    monthDay = "10 August",
    year = "2002",
    initialMonthDayPrivacy = "Friends",
    initialYearPrivacy = "Friends",
    onClose,
    onSave,
}) {
    const [monthDayPrivacy, setMonthDayPrivacy] = useState(initialMonthDayPrivacy);
    const [yearPrivacy, setYearPrivacy] = useState(initialYearPrivacy);

    const changed =
        monthDayPrivacy !== initialMonthDayPrivacy || yearPrivacy !== initialYearPrivacy;

    const handleSave = () => {
        if (!changed) return;
        onSave(monthDayPrivacy, yearPrivacy);
    };

    return (
        <div className="dob-overlay" onClick={onClose}>
            <div className="dob-card" onClick={(e) => e.stopPropagation()}>

                <div className="dob-header">
                    <button className="dob-close" onClick={onClose} aria-label="Close">✕</button>
                    <h2>Date of birth</h2>
                    <BsChevronRight className="dob-header-chevron" />
                </div>

                <div className="dob-body">
                    <PrivacyPill value={monthDayPrivacy} onChange={setMonthDayPrivacy} />
                    <div className="dob-input-wrap">
                        <span className="dob-floating-label">Month and day</span>
                        {/* Date sirf Accounts Centre se badalti hai, isliye yaha read-only */}
                        <input className="dob-input" value={monthDay} readOnly />
                    </div>

                    <PrivacyPill value={yearPrivacy} onChange={setYearPrivacy} />
                    <div className="dob-input-wrap">
                        <span className="dob-floating-label">Year</span>
                        <input className="dob-input" value={year} readOnly />
                    </div>

                    <button className="dob-edit-link" type="button">
                        <div className="dob-edit-link-text">
                            <strong>Edit your date of birth</strong>
                            <span>You can edit your date of birth in Accounts Centre.</span>
                        </div>
                        <BsChevronRight />
                    </button>
                </div>

                <div className="dob-footer">
                    <button className="dob-save-btn" onClick={handleSave} disabled={!changed}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DateOfBirthPage;
import React from "react";
import { FaUserAlt, FaPaw } from "react-icons/fa";
import "./css/FamilyBottomSheet.css";

function FamilyBottomSheet({ isOpen, onClose, onFamilyMember, onPet }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fbs-backdrop" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="fbs-sheet">
        <div className="fbs-handle" />
        <h3 className="fbs-title">Select family member type</h3>

        <ul className="fbs-list">
          <li className="fbs-item" onClick={onFamilyMember}>
            <div className="fbs-icon"><FaUserAlt size={22} /></div>
            <span>Family member</span>
          </li>
          <li className="fbs-item" onClick={onPet}>
            <div className="fbs-icon"><FaPaw size={22} /></div>
            <span>Pet</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default FamilyBottomSheet;

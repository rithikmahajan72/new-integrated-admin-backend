import React from 'react';
import { X } from 'lucide-react';

const SaveSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Figma assets
  const checkIcon = "http://localhost:3845/assets/e5678a3b8326a52250be1683e841fedf9f641617.svg";
  const closeIcon = "http://localhost:3845/assets/74400e78448b85fb9710d100c8cbcbe664fe30de.svg";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] w-[445px] h-[280px] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-[33px] top-[33px] w-6 h-6 flex items-center justify-center"
        >
          <img src={closeIcon} alt="Close" className="w-4 h-4" />
        </button>

        {/* Success Check Icon */}
        <div className="absolute left-1/2 top-[45px] transform -translate-x-1/2 w-[74px] h-[74px]">
          <img
            src={checkIcon}
            alt="Success check"
            className="w-full h-full"
          />
        </div>

        {/* Title */}
        <div className="absolute left-1/2 top-[125px] transform -translate-x-1/2 text-center">
          <p className="font-['Montserrat'] font-bold text-[18px] text-black leading-[22px] tracking-[-0.41px] w-[242px]">
            Arrangement updated successfully!
          </p>
        </div>

        {/* Done Button */}
        <div className="absolute left-1/2 bottom-[63px] transform -translate-x-1/2">
          <button
            onClick={onClose}
            className="bg-black text-white rounded-3xl w-[270px] h-12 flex items-center justify-center"
          >
            <span className="font-['Montserrat'] font-semibold text-[16px] leading-[1.406]">
              Done
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSuccessModal;

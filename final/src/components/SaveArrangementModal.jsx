import React from 'react';
import { X } from 'lucide-react';

const SaveArrangementModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Figma assets
  const warningIcon = "http://localhost:3845/assets/c72dbca3d7c567f025d4fe65163f0d0ae35ae9e2.svg";
  const warningIconBg = "http://localhost:3845/assets/28bcf364dbda62f09ff4ee8b42066c4641ce2575.svg";
  const warningIconDot = "http://localhost:3845/assets/f8ca3f1d6d30b0b540c05804372fe22cd04a9441.svg";
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

        {/* Warning Icon */}
        <div className="absolute left-1/2 top-[45px] transform -translate-x-1/2 w-[35px] h-[35px]">
          <div className="absolute inset-[12.5%]">
            <div className="absolute inset-[-3.81%]">
              <img
                src={warningIcon}
                alt="Warning background"
                className="w-full h-full"
              />
            </div>
          </div>
          <div className="absolute bottom-[31.84%] left-[20.83%] right-[20.84%] top-[39.59%]">
            <img
              src={warningIconBg}
              alt="Warning background"
              className="w-full h-full"
            />
          </div>
          <div className="absolute bottom-[62.5%] left-[62.5%] right-1/4 top-1/4">
            <img
              src={warningIconDot}
              alt="Warning dot"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Title */}
        <div className="absolute left-1/2 top-[127px] transform -translate-x-1/2 text-center">
          <p className="font-['Montserrat'] font-bold text-[18px] text-black leading-[22px] tracking-[-0.41px] w-[175px]">
            are you sure you want to save this arrangement
          </p>
        </div>

        {/* Buttons */}
        <div className="absolute bottom-[63px] left-1/2 transform -translate-x-1/2 flex gap-[21px]">
          {/* Yes Button */}
          <button
            onClick={onConfirm}
            className="bg-black text-white rounded-[100px] w-[188px] h-[48px] flex items-center justify-center border border-black"
          >
            <span className="font-['Montserrat'] font-medium text-[16px] leading-[1.2]">
              Yes
            </span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="bg-white text-black rounded-[100px] w-[188px] h-[48px] flex items-center justify-center border border-[#e4e4e4]"
          >
            <span className="font-['Montserrat'] font-medium text-[16px] leading-[1.2]">
              Cancel
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveArrangementModal;

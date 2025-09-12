import React from 'react';
import CollectCommunicationPreferences from './Collect communication preferences';

/**
 * Communication Preferences Toggle Component
 * 
 * A lightweight wrapper component that provides just the toggle functionality
 * for communication preferences without all the modal logic.
 * This can be imported into Settings.js to maintain the UI.
 */

const CommunicationPreferencesToggle = ({ enabled, onToggle }) => {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="font-bold text-[#010101] text-[20px] font-montserrat">
        Collect communication preferences
      </span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggle('on')}
          className={`px-4 py-2 rounded-full text-[16px] font-medium transition-colors min-w-[69px] ${
            enabled 
              ? 'bg-[#000aff] text-white border border-black' 
              : 'bg-transparent text-black border border-[#e4e4e4]'
          }`}
        >
          On
        </button>
        <button
          onClick={() => onToggle('off')}
          className={`px-4 py-2 rounded-full text-[16px] font-medium transition-colors min-w-[76px] ${
            !enabled 
              ? 'bg-[#000aff] text-white border border-black' 
              : 'bg-transparent text-black border border-[#e4e4e4]'
          }`}
        >
          Off
        </button>
      </div>
    </div>
  );
};

export default CommunicationPreferencesToggle;
export { CollectCommunicationPreferences };

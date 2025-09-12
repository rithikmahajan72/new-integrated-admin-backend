import React, { useState, useCallback, useMemo, memo } from "react";
import TwoFactorAuth from "../components/TwoFactorAuth";

// Constants moved outside component to prevent recreation on each render
const INITIAL_MODAL_STATE = {
  communicationPrefsConfirmOn: false,
  communicationPrefsConfirmOff: false,
  communicationPrefs2FAOn: false,
  communicationPrefs2FAOff: false,
  communicationPrefsSuccessOn: false,
  communicationPrefsSuccessOff: false,
  communicationPrefsFinalSuccessOn: false,
  communicationPrefsFinalSuccessOff: false,
};

const CONTACT_INFO = {
  phoneNumber: "+1 (555) 123-4567",
  emailAddress: "communications@system.com",
};

// Memoized SVG components for better performance
const CloseIcon = memo(() => (
  <svg
    className="w-full h-full"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
));
CloseIcon.displayName = "CloseIcon";

const CheckIcon = memo(() => (
  <svg
    className="w-8 h-8 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
));
CheckIcon.displayName = "CheckIcon";

const XIcon = memo(() => (
  <svg
    className="w-8 h-8 text-red-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
));
XIcon.displayName = "XIcon";

/**
 * Communication Preferences Collection Component
 *
 * Features:
 * - Toggle communication preferences setting with 2FA verification
 * - Modal dialogs for confirmation and success states
 * - Secure authentication flow with OTP and password verification
 *
 * Performance optimizations:
 * - useCallback for all event handlers
 * - useMemo for computed values
 * - Memoized SVG icons and modal components
 * - Constants moved outside component
 * - Organized state management
 * - Efficient modal state handling
 */

const CollectCommunicationPreferences = () => {
  // ==============================
  // STATE MANAGEMENT
  // ==============================

  // Communication preferences setting
  const [communicationPrefs, setCommunicationPrefs] = useState(true);

  // Modal states for communication preferences - using constant reference
  const [modals, setModals] = useState(INITIAL_MODAL_STATE);

  // ==============================
  // MEMOIZED VALUES
  // ==============================

  // Memoized status indicator
  const statusIndicator = useMemo(
    () => ({
      className: `w-3 h-3 rounded-full ${
        communicationPrefs ? "bg-green-500" : "bg-red-500"
      }`,
      text: `Communication preferences collection is ${
        communicationPrefs ? "enabled" : "disabled"
      }`,
      description: communicationPrefs
        ? "User communication preferences are being collected and stored securely."
        : "Communication preferences collection is currently disabled.",
    }),
    [communicationPrefs]
  );

  // ==============================
  // UTILITY FUNCTIONS
  // ==============================

  // Update modal state utility
  const updateModal = useCallback((modalKey, value) => {
    setModals((prev) => ({ ...prev, [modalKey]: value }));
  }, []);

  // ==============================
  // TOGGLE HANDLERS
  // ==============================

  const handleToggleSetting = useCallback(
    (settingKey, action) => {
      const modalKey = `${settingKey}Confirm${action === "on" ? "On" : "Off"}`;
      updateModal(modalKey, true);
    },
    [updateModal]
  );

  const handleConfirmToggleOn = useCallback(
    (settingKey) => {
      updateModal(`${settingKey}ConfirmOn`, false);
      updateModal(`${settingKey}2FAOn`, true);
    },
    [updateModal]
  );

  const handleConfirmToggleOff = useCallback(
    (settingKey) => {
      updateModal(`${settingKey}ConfirmOff`, false);
      updateModal(`${settingKey}2FAOff`, true);
    },
    [updateModal]
  );

  const handleCancelToggle = useCallback(
    (settingKey, action) => {
      const modalKey = `${settingKey}Confirm${action}`;
      updateModal(modalKey, false);
    },
    [updateModal]
  );

  // ==============================
  // 2FA HANDLERS
  // ==============================

  const handle2FASubmit = useCallback(
    (settingKey, action, data) => {
      if (
        data?.verificationCode &&
        data?.emailPassword &&
        data?.defaultPassword
      ) {
        updateModal(`${settingKey}2FA${action}`, false);
        updateModal(`${settingKey}Success${action}`, true);
      } else {
        alert("Please fill in all fields");
      }
    },
    [updateModal]
  );

  const handleCancel2FA = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}2FA${action}`, false);
    },
    [updateModal]
  );

  // ==============================
  // SUCCESS MODAL HANDLERS
  // ==============================

  const handleSuccessModalDone = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}Success${action}`, false);
      updateModal(`${settingKey}FinalSuccess${action}`, true);
    },
    [updateModal]
  );

  const handleFinalSuccessModalDone = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}FinalSuccess${action}`, false);
      setCommunicationPrefs(action === "On");
    },
    [updateModal]
  );

  const handleCloseSuccessModal = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}Success${action}`, false);
      setCommunicationPrefs(action === "On");
    },
    [updateModal]
  );

  const handleCloseFinalSuccessModal = useCallback(
    (settingKey, action) => {
      updateModal(`${settingKey}FinalSuccess${action}`, false);
      setCommunicationPrefs(action === "On");
    },
    [updateModal]
  );

  // ==============================
  // MEMOIZED MODAL COMPONENTS
  // ==============================

  // Memoized confirmation modal
  const ConfirmationModal = useMemo(
    () =>
      memo(({ isOpen, onClose, onConfirm, title, action }) => {
        if (!isOpen) return null;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
              <button
                onClick={onClose}
                className="absolute right-[33px] top-[33px] w-6 h-6 text-gray-500 hover:text-gray-700"
              >
                <CloseIcon />
              </button>
              <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[165px] text-center">
                <p className="font-bold text-black text-[18px] leading-[22px] tracking-[-0.41px] font-['Montserrat']">
                  {title}
                </p>
              </div>
              <div className="absolute top-[189px] left-1/2 transform -translate-x-1/2 flex gap-4">
                <button
                  onClick={onConfirm}
                  className="bg-black text-white rounded-3xl w-[149px] h-12 font-semibold text-[16px] leading-[22px] font-['Montserrat'] hover:bg-gray-800 transition-colors"
                >
                  yes
                </button>
                <button
                  onClick={onClose}
                  className="border border-[#e4e4e4] text-black rounded-[100px] w-[209px] h-16 font-medium text-[16px] leading-[19.2px] font-['Montserrat'] hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
              <div className="h-[280px]"></div>
            </div>
          </div>
        );
      }),
    []
  );

  // Memoized success modal
  const SuccessModal = useMemo(
    () =>
      memo(
        ({
          isOpen,
          onClose,
          onDone,
          title,
          description,
          isSuccess = true,
          buttonText = "Done",
        }) => {
          if (!isOpen) return null;

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-[0px_4px_120px_2px_rgba(0,0,0,0.25)] relative w-full max-w-md mx-4 overflow-clip">
                <button
                  onClick={onClose}
                  className="absolute right-[33px] top-[33px] w-6 h-6 text-gray-500 hover:text-gray-700"
                >
                  <CloseIcon />
                </button>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div
                      className={`w-16 h-16 ${
                        isSuccess ? "bg-green-100" : "bg-red-100"
                      } rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      {isSuccess ? <CheckIcon /> : <XIcon />}
                    </div>
                    <h3 className="font-bold text-black text-[18px] mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-600">{description}</p>
                  </div>
                  <button
                    onClick={onDone}
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            </div>
          );
        }
      ),
    []
  );

  // ==============================
  // COMPONENT DEFINITIONS
  // ==============================

  const ToggleSwitch = useCallback(
    ({ enabled, label, settingKey }) => (
      <div className="flex items-center justify-between py-4">
        <span className="font-bold text-[#010101] text-[20px] font-montserrat">
          {label}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleSetting(settingKey, "on")}
            className={`px-4 py-2 rounded-full text-[16px] font-medium transition-colors min-w-[69px] ${
              enabled ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            On
          </button>
          <button
            onClick={() => handleToggleSetting(settingKey, "off")}
            className={`px-4 py-2 rounded-full text-[16px] font-medium transition-colors min-w-[76px] ${
              !enabled ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Off
          </button>
        </div>
      </div>
    ),
    [handleToggleSetting]
  );

  // Render modals for communication preferences setting
  const renderModalsForSetting = useCallback(
    (settingKey, displayName) => {
      return (
        <>
          {/* Confirmation Modals */}
          <ConfirmationModal
            isOpen={modals[`${settingKey}ConfirmOn`]}
            onClose={() => handleCancelToggle(settingKey, "On")}
            onConfirm={() => handleConfirmToggleOn(settingKey)}
            title={`Are you sure you want to turn ${displayName} on`}
            action="On"
          />

          <ConfirmationModal
            isOpen={modals[`${settingKey}ConfirmOff`]}
            onClose={() => handleCancelToggle(settingKey, "Off")}
            onConfirm={() => handleConfirmToggleOff(settingKey)}
            title={`Are you sure you want to turn ${displayName} off`}
            action="Off"
          />

          {/* 2FA Modals */}
          {modals[`${settingKey}2FAOn`] && (
            <TwoFactorAuth
              onSubmit={(data) => handle2FASubmit(settingKey, "On", data)}
              onClose={() => handleCancel2FA(settingKey, "On")}
              phoneNumber={CONTACT_INFO.phoneNumber}
              emailAddress={CONTACT_INFO.emailAddress}
            />
          )}

          {modals[`${settingKey}2FAOff`] && (
            <TwoFactorAuth
              onSubmit={(data) => handle2FASubmit(settingKey, "Off", data)}
              onClose={() => handleCancel2FA(settingKey, "Off")}
              phoneNumber={CONTACT_INFO.phoneNumber}
              emailAddress={CONTACT_INFO.emailAddress}
            />
          )}

          {/* Success Modals */}
          <SuccessModal
            isOpen={modals[`${settingKey}SuccessOn`]}
            onClose={() => handleCloseSuccessModal(settingKey, "On")}
            onDone={() => handleSuccessModalDone(settingKey, "On")}
            title={`${displayName} Turned On`}
            description="The setting has been successfully activated."
            isSuccess={true}
          />

          <SuccessModal
            isOpen={modals[`${settingKey}SuccessOff`]}
            onClose={() => handleCloseSuccessModal(settingKey, "Off")}
            onDone={() => handleSuccessModalDone(settingKey, "Off")}
            title={`${displayName} Turned Off`}
            description="The setting has been successfully deactivated."
            isSuccess={false}
          />

          <SuccessModal
            isOpen={modals[`${settingKey}FinalSuccessOn`]}
            onClose={() => handleCloseFinalSuccessModal(settingKey, "On")}
            onDone={() => handleFinalSuccessModalDone(settingKey, "On")}
            title="Configuration Complete"
            description={`${displayName} is now active and configured.`}
            isSuccess={true}
            buttonText="Finish"
          />

          <SuccessModal
            isOpen={modals[`${settingKey}FinalSuccessOff`]}
            onClose={() => handleCloseFinalSuccessModal(settingKey, "Off")}
            onDone={() => handleFinalSuccessModalDone(settingKey, "Off")}
            title="Configuration Complete"
            description={`${displayName} has been successfully disabled.`}
            isSuccess={false}
            buttonText="Finish"
          />
        </>
      );
    },
    [
      modals,
      ConfirmationModal,
      SuccessModal,
      handleCancelToggle,
      handleConfirmToggleOn,
      handleConfirmToggleOff,
      handle2FASubmit,
      handleCancel2FA,
      handleSuccessModalDone,
      handleFinalSuccessModalDone,
      handleCloseSuccessModal,
      handleCloseFinalSuccessModal,
    ]
  );

  // ==============================
  // MAIN RENDER
  // ==============================

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#010101] font-montserrat">
            Communication Preferences Collection
          </h1>
          <p className="text-gray-600 mt-2">
            Configure data collection settings for communication preferences and
            contact information.
          </p>
        </div>

        {/* Communication Preferences Toggle */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <ToggleSwitch
            enabled={communicationPrefs}
            label="Collect communication preferences"
            settingKey="communicationPrefs"
          />
          <p className="text-sm text-gray-600 mt-2">
            When enabled, the system will collect user communication preferences
            including email, SMS, and notification settings.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-[18px] text-[#010101] mb-4">
            Current Status
          </h3>
          <div className="flex items-center space-x-3">
            <div className={statusIndicator.className}></div>
            <span className="text-[16px] font-medium">
              {statusIndicator.text}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {statusIndicator.description}
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h4 className="font-bold text-[16px] text-blue-800 mb-2">
            Privacy Notice
          </h4>
          <p className="text-sm text-blue-700">
            All communication preferences are collected in compliance with
            privacy regulations. Users have full control over their data and can
            opt-out at any time. Data is encrypted and stored securely with
            access limited to authorized personnel only.
          </p>
        </div>

        {/* Render Modals */}
        {renderModalsForSetting(
          "communicationPrefs",
          "Communication Preferences Collection"
        )}
      </div>
    </div>
  );
};

export default CollectCommunicationPreferences;

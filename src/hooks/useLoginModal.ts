import { useState, useEffect } from 'react';

export const useLoginModal = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };

    // Listen for the custom event
    window.addEventListener('showLoginModal', handleShowLoginModal);

    return () => {
      window.removeEventListener('showLoginModal', handleShowLoginModal);
    };
  }, []);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToForgotPassword = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  const handleSwitchToLoginFromForgot = () => {
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  return {
    showLoginModal,
    showRegisterModal,
    showForgotPasswordModal,
    handleCloseLoginModal,
    handleSwitchToRegister,
    handleSwitchToForgotPassword,
    handleCloseRegisterModal,
    handleSwitchToLogin,
    handleCloseForgotPasswordModal,
    handleSwitchToLoginFromForgot,
  };
};

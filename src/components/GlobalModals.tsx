import React from 'react';
import { useLoginModal } from '../hooks/useLoginModal';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';

const GlobalModals: React.FC = () => {
  const {
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
  } = useLoginModal();

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={handleCloseForgotPasswordModal}
        onSwitchToLogin={handleSwitchToLoginFromForgot}
      />
    </>
  );
};

export default GlobalModals;

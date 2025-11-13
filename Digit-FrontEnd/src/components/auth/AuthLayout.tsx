import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth/AuthLayout.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  footerContent?: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  footerContent
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="centered-logo-container">
          <img src="https://nimblevision.io/public/assets/img/NimbleLogo.jpg" alt="Nimble Vision" className="centered-logo" />
         
        </div>
        
        <div className="auth-content">
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
        
        {footerContent && <div className="auth-footer-links">{footerContent}</div>}
      </div>
    </div>
  );
};

export default AuthLayout;

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick
}) => {
  return (
    <button
      className={`button button-${variant} button-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

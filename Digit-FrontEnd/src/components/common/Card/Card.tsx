import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;

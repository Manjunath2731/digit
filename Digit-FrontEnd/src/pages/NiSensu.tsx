import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import '../styles/products/ProductPage.css';

const NiSensu: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCheckout = () => {
    window.open('https://nimblevision.io/products/ni-sensu', '_blank');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        <div className="product-page">
          <div className="product-container-simple">
            <div className="product-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h1 className="product-title-simple">Ni-Sensu</h1>
            <p className="product-description-simple">
              Advanced IoT-based water monitoring device for real-time tracking and management
            </p>
            <button className="checkout-button-simple" onClick={handleCheckout}>
              View Product & Purchase
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NiSensu;

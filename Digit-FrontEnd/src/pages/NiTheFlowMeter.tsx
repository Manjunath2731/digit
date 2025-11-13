import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import '../styles/products/ProductPage.css';

const NiTheFlowMeter: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCheckout = () => {
    window.open('https://nimblevision.io/products/ni-the-flow-meter', '_blank');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        <div className="product-page">
          <div className="product-container-simple">
            <div className="product-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h1 className="product-title-simple">Ni-The Flow Meter</h1>
            <p className="product-description-simple">
              Precision water flow measurement device with real-time data and wireless connectivity
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

export default NiTheFlowMeter;

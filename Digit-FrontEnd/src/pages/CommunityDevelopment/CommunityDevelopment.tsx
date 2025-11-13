import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './CommunityDevelopment.css';
import cdIcon from '../../assets/icons/cd.svg';
import cdImage from '../../assets/images/cd.jpg';
import Chatbot from '../../components/chatbot/Chatbot';
import LeadGen from '../../components/leadgen/LeadGen';

const CommunityDevelopment: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Disable scrolling for this page only, but allow scrolling in modals
  const preventDefault = useCallback((e: Event) => {
    // Check if the event target is inside a modal
    const target = e.target as HTMLElement;
    const isInsideModal = target.closest('.chatbot-modal') || 
                         target.closest('.maximized-chat-conversation') ||
                         target.closest('.chat-conversation');
    
    // Only prevent default if not inside a modal
    if (!isInsideModal) {
      e.preventDefault();
    }
  }, []);
  
  useEffect(() => {
    // Instead of setting overflow: hidden directly, we'll use a class
    // Add a class to the body to disable scrolling
    document.body.classList.add('no-scroll');
    
    // Add event listeners with the conditional preventDefault
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('wheel', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, [preventDefault]);
  
  // Function to handle chatbot state changes
  const handleChatbotStateChange = (isOpen: boolean) => {
    setIsChatbotOpen(isOpen);
  };
  // No longer need the showMessage state as it's handled by the Chatbot component
  return (
    <div className="community-development-page">
      <div className="breadcrumb">
        <Link to="/" className="home-link"><span className="home-icon">🏠</span> Home</Link> &gt; Community Development
      </div>
      
      <div className="content-container">
        <div className="left-column">
          <div className="hero-image">
            <img src={cdImage} alt="Community Development Building" />
            <div className="image-navigation">
              <button className="nav-button prev">❮</button>
              <button className="nav-button next">❯</button>
            </div>
          </div>
        </div>
        
        <div className="right-section">
          <div className="main-content">
            <h1>Development Services</h1>
            
            <div className="service-description">
              <p>
                The Development Services Department is responsible for overseeing and implementing 
                land use policy and regulations governing growth in the City of Mayorville. Our 
                department works with our community to plan for sustainable development that 
                balances economic growth with environmental and community needs.
              </p>
              <p>
                Through dedicated planning and development, we help guide Mayorville's future 
                in a way that respects our heritage and character while embracing progress and 
                innovation. Our team of experts is ready to assist you with all your development 
                needs in the city.
              </p>
            </div>
            
            <h2>Mission</h2>
            <p>
              To create and guide the City's vision of Mayorville by creating effective and balanced 
              policies while providing exceptional customer service through transparent and efficient 
              development processes and effective resources. The staff is committed through 
              professional integrity to enhancing the quality of life for current and future residents 
              while respecting our rich history and the citizens of Mayorville.
            </p>
            
            <h2>Vision</h2>
            <p>
              To cultivate a sustainable community where development and growth align with our 
              community goals and values. We strive to be leaders in innovative urban planning 
              approaches while maintaining our commitment to citizen involvement, public participation, 
              and responsive city services.
            </p>
          </div>
          
          <div className="staff-directory">
            <h2 className="staff-heading">Staff Directory</h2>
            
            <div className="staff-item">
              <h3>Development Section</h3>
              <div className="contact-info">
                <p className="address"><span className="icon">📍</span> 450 Windmill Road, Suite 100</p>
                <p className="city">Mayorville, CA 95123</p>
                <p className="phone"><span className="icon">📞</span> Tel: 555-123-4567</p>
              </div>
            </div>
            
            <div className="staff-item">
              <h3>Henry Parks - Planning Director</h3>
              <div className="contact-info">
                <p className="phone"><span className="icon">📞</span> Tel: 555-123-4568</p>
              </div>
            </div>
            
            <div className="staff-item">
              <h3>Brad Cooper - Senior Planner</h3>
              <div className="contact-info">
                <p className="phone"><span className="icon">📞</span> Tel: 555-123-4569</p>
              </div>
            </div>
            
            <div className="staff-item">
              <h3>Building Permits Division (1-800)</h3>
              <div className="contact-info">
                <p className="phone"><span className="icon">📞</span> Tel: 1-800-555-0123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ongoing-developments">
        <h2>Ongoing Developments in Mayorville</h2>
      </div>
      
      {/* Chatbot component */}
      <Chatbot onStateChange={handleChatbotStateChange} />
      {/* Hide LeadGen when Chatbot is open (on any device) */}
      {!isChatbotOpen && <LeadGen />}
    </div>
  );
};

export default CommunityDevelopment;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth/authService';
import { User } from '../types/user';
import Sidebar from '../components/layout/Sidebar';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />

        <div className="dashboard-content">
          <div className="welcome-card">
            <h1>Welcome, {user.user_name}!</h1>
            <p>You have successfully logged in to your account.</p>
          </div>

          <div className="user-details-card">
            <h2>Your Account Details</h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user.phone_no}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{user.user_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Type:</span>
                <span className="detail-value">
                  {/* {user.premium ? 'Premium' : 'Standard'} */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default Dashboard;

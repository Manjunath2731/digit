import React from 'react';
import { SecondaryUser } from '../../services/userManagement';
import Button from '../auth/Button';
import '../../styles/users/UserManagement.css';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SecondaryUser | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const getDeviceLabel = (device?: string) => {
    switch (device) {
      case 't11': return 't11';
      case 't12': return 't12';
      case 'r4': return 'r4';
      case 'f95': return 'f95';
      default: return 'Not Specified';
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'full': return 'Full Access';
      case 'limited': return 'Limited Access';
      case 'view_only': return 'View Only';
      default: return level;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-details-modal">
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-sections">
            <div className="detail-section">
              <h3>User Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{user.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Access Level</span>
                  <span className="detail-value">
                    <span className={`access-badge ${user.access_level}`}>
                      {getAccessLevelLabel(user.access_level)}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Added On</span>
                  <span className="detail-value">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Device Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Device Type</span>
                  <span className="detail-value">
                    <span className={`device-badge ${user.device || 'not-specified'}`}>
                      {getDeviceLabel(user.device)}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Login</span>
                  <span className="detail-value">Yesterday, 2:30 PM</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">IP Address</span>
                  <span className="detail-value">192.168.1.{user.id + 100}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Browser</span>
                  <span className="detail-value">Chrome 118.0.5993.88</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">OS</span>
                  <span className="detail-value">Windows 11</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">Mumbai, India</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Activity Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Last Activity</span>
                  <span className="detail-value">Today, 9:45 AM</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Logins</span>
                  <span className="detail-value">{15 + user.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reports Generated</span>
                  <span className="detail-value">{3 + user.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Properties Viewed</span>
                  <span className="detail-value">{8 + user.id * 2}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Session Duration</span>
                  <span className="detail-value">45 minutes (avg)</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Created</span>
                  <span className="detail-value">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            fullWidth={false}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import '../styles/EditProfile.css';

const EditProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    contactNumber: '',
    name: '',
    pincode: '',
    address: ''
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      console.log('User data:', parsedUser); // Debug log
      
      // Populate form with user data
      setFormData({
        email: parsedUser.email_id || parsedUser.email || '',
        contactNumber: parsedUser.phone_no ? String(parsedUser.phone_no) : (parsedUser.phone || ''),
        name: parsedUser.user_name || '',
        pincode: parsedUser.pin_code ? String(parsedUser.pin_code) : '',
        address: parsedUser.address || ''
      });
      
      // Set profile picture if exists
      if (parsedUser.profile_picture || parsedUser.profilePicture) {
        setProfilePicture(parsedUser.profile_picture || parsedUser.profilePicture);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Implement API call to update profile
      console.log('Updating profile:', formData);
      
      // Update localStorage
      if (user) {
        const updatedUser = {
          ...user,
          email_id: formData.email,
          phone_no: formData.contactNumber ? parseInt(formData.contactNumber) : 0,
          user_name: formData.name,
          pin_code: formData.pincode ? parseInt(formData.pincode) : 0,
          address: formData.address
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      // TODO: Implement API call to upload picture
      console.log('Uploading picture:', selectedFile);
      alert('Picture uploaded successfully!');
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Failed to upload picture');
    }
  };

  return (
    <div className="edit-profile-page">
      <Sidebar user={user} />
      <div className="edit-profile-content">
        <div className="profile-sections">
          {/* Edit Profile Section */}
          <div className="profile-card">
            <div className="card-header">
              <div className="header-icon cyan-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2>Edit Profile</h2>
            </div>

            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-row">
                <label>Email ID</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email ID"
                  disabled
                />
              </div>

              <div className="form-row">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  maxLength={10}
                />
              </div>

              <div className="form-row">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                />
              </div>

              <div className="form-row">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  maxLength={6}
                />
              </div>

              <div className="form-row">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>

              <button type="submit" className="update-button" disabled={isUpdating}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {isUpdating ? 'UPDATING...' : 'UPDATE'}
              </button>
            </form>
          </div>

          {/* Change Picture Section */}
          <div className="profile-card">
            <div className="card-header">
              <div className="header-icon pink-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h2>Change Picture</h2>
            </div>

            <div className="picture-upload">
              <div className="profile-picture-preview">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" />
                ) : (
                  <div className="default-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>

              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <button 
                type="button" 
                className="select-file-button"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                SELECT FILE
              </button>
            </div>
          </div>
        </div>

        <div className="ads-section">
          <p>Ads</p>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

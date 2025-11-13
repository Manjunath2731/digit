import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { 
  getUserDeviceIds, 
  getBorewellLevel,
  getUniqueConstituencies,
  getWardsByConstituency,
  getDevicesByConstituencyAndWard,
  type UserDevice 
} from '../services/deviceManagement';
import '../styles/WaterLevel.css';

const WaterLevel: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<UserDevice[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBorewell, setSelectedBorewell] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Water level state
  const [waterLevel, setWaterLevel] = useState(0);
  const [waterLevelPercentage, setWaterLevelPercentage] = useState(0);
  const [waterLevelStatus, setWaterLevelStatus] = useState('normal');
  const [waterLevelStatusText, setWaterLevelStatusText] = useState('Normal');

  const scaleMarks = [0, 400, 800, 1200, 1600, 2000];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadUserDevices();
    }
  }, []);

  const loadUserDevices = async () => {
    try {
      setIsLoading(true);
      const devices = await getUserDeviceIds();
      
      setUserDevices(devices);
      
      if (devices.length > 0) {
        const uniqueConstituencies = getUniqueConstituencies(devices);
        
        setConstituencies(uniqueConstituencies);
        
        if (uniqueConstituencies.length > 0) {
          setSelectedConstituency(uniqueConstituencies[0]);
          handleConstituencyChange(uniqueConstituencies[0], devices);
        } else {
          setSelectedBorewell(devices[0].device_id || '');
          fetchWaterLevel(devices[0].device_id);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user devices:', error);
      setUserDevices([]);
      setIsLoading(false);
    }
  };

  const handleConstituencyChange = (constituency: string, devices: UserDevice[] = userDevices) => {
    setSelectedConstituency(constituency);
    
    const filteredWards = getWardsByConstituency(devices, constituency);
    
    setWards(filteredWards);
    
    if (filteredWards.length > 0) {
      setSelectedWard(filteredWards[0]);
      handleWardChange(filteredWards[0], constituency, devices);
    }
  };

  const handleWardChange = (ward: string, constituency: string = selectedConstituency, devices: UserDevice[] = userDevices) => {
    setSelectedWard(ward);
    
    const filtered = getDevicesByConstituencyAndWard(devices, constituency, ward);
    
    setFilteredDevices(filtered);
    
    if (filtered.length > 0) {
      setSelectedBorewell(filtered[0].device_id);
      fetchWaterLevel(filtered[0].device_id);
    }
  };

  const getDisplayLevel = (): number => {
    if (waterLevel < 100) {
      return waterLevel * 20;
    } else if (waterLevel >= 100 && waterLevel < 200) {
      return waterLevel * 10;
    } else if (waterLevel >= 200 && waterLevel < 500) {
      return waterLevel * 3;
    } else if (waterLevel >= 500 && waterLevel < 1000) {
      return waterLevel * 2;
    } else {
      return waterLevel;
    }
  };

  const fetchWaterLevel = async (deviceId: string) => {
    if (!deviceId) {
      console.error('No device selected');
      return;
    }
    
    setIsDataLoading(true);
    
    try {
      const response = await getBorewellLevel(deviceId, '1');
      console.log('Water level response:', response);
      
      // Check if the response has a status field and it's false
      if (response && response.status === false) {
        console.log('No data available:', response.msg);
        setWaterLevel(0);
        setWaterLevelPercentage(0);
        setWaterLevelStatus('low');
        setWaterLevelStatusText(response.msg || 'No Data');
      }
      // Check if we have valid level data
      else if (response && response.level) {
        const level = parseFloat(response.level || '0');
        setWaterLevel(level);
        
        // Calculate the level for visualization based on the rules
        let calculatedLevel;
        if (level < 100) {
          calculatedLevel = level * 20;
        } else if (level >= 100 && level < 200) {
          calculatedLevel = level * 10;
        } else if (level >= 200 && level < 500) {
          calculatedLevel = level * 3;
        } else if (level >= 500 && level < 1000) {
          calculatedLevel = level * 2;
        } else {
          calculatedLevel = level;
        }
        
        // Calculate the distance from top to water surface (2000 - calculatedLevel)
        const distanceFromTop = 2000 - calculatedLevel;
        
        // Calculate the percentage for the visualization (0-2000 scale)
        setWaterLevelPercentage((distanceFromTop / 2000) * 100);
        
        // Set status based on the calculated level
        if (calculatedLevel < 400) {
          setWaterLevelStatus('low');
          setWaterLevelStatusText('LOW');
        } else if (calculatedLevel > 1600) {
          setWaterLevelStatus('high');
          setWaterLevelStatusText('HIGH');
        } else {
          setWaterLevelStatus('normal');
          setWaterLevelStatusText('NORMAL');
        }
      } else {
        console.error('Unexpected API response format:', response);
        setWaterLevel(0);
        setWaterLevelPercentage(0);
        setWaterLevelStatus('low');
        setWaterLevelStatusText('No Data');
      }
      
      setIsDataLoading(false);
    } catch (error: any) {
      console.error('Error fetching water level data:', error);
      setWaterLevel(0);
      setWaterLevelPercentage(0);
      setWaterLevelStatus('low');
      
      if (error.response?.status === 400) {
        setWaterLevelStatusText('NO DATA');
      } else {
        setWaterLevelStatusText('ERROR');
      }
      
      setIsDataLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="dashboard-container">
      <header className="auth-header">
        <div className="logo-container">
          <img src="https://nimblevision.io/public/assets/images/nv-logo.png" alt="DIGIT" className="header-logo" />
          <span className="logo-text">Nimble Vision</span>
        </div>
        <div className="language-selector">
          <select className="language-dropdown">
            <option value="ENGLISH">ENGLISH</option>
            <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
          </select>
        </div>
      </header>

      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="dashboard-content">
          <main className="main-content water-level-main">
            <div className="page-header">
              <h1><span className="header-icon">💧</span> Water Level</h1>
            </div>

            {/* Device Selector */}
            <div className="borewell-selector">
              {userDevices.length > 0 ? (
                <div className="selector-group">
                  <div className="selector-item">
                    <label><span className="label-icon">📍</span> Constituency:</label>
                    <select 
                      value={selectedConstituency} 
                      onChange={(e) => handleConstituencyChange(e.target.value)}
                    >
                      {constituencies.map(constituency => (
                        <option key={constituency} value={constituency}>{constituency}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="selector-item">
                    <label><span className="label-icon">🏘️</span> Ward:</label>
                    <select 
                      value={selectedWard} 
                      onChange={(e) => handleWardChange(e.target.value)}
                      disabled={!selectedConstituency || wards.length === 0}
                    >
                      {wards.map(ward => (
                        <option key={ward} value={ward}>{ward}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="selector-item">
                    <label><span className="label-icon">💧</span> Borewell:</label>
                    <select 
                      value={selectedBorewell} 
                      onChange={(e) => {
                        setSelectedBorewell(e.target.value);
                        fetchWaterLevel(e.target.value);
                      }}
                      disabled={!selectedWard || filteredDevices.length === 0}
                    >
                      {filteredDevices.map(device => (
                        <option key={device.device_id} value={device.device_id}>
                          {device.device_name || device.device_id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="no-devices">
                  <span className="warning-icon">⚠️</span> No devices available
                </div>
              )}
              
              {isLoading && (
                <div className="loading-indicator">
                  <span className="spinner">⟳</span> Loading...
                </div>
              )}
            </div>

            {/* Water Level Card */}
            {selectedBorewell && (
              <div className="water-level-card">
                <div className="card-header">
                  <div className="card-icon">💧</div>
                  <h2>Water Level</h2>
                  <div className="header-actions">
                    <button className="refresh-btn" onClick={() => fetchWaterLevel(selectedBorewell)}>
                      <span className="refresh-icon">↻</span> Refresh
                    </button>
                    <button className="expand-btn" onClick={toggleExpand}>
                      <span className="expand-icon">{isExpanded ? '⤓' : '⤢'}</span>
                    </button>
                  </div>
                </div>
                
                <div className={`level-container ${isExpanded ? 'expanded' : ''}`}>
                  {!isDataLoading ? (
                    <div className="level-indicator">
                      <div className="level-scale">
                        {scaleMarks.map((mark) => (
                          <div key={mark} className="scale-mark">
                            <div className="mark-label">{mark}</div>
                            <div className="mark-line"></div>
                          </div>
                        ))}
                      </div>
                      <div className="well-container">
                        <div className="well">
                          <div className="water" style={{ height: `${waterLevelPercentage}%` }}></div>
                        </div>
                      </div>
                      <div className="level-info">
                        <div className="level-value">{getDisplayLevel().toFixed(1)} ft</div>
                      </div>
                    </div>
                  ) : (
                    <div className="loading-indicator">
                      <span className="spinner">⟳</span> Loading water level data...
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default WaterLevel;

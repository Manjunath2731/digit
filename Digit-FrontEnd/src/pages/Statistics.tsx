import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { 
  getUserDeviceIds, 
  getDeviceStatistics,
  getDeviceDiagnosticInfo,
  getUniqueConstituencies,
  getWardsByConstituency,
  getDevicesByConstituencyAndWard,
  type UserDevice 
} from '../services/deviceManagement';
import '../styles/Statistics.css';

interface DeviceStats {
  total_overload_trips: number;
  total_underload_trips: number;
  daily_consumption: number;
  total_cycles: number;
  total_on_time: string;
  device_on_status: number;
}

const Statistics: React.FC = () => {
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
  
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    total_overload_trips: 0,
    total_underload_trips: 0,
    daily_consumption: 0,
    total_cycles: 0,
    total_on_time: '00:00:00',
    device_on_status: 0
  });

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
          fetchDeviceStatistics(devices[0].device_id);
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
      fetchDeviceStatistics(filtered[0].device_id);
    }
  };

  const fetchDeviceStatistics = async (deviceId: string) => {
    if (!deviceId) {
      console.error('No device selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const statsResponse = await getDeviceStatistics(deviceId, '1');
      
      if (statsResponse) {
        setDeviceStats({
          total_overload_trips: statsResponse.total_overload_trips || 0,
          total_underload_trips: statsResponse.total_underload_trips || 0,
          daily_consumption: statsResponse.daily_consumption || 0,
          total_cycles: statsResponse.total_cycles || 0,
          total_on_time: statsResponse.total_on_time || '00:00:00',
          device_on_status: statsResponse.device_on_status || 0
        });
      }
      
      // Also fetch diagnostic data for motor status
      try {
        const diagnosticResponse = await getDeviceDiagnosticInfo(deviceId, '1');
        
        if (diagnosticResponse) {
          setDeviceStats(prev => ({
            ...prev,
            device_on_status: diagnosticResponse.status_1 === '1' ? 1 : 0
          }));
        }
      } catch (diagError) {
        console.error('Error fetching diagnostic data:', diagError);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching device statistics:', error);
      setIsLoading(false);
    }
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
          <main className="main-content statistics-main">
            {/* <div className="page-header">
              <h1><span className="header-icon">📊</span> Statistics</h1>
            </div> */}

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
                    <label><span className="label-icon">🔌</span> Device:</label>
                    <select 
                      value={selectedBorewell} 
                      onChange={(e) => {
                        setSelectedBorewell(e.target.value);
                        fetchDeviceStatistics(e.target.value);
                      }}
                      disabled={!selectedWard || filteredDevices.length === 0}
                    >
                      {filteredDevices.map(device => (
                        <option key={device.device_id} value={device.device_id}>
                          {device.device_name}
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
                  <span className="spinner">⟳</span> Loading data...
                </div>
              )}
            </div>

            {/* Statistics Cards Grid */}
            <div className="stats-container">
              {/* Overload Trips Card */}
              <div className="stats-card">
                <div className="card-header">
                  <div className="card-icon overload-icon">⚡</div>
                  <h2>Total Overload Trips</h2>
                </div>
                <div className="stat-content">
                  <div className="stat-value-large">{deviceStats.total_overload_trips}</div>
                  <div className="stat-description">Number of times the device has tripped due to overload</div>
                </div>
              </div>

              {/* Underload Trips Card */}
              <div className="stats-card">
                <div className="card-header">
                  <div className="card-icon underload-icon">🔋</div>
                  <h2>Total Underload Trips</h2>
                </div>
                <div className="stat-content">
                  <div className="stat-value-large">{deviceStats.total_underload_trips}</div>
                  <div className="stat-description">Number of times the device has tripped due to underload</div>
                </div>
              </div>

              {/* Water Extraction Card */}
              <div className="stats-card">
                <div className="card-header">
                  <div className="card-icon water-icon">💧</div>
                  <h2>Water Extraction Today</h2>
                </div>
                <div className="stat-content">
                  <div className="stat-value-large">
                    {deviceStats.daily_consumption.toFixed(2)} <span className="unit">KL</span>
                  </div>
                  <div className="stat-description">Total water extracted today in Kilo Litre</div>
                </div>
              </div>

              {/* Cycle Count Card */}
              <div className="stats-card">
                <div className="card-header">
                  <div className="card-icon cycle-icon">🔄</div>
                  <h2>Cycle Count</h2>
                </div>
                <div className="stat-content">
                  <div className="stat-value-large">{deviceStats.total_cycles}</div>
                  <div className="stat-description">Total number of pump cycles today</div>
                </div>
              </div>

              {/* Motor Status Card */}
              <div className="stats-card">
                <div className="card-header">
                  <div className={`card-icon status-icon ${deviceStats.device_on_status === 1 ? 'active' : ''}`}>
                    🔌
                  </div>
                  <h2>Current Motor Status</h2>
                </div>
                <div className="stat-content">
                  <div className={`stat-value-large ${deviceStats.device_on_status === 1 ? 'status-on' : 'status-off'}`}>
                    {deviceStats.device_on_status === 1 ? 'ON' : 'OFF'}
                  </div>
                  <div className="stat-description">Current operational status of the motor</div>
                </div>
              </div>

              {/* On Time Card */}
              <div className="stats-card">
                <div className="card-header">
                  <div className="card-icon time-icon">⏰</div>
                  <h2>Total On Time Today</h2>
                </div>
                <div className="stat-content">
                  <div className="stat-value-large">{deviceStats.total_on_time}</div>
                  <div className="stat-description">Total duration the motor has been running today</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default Statistics;

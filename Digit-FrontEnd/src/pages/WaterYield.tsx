import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { 
  getUserDeviceIds, 
  getHighestLowestWaterExtractionDetails,
  getUniqueConstituencies,
  getWardsByConstituency,
  getDevicesByConstituencyAndWard,
  type UserDevice 
} from '../services/deviceManagement';
import '../styles/WaterYield.css';

interface WaterYieldData {
  date: string;
  water_consumption: number;
  total_on_time: string;
}

interface WaterDetails {
  start_date: string;
  end_date: string;
  total_days: number;
  total_water_consumption: number;
  total_on_time: string;
}

const WaterYield: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<UserDevice[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBorewell, setSelectedBorewell] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [yieldData, setYieldData] = useState<WaterYieldData[]>([]);
  const [waterDetails, setWaterDetails] = useState<WaterDetails | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

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
          fetchWaterYieldData(devices[0].device_id);
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
      fetchWaterYieldData(filtered[0].device_id);
    }
  };

  const fetchWaterYieldData = async (deviceId: string) => {
    if (!deviceId) {
      console.error('No device selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await getHighestLowestWaterExtractionDetails(deviceId, '1');
      
      if (response && response.data && Array.isArray(response.data)) {
        setYieldData(response.data);
        setWaterDetails(response.details || null);
        processChartData(response.data);
      } else {
        console.error('Unexpected API response format:', response);
        setYieldData([]);
        setWaterDetails(null);
        setChartData([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching water yield data:', error);
      setYieldData([]);
      setWaterDetails(null);
      setChartData([]);
      setIsLoading(false);
    }
  };

  const convertTimeToHours = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return parseFloat((hours + minutes/60 + seconds/3600).toFixed(2));
  };

  const processChartData = (data: WaterYieldData[]) => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    
    // Sort data by date (oldest to newest)
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Get the last 7 days or 30 days based on timeRange
    const dataToShow = timeRange === 'week' ? 
      sortedData.slice(-7) : 
      sortedData.slice(-30);
    
    // Extract labels and values
    const processedData = dataToShow.map(item => {
      const date = new Date(item.date);
      const label = timeRange === 'week' ? 
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] : 
        date.getDate().toString();
      const consumption = Number(item.water_consumption) || 0;
      const onTimeHours = convertTimeToHours(item.total_on_time || "00:00:00");
      
      return { label, consumption, onTimeHours };
    });
    
    // Calculate max values for scaling
    const maxConsumption = Math.max(...processedData.map(d => d.consumption), 1);
    const maxOnTime = Math.max(...processedData.map(d => d.onTimeHours), 1);
    
    // Add percentages for visualization
    const chartDataWithPercentages = processedData.map(item => ({
      ...item,
      consumptionPercentage: (item.consumption / maxConsumption) * 100,
      onTimePercentage: (item.onTimeHours / maxOnTime) * 100
    }));
    
    setChartData(chartDataWithPercentages);
  };

  useEffect(() => {
    if (yieldData.length > 0) {
      processChartData(yieldData);
    }
  }, [timeRange]);

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
          <main className="main-content water-yield-main">
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
                        fetchWaterYieldData(e.target.value);
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

            {/* Water Yield Card */}
            <div className="yield-card">
              <div className="card-header">
                <div className="card-title-section">
                  <div className="card-icon">📊</div>
                  <h2>Water Yield</h2>
                </div>
                <div className="header-actions">
                  <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              {/* Water Details Summary */}
              {waterDetails && (
                <div className="water-details-summary">
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-icon">📅</div>
                      <div className="detail-content">
                        <span className="detail-label">Period</span>
                        <span className="detail-value">{waterDetails.start_date} to {waterDetails.end_date}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">⏰</div>
                      <div className="detail-content">
                        <span className="detail-label">Total Days</span>
                        <span className="detail-value">{waterDetails.total_days} days</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">💧</div>
                      <div className="detail-content">
                        <span className="detail-label">Total Consumption</span>
                        <span className="detail-value">{waterDetails.total_water_consumption.toFixed(2)} KL</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">⏳</div>
                      <div className="detail-content">
                        <span className="detail-label">Total On Time</span>
                        <span className="detail-value">{waterDetails.total_on_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dual Bar Chart */}
              <div className="chart-container">
                {chartData.length > 0 ? (
                  <div className="dual-bar-chart">
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color consumption"></div>
                        <span>Water Consumption (KL)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color ontime"></div>
                        <span>On Time (Hours)</span>
                      </div>
                    </div>
                    
                    <div className="chart-bars">
                      {chartData.map((item, index) => (
                        <div key={index} className="bar-group">
                          <div className="bars-container">
                            <div 
                              className="bar consumption-bar"
                              style={{ height: `${item.consumptionPercentage}%` }}
                              title={`${item.consumption.toFixed(2)} KL`}
                            >
                              <span className="bar-value">{item.consumption.toFixed(1)}</span>
                            </div>
                            <div 
                              className="bar ontime-bar"
                              style={{ height: `${item.onTimePercentage}%` }}
                              title={`${item.onTimeHours.toFixed(2)} Hours`}
                            >
                              <span className="bar-value">{item.onTimeHours.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="bar-label">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-data">No data available</div>
                )}
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

export default WaterYield;

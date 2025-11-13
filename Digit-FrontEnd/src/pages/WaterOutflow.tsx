import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { 
  getUserDeviceIds, 
  getWaterExtractionDetails,
  getUniqueConstituencies,
  getWardsByConstituency,
  getDevicesByConstituencyAndWard,
  type UserDevice 
} from '../services/deviceManagement';
import '../styles/WaterOutflow.css';

interface WaterData {
  date: string;
  water_consumption: number;
}

interface WaterDetails {
  start_date: string;
  end_date: string;
  total_days: number;
  total_water_consumption: number;
}

const WaterOutflow: React.FC = () => {
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
  const [tankData, setTankData] = useState<WaterData[]>([]);
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
          fetchWaterOutflowData(devices[0].device_id);
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
      fetchWaterOutflowData(filtered[0].device_id);
    }
  };

  const fetchWaterOutflowData = async (deviceId: string) => {
    if (!deviceId) {
      console.error('No device selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await getWaterExtractionDetails(deviceId, '1');
      
      if (response && response.data && Array.isArray(response.data)) {
        setTankData(response.data);
        setWaterDetails(response.details || null);
        processChartData(response.data);
      } else {
        console.error('Unexpected API response format:', response);
        setTankData([]);
        setWaterDetails(null);
        setChartData([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching water outflow data:', error);
      setTankData([]);
      setWaterDetails(null);
      setChartData([]);
      setIsLoading(false);
    }
  };

  const processChartData = (data: WaterData[]) => {
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
      const value = Number(item.water_consumption) || 0;
      
      return { label, value };
    });
    
    // Calculate average
    const values = processedData.map(d => d.value);
    const average = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    const maxValue = Math.max(...values, average);
    
    // Add color based on comparison with average
    const chartDataWithColors = processedData.map(item => ({
      ...item,
      isAboveAverage: item.value > average,
      percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0
    }));
    
    setChartData(chartDataWithColors);
  };

  useEffect(() => {
    if (tankData.length > 0) {
      processChartData(tankData);
    }
  }, [timeRange]);

  const getAverageValue = () => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.value, 0);
    return sum / chartData.length;
  };

  const getMaxValue = () => {
    if (chartData.length === 0) return 300;
    return Math.max(...chartData.map(d => d.value), getAverageValue());
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
          <main className="main-content water-outflow-main">
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
                        fetchWaterOutflowData(e.target.value);
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

            {/* Water Outflow Card */}
            <div className="outflow-card">
              <div className="card-header">
                <div className="card-title-section">
                  <div className="card-icon">💧</div>
                  <h2>Water Outflow</h2>
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
                  </div>
                </div>
              )}

              {/* Chart Container */}
              <div className="chart-container">
                {chartData.length > 0 ? (
                  <div className="bar-chart">
                    <div className="y-axis-label">Water Outflow (in Kilo Litre)</div>
                    
                    {/* Y-axis scale */}
                    <div className="y-axis-scale">
                      {[300, 250, 200, 150, 100, 50, 0].map((value) => (
                        <div key={value} className="y-axis-value">{value}</div>
                      ))}
                    </div>
                    
                    <div className="chart-area">
                      {/* Grid lines */}
                      <div className="grid-lines">
                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="grid-line"></div>
                        ))}
                      </div>
                      
                      {/* Bars */}
                      <div className="chart-bars">
                        {chartData.map((item, index) => (
                          <div key={index} className="bar-wrapper">
                            <div className="bar-container">
                              <div 
                                className={`bar ${item.isAboveAverage ? 'above-avg' : 'below-avg'}`}
                                style={{ height: `${item.percentage}%` }}
                              >
                              </div>
                            </div>
                            <div className="bar-label">{item.label}</div>
                          </div>
                        ))}
                      </div>
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

export default WaterOutflow;

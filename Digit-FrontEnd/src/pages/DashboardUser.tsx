import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth/authService';
import Sidebar from '../components/layout/Sidebar';
import { getUserDeviceIds, getDeviceTankState2, getDeviceTankState3 } from '../services/deviceManagement';
import WaterTank3D from '../components/WaterTank3D_EXACT';
import '../styles/DashboardUser.css';
import '../styles/Dashboard.css';

interface TankData {
  id: string;
  name: string;
  totalCapacity: number;
  currentCapacity: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
}

interface HourlyConsumption {
  hour: string;
  consumption: number;
}

interface HourlyData {
  deviceId: string;
  deviceName: string;
  hourlyData: HourlyConsumption[];
  hasData: boolean;
}

interface DailyConsumption {
  consumption: number;
  date: string;
  formattedDate: string;
}

interface PastConsumptionData {
  deviceId: string;
  deviceName: string;
  dailyData: DailyConsumption[];
  hasData: boolean;
}

const DashboardUser: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [selectedWaterLevel, setSelectedWaterLevel] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [liveTankView, setLiveTankView] = useState('LIVE TANK');
  const [hourlyDataList, setHourlyDataList] = useState<HourlyData[]>([]);
  const [isLoadingHourly, setIsLoadingHourly] = useState(false);
  const [pastConsumptionList, setPastConsumptionList] = useState<PastConsumptionData[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [userDevices, setUserDevices] = useState<any[]>([]);

  // Mock tank data - Replace with API call
  const [tankData, setTankData] = useState<TankData[]>([
    {
      id: '1',
      name: 'Bhadra OH 1',
      totalCapacity: 76204,
      currentCapacity: 62487.28,
      percentage: 82,
      status: 'normal'
    },
    {
      id: '2',
      name: 'Tunga Netra Sump',
      totalCapacity: 186300,
      currentCapacity: 149040,
      percentage: 80,
      status: 'normal'
    },
    {
      id: '3',
      name: 'Tunga Netra Sump Motor',
      totalCapacity: 10000,
      currentCapacity: 7800,
      percentage: 78,
      status: 'normal'
    },
    {
      id: '4',
      name: 'Reservoir Tank 4',
      totalCapacity: 50000,
      currentCapacity: 32000,
      percentage: 64,
      status: 'warning'
    }
  ]);

  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Load user devices
    loadUserDevices();
  }, []);

  useEffect(() => {
    // Fetch hourly data when view changes to HOURLY CONSUMPTIONS
    if (liveTankView === 'HOURLY CONSUMPTIONS' && userDevices.length > 0) {
      fetchHourlyConsumptionData();
    } else if (liveTankView === 'PAST CONSUMPTIONS' && userDevices.length > 0) {
      fetchPastConsumptionData();
    }
  }, [liveTankView, userDevices]);

  const loadUserDevices = async () => {
    try {
      const devices = await getUserDeviceIds();
      setUserDevices(devices);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const fetchHourlyConsumptionData = async () => {
    setIsLoadingHourly(true);
    const hourlyData: HourlyData[] = [];

    try {
      // Fetch only the first device
      if (userDevices.length > 0) {
        const device = userDevices[0];
        try {
          console.log('Fetching data for device:', device.device_id);
          const response = await getDeviceTankState2(device.device_id, '1');
          
          console.log('API Response:', response);
          
          if (response && response.data && Array.isArray(response.data)) {
            // Process all hourly data from the response
            const hourlyConsumption: HourlyConsumption[] = response.data.map((item: any) => {
              const date = new Date(item.created_at);
              let hour = date.getHours();
              const minute = date.getMinutes();
              const ampm = hour >= 12 ? 'pm' : 'am';
              hour = hour % 12 || 12;
              const timeLabel = `${hour}.${minute.toString().padStart(2, '0')} ${ampm}`;
              
              return {
                hour: timeLabel,
                consumption: item.onehrs || 0
              };
            });
            
            const hasData = hourlyConsumption.some(h => h.consumption > 0);
            
            if (hasData) {
              hourlyData.push({
                deviceId: device.device_id,
                deviceName: device.device_name || device.device_id,
                hourlyData: hourlyConsumption,
                hasData: hasData
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching data for device ${device.device_id}:`, error);
        }
      }
      
      setHourlyDataList(hourlyData);
    } catch (error) {
      console.error('Error fetching hourly consumption data:', error);
    } finally {
      setIsLoadingHourly(false);
    }
  };

  const fetchPastConsumptionData = async () => {
    setIsLoadingPast(true);
    const pastData: PastConsumptionData[] = [];

    try {
      // Get unique devices only
      const uniqueDevices = userDevices.filter((device, index, self) =>
        index === self.findIndex((d) => d.device_id === device.device_id)
      );
      const devicesToFetch = uniqueDevices.slice(0, 6);
      
      for (const device of devicesToFetch) {
        try {
          const response = await getDeviceTankState3(device.device_id, '1');
          
          console.log('Past Consumption API Response:', response);
          
          if (response && response.data && Array.isArray(response.data)) {
            // Process all daily data from the response
            const dailyData: DailyConsumption[] = response.data.map((item: any) => {
              const consumption = item.oneday_night || 0;
              const date = new Date(item.created_at);
              const day = date.getDate();
              const month = date.toLocaleString('en-US', { month: 'short' });
              const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
              
              return {
                consumption: consumption,
                date: item.created_at,
                formattedDate: `${day}${suffix} ${month}`
              };
            });
            
            const hasData = dailyData.some(d => d.consumption > 0);
            
            pastData.push({
              deviceId: device.device_id,
              deviceName: device.device_name || device.device_id,
              dailyData: dailyData,
              hasData: hasData
            });
          }
        } catch (error) {
          console.error(`Error fetching past data for device ${device.device_id}:`, error);
        }
      }
      
      setPastConsumptionList(pastData);
    } catch (error) {
      console.error('Error fetching past consumption data:', error);
    } finally {
      setIsLoadingPast(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTankStatusColor = (percentage: number) => {
    if (percentage >= 70) return 'normal';
    if (percentage >= 40) return 'warning';
    return 'critical';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const renderHourlyChart = (data: HourlyData) => {
    if (!data.hasData) {
      return null;
    }

    const colors = [
      '#FF6B9D', '#9C27B0', '#673AB7', '#3F51B5', 
      '#2196F3', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
      '#FF9800', '#FF5722', '#795548', '#607D8B',
      '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#00BCD4', '#009688', '#4CAF50'
    ];

    // Filter out zero consumption hours
    const nonZeroHours = data.hourlyData.filter(h => h.consumption > 0);
    const total = nonZeroHours.reduce((sum, h) => sum + h.consumption, 0);
    
    let currentAngle = 0;
    const segments = nonZeroHours.map((hour, index) => {
      const percentage = (hour.consumption / total) * 100;
      const angle = (hour.consumption / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        hour: hour.hour,
        value: hour.consumption,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: colors[index % colors.length]
      };
    });

    return (
      <div key={data.deviceId} className="pie-chart-container">
        <div className="pie-chart-wrapper">
          <svg className="pie-chart" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="white" />
            {segments.map((segment, index) => {
              const x1 = 100 + 80 * Math.cos((segment.startAngle - 90) * Math.PI / 180);
              const y1 = 100 + 80 * Math.sin((segment.startAngle - 90) * Math.PI / 180);
              const x2 = 100 + 80 * Math.cos((segment.endAngle - 90) * Math.PI / 180);
              const y2 = 100 + 80 * Math.sin((segment.endAngle - 90) * Math.PI / 180);
              const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="100" cy="100" r="50" fill="white" />
          </svg>
          
          {/* Hour labels around the chart */}
          <div className="hour-labels">
            {segments.filter(seg => seg.percentage > 2).map((segment, index) => {
              const angle = (segment.startAngle + segment.endAngle) / 2;
              const radius = 58;
              const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
              const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
              
              return (
                <div
                  key={index}
                  className="hour-label"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    color: segment.color
                  }}
                >
                  {segment.hour}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="chart-info">
          <p className="total-consumption">{total.toFixed(0)} ltrs</p>
        </div>
      </div>
    );
  };

  const renderBarChart = (data: PastConsumptionData) => {
    if (!data.hasData) {
      return null; // Don't render if no data
    }

    // Different colors for each bar
    const barColors = [
      '#FF6B9D', '#9C27B0', '#673AB7', '#3F51B5', 
      '#2196F3', '#00BCD4', '#009688'
    ];

    // Get data for last 7 days only
    const daysData = data.dailyData.slice(0, 7);
    const maxConsumption = Math.max(...daysData.map(d => d.consumption));
    const totalConsumption = daysData.reduce((sum, d) => sum + d.consumption, 0);

    return (
      <div key={data.deviceId} className="past-consumption-card">
        <div className="device-info-header">
        </div>
        
        <div className="multi-bar-chart-container">
          <div className="y-axis">
            <div>{(maxConsumption / 1000).toFixed(0)}K</div>
            <div>{(maxConsumption * 0.75 / 1000).toFixed(0)}K</div>
            <div>{(maxConsumption * 0.5 / 1000).toFixed(0)}K</div>
            <div>{(maxConsumption * 0.25 / 1000).toFixed(0)}K</div>
            <div>0</div>
          </div>
          
          <div className="bars-container">
            {daysData.map((day, index) => {
              const barHeight = (day.consumption / maxConsumption) * 100;
              const barColor = barColors[index % barColors.length];
              
              return (
                <div key={index} className="bar-wrapper-multi">
                  <div 
                    className="consumption-bar"
                    style={{ 
                      height: `${barHeight}%`,
                      background: `linear-gradient(to top, ${barColor}, ${barColor}aa)`
                    }}
                    title={`${day.formattedDate}: ${day.consumption.toLocaleString()} L`}
                  />
                  <div className="x-axis-label-multi">{day.formattedDate}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="device-info-footer">
          <p className="consumption-value">Last 7 Days Consumption</p>
          <p className="consumption-value">Device: {data.deviceName}</p>
          <p className="consumption-value">Total: {(totalConsumption / 1000).toFixed(0)}K L</p>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="dashboard-content">
          <main className="main-content">
          {/* User Info Card */}
          <div className="user-info-card">
            <div className="user-info-left">
              <div className="user-info-item">
                <span className="info-icon">✉</span>
                <span>{user?.email_id || 'nimble@gmail.com'}</span>
              </div>
              <div className="user-info-item">
                <span className="info-icon">📍</span>
                <span>Bangalore</span>
              </div>
            </div>
            <div className="user-info-right">
              <div className="user-info-item">
                <span className="info-icon">📞</span>
                <span>{user?.phone_no || '9898989898'}</span>
              </div>
              <div className="user-info-item">
                <span className="info-icon">📍</span>
                <span>562121</span>
              </div>
              <div className="user-info-item">
                <span className="info-icon">📅</span>
                <span>{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-row">
              <select 
                className="filter-select pink"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">SELECT CITY</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
              </select>

              <select 
                className="filter-select pink"
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
              >
                <option value="">SELECT PINCODE</option>
                <option value="562121">562121</option>
                <option value="560001">560001</option>
                <option value="400001">400001</option>
              </select>

              <select 
                className="filter-select pink"
                value={selectedWaterLevel}
                onChange={(e) => setSelectedWaterLevel(e.target.value)}
              >
                <option value="">SELECT WATER LEVEL</option>
                <option value="high">High (70-100%)</option>
                <option value="medium">Medium (40-70%)</option>
                <option value="low">Low (0-40%)</option>
              </select>

              <select 
                className="filter-select pink"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
              >
                <option value="">SELECT DEVICE ID</option>
                <option value="device1">Device 001</option>
                <option value="device2">Device 002</option>
                <option value="device3">Device 003</option>
              </select>
            </div>

            <div className="filter-row">
              <select 
                className="filter-select purple"
                value={liveTankView}
                onChange={(e) => setLiveTankView(e.target.value)}
              >
                <option value="LIVE TANK">LIVE TANK</option>
                <option value="HOURLY CONSUMPTIONS">Daily Breaker</option>
                    <option value="PAST CONSUMPTIONS">Past Consumptions</option>
              </select>
            </div>
          </div>

          {/* Live Tank Status Section or Hourly Consumption */}
          {liveTankView === 'LIVE TANK' ? (
            <div className="live-tank-section">
              <div className="section-header">
                <div className="section-icon">🚰</div>
                <h2>Live Tank Status</h2>
              </div>

              <div className="tanks-grid">
                {tankData.map((tank) => (
                  <div key={tank.id} >
                    <div className="tank-visual">
                      <WaterTank3D 
                        percentage={tank.percentage}
                        status={tank.status}
                      />
                    </div>
                    <div className="tank-info">
                      <h3 className="tank-name">{tank.name}</h3>
                      <div className="tank-details">
                        <p className="tank-detail-item">
                         Total Capacity: {formatNumber(tank.totalCapacity)} litres
                        </p>
                        <p className="tank-detail-item">
                        Current Capacity: {formatNumber(tank.currentCapacity)} litres
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : liveTankView === 'HOURLY CONSUMPTIONS' ? (
            <div className="hourly-consumption-section">
              <div className="section-header">
                <h2>💧 Todays Consumption</h2>
              </div>

              {isLoadingHourly ? (
                <div className="loading-container">
                  <span className="spinner">⟳</span> Loading hourly consumption data...
                </div>
              ) : (
                <div className="pie-charts-grid">
                  {hourlyDataList.map((data) => renderHourlyChart(data))}
                </div>
              )}
            </div>
          ) : (
            <div className="past-consumption-section">
              <div className="section-header">
                <div className="section-icon">📊</div>
                <h2>Past Details</h2>
              </div>

              {isLoadingPast ? (
                <div className="loading-container">
                  <span className="spinner">⟳</span> Loading past consumption data...
                </div>
              ) : (
                <div className="past-charts-grid">
                  {pastConsumptionList.map((data) => renderBarChart(data))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {/* <div className="analytics-section">
            <div className="section-header">
             
              <h2>Analytics Overview</h2>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-icon blue">📊</div>
                <div className="analytics-content">
                  <h3>Total Water Consumed</h3>
                  <p className="analytics-value">251,327 L</p>
                  <p className="analytics-change positive">+12% from last month</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon green">💧</div>
                <div className="analytics-content">
                  <h3>Average Tank Level</h3>
                  <p className="analytics-value">76%</p>
                  <p className="analytics-change positive">+5% from last week</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon orange">⚠️</div>
                <div className="analytics-content">
                  <h3>Low Level Alerts</h3>
                  <p className="analytics-value">3</p>
                  <p className="analytics-change negative">2 active alerts</p>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon purple">🔄</div>
                <div className="analytics-content">
                  <h3>Refill Cycles</h3>
                  <p className="analytics-value">24</p>
                  <p className="analytics-change neutral">This month</p>
                </div>
              </div>
            </div>
          </div> */}
          </main>
        </div>
      </div>
      
      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default DashboardUser;

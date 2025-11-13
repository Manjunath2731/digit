import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { 
  getUserDeviceIds, 
  getBorewellDetails as fetchBorewellDetailsAPI,
  getUniqueConstituencies,
  getWardsByConstituency,
  getDevicesByConstituencyAndWard,
  type UserDevice 
} from '../services/deviceManagement';
import '../styles/ElectricalParameters.css';

interface BorewellDetail {
  id: number;
  current_status_date: string;
  Rphase: number;
  Yphase: number;
  Bphase: number;
  Rcurrent: number;
  Ycurrent: number;
  Bcurrent: number;
}

interface ChartDataPoint {
  time: string;
  value: number;
  originalIndex: number;
}

const ElectricalParameters: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<UserDevice[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBorewell, setSelectedBorewell] = useState('');
  const [voltageTimeRange, setVoltageTimeRange] = useState('24');
  const [currentTimeRange, setCurrentTimeRange] = useState('24');
  const [borewellDetails, setBorewellDetails] = useState<BorewellDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Load devices using API
      loadUserDevices();
    }
  }, []);

  const loadUserDevices = async () => {
    try {
      setIsLoading(true);
      const devices = await getUserDeviceIds();
      
      setUserDevices(devices);
      
      if (devices.length > 0) {
        // Extract unique constituencies
        const uniqueConstituencies = getUniqueConstituencies(devices);
        
        setConstituencies(uniqueConstituencies);
        
        if (uniqueConstituencies.length > 0) {
          setSelectedConstituency(uniqueConstituencies[0]);
          handleConstituencyChange(uniqueConstituencies[0], devices);
        } else {
          setSelectedBorewell(devices[0].device_id || '');
          fetchBorewellDetails(devices[0].device_id);
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
      fetchBorewellDetails(filtered[0].device_id);
    }
  };

  const fetchBorewellDetails = async (deviceId: string) => {
    if (!deviceId) {
      console.error('No device selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const details = await fetchBorewellDetailsAPI(deviceId);
      setBorewellDetails(details);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching borewell details:', error);
      setIsLoading(false);
    }
  };

  const generateTimeSeriesData = (details: BorewellDetail[]): ChartDataPoint[] => {
    if (!details || details.length === 0) return [];
    
    const timeItems = details.map((detail, index) => {
      const dateObj = new Date(detail.current_status_date);
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return {
        time: timeStr,
        value: detail.id,
        originalIndex: index
      };
    });
    
    return timeItems.sort((a, b) => a.value - b.value);
  };

  const renderLineChart = (
    data: BorewellDetail[],
    phaseRField: keyof BorewellDetail,
    phaseYField: keyof BorewellDetail,
    phaseBField: keyof BorewellDetail,
    title: string,
    yAxisLabel: string
  ) => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available</div>;
    }

    const timeSeriesBase = generateTimeSeriesData(data);
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Get all values to calculate min/max
    const allValues = timeSeriesBase.flatMap(point => [
      Number(data[point.originalIndex][phaseRField]),
      Number(data[point.originalIndex][phaseYField]),
      Number(data[point.originalIndex][phaseBField])
    ]);
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue || 1;

    const createPath = (field: keyof BorewellDetail, color: string) => {
      const points = timeSeriesBase.map((point, index) => {
        const x = (index / (timeSeriesBase.length - 1 || 1)) * chartWidth;
        const value = Number(data[point.originalIndex][field]);
        const y = chartHeight - ((value - minValue) / valueRange) * chartHeight;
        return `${x},${y}`;
      });
      
      return (
        <polyline
          key={field as string}
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      );
    };

    return (
      <div className="chart-wrapper">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => {
              const y = (i / 4) * chartHeight;
              const value = maxValue - (i / 4) * valueRange;
              return (
                <g key={i}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                  />
                  <text
                    x="-10"
                    y={y + 5}
                    textAnchor="end"
                    fontSize="12"
                    fill="#666"
                  >
                    {value.toFixed(0)}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis labels */}
            {timeSeriesBase.map((point, index) => {
              if (index % Math.ceil(timeSeriesBase.length / 6) === 0) {
                const x = (index / (timeSeriesBase.length - 1 || 1)) * chartWidth;
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {point.time}
                  </text>
                );
              }
              return null;
            })}
            
            {/* Chart lines */}
            {createPath(phaseRField, '#FF647C')}
            {createPath(phaseYField, '#4CAF50')}
            {createPath(phaseBField, '#2196F3')}
            
            {/* Y-axis label */}
            <text
              x={-chartHeight / 2}
              y={-45}
              textAnchor="middle"
              fontSize="14"
              fill="#333"
              transform={`rotate(-90, -${chartHeight / 2}, -45)`}
            >
              {yAxisLabel}
            </text>
            
            {/* X-axis label */}
            <text
              x={chartWidth / 2}
              y={chartHeight + 40}
              textAnchor="middle"
              fontSize="14"
              fill="#333"
            >
              Time
            </text>
          </g>
        </svg>
        
        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF647C' }}></span>
            <span>Phase R</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>Phase Y</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
            <span>Phase B</span>
          </div>
        </div>
      </div>
    );
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
          <main className="main-content electrical-main">
            <div className="page-header">
              <h1><span className="header-icon">⚡</span> Electrical Parameters</h1>
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
                    <label><span className="label-icon">🔌</span> Device:</label>
                    <select 
                      value={selectedBorewell} 
                      onChange={(e) => {
                        setSelectedBorewell(e.target.value);
                        fetchBorewellDetails(e.target.value);
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

            {/* Charts Grid */}
            <div className="grid-container">
              {/* 3 Phase Voltage Chart */}
              <div className="card voltage-card">
                <div className="card-header">
                  <div className="card-icon">⚡</div>
                  <h2>3 Phase Voltage</h2>
                  <div className="header-actions">
                    <select 
                      value={voltageTimeRange} 
                      onChange={(e) => setVoltageTimeRange(e.target.value)}
                    >
                      <option value="24">Last 24 hours</option>
                      <option value="48">Last 48 hours</option>
                    </select>
                  </div>
                </div>
                <div className="chart-container">
                  {renderLineChart(
                    borewellDetails,
                    'Rphase',
                    'Yphase',
                    'Bphase',
                    '3 Phase Voltage',
                    'Voltage (V)'
                  )}
                </div>
              </div>

              {/* 3 Phase Current Chart */}
              <div className="card current-card">
                <div className="card-header">
                  <div className="card-icon">🔌</div>
                  <h2>3 Phase Current</h2>
                  <div className="header-actions">
                    <select 
                      value={currentTimeRange} 
                      onChange={(e) => setCurrentTimeRange(e.target.value)}
                    >
                      <option value="24">Last 24 hours</option>
                      <option value="48">Last 48 hours</option>
                    </select>
                  </div>
                </div>
                <div className="chart-container">
                  {renderLineChart(
                    borewellDetails,
                    'Rcurrent',
                    'Ycurrent',
                    'Bcurrent',
                    '3 Phase Current',
                    'Current (A)'
                  )}
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

export default ElectricalParameters;

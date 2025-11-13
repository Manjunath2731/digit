// Device management service
import axios from 'axios';

export interface UserDevice {
  device_id: string;
  device_name: string;
  profile_type: number;
  plan_type: number;
  lat: number;
  lng: number;
  constituency: string;
  ward: string;
}

const API_BASE_URL = 'https://nimblevision.io/public/api';
const API_KEY = 'chinnu';
const API_TOKEN = '257bbec888a81696529ee979804cca59';

/**
 * Get all devices for a specific user
 * Uses hardcoded credentials from the API
 * @returns Promise with array of user devices
 */
export const getUserDeviceIds = async (): Promise<UserDevice[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getUserDeviceIds`, {
      params: {
        key: API_KEY,
        token: API_TOKEN,
        user_phone: '9739862325',
        user_email: 'bwssbborewell@gmail.com'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user devices:', error);
    throw error;
  }
};

/**
 * Get borewell details for a specific device
 * @param deviceId - Device ID to fetch details for
 * @returns Promise with borewell details
 */
export const getBorewellDetails = async (deviceId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getBorewellDetails`, {
      params: {
        key: API_KEY,
        token: API_TOKEN,
        profile_type: '1',
        device_id: deviceId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching borewell details:', error);
    throw error;
  }
};

/**
 * Get water level for a specific device
 * @param deviceId - Device ID to fetch water level for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with water level data
 */
export const getBorewellLevel = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getBorewellLevel`, {
      params: {
        device_id: deviceId,
        tank_id: tankId,
        key: API_KEY,
        token: API_TOKEN,
        profile_type: '1'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching water level:', error);
    throw error;
  }
};

/**
 * Get water extraction details for a specific device
 * @param deviceId - Device ID to fetch water extraction details for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with water extraction data including consumption history
 */
export const getWaterExtractionDetails = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getWaterExtractionDetails`, {
      params: {
        key: API_KEY,
        token: API_TOKEN,
        profile_type: '1',
        device_id: deviceId,
        tank_id: tankId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching water extraction details:', error);
    throw error;
  }
};

/**
 * Get device statistics for a specific device
 * @param deviceId - Device ID to fetch statistics for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with device statistics
 */
export const getDeviceStatistics = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getDeviceStatistics`, {
      params: {
        key: API_KEY,
        token: API_TOKEN,
        profile_type: '1',
        device_id: deviceId,
        tank_id: tankId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching device statistics:', error);
    throw error;
  }
};

/**
 * Get device diagnostic information
 * @param deviceId - Device ID to fetch diagnostic info for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with diagnostic data
 */
export const getDeviceDiagnosticInfo = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getDeviceDiagnosticInfo`, {
      params: {
        tank_id: tankId,
        key: API_KEY,
        token: API_TOKEN,
        profile_type: '1',
        device_id: deviceId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching device diagnostic info:', error);
    throw error;
  }
};

/**
 * Get highest and lowest water extraction details (Water Yield data)
 * @param deviceId - Device ID to fetch water yield data for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with water yield data including consumption and on-time
 */
export const getHighestLowestWaterExtractionDetails = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getHighestLowestWaterExtractionDetails`, {
      params: {
        key: API_KEY,
        token: API_TOKEN,
        profile_type: '1',
        device_id: deviceId,
        tank_id: tankId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching water yield data:', error);
    throw error;
  }
};

/**
 * Get device tank state with hourly consumption data
 * @param deviceId - Device ID to fetch tank state for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with hourly consumption data
 */
export const getDeviceTankState2 = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get('https://nimblevision.io/public/api/getDeviceTankState2?profile_type=1&device_id=16301966&tank_id=1&key=chinnu&token=257bbec888a81696529ee979804cca59http://3.6.204.10/public/api/getDeviceTankState2?profile_type=1&device_id=867624068951861&tank_id=1&key=chinnu&token=257bbec888a81696529ee979804cca59');

    return response.data;
  } catch (error) {
    console.error('Error fetching device tank state:', error);
    throw error;
  }
};

/**
 * Get device tank state with past consumption data
 * @param deviceId - Device ID to fetch past consumption for
 * @param tankId - Tank ID (default: '1')
 * @returns Promise with past consumption data
 */
export const getDeviceTankState3 = async (
  deviceId: string,
  tankId: string = '1'
): Promise<any> => {
  try {
    const response = await axios.get('https://nimblevision.io/public/api/getDeviceTankState3?profile_type=1&device_id=16301966&tank_id=1&key=chinnu&token=257bbec888a81696529ee979804cca59http://3.6.204.10/public/api/getDeviceTankState2?profile_type=1&device_id=867624068951861&tank_id=1&key=chinnu&token=257bbec888a81696529ee979804cca59');

    return response.data;
  } catch (error) {
    console.error('Error fetching past consumption data:', error);
    throw error;
  }
};

/**
 * Extract unique constituencies from device list
 * @param devices - Array of user devices
 * @returns Array of unique constituency names
 */
export const getUniqueConstituencies = (devices: UserDevice[]): string[] => {
  return devices
    .map(device => device.constituency)
    .filter((constituency, index, self) => 
      constituency && constituency.trim() !== '' && self.indexOf(constituency) === index
    );
};

/**
 * Extract unique wards for a specific constituency
 * @param devices - Array of user devices
 * @param constituency - Constituency to filter by
 * @returns Array of unique ward names
 */
export const getWardsByConstituency = (
  devices: UserDevice[],
  constituency: string
): string[] => {
  return devices
    .filter(device => device.constituency === constituency)
    .map(device => device.ward)
    .filter((ward, index, self) => 
      ward && ward.trim() !== '' && self.indexOf(ward) === index
    );
};

/**
 * Filter devices by constituency and ward
 * @param devices - Array of user devices
 * @param constituency - Constituency to filter by
 * @param ward - Ward to filter by
 * @returns Filtered array of devices
 */
export const getDevicesByConstituencyAndWard = (
  devices: UserDevice[],
  constituency: string,
  ward: string
): UserDevice[] => {
  return devices.filter(
    device => device.constituency === constituency && device.ward === ward
  );
};

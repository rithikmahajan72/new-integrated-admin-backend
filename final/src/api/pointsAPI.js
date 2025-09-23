import API from './axiosConfig';

// Points System API endpoints
export const pointsAPI = {
  // System configuration
  getSystemConfig: () => API.get('/api/points/config'),
  updateSystemConfig: (configData) => API.put('/api/points/config', configData),
  
  // Users with points
  getAllUsersWithPoints: (params = {}) => API.get('/api/points/users', { params }),
  getUserPoints: (userId) => API.get(`/api/points/user/${userId}`),
  getUserPointsHistory: (userId, params = {}) => API.get(`/api/points/user/${userId}/history`, { params }),
  
  // Points operations
  allocatePoints: (userId, pointsData) => API.post(`/api/points/user/${userId}/allocate`, pointsData),
  redeemPoints: (userId, pointsData) => API.post(`/api/points/user/${userId}/redeem`, pointsData),
  updateUserPoints: (userId, pointsData) => API.put(`/api/points/user/${userId}`, pointsData),
  deleteUserPoints: (userId) => API.delete(`/api/points/user/${userId}`),
  
  // Summary and statistics
  getPointsSummary: () => API.get('/api/points/summary'),
};

export default pointsAPI;

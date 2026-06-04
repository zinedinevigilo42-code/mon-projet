import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Instance Axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ Refresh token invalide - Déconnexion forcée');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== NOTIFICATIONS ====================

/**
 * Récupérer les notifications pour l'utilisateur
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications/');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    throw error;
  }
};

export const getUserNotifications = async () => {
  try {
    const response = await api.get('/notifications/user/');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur récupération notifications utilisateur:', error);
    throw error;
  }
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur marquer notification:', error);
    throw error;
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.post('/notifications/mark-all-read/');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur marquer toutes notifications:', error);
    throw error;
  }
};

/**
 * Récupérer les nouvelles boissons (créées dans les 7 derniers jours)
 */
export const getNewBoissons = async () => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const response = await api.get('/boissons/', {
      params: {
        is_new: true,
        created_after: weekAgo.toISOString().split('T')[0]
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur récupération nouvelles boissons:', error);
    throw error;
  }
};

/**
 * Récupérer les machines en panne
 */
export const getMachinesWithPannes = async () => {
  try {
    const response = await api.get('/machines/', {
      params: {
        status: 'panne'
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur récupération machines en panne:', error);
    throw error;
  }
};

// ==================== AUTH ====================

export const register = async (userData) => {
  try {
    const response = await api.post('/users/', userData);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur inscription:', error.response?.data || error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login/', credentials);
    const { access, refresh, user } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error('❌ Erreur connexion:', error.response?.data || error);
    throw error;
  }
};

export const logout = () => {
  console.log('👋 Déconnexion utilisateur');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return null;
  }
  
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ Erreur parsing données utilisateur:', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getProfile = async () => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}/`, userData);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== USERS ====================

export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== BOISSONS ====================
export const getBoissons = async (params = {}) => {
  try {
    const response = await api.get('/boissons/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBoisson = async (id) => {
  try {
    const response = await api.get(`/boissons/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBoisson = async (boissonData) => {
  try {
    const response = await api.post('/boissons/', boissonData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBoisson = async (id, boissonData) => {
  try {
    const response = await api.put(`/boissons/${id}/`, boissonData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBoisson = async (id) => {
  try {
    const response = await api.delete(`/boissons/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const patchBoisson = async (id, boissonData) => {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/boissons/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: boissonData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// ==================== MACHINES ====================

export const getMachines = async (params = {}) => {
  try {
    const response = await api.get('/machines/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMachine = async (id) => {
  try {
    const response = await api.get(`/machines/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMachine = async (machineData) => {
  try {
    const response = await api.post('/machines/', machineData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMachine = async (id, machineData) => {
  try {
    const response = await api.put(`/machines/${id}/`, machineData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMachine = async (id) => {
  try {
    const response = await api.delete(`/machines/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMachineStocks = async (machineId) => {
  try {
    const response = await api.get('/machine-stocks/', {
      params: { machine: machineId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== STOCKS ====================

export const getStocks = async (params = {}) => {
  try {
    const response = await api.get('/machine-stocks/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStock = async (id) => {
  try {
    const response = await api.get(`/machine-stocks/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStock = async (stockData) => {
  try {
    const response = await api.post('/machine-stocks/', stockData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStock = async (id, stockData) => {
  try {
    const response = await api.put(`/machine-stocks/${id}/`, stockData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStock = async (id) => {
  try {
    const response = await api.delete(`/machine-stocks/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== APPROVISIONNEMENTS ====================

export const getApprovisionnements = async (params = {}) => {
  try {
    const response = await api.get('/approvisionnements/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApprovisionnement = async (id) => {
  try {
    const response = await api.get(`/approvisionnements/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createApprovisionnement = async (approvData) => {
  try {
    const response = await api.post('/approvisionnements/', approvData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteApprovisionnement = async (id) => {
  try {
    const response = await api.delete(`/approvisionnements/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== TRANSACTIONS ====================

export const getTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transactions/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransaction = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions/', transactionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}/`, transactionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserTransactions = async (userId) => {
  try {
    const response = await api.get('/transactions/', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== PANNES ====================

export const getPannes = async (params = {}) => {
  try {
    const response = await api.get('/pannes/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPanne = async (id) => {
  try {
    const response = await api.get(`/pannes/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPanne = async (panneData) => {
  try {
    const response = await api.post('/pannes/', panneData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePanne = async (id, panneData) => {
  try {
    const response = await api.put(`/pannes/${id}/`, panneData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resolvePanne = async (id) => {
  try {
    const response = await api.patch(`/pannes/${id}/`, {
      status: 'resolu'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePanne = async (id) => {
  try {
    const response = await api.delete(`/pannes/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== STATISTIQUES ====================

export const getStats = async () => {
  try {
    const response = await api.get('/stats/dashboard/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMachineStats = async (machineId) => {
  try {
    const response = await api.get(`/machines/${machineId}/stats/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRevenues = async (params = {}) => {
  try {
    const response = await api.get('/transactions/', { 
      params: { 
        ...params, 
        statut: 'success' 
      } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

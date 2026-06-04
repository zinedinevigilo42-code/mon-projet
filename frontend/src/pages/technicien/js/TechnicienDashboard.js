import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Monitor,
  Package,
  AlertTriangle,
  LogOut,
  TrendingUp,
  Activity,
  MapPin,
  Coffee
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../css/TechnicienDashboard.css';
import { getCurrentUser, logout } from '../../../services/api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const TechnicienDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMachines: 0,
    machinesActives: 0,
    pannesActives: 0,
    stocksFaibles: 0,
    approvisionnementsSemaine: 0
  });
  const [recentPannes, setRecentPannes] = useState([]);
  const [stocksAlerts, setStocksAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== 'technicien' && currentUser.role !== 'admin')) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [machinesRes, pannesRes, stocksRes, approvsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/machines/`, config),
        axios.get(`${API_BASE_URL}/pannes/?status=non_resolu`, config),
        axios.get(`${API_BASE_URL}/machine-stocks/`, config),
        axios.get(`${API_BASE_URL}/approvisionnements/`, config)
      ]);

      // Calculer les statistiques
      const machinesActives = machinesRes.data.filter(m => m.status === 'active').length;
      const stocksFaibles = stocksRes.data.filter(s => s.stock_restante <= s.seuil_rupture).length;

      // Approvisionnements de la semaine dernière
      const uneSeamineAgo = new Date();
      uneSeamineAgo.setDate(uneSeamineAgo.getDate() - 7);
      const approvisionnementsSemaine = approvsRes.data.filter(
        a => new Date(a.date) >= uneSeamineAgo
      ).length;

      setStats({
        totalMachines: machinesRes.data.length,
        machinesActives: machinesActives,
        pannesActives: pannesRes.data.length,
        stocksFaibles: stocksFaibles,
        approvisionnementsSemaine: approvisionnementsSemaine
      });

      // Récupérer les 5 dernières pannes
      setRecentPannes(pannesRes.data.slice(0, 5));

      // Récupérer les stocks critiques (stock = 0 ou <= seuil)
      const criticalStocks = stocksRes.data
        .filter(s => s.stock_restante <= s.seuil_rupture)
        .sort((a, b) => a.stock_restante - b.stock_restante)
        .slice(0, 5);
      setStocksAlerts(criticalStocks);

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    {
      title: 'Machines Actives',
      value: `${stats.machinesActives}/${stats.totalMachines}`,
      icon: Monitor,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      action: () => navigate('/technicien/machines')
    },
    {
      title: 'Pannes à Résoudre',
      value: stats.pannesActives,
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      action: () => navigate('/technicien/pannes'),
      urgent: stats.pannesActives > 0
    },
    {
      title: 'Stocks Faibles',
      value: stats.stocksFaibles,
      icon: Package,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      action: () => navigate('/technicien/stocks'),
      urgent: stats.stocksFaibles > 0
    },
    {
      title: 'Approvs. Semaine',
      value: stats.approvisionnementsSemaine,
      icon: TrendingUp,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      action: () => navigate('/technicien/stocks')
    }
  ];

  const menuItems = [
    { icon: Monitor, label: 'Machines', path: '/technicien/machines', color: '#10b981', badge: stats.pannesActives > 0 ? stats.pannesActives : null },
    { icon: Package, label: 'Stocks', path: '/technicien/stocks', color: '#f59e0b', badge: stats.stocksFaibles > 0 ? stats.stocksFaibles : null },
    { icon: AlertTriangle, label: 'Pannes', path: '/technicien/pannes', color: '#ef4444', badge: stats.pannesActives },
    { icon: TrendingUp, label: 'Approvisionnements', path: '/technicien/approvisionnements', color: '#3b82f6' }
  ];

  if (loading) {
    return (
      <div className="technicien-dashboard loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="technicien-dashboard">
      {/* Sidebar */}
      <aside className="tech-sidebar">
        <div className="sidebar-header">
          <Wrench className="logo-icon" size={40} />
          <h2>VibeDrink</h2>
          <span className="tech-badge">TECHNICIEN</span>
        </div>

        <nav className="sidebar-nav">
          <motion.div
            className="nav-item active"
            whileHover={{ x: 5 }}
          >
            <Activity size={20} />
            <span>Dashboard</span>
          </motion.div>

          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              className="nav-item"
              onClick={() => navigate(item.path)}
              whileHover={{ x: 5 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <item.icon size={20} style={{ color: item.color }} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.first_name} {user?.last_name}</p>
              <p className="user-role">Technicien</p>
            </div>
          </div>
          <motion.button
            className="logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={18} />
            Déconnexion
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="tech-content">
        <header className="content-header">
          <div>
            <h1>Tableau de bord Technicien</h1>
            <p>Bienvenue, {user?.first_name} ! Voici l'état de vos machines</p>
          </div>
          <div className="header-actions">
            <motion.button
              className="refresh-btn"
              onClick={fetchDashboardData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Activity size={18} />
              Actualiser
            </motion.button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              className={`stat-card ${stat.urgent ? 'urgent' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.action}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.title}</p>
                <h3 className="stat-value">{stat.value}</h3>
                {stat.urgent && (
                  <span className="urgent-badge">Action requise</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts Section */}
        <div className="alerts-section">
          <div className="alerts-grid">
            {/* Pannes Actives */}
            {stats.pannesActives > 0 && (
              <motion.div
                className="alert-box pannes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="alert-header">
                  <AlertTriangle size={24} />
                  <h3>Pannes à Résoudre ({stats.pannesActives})</h3>
                </div>
                <div className="alert-list">
                  {recentPannes.map((panne) => (
                    <div key={panne.id} className="alert-item">
                      <div className="alert-item-content">
                        <p className="alert-title">Machine #{panne.machine}</p>
                        <p className="alert-desc">{panne.description}</p>
                        <span className="alert-time">
                          {new Date(panne.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <button
                        className="alert-action-btn"
                        onClick={() => navigate('/technicien/pannes')}
                      >
                        Résoudre
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="view-all-alert-btn"
                  onClick={() => navigate('/technicien/pannes')}
                >
                  Voir toutes les pannes →
                </button>
              </motion.div>
            )}

            {/* Stocks Faibles */}
            {stats.stocksFaibles > 0 && (
              <motion.div
                className="alert-box stocks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="alert-header">
                  <Package size={24} />
                  <h3>Stocks à Réapprovisionner ({stats.stocksFaibles})</h3>
                </div>
                <div className="alert-list">
                  {stocksAlerts.map((stock) => (
                    <div key={stock.id} className="alert-item">
                      <div className="alert-item-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Coffee size={16} color="#8b5cf6" />
                          <p className="alert-title">{stock.boisson?.nom || 'Boisson'}</p>
                        </div>
                        <p className="alert-desc">
                          Machine #{stock.machine} - {stock.stock_restante}/{stock.stock_initial} restant
                        </p>
                        <div className="stock-bar">
                          <div
                            className="stock-bar-fill"
                            style={{
                              width: `${(stock.stock_restante / stock.stock_initial) * 100}%`,
                              backgroundColor: stock.stock_restante === 0 ? '#ef4444' : '#f59e0b'
                            }}
                          ></div>
                        </div>
                      </div>
                      <button
                        className="alert-action-btn"
                        onClick={() => navigate('/technicien/stocks')}
                      >
                        Approvisionner
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="view-all-alert-btn"
                  onClick={() => navigate('/technicien/stocks')}
                >
                  Voir tous les stocks →
                </button>
              </motion.div>
            )}
          </div>

          {/* Aucune alerte */}
          {stats.pannesActives === 0 && stats.stocksFaibles === 0 && (
            <motion.div
              className="no-alerts"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="no-alerts-icon">✅</div>
              <h3>Tout est en ordre !</h3>
              <p>Aucune panne ni stock faible détecté</p>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Actions Rapides</h2>
          <div className="actions-grid">
            <motion.div
              className="action-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/technicien/machines')}
            >
              <Monitor size={32} color="#10b981" />
              <h4>Gérer les Machines</h4>
              <p>Voir et modifier l'état des machines</p>
            </motion.div>

            <motion.div
              className="action-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/technicien/stocks')}
            >
              <Package size={32} color="#f59e0b" />
              <h4>Gérer les Stocks</h4>
              <p>Approvisionner et surveiller</p>
            </motion.div>

            <motion.div
              className="action-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/technicien/pannes')}
            >
              <AlertTriangle size={32} color="#ef4444" />
              <h4>Déclarer une Panne</h4>
              <p>Signaler un problème technique</p>
            </motion.div>

            <motion.div
              className="action-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/technicien/approvisionnements')}
            >
              <TrendingUp size={32} color="#3b82f6" />
              <h4>Historique Approvs.</h4>
              <p>Consulter les approvisionnements</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechnicienDashboard;
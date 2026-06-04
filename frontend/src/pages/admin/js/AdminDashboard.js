import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Coffee,
  Monitor,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  Activity,
  ShoppingCart,
  ArrowUp,
  LogOut,
  UserPlus,
  Calendar,
  Bell,
  Search,
  ChevronRight,
  Eye,
  Clock,
  Percent,
  Shield,
  BarChart3,
  Download,
  Settings,
  Menu,
  X,
  CheckCircle,
  PackageCheck,
  CreditCard,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/AdminDashboard.css';
import { getCurrentUser, logout } from '../../../services/api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalClients: 0,
    clientsToday: 0,
    clientsThisWeek: 0,
    totalMachines: 0,
    totalBoissons: 0,
    totalTransactions: 0,
    revenus: 0,
    pannesActives: 0,
    stocksFaibles: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [usersRes, machinesRes, boissonsRes, transactionsRes, pannesRes, stocksRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/`, config),
        axios.get(`${API_BASE_URL}/machines/`, config),
        axios.get(`${API_BASE_URL}/boissons/`, config),
        axios.get(`${API_BASE_URL}/transactions/`, config),
        axios.get(`${API_BASE_URL}/pannes/?status=non_resolu`, config),
        axios.get(`${API_BASE_URL}/machine-stocks/`, config)
      ]);

      const clients = usersRes.data.filter(u => u.role === 'client');
      const employees = usersRes.data.filter(u => u.role === 'technicien' || u.role === 'admin');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const clientsToday = clients.filter(c => {
        const joinDate = new Date(c.date_joined);
        joinDate.setHours(0, 0, 0, 0);
        return joinDate.getTime() === today.getTime();
      }).length;
      
      const clientsThisWeek = clients.filter(c => {
        const joinDate = new Date(c.date_joined);
        return joinDate >= oneWeekAgo;
      }).length;

      const revenus = transactionsRes.data
        .filter(t => t.statut === 'success')
        .reduce((sum, t) => sum + parseFloat(t.montant), 0);

      const stocksFaibles = stocksRes.data.filter(
        s => s.stock_restante <= s.seuil_rupture
      ).length;

      setStats({
        totalEmployees: employees.length,
        totalClients: clients.length,
        clientsToday: clientsToday,
        clientsThisWeek: clientsThisWeek,
        totalMachines: machinesRes.data.length,
        totalBoissons: boissonsRes.data.length,
        totalTransactions: transactionsRes.data.length,
        revenus: revenus,
        pannesActives: pannesRes.data.length,
        stocksFaibles: stocksFaibles
      });

      setRecentTransactions(transactionsRes.data.slice(0, 5));
      
      // Récupérer les notifications pour l'admin
      await fetchNotifications();
      
      // Récupérer les activités récentes
      fetchRecentActivities(transactionsRes.data, pannesRes.data, stocksRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Si vous avez un endpoint notifications, utilisez-le
      // Sinon, simulez les notifications avec les données existantes
      const [transactionsRes, pannesRes, approvisionnementsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions/?limit=5`, config),
        axios.get(`${API_BASE_URL}/pannes/?status=resolu&limit=5`, config),
        axios.get(`${API_BASE_URL}/approvisionnements/?limit=5`, config)
      ]);

      // Générer des notifications basées sur les données
      const generatedNotifications = [];
      
      // Notifications pour transactions récentes
      transactionsRes.data.forEach(transaction => {
        if (transaction.statut === 'success') {
          generatedNotifications.push({
            id: `transaction-${transaction.id}`,
            title: 'Nouvelle Transaction',
            message: `Le client a effectué une transaction de ${transaction.montant} Ar`,
            type: 'transaction',
            time: new Date(transaction.date),
            read: false,
            icon: CreditCard
          });
        }
      });
      
      // Notifications pour pannes résolues
      pannesRes.data.forEach(panne => {
        generatedNotifications.push({
          id: `panne-${panne.id}`,
          title: 'Panne Résolue',
          message: `Le technicien a résolu la panne sur la machine ${panne.machine}`,
          type: 'panne_resolue',
          time: new Date(panne.updated_at || panne.created_at),
          read: false,
          icon: CheckCircle
        });
      });
      
      // Notifications pour approvisionnements
      approvisionnementsRes.data.forEach(approv => {
        generatedNotifications.push({
          id: `approv-${approv.id}`,
          title: 'Stock Approvisionné',
          message: `Le technicien a approvisionné ${approv.quantite} unités`,
          type: 'stock_approvisionne',
          time: new Date(approv.date),
          read: false,
          icon: PackageCheck
        });
      });
      
      // Trier par date (plus récent d'abord)
      generatedNotifications.sort((a, b) => b.time - a.time);
      
      setNotifications(generatedNotifications);
      setUnreadNotifications(generatedNotifications.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
    }
  };

  const fetchRecentActivities = (transactions, pannes, stocks) => {
    const activities = [];
    
    // Transactions récentes
    transactions.slice(0, 3).forEach(t => {
      if (t.statut === 'success') {
        activities.push({
          id: `act-${t.id}`,
          type: 'transaction',
          title: 'Transaction client',
          description: `Achat de ${t.montant} Ar`,
          time: new Date(t.date),
          icon: ShoppingCart,
          color: '#10b981'
        });
      }
    });
    
    // Pannes actives
    pannes.slice(0, 2).forEach(p => {
      activities.push({
        id: `act-${p.id}`,
        type: 'panne',
        title: 'Panne signalée',
        description: p.description.substring(0, 50) + '...',
        time: new Date(p.created_at),
        icon: AlertTriangle,
        color: '#ef4444'
      });
    });
    
    // Stocks faibles
    stocks.filter(s => s.stock_restante <= s.seuil_rupture).slice(0, 2).forEach(s => {
      activities.push({
        id: `act-stock-${s.id}`,
        type: 'stock',
        title: 'Stock faible',
        description: `${s.boisson} - ${s.stock_restante} unités restantes`,
        time: new Date(),
        icon: Package,
        color: '#f59e0b'
      });
    });
    
    activities.sort((a, b) => b.time - a.time);
    setRecentActivities(activities.slice(0, 5));
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadNotifications(0);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchDashboardData();
    
    // Polling pour les mises à jour toutes les 30 secondes
    const updateInterval = setInterval(fetchDashboardData, 30000);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [navigate, fetchDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    {
      title: 'Revenus Total',
      value: `${stats.revenus.toFixed(2)} Ar`,
      icon: DollarSign,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: '#10b981',
      trend: '+12.5%',
      change: 'positive'
    },
    {
      title: 'Employés Actifs',
      value: stats.totalEmployees,
      icon: Users,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3b82f6',
      action: () => navigate('/admin/users'),
      subtitle: 'Gérez vos équipes'
    },
    {
      title: 'Clients Totaux',
      value: stats.totalClients,
      icon: UserPlus,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      borderColor: '#8b5cf6',
      subtitle: `+${stats.clientsThisWeek} cette semaine`,
      trend: '+8.2%',
      change: 'positive'
    },
    {
      title: 'Machines',
      value: stats.totalMachines,
      icon: Monitor,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      borderColor: '#06b6d4',
      action: () => navigate('/admin/machines'),
      subtitle: `${stats.pannesActives} en panne`
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: ShoppingCart,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#f59e0b',
      trend: '+18.3%',
      change: 'positive'
    },
    {
      title: 'Boissons',
      value: stats.totalBoissons,
      icon: Coffee,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      borderColor: '#ec4899',
      action: () => navigate('/admin/boissons'),
      subtitle: 'Menu complet'
    }
  ];

  const alertCards = [
    {
      title: 'Pannes Actives',
      value: stats.pannesActives,
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      action: () => navigate('/admin/pannes')
    },
    {
      title: 'Stocks Faibles',
      value: stats.stocksFaibles,
      icon: Package,
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      action: () => navigate('/admin/stocks')
    }
  ];

  const clientStats = [
    {
      label: 'Total Inscrits',
      value: stats.totalClients,
      icon: Users,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      trend: '+8.2%'
    },
    {
      label: 'Aujourd\'hui',
      value: `+${stats.clientsToday}`,
      icon: Calendar,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      trend: '+15%'
    },
    {
      label: 'Cette Semaine',
      value: `+${stats.clientsThisWeek}`,
      icon: TrendingUp,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      trend: '+12%'
    },
    {
      label: 'Taux d\'Activité',
      value: stats.totalClients > 0 
        ? `${(stats.totalTransactions / stats.totalClients).toFixed(1)}`
        : '0',
      icon: Percent,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      subtitle: 'Achats/client'
    }
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', color: '#8b5cf6' },
    { icon: Users, label: 'Employés', path: '/admin/users', color: '#3b82f6' },
    { icon: Coffee, label: 'Boissons', path: '/admin/boissons', color: '#ec4899' },
    { icon: Monitor, label: 'Machines', path: '/admin/machines', color: '#06b6d4' },
    { icon: Package, label: 'Stocks', path: '/admin/stocks', color: '#f59e0b' },
    { icon: TrendingUp, label: 'Transactions', path: '/admin/transactions', color: '#10b981' },
    { icon: AlertTriangle, label: 'Pannes', path: '/admin/pannes', color: '#ef4444' },
    
  ];

  const quickActions = [
    { icon: Users, label: 'Ajouter Employé', action: () => navigate('/admin/users') },
    { icon: Coffee, label: 'Ajouter Boisson', action: () => navigate('/admin/boissons') },
    { icon: Monitor, label: 'Ajouter Machine', action: () => navigate('/admin/machines') },
    { icon: Download, label: 'Exporter Rapport', action: () => navigate('/admin/reports') }
  ];

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'transaction': return <CreditCard size={16} color="#10b981" />;
      case 'panne_resolue': return <CheckCircle size={16} color="#3b82f6" />;
      case 'stock_approvisionne': return <PackageCheck size={16} color="#f59e0b" />;
      default: return <Bell size={16} color="#8b5cf6" />;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-admin-page dashboard-loading">
        <div className="dashboard-loader-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="dashboard-loader-icon"
          >
            <Activity size={40} color="#8b5cf6" />
          </motion.div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin-page">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <motion.button
            className="dashboard-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
          
          <div className="dashboard-brand">
            <Coffee className="dashboard-brand-icon" size={28} />
            <div className="dashboard-brand-text">
              <h1>VibeDrink<span className="dashboard-admin-tag">Admin</span></h1>
              <p className="dashboard-brand-subtitle">Tableau de bord administratif</p>
            </div>
          </div>
        </div>

        <div className="dashboard-header-center">
          <div className="dashboard-search-wrapper">
            <Search size={18} className="dashboard-search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher des employés, clients, machines..." 
              className="dashboard-search-input" 
            />
          </div>
        </div>

        <div className="dashboard-header-right">
          <div className="dashboard-header-actions">
            <div className="dashboard-notifications-container">
              <motion.button 
                className="dashboard-icon-btn dashboard-notification-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="dashboard-notification-count">{unreadNotifications}</span>
                )}
              </motion.button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="dashboard-notifications-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="dashboard-notifications-header">
                      <h3>Notifications ({notifications.length})</h3>
                      <button 
                        className="dashboard-mark-all-btn"
                        onClick={handleMarkAllNotificationsAsRead}
                      >
                        Tout marquer comme lu
                      </button>
                    </div>
                    
                    <div className="dashboard-notifications-list">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`dashboard-notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                          >
                            <div className="dashboard-notification-icon">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="dashboard-notification-content">
                              <h4>{notification.title}</h4>
                              <p>{notification.message}</p>
                              <span className="dashboard-notification-time">
                                {formatDate(notification.time)}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="dashboard-notification-dot"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="dashboard-no-notifications">
                          <Bell size={32} color="#ccc" />
                          <p>Aucune notification</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="dashboard-notifications-footer">
                      <button 
                        className="dashboard-view-all-notifications"
                        onClick={() => navigate('/admin/notifications')}
                      >
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="dashboard-user-dropdown">
              <motion.div 
                className="dashboard-user-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                whileHover={{ scale: 1.05 }}
              >
                <div className="dashboard-user-avatar">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="dashboard-user-info-mini">
                  <span className="dashboard-user-name">{user?.first_name}</span>
                  <ChevronRight size={16} className={`dashboard-dropdown-arrow ${showUserMenu ? 'dashboard-open' : ''}`} />
                </div>
              </motion.div>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    className="dashboard-dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="dashboard-dropdown-header">
                      <div className="dashboard-user-info-full">
                        <div className="dashboard-user-avatar-large">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div>
                          <h4>{user?.first_name} {user?.last_name}</h4>
                          <p className="dashboard-user-email">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dashboard-dropdown-items">
                      <button className="dashboard-dropdown-item" onClick={() => navigate('/admin/account-settings')}>
                        <Settings size={16} />
                        <span>Paramètres du compte</span>
                      </button>
                      <button className="dashboard-dropdown-item">
                        <Activity size={16} />
                        <span>Activité récente</span>
                      </button>
                      <div className="dashboard-dropdown-divider"></div>
                      <motion.button 
                        className="dashboard-dropdown-item dashboard-logout-item"
                        onClick={handleLogout}
                        whileHover={{ x: 5 }}
                      >
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <motion.aside 
          className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-open' : 'dashboard-closed'}`}
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="dashboard-sidebar-content">
            <nav className="dashboard-sidebar-nav">
              <div className="dashboard-nav-section">
                <h3 className="dashboard-section-title">Navigation</h3>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`dashboard-nav-item ${activeSection === item.label.toLowerCase() ? 'dashboard-active' : ''}`}
                    onClick={() => {
                      navigate(item.path);
                      setActiveSection(item.label.toLowerCase());
                    }}
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <item.icon size={20} style={{ color: item.color }} />
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="dashboard-nav-arrow" />
                  </motion.div>
                ))}
              </div>

              <div className="dashboard-nav-section">
                <h3 className="dashboard-section-title">Actions Rapides</h3>
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    className="dashboard-quick-action-btn"
                    onClick={action.action}
                    whileHover={{ x: 5 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <action.icon size={18} />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </nav>

            <div className="dashboard-sidebar-footer">
              <div className="dashboard-system-status">
                <div className="dashboard-status-item">
                  <div className="dashboard-status-indicator dashboard-active"></div>
                  <div className="dashboard-status-info">
                    <span className="dashboard-status-label">Système</span>
                    <span className="dashboard-status-value">Opérationnel</span>
                  </div>
                </div>
                <div className="dashboard-status-item">
                  <div className="dashboard-status-indicator dashboard-secure"></div>
                  <div className="dashboard-status-info">
                    <span className="dashboard-status-label">Sécurité</span>
                    <span className="dashboard-status-value">Maximale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Dashboard Header */}
          <div className="dashboard-content-header">
            <div className="dashboard-header-content">
              <h1>Tableau de bord</h1>
              <p>Vue d'ensemble de votre système VibeDrink</p>
            </div>
            
            <div className="dashboard-header-controls">
              <motion.button
                className="dashboard-refresh-btn"
                onClick={fetchDashboardData}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Activity size={18} />
                Actualiser les données
              </motion.button>
              
              <div className="dashboard-date-range">
                <button className="dashboard-date-btn dashboard-active">Aujourd'hui</button>
                <button className="dashboard-date-btn">7 jours</button>
                <button className="dashboard-date-btn">30 jours</button>
                <button className="dashboard-date-btn">Personnalisé</button>
              </div>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="dashboard-quick-overview">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                className="dashboard-overview-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={stat.action}
                style={{ cursor: stat.action ? 'pointer' : 'default' }}
                whileHover={stat.action ? { 
                  scale: 1.02, 
                  y: -3,
                  boxShadow: `0 8px 25px ${stat.color}25`
                } : {}}
              >
                <div className="dashboard-overview-header">
                  <div className="dashboard-card-icon" style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  {stat.trend && (
                    <div className="dashboard-trend-badge" style={{ 
                      backgroundColor: stat.change === 'positive' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: stat.change === 'positive' ? '#10b981' : '#ef4444'
                    }}>
                      <ArrowUp size={12} />
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                
                <div className="dashboard-overview-content">
                  <h3>{stat.value}</h3>
                  <p className="dashboard-card-title">{stat.title}</p>
                  {stat.subtitle && (
                    <p className="dashboard-card-subtitle">{stat.subtitle}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Sections */}
          <div className="dashboard-content-sections">
            {/* Analytics Section */}
            <div className="dashboard-analytics-section">
              <div className="dashboard-section-header">
                <h2>
                  <BarChart3 size={24} />
                  Analytics Clients
                </h2>
                <button className="dashboard-section-action" onClick={() => navigate('/admin/reports')}>
                  <Eye size={16} />
                  Voir détails
                </button>
              </div>

              <div className="dashboard-analytics-grid">
                {clientStats.map((metric, index) => (
                  <motion.div
                    key={index}
                    className="dashboard-analytics-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ 
                      borderLeft: `4px solid ${metric.color}`,
                      background: `linear-gradient(135deg, ${metric.bgColor}, rgba(255, 255, 255, 0.03))`
                    }}
                  >
                    <div className="dashboard-metric-header">
                      <div className="dashboard-metric-icon" style={{ backgroundColor: metric.bgColor }}>
                        <metric.icon size={18} style={{ color: metric.color }} />
                      </div>
                      <div className="dashboard-metric-info">
                        <span className="dashboard-metric-label">{metric.label}</span>
                        {metric.trend && (
                          <div className="dashboard-metric-trend">
                            <ArrowUp size={12} />
                            <span>{metric.trend}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="dashboard-metric-content">
                      <h3>{metric.value}</h3>
                      {metric.subtitle && (
                        <p className="dashboard-metric-subtitle">{metric.subtitle}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activities */}
              <div className="dashboard-recent-activities">
                <h4 className="dashboard-activities-title">Activités Récentes</h4>
                <div className="dashboard-activities-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className="dashboard-activity-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="dashboard-activity-icon" style={{ backgroundColor: activity.color + '20' }}>
                          <activity.icon size={16} style={{ color: activity.color }} />
                        </div>
                        <div className="dashboard-activity-content">
                          <h5>{activity.title}</h5>
                          <p>{activity.description}</p>
                          <span className="dashboard-activity-time">{formatDate(activity.time)}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="dashboard-no-activities">
                      <p>Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity & Alerts */}
            <div className="dashboard-activity-section">
              {/* Alerts */}
              {(stats.pannesActives > 0 || stats.stocksFaibles > 0) && (
                <div className="dashboard-alerts-container">
                  <div className="dashboard-section-header">
                    <h2>
                      <AlertTriangle size={24} />
                      Alertes en cours
                    </h2>
                    <span className="dashboard-alert-count">{stats.pannesActives + stats.stocksFaibles}</span>
                  </div>
                  
                  <div className="dashboard-alerts-list">
                    {alertCards.map((alert, index) => (
                      alert.value > 0 && (
                        <motion.div
                          key={index}
                          className="dashboard-alert-item"
                          onClick={alert.action}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          style={{ 
                            background: alert.bgColor,
                            border: `1px solid ${alert.color}`
                          }}
                        >
                          <alert.icon size={20} style={{ color: alert.color }} />
                          <div className="dashboard-alert-details">
                            <h4>{alert.value}</h4>
                            <p>{alert.title}</p>
                          </div>
                          <ChevronRight size={16} style={{ color: alert.color }} />
                        </motion.div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              <div className="dashboard-transactions-container">
                <div className="dashboard-section-header">
                  <h2>
                    <ShoppingCart size={24} />
                    Transactions Récentes
                  </h2>
                  <button
                    className="dashboard-view-all-btn"
                    onClick={() => navigate('/admin/transactions')}
                  >
                    Voir tout
                  </button>
                </div>
                
                <div className="dashboard-transactions-table">
                  <div className="dashboard-table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Client</th>
                          <th>Montant</th>
                          <th>Statut</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="dashboard-transaction-id">#{transaction.id}</td>
                            <td className="dashboard-client-cell">
                              <div className="dashboard-client-info">
                                <span>Client #{transaction.user || 'Anonyme'}</span>
                                <small>{transaction.machine || 'Machine N/A'}</small>
                              </div>
                            </td>
                            <td className="dashboard-amount-cell">
                              <span className="dashboard-amount">{parseFloat(transaction.montant).toFixed(2)} Ar</span>
                            </td>
                            <td>
                              <span className={`dashboard-status-badge ${transaction.statut}`}>
                                {transaction.statut === 'success' ? 'Succès' :
                                 transaction.statut === 'pending' ? 'En cours' : 'Échoué'}
                              </span>
                            </td>
                            <td className="dashboard-date-cell">
                              <Clock size={14} />
                              {new Date(transaction.date).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="dashboard-system-status-bar">
            <div className="dashboard-status-item">
              <div className="dashboard-status-content">
                <span className="dashboard-status-label">Performance système</span>
                <span className="dashboard-status-value">99.9%</span>
              </div>
              <div className="dashboard-status-progress">
                <div className="dashboard-progress-bar" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            
            <div className="dashboard-status-item">
              <div className="dashboard-status-content">
                <span className="dashboard-status-label">Revenu moyen</span>
                <span className="dashboard-status-value">
                  {(stats.revenus / Math.max(stats.totalTransactions, 1)).toFixed(2)} Ar
                </span>
              </div>
            </div>
            
            <div className="dashboard-status-item">
              <div className="dashboard-status-content">
                <span className="dashboard-status-label">Dernière mise à jour</span>
                <span className="dashboard-status-value">À l'instant</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="dashboard-floating-action-btn"
        onClick={() => navigate('/admin/quick-add')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span>+</span>
      </motion.button>
    </div>
  );
};

export default AdminDashboard;
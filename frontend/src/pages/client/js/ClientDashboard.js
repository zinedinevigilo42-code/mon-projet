import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Coffee,
  MapPin,
  History,
  LogOut,
  CreditCard,
  TrendingUp,
  Users,
  Star,
  Bell,
  Settings,
  Gift,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Target,
  DollarSign,
  Battery,
  Thermometer,
  Clock,
  Award,
  Calendar,
  Package,
  Zap,
  Activity,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Eye,
  Percent,
  BarChart3,
  Home,
  User,
  Shield,
  Heart, 
  Search,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/ClientDashboard.css';
import { 
  getCurrentUser, 
  logout
} from '../../../services/api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalSpent: 0,
    favoriteBoisson: null,
    machinesAvailable: 0,
    monthlyAverage: 0,
    points: 0,
    availableBoissons: 0,
    thisMonthSpent: 0,
    monthlyGoal: 10000,
    goalProgress: 0,
    favoriteMachine: "Machine #12",
    favoriteLocation: "Bâtiment A"
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newBoissons, setNewBoissons] = useState([]);
  const [machinesWithPannes, setMachinesWithPannes] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [transactionsRes, machinesRes, boissonsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions/`, config),
        axios.get(`${API_BASE_URL}/machines/?status=active`, config),
        axios.get(`${API_BASE_URL}/boissons/?active=true`, config)
      ]);

      const [newBoissonsRes, pannesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/boissons/?is_new=true`, config),
        axios.get(`${API_BASE_URL}/machines/?status=panne`, config)
      ]);

      setNewBoissons(newBoissonsRes.data);
      setMachinesWithPannes(pannesRes.data);

      const userTransactions = transactionsRes.data.filter(t => t.user === user?.id);
      
      const successTransactions = userTransactions.filter(t => t.statut === 'success');
      const totalSpent = successTransactions.reduce((sum, t) => sum + parseFloat(t.montant), 0);
      
      const currentMonth = new Date().getMonth();
      const monthlyTransactions = successTransactions.filter(t => 
        new Date(t.date).getMonth() === currentMonth
      );
      const monthlySpent = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.montant), 0);
      const monthlyAverage = monthlyTransactions.length > 0 ? monthlySpent / monthlyTransactions.length : 0;

      const boissonsCount = {};
      successTransactions.forEach(t => {
        if (t.boisson) {
          boissonsCount[t.boisson] = (boissonsCount[t.boisson] || 0) + 1;
        }
      });
      const favoriteBoisson = Object.keys(boissonsCount).length > 0
        ? Object.keys(boissonsCount).reduce((a, b) => boissonsCount[a] > boissonsCount[b] ? a : b)
        : null;

      const points = Math.floor(totalSpent / 1000) * 10;
      const goalProgress = Math.min((monthlySpent / 10000) * 100, 100);

      setStats({
        totalTransactions: userTransactions.length,
        totalSpent: totalSpent,
        favoriteBoisson: favoriteBoisson,
        machinesAvailable: machinesRes.data.length,
        monthlyAverage: monthlyAverage,
        points: points,
        availableBoissons: boissonsRes.data.length,
        thisMonthSpent: monthlySpent,
        monthlyGoal: 10000,
        goalProgress: goalProgress,
        favoriteMachine: "Machine #12",
        favoriteLocation: "Bâtiment A"
      });

      setRecentTransactions(userTransactions.slice(0, 5));
      generateNotifications(newBoissonsRes.data, pannesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  }, [user?.id]);

  const generateNotifications = (newBoissonsData, machinesPannesData) => {
    const notifications = [];
    
    if (newBoissonsData && newBoissonsData.length > 0) {
      newBoissonsData.forEach(boisson => {
        notifications.push({
          id: `boisson-${boisson.id}`,
          title: "Nouvelle boisson disponible !",
          message: `"${boisson.nom}" a été ajoutée au menu. Prix: ${boisson.prix} Ar`,
          type: 'new_boisson',
          time: new Date(),
          read: false,
          icon: Sparkles
        });
      });
    }
    
    if (machinesPannesData && machinesPannesData.length > 0) {
      machinesPannesData.forEach(machine => {
        notifications.push({
          id: `machine-${machine.id}`,
          title: "Machine en panne",
          message: `La machine "${machine.nom}" (${machine.localisation}) est actuellement en panne.`,
          type: 'machine_panne',
          time: new Date(),
          read: false,
          icon: AlertTriangle
        });
      });
    }

    if (stats.totalTransactions === 0) {
      notifications.push({
        id: 'welcome-bonus',
        title: "Bienvenue sur VibeDrink!",
        message: "Profitez de votre première boisson avec 10% de réduction!",
        type: 'welcome',
        time: new Date(),
        read: false,
        icon: Gift
      });
    }

    if (stats.points >= 50) {
      notifications.push({
        id: 'points-bonus',
        title: "Points de fidélité!",
        message: `Vous avez ${stats.points} points. Échangez-les contre des boissons gratuites!`,
        type: 'points',
        time: new Date(),
        read: false,
        icon: Award
      });
    }
    
    notifications.sort((a, b) => b.time - a.time);
    setNotifications(notifications);
    setUnreadNotifications(notifications.filter(n => !n.read).length);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'client') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchDashboardData();
    
    const updateInterval = setInterval(fetchDashboardData, 30000);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [navigate, fetchDashboardData]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadNotifications(0);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveSection(path.split('/').pop());
  };

  const statCards = [
    {
      title: 'Dépenses Totales',
      value: `${stats.totalSpent.toFixed(0)} Ar`,
      icon: DollarSign,
      color: '#E31837',
      bgColor: '#FFEBEE',
      borderColor: '#FFCDD2',
      trend: `+${stats.thisMonthSpent.toFixed(0)} Ar ce mois`,
      change: 'positive',
      gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)'
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: ShoppingBag,
      color: '#1E3A8A',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      subtitle: 'Opérations réussies',
      trend: `Moyenne: ${stats.monthlyAverage.toFixed(0)} Ar`,
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
    },
    {
      title: 'Points Fidélité',
      value: stats.points,
      icon: Award,
      color: '#B45309',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      subtitle: 'Points disponibles',
      trend: `${Math.floor(stats.points / 100)} boisson(s) gratuite(s)`,
      gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
    },
    {
      title: 'Machines Actives',
      value: stats.machinesAvailable,
      icon: Battery,
      color: '#047857',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      subtitle: machinesWithPannes.length > 0 ? `${machinesWithPannes.length} en panne` : 'Toutes opérationnelles',
      trend: machinesWithPannes.length > 0 ? '⚠️ Maintenance requise' : '✓ Tout fonctionne',
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
    }
  ];

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/client/dashboard', color: '#E31837' },
    { icon: Coffee, label: 'Boissons', path: '/client/boissons', color: '#1E3A8A' },
    { icon: MapPin, label: 'Machines', path: '/client/machines', color: '#047857' },
    { icon: ShoppingBag, label: 'Acheter', path: '/client/acheter', color: '#B45309' },
    { icon: History, label: 'Historique', path: '/client/historique', color: '#7C3AED' },
    { icon: CreditCard, label: 'Paiements', path: '/client/paiements', color: '#0F766E' },
    // Profil et Récompenses retirés comme demandé
  ];

  const quickActions = [
    { 
      icon: Coffee, 
      label: 'Nouvelles Boissons', 
      description: `${newBoissons.length} nouveauté(s)`, 
      color: '#E31837', 
      path: '/client/boissons',
      badge: newBoissons.length > 0 ? newBoissons.length : null
    },
    { 
      icon: MapPin, 
      label: 'Machines', 
      description: `${machinesWithPannes.length} en panne`, 
      color: '#E31837', 
      path: '/client/machines',
      badge: machinesWithPannes.length > 0 ? machinesWithPannes.length : null
    },
    { 
      icon: ShoppingBag, 
      label: 'Acheter Maintenant', 
      description: 'Faire un achat', 
      color: '#E31837', 
      path: '/client/acheter',
      accent: true
    },
    { 
      icon: CreditCard, 
      label: 'Recharger Solde', 
      description: 'Ajouter des fonds', 
      color: '#E31837', 
      path: '/client/paiements' 
    },
    // Récompenses retiré des actions rapides
    { 
      icon: History, 
      label: 'Historique', 
      description: 'Voir mes achats', 
      color: '#E31837', 
      path: '/client/historique' 
    },
  ];

  const clientStats = [
    {
      label: 'Boissons Disponibles',
      value: stats.availableBoissons,
      icon: Package,
      color: '#E31837',
      bgColor: '#FFEBEE',
      trend: '+5%'
    },
    {
      label: 'Objectif Mensuel',
      value: `${stats.goalProgress.toFixed(0)}%`,
      icon: Target,
      color: '#047857',
      bgColor: '#ECFDF5',
      subtitle: `${stats.thisMonthSpent.toFixed(0)}/${stats.monthlyGoal} Ar`
    },
    {
      label: 'Économies',
      value: `${(stats.points * 10).toFixed(0)} Ar`,
      icon: DollarSign,
      color: '#B45309',
      bgColor: '#FFFBEB',
      trend: `${stats.points} points`
    },
    {
      label: 'Taux de Réussite',
      value: stats.totalTransactions > 0 ? 
        `${((stats.totalTransactions - recentTransactions.filter(t => t.statut === 'failed').length) / stats.totalTransactions * 100).toFixed(0)}%` : '100%',
      icon: Percent,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      subtitle: 'Transactions réussies'
    }
  ];

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'success':
        return { class: 'dash-client-status-success', label: 'Succès', icon: CheckCircle, color: '#10B981' };
      case 'pending':
        return { class: 'dash-client-status-pending', label: 'En cours', icon: Clock, color: '#F59E0B' };
      case 'failed':
        return { class: 'dash-client-status-failed', label: 'Échoué', icon: AlertTriangle, color: '#EF4444' };
      default:
        return { class: '', label: statut, icon: null, color: '#6B7280' };
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_boisson': return <Sparkles size={16} color="#E31837" />;
      case 'machine_panne': return <AlertTriangle size={16} color="#F59E0B" />;
      case 'welcome': return <Gift size={16} color="#10B981" />;
      case 'points': return <Award size={16} color="#F59E0B" />;
      default: return <Bell size={16} color="#E31837" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dash-client-page dash-client-loading">
        <div className="dash-client-loader-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="dash-client-loader-icon"
          >
            <Coffee size={40} color="#E31837" />
          </motion.div>
          <p>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-client-page">
      {/* Top Header avec navigation originale */}
      <header className="dash-client-header">
        <div className="dash-client-header-left">
          <motion.button
            className="dash-client-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
          
          <div className="dash-client-brand">
            <Coffee className="dash-client-brand-icon" size={28} />
            <div className="dash-client-brand-text">
              <h1>Vibe<span className="dash-client-brand-accent">Drink</span><span className="dash-client-client-tag">Client</span></h1>
              <p className="dash-client-brand-subtitle">Votre espace personnel</p>
            </div>
          </div>
        </div>

        <div className="dash-client-header-center">
          <div className="dash-client-search-wrapper">
            <Search size={18} className="dash-client-search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher des boissons, machines..." 
              className="dash-client-search-input" 
            />
          </div>
        </div>

        <div className="dash-client-header-right">
          <div className="dash-client-header-actions">
            <div className="dash-client-notifications-container">
              <motion.button 
                className="dash-client-icon-btn dash-client-notification-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="dash-client-notification-count">{unreadNotifications}</span>
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="dash-client-notifications-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="dash-client-notifications-header">
                      <h3>Notifications ({notifications.length})</h3>
                      {notifications.length > 0 && (
                        <button 
                          className="dash-client-mark-all-btn"
                          onClick={handleMarkAllAsRead}
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    
                    <div className="dash-client-notifications-list">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`dash-client-notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="dash-client-notification-icon">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="dash-client-notification-content">
                              <h4>{notification.title}</h4>
                              <p>{notification.message}</p>
                              <span className="dash-client-notification-time">
                                {formatDate(notification.time)}
                              </span>
                            </div>
                            {!notification.read && (
                              <div className="dash-client-notification-dot"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="dash-client-no-notifications">
                          <Bell size={32} color="#D1D5DB" />
                          <p>Aucune notification</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="dash-client-notifications-footer">
                        <button 
                          className="dash-client-view-all-notifications"
                          onClick={() => {
                            setShowNotifications(false);
                            handleNavigation('/client/boissons');
                          }}
                        >
                          Voir toutes les nouveautés
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="dash-client-user-dropdown">
              <motion.div 
                className="dash-client-user-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                whileHover={{ scale: 1.05 }}
              >
                <div className="dash-client-user-avatar">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="dash-client-user-info-mini">
                  <span className="dash-client-user-name">{user?.first_name}</span>
                  <ChevronDown size={16} className={`dash-client-dropdown-arrow ${showUserMenu ? 'open' : ''}`} />
                </div>
              </motion.div>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    className="dash-client-dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="dash-client-dropdown-header">
                      <div className="dash-client-user-info-full">
                        <div className="dash-client-user-avatar-large">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div>
                          <h4>{user?.first_name} {user?.last_name}</h4>
                          <p className="dash-client-user-email">{user?.email}</p>
                          <div className="dash-client-user-points-badge">
                            <Award size={14} />
                            <span>{stats.points} points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dash-client-dropdown-items">
                      {/* Retiré l'option Profil du menu utilisateur */}
                      <button className="dash-client-dropdown-item" onClick={() => handleNavigation('/client/parametres')}>
                        <Settings size={16} />
                        <span>Paramètres</span>
                      </button>
                      <div className="dash-client-dropdown-divider"></div>
                      <motion.button 
                        className="dash-client-dropdown-item dash-client-logout-item"
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
      <div className="dash-client-container">
        {/* Sidebar avec navigation originale */}
        <motion.aside 
          className={`dash-client-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="dash-client-sidebar-content">
            <nav className="dash-client-sidebar-nav">
              <div className="dash-client-nav-section">
                <h3 className="dash-client-section-title">Navigation</h3>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`dash-client-nav-item ${activeSection === item.label.toLowerCase() ? 'active' : ''}`}
                    onClick={() => {
                      handleNavigation(item.path);
                      setActiveSection(item.label.toLowerCase());
                    }}
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <item.icon size={20} style={{ color: item.color }} />
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="dash-client-nav-arrow" />
                  </motion.div>
                ))}
              </div>

              <div className="dash-client-nav-section">
                <h3 className="dash-client-section-title">Actions Rapides</h3>
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    className={`dash-client-quick-action-btn ${action.accent ? 'dash-client-accent-btn' : ''}`}
                    onClick={() => handleNavigation(action.path)}
                    whileHover={{ x: 5 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <action.icon size={18} />
                    <span>{action.label}</span>
                    {action.badge && action.badge > 0 && (
                      <span className="dash-client-action-badge">{action.badge}</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </nav>

            <div className="dash-client-sidebar-footer">
              <div className="dash-client-system-status">
                <div className="dash-client-status-item">
                  <div className="dash-client-status-indicator dash-client-active"></div>
                  <div className="dash-client-status-info">
                    <span className="dash-client-status-label">Système</span>
                    <span className="dash-client-status-value">Actif</span>
                  </div>
                </div>
                <div className="dash-client-status-item">
                  <div className="dash-client-status-indicator dash-client-secure"></div>
                  <div className="dash-client-status-info">
                    <span className="dash-client-status-label">Sécurité</span>
                    <span className="dash-client-status-value">Protégé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="dash-client-content">
          {/* Dashboard Header */}
          <div className="dash-client-content-header">
            <div className="dash-client-header-content">
              <h1>Bonjour, <span className="dash-client-welcome-name">{user?.first_name}</span> 👋</h1>
              <p>Bienvenue sur votre tableau de bord VibeDrink</p>
              {unreadNotifications > 0 && (
                <div className="dash-client-notification-alert">
                  <Bell size={16} />
                  <span>Vous avez {unreadNotifications} notification(s) non lue(s)</span>
                </div>
              )}
            </div>
            
            <div className="dash-client-header-controls">
              <motion.button
                className="dash-client-refresh-btn"
                onClick={fetchDashboardData}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={18} />
                Actualiser
              </motion.button>
              
              <div className="dash-client-date-range">
                <button className="dash-client-date-btn dash-client-active">Aujourd'hui</button>
                <button className="dash-client-date-btn">7 jours</button>
                <button className="dash-client-date-btn">30 jours</button>
              </div>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="dash-client-quick-overview">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                className="dash-client-overview-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ cursor: 'default' }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -3,
                  boxShadow: `0 8px 25px ${stat.color}25`
                }}
              >
                <div className="dash-client-overview-header">
                  <div className="dash-client-card-icon" style={{ background: stat.gradient, borderColor: stat.borderColor }}>
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  {stat.trend && (
                    <div className="dash-client-trend-badge" style={{ 
                      backgroundColor: stat.change === 'positive' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: stat.change === 'positive' ? '#10B981' : '#EF4444'
                    }}>
                      <ArrowUp size={12} />
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                
                <div className="dash-client-overview-content">
                  <h3 style={{ color: stat.color }}>{stat.value}</h3>
                  <p className="dash-client-card-title">{stat.title}</p>
                  {stat.subtitle && (
                    <p className="dash-client-card-subtitle">{stat.subtitle}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Sections */}
          <div className="dash-client-content-sections">
            {/* Analytics Section */}
            <div className="dash-client-analytics-section">
              <div className="dash-client-section-header">
                <h2>
                  <BarChart3 size={24} />
                  Mes Statistiques
                </h2>
                <button className="dash-client-section-action" onClick={() => handleNavigation('/client/historique')}>
                  <Eye size={16} />
                  Voir détails
                </button>
              </div>

              <div className="dash-client-analytics-grid">
                {clientStats.map((metric, index) => (
                  <motion.div
                    key={index}
                    className="dash-client-analytics-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ 
                      borderLeft: `4px solid ${metric.color}`,
                      background: `linear-gradient(135deg, ${metric.bgColor}, rgba(255, 255, 255, 0.9))`
                    }}
                  >
                    <div className="dash-client-metric-header">
                      <div className="dash-client-metric-icon" style={{ backgroundColor: metric.bgColor }}>
                        <metric.icon size={18} style={{ color: metric.color }} />
                      </div>
                      <div className="dash-client-metric-info">
                        <span className="dash-client-metric-label">{metric.label}</span>
                        {metric.trend && (
                          <div className="dash-client-metric-trend">
                            <ArrowUp size={12} />
                            <span>{metric.trend}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="dash-client-metric-content">
                      <h3 style={{ color: metric.color }}>{metric.value}</h3>
                      {metric.subtitle && (
                        <p className="dash-client-metric-subtitle">{metric.subtitle}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activities */}
              <div className="dash-client-recent-activities">
                <h4 className="dash-client-activities-title">Mes Préférences</h4>
                <div className="dash-client-favorites-container">
                  {stats.favoriteBoisson ? (
                    <motion.div 
                      className="dash-client-favorite-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="dash-client-favorite-icon">
                        <Star size={24} color="#F59E0B" />
                      </div>
                      <div className="dash-client-favorite-content">
                        <h3>Boisson Favorite</h3>
                        <p className="dash-client-favorite-boisson">{stats.favoriteBoisson}</p>
                        <span className="dash-client-favorite-tag">La plus consommée</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="dash-client-empty-favorites">
                      <Coffee size={32} color="#9CA3AF" />
                      <p>Pas encore de boisson favorite</p>
                    </div>
                  )}
                  
                  <div className="dash-client-goal-progress">
                    <div className="dash-client-goal-header">
                      <span className="dash-client-goal-label">Objectif Mensuel</span>
                      <span className="dash-client-goal-value">{stats.thisMonthSpent.toFixed(0)}/{stats.monthlyGoal} Ar</span>
                    </div>
                    <div className="dash-client-progress-bar">
                      <motion.div 
                        className="dash-client-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.goalProgress}%` }}
                        transition={{ duration: 1 }}
                        style={{ background: 'linear-gradient(90deg, #E31837, #FF6B95)' }}
                      />
                    </div>
                    <div className="dash-client-goal-percentage">{stats.goalProgress.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Rewards */}
            <div className="dash-client-activity-section">
              {/* Alerts */}
              {(newBoissons.length > 0 || machinesWithPannes.length > 0) && (
                <div className="dash-client-alerts-container">
                  <div className="dash-client-section-header">
                    <h2>
                      <AlertTriangle size={24} />
                      Alertes
                    </h2>
                    <span className="dash-client-alert-count">{newBoissons.length + machinesWithPannes.length}</span>
                  </div>
                  
                  <div className="dash-client-alerts-list">
                    {newBoissons.length > 0 && (
                      <motion.div
                        className="dash-client-alert-item"
                        onClick={() => handleNavigation('/client/boissons')}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        style={{ 
                          background: '#FFEBEE',
                          border: '1px solid #FFCDD2'
                        }}
                      >
                        <Sparkles size={20} color="#E31837" />
                        <div className="dash-client-alert-details">
                          <h4>{newBoissons.length}</h4>
                          <p>Nouvelle(s) boisson(s)</p>
                        </div>
                        <ChevronRight size={16} color="#E31837" />
                      </motion.div>
                    )}
                    
                    {machinesWithPannes.length > 0 && (
                      <motion.div
                        className="dash-client-alert-item"
                        onClick={() => handleNavigation('/client/machines')}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        style={{ 
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A'
                        }}
                      >
                        <AlertTriangle size={20} color="#F59E0B" />
                        <div className="dash-client-alert-details">
                          <h4>{machinesWithPannes.length}</h4>
                          <p>Machine(s) en panne</p>
                        </div>
                        <ChevronRight size={16} color="#F59E0B" />
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              <div className="dash-client-transactions-container">
                <div className="dash-client-section-header">
                  <h2>
                    <ShoppingBag size={24} />
                    Dernières Transactions
                  </h2>
                  <button
                    className="dash-client-view-all-btn"
                    onClick={() => handleNavigation('/client/historique')}
                  >
                    Voir tout
                  </button>
                </div>
                
                <div className="dash-client-transactions-table">
                  <div className="dash-client-table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Boisson</th>
                          <th>Machine</th>
                          <th>Montant</th>
                          <th>Statut</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.length > 0 ? (
                          recentTransactions.map((transaction) => {
                            const statusInfo = getStatusBadge(transaction.statut);
                            return (
                              <tr key={transaction.id}>
                                <td className="dash-client-transaction-item-cell">
                                  <div className="dash-client-transaction-item-info">
                                    <Coffee size={16} />
                                    <span>{transaction.boisson || 'Boisson'}</span>
                                  </div>
                                </td>
                                <td className="dash-client-machine-cell">
                                  Machine #{transaction.machine || 'N/A'}
                                </td>
                                <td className="dash-client-amount-cell">
                                  <span className="dash-client-amount">{parseFloat(transaction.montant).toFixed(0)} Ar</span>
                                </td>
                                <td>
                                  <span className={`dash-client-status-badge ${statusInfo.class}`}>
                                    {statusInfo.icon && <statusInfo.icon size={12} />}
                                    {statusInfo.label}
                                  </span>
                                </td>
                                <td className="dash-client-date-cell">
                                  <Clock size={14} />
                                  {new Date(transaction.date).toLocaleDateString('fr-FR')}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" className="dash-client-no-transactions">
                              <div className="dash-client-empty-state">
                                <Coffee size={32} color="#9CA3AF" />
                                <p>Aucune transaction récente</p>
                                <button 
                                  className="dash-client-empty-action"
                                  onClick={() => handleNavigation('/client/acheter')}
                                >
                                  Faire votre première commande
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rewards Section - Retiré car la page n'existe pas */}
              </div>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="dash-client-system-status-bar">
            <div className="dash-client-status-item">
              <div className="dash-client-status-content">
                <span className="dash-client-status-label">Machines disponibles</span>
                <span className="dash-client-status-value">{stats.machinesAvailable}</span>
              </div>
              <div className="dash-client-status-progress">
                <div className="dash-client-progress-bar" style={{ 
                  width: `${(stats.machinesAvailable / (stats.machinesAvailable + machinesWithPannes.length)) * 100}%` 
                }}></div>
              </div>
            </div>
            
            <div className="dash-client-status-item">
              <div className="dash-client-status-content">
                <span className="dash-client-status-label">Boissons disponibles</span>
                <span className="dash-client-status-value">{stats.availableBoissons}</span>
              </div>
            </div>
            
            <div className="dash-client-status-item">
              <div className="dash-client-status-content">
                <span className="dash-client-status-label">Dernière mise à jour</span>
                <span className="dash-client-status-value">À l'instant</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="dash-client-floating-action-btn"
        onClick={() => handleNavigation('/client/acheter')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Coffee size={24} />
        <span className="dash-client-fab-label">Commander</span>
      </motion.button>
    </div>
  );
};

export default ClientDashboard;
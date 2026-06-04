import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  ChevronLeft,
  Filter,
  Download,
  DollarSign,
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Coffee,
  Monitor,
  User,
  X,
  Info,
  AlertCircle,
  BarChart,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTransactions } from '../../../services/api';
import '../css/AdminTransactions.css';

const AdminTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    revenue: 0,
    todayRevenue: 0,
    avgTransaction: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
    calculateStats();
  }, [searchTerm, filterStatus, filterPayment, transactions]);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
      setLoading(false);
      showNotification('success', 'Chargement réussi', `${data.length} transactions chargées`);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
      setLoading(false);
      showNotification('error', 'Erreur', 'Impossible de charger les transactions');
    }
  };

  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const success = transactions.filter(t => t.statut === 'success');
    const pending = transactions.filter(t => t.statut === 'pending');
    const failed = transactions.filter(t => t.statut === 'failed');
    const revenue = success.reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
    
    // Revenus aujourd'hui
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= today && t.statut === 'success';
    });
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
    
    // Transaction moyenne
    const avgTransaction = success.length > 0 ? revenue / success.length : 0;

    setStats({
      total: transactions.length,
      success: success.length,
      pending: pending.length,
      failed: failed.length,
      revenue: revenue,
      todayRevenue: todayRevenue,
      avgTransaction: avgTransaction
    });
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.id.toString().includes(searchTerm) ||
        (t.user && t.user.toString().includes(searchTerm)) ||
        (t.boisson && t.boisson.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.statut === filterStatus);
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter(t => t.moyen_paiement === filterPayment);
    }

    setFilteredTransactions(filtered);
  };

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const getStatusInfo = (statut) => {
    switch (statut) {
      case 'success':
        return { 
          icon: CheckCircle, 
          label: 'Succès', 
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 'pending':
        return { 
          icon: Clock, 
          label: 'En cours', 
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      case 'failed':
        return { 
          icon: XCircle, 
          label: 'Échoué', 
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      default:
        return { 
          icon: Clock, 
          label: statut, 
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)'
        };
    }
  };

  const getPaymentInfo = (moyen) => {
    switch (moyen) {
      case 'carte':
        return { icon: CreditCard, label: 'Carte Bancaire', color: '#3b82f6' };
      case 'mobile_money':
        return { icon: Smartphone, label: 'Mobile Money', color: '#8b5cf6' };
      case 'cash_simulation':
        return { icon: Wallet, label: 'Cash (Simulation)', color: '#10b981' };
      default:
        return { icon: DollarSign, label: moyen, color: '#64748b' };
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Utilisateur', 'Boisson', 'Machine', 'Montant', 'Moyen Paiement', 'Statut'];
    const csvData = filteredTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleString('fr-FR'),
      t.user || 'N/A',
      t.boisson || 'N/A',
      t.machine || 'N/A',
      t.montant,
      getPaymentInfo(t.moyen_paiement).label,
      getStatusInfo(t.statut).label
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('info', 'Export réussi', 'Le fichier CSV a été téléchargé');
  };

  const statsCards = [
    {
      title: 'Revenus Total',
      value: `${stats.revenue.toFixed(2)} Ar`,
      icon: DollarSign,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${stats.success} transactions réussies`,
      trend: '+12%'
    },
    {
      title: 'Aujourd\'hui',
      value: `${stats.todayRevenue.toFixed(2)} Ar`,
      icon: Activity,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      subtitle: `Revenus du jour`,
      trend: '+5%'
    },
    {
      title: 'Transactions',
      value: stats.total,
      icon: BarChart,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      subtitle: `${stats.success} réussies • ${stats.pending} en cours`
    },
    {
      title: 'Moyenne',
      value: `${stats.avgTransaction.toFixed(2)} Ar`,
      icon: TrendingUp,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      subtitle: 'Par transaction réussie',
      trend: '+8%'
    }
  ];

  return (
    <div className="admin-transactions-page">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`transactions-notification ${notification.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="transactions-notification-icon">
              {notification.type === 'success' && <CheckCircle size={20} />}
              {notification.type === 'error' && <AlertCircle size={20} />}
              {notification.type === 'info' && <Info size={20} />}
            </div>
            <div className="transactions-notification-content">
              <div className="transactions-notification-title">{notification.title}</div>
              <div className="transactions-notification-message">{notification.message}</div>
            </div>
            <button 
              className="transactions-notification-close" 
              onClick={() => setNotification(null)}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="transactions-header">
        <div className="transactions-header-main">
          <div className="transactions-header-left">
            <button 
              className="transactions-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="transactions-page-title">
              <div className="transactions-title-icon">
                <TrendingUp size={32} />
                <div className="transactions-icon-badge">
                  <span>{transactions.length}</span>
                </div>
              </div>
              <div>
                <h1>Transactions Financières</h1>
                <p>Suivi des paiements et revenus</p>
              </div>
            </div>
          </div>
          <div className="transactions-header-actions">
            <motion.button 
              className="transactions-header-btn transactions-export-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Exporter
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="transactions-stats-overview">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="transactions-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: `linear-gradient(135deg, ${stat.bgColor}, rgba(255, 255, 255, 0.05))`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div className="transactions-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="transactions-stat-content">
                <h3>{stat.value}</h3>
                <p className="transactions-stat-label">{stat.title}</p>
                {stat.trend && (
                  <div className="transactions-stat-trend" style={{ color: stat.color }}>
                    <ArrowUp size={12} />
                    <span>{stat.trend}</span>
                  </div>
                )}
                {stat.subtitle && (
                  <p className="transactions-stat-subtitle">{stat.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      {/* Information Card */}
      <motion.div 
        className="transactions-stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
      >
        <div className="transactions-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <Info size={20} style={{ color: '#3b82f6' }} />
        </div>
        <div className="transactions-stat-content">
          <h3 style={{ fontSize: '18px', color: '#3b82f6' }}>Statistiques Transactions</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px', 
            marginTop: '12px' 
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--transactions-text-secondary)' }}>Taux de réussite</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>
                {((stats.success / stats.total) * 100 || 0).toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--transactions-text-secondary)' }}>Taux d'échec</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>
                {((stats.failed / stats.total) * 100 || 0).toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--transactions-text-secondary)' }}>En attente</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f59e0b' }}>
                {stats.pending}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="transactions-filters-section">
        <div className="transactions-filters-main">
          <div className="transactions-search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher par ID, utilisateur ou boisson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="transactions-search-input"
            />
            {searchTerm && (
              <button 
                className="transactions-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="transactions-filter-controls">
            <div className="transactions-filter-group">
              <Filter size={18} />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="transactions-filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="pending">En cours</option>
                <option value="failed">Échoué</option>
              </select>
            </div>

            <div className="transactions-filter-group">
              <CreditCard size={18} />
              <select 
                value={filterPayment} 
                onChange={(e) => setFilterPayment(e.target.value)}
                className="transactions-filter-select"
              >
                <option value="all">Tous les paiements</option>
                <option value="carte">Carte Bancaire</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash_simulation">Cash (Simulation)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="transactions-content">
        {loading ? (
          <div className="transactions-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="transactions-loader"
            />
            <p>Chargement des transactions...</p>
          </div>
        ) : (
          <>
            <div className="transactions-table-header">
              <h3>Historique des transactions ({filteredTransactions.length})</h3>
              <div className="transactions-table-info">
                <span className="transactions-info-item">
                  <TrendingUp size={16} />
                  {filteredTransactions.length} résultat(s)
                </span>
                <span className="transactions-info-item">
                  <Clock size={16} />
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Transactions Grid */}
            <div className="transactions-grid">
              {filteredTransactions.map((transaction) => {
                const statusInfo = getStatusInfo(transaction.statut);
                const paymentInfo = getPaymentInfo(transaction.moyen_paiement);
                const StatusIcon = statusInfo.icon;
                const PaymentIcon = paymentInfo.icon;
                const date = new Date(transaction.date);
                const isSuccess = transaction.statut === 'success';

                return (
                  <motion.div
                    key={transaction.id}
                    className="transactions-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
                    style={{
                      borderLeft: `4px solid ${statusInfo.color}`
                    }}
                  >
                    <div className="transactions-card-header">
                      <div className="transactions-card-info">
                        <h4>
                          <DollarSign size={18} color={statusInfo.color} />
                          Transaction #{transaction.id}
                        </h4>
                        <p>
                          <Clock size={14} />
                          {date.toLocaleDateString('fr-FR')} à{' '}
                          {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`transactions-card-status transactions-${transaction.statut}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="transactions-card-body">
                      <div className="transactions-card-details">
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Coffee size={14} color="var(--transactions-primary)" />
                            <span style={{ fontWeight: 500, color: 'var(--transactions-text)' }}>
                              {transaction.boisson || 'Boisson'}
                            </span>
                          </div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            color: isSuccess ? '#10b981' : 'var(--transactions-text-secondary)'
                          }}>
                            {parseFloat(transaction.montant || 0).toFixed(2)} Ar
                          </div>
                        </div>

                        <div className="transactions-detail-item">
                          <Monitor size={14} />
                          <span>Machine: <strong>#{transaction.machine || 'N/A'}</strong></span>
                        </div>
                        
                        <div className="transactions-detail-item">
                          <User size={14} />
                          <span>Utilisateur: <strong>User #{transaction.user || 'N/A'}</strong></span>
                        </div>

                        <div className="transactions-detail-item">
                          <PaymentIcon size={14} color={paymentInfo.color} />
                          <span>{paymentInfo.label}</span>
                        </div>

                        {transaction.statut === 'pending' && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '6px',
                            marginTop: '8px'
                          }}>
                            <Clock size={12} color="#f59e0b" />
                            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                              En attente de confirmation
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="transactions-card-footer">
                      <div className="transactions-last-active">
                        <span>ID: #{transaction.id}</span>
                      </div>
                      <div className="transactions-action-buttons">
                        <motion.button
                          className="transactions-action-btn"
                          style={{ background: 'var(--transactions-glass)', color: 'var(--transactions-info)' }}
                          onClick={() => handleViewDetail(transaction)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Voir détails"
                        >
                          <Info size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="transactions-empty-state">
                <TrendingUp size={80} />
                <h3>Aucune transaction trouvée</h3>
                <p>Modifiez vos critères de recherche</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Détails */}
      <AnimatePresence>
        {showDetailModal && selectedTransaction && (
          <motion.div
            className="transactions-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="transactions-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <div className="transactions-modal-header">
                <h2>
                  <TrendingUp size={24} />
                  Transaction #{selectedTransaction.id}
                </h2>
                <button className="transactions-close-btn" onClick={() => setShowDetailModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="transactions-modal-form">
                <div style={{
                  padding: '20px',
                  background: 'var(--transactions-surface-light)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: getStatusInfo(selectedTransaction.statut).bgColor,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarSign size={24} color={getStatusInfo(selectedTransaction.statut).color} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--transactions-text)' }}>
                        {selectedTransaction.boisson || 'Transaction'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                        ID: #{selectedTransaction.id}
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'var(--transactions-glass)',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                      Montant de la transaction
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '28px', 
                      fontWeight: 'bold', 
                      color: getStatusInfo(selectedTransaction.statut).color 
                    }}>
                      {parseFloat(selectedTransaction.montant || 0).toFixed(2)} Ar
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                        <strong>Statut:</strong>
                      </p>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: getStatusInfo(selectedTransaction.statut).bgColor,
                        border: `1px solid ${getStatusInfo(selectedTransaction.statut).color}30`,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: getStatusInfo(selectedTransaction.statut).color
                      }}>
                        {selectedTransaction.statut === 'success' && <CheckCircle size={12} />}
                        {selectedTransaction.statut === 'pending' && <Clock size={12} />}
                        {selectedTransaction.statut === 'failed' && <XCircle size={12} />}
                        {getStatusInfo(selectedTransaction.statut).label}
                      </div>
                    </div>

                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                        <strong>Moyen de paiement:</strong>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedTransaction.moyen_paiement === 'carte' && <CreditCard size={14} color="#3b82f6" />}
                        {selectedTransaction.moyen_paiement === 'mobile_money' && <Smartphone size={14} color="#8b5cf6" />}
                        {selectedTransaction.moyen_paiement === 'cash_simulation' && <Wallet size={14} color="#10b981" />}
                        <span style={{ fontSize: '14px', color: 'var(--transactions-text)' }}>
                          {getPaymentInfo(selectedTransaction.moyen_paiement).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                        <strong>Machine:</strong>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={14} color="var(--transactions-text-tertiary)" />
                        <span style={{ fontSize: '14px', color: 'var(--transactions-text)' }}>
                          Machine #{selectedTransaction.machine || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                        <strong>Utilisateur:</strong>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} color="var(--transactions-text-tertiary)" />
                        <span style={{ fontSize: '14px', color: 'var(--transactions-text)' }}>
                          User #{selectedTransaction.user || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--transactions-border)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--transactions-text-secondary)' }}>
                      <strong>Date et heure:</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} color="var(--transactions-text-tertiary)" />
                      <span style={{ fontSize: '14px', color: 'var(--transactions-text)' }}>
                        {new Date(selectedTransaction.date).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTransaction.statut === 'pending' && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={16} color="#f59e0b" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b' }}>
                      <strong>Transaction en attente:</strong> En cours de traitement.
                    </p>
                  </div>
                )}

                {selectedTransaction.statut === 'failed' && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <XCircle size={16} color="#ef4444" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>
                      <strong>Transaction échouée:</strong> Le paiement n'a pas pu être traité.
                    </p>
                  </div>
                )}

                <div className="transactions-modal-footer">
                  <button 
                    type="button" 
                    className="transactions-btn-secondary" 
                    onClick={() => setShowDetailModal(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTransactions;
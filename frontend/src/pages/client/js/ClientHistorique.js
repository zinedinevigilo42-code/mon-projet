import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  ChevronLeft,
  Filter,
  Download,
  Coffee,
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  ChevronRight,
  Eye,
  RefreshCw,
  Printer,
  FileText,
  TrendingDown,
  Sparkles,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/ClientHistorique.css';
import { getTransactions, getCurrentUser } from '../../../services/api';

const ClientHistorique = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    totalSpent: 0,
    averageSpent: 0,
    lastMonthSpent: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, filterStatus, filterPayment, filterDate, sortBy, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      calculateStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
      setLoading(false);
    }
  };

  const calculateStats = useCallback((data) => {
    const success = data.filter(t => t.statut === 'success');
    const pending = data.filter(t => t.statut === 'pending');
    const failed = data.filter(t => t.statut === 'failed');
    const totalSpent = success.reduce((sum, t) => sum + parseFloat(t.montant), 0);
    
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthTransactions = success.filter(t => new Date(t.date) >= lastMonth);
    const lastMonthSpent = lastMonthTransactions.reduce((sum, t) => sum + parseFloat(t.montant), 0);
    
    const averageSpent = success.length > 0 ? totalSpent / success.length : 0;

    setStats({
      total: data.length,
      success: success.length,
      pending: pending.length,
      failed: failed.length,
      totalSpent: totalSpent,
      averageSpent: averageSpent,
      lastMonthSpent: lastMonthSpent
    });
  }, []);

  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.id?.toString().includes(searchTerm) ||
        t.boisson?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.machine?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.statut === filterStatus);
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter(t => t.moyen_paiement === filterPayment);
    }

    if (filterDate !== 'all') {
      const now = new Date();
      switch (filterDate) {
        case 'today':
          filtered = filtered.filter(t => {
            const date = new Date(t.date);
            return date.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filtered = filtered.filter(t => new Date(t.date) >= monthAgo);
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date) - new Date(a.date);
        case 'date_asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount_desc':
          return parseFloat(b.montant) - parseFloat(a.montant);
        case 'amount_asc':
          return parseFloat(a.montant) - parseFloat(b.montant);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    setFilteredTransactions(filtered);
  }, [searchTerm, filterStatus, filterPayment, filterDate, sortBy, transactions]);

  const getStatusInfo = useCallback((statut) => {
    switch (statut) {
      case 'success':
        return { 
          icon: CheckCircle, 
          class: 'ch-status-success', 
          label: 'Succès',
          description: 'Transaction réussie',
          color: '#10b981'
        };
      case 'pending':
        return { 
          icon: Clock, 
          class: 'ch-status-pending', 
          label: 'En cours',
          description: 'Transaction en traitement',
          color: '#f59e0b'
        };
      case 'failed':
        return { 
          icon: XCircle, 
          class: 'ch-status-failed', 
          label: 'Échoué',
          description: 'Transaction échouée',
          color: '#ef4444'
        };
      default:
        return { 
          icon: Clock, 
          class: 'ch-status-default', 
          label: statut,
          description: 'Statut inconnu',
          color: '#6b7280'
        };
    }
  }, []);

  const getPaymentInfo = useCallback((moyen) => {
    switch (moyen) {
      case 'carte':
        return { 
          icon: CreditCard, 
          label: 'Carte Bancaire',
          color: '#3b82f6',
          description: 'Paiement par carte'
        };
      case 'mobile_money':
        return { 
          icon: Smartphone, 
          label: 'Mobile Money',
          color: '#10b981',
          description: 'Paiement mobile'
        };
      case 'cash_simulation':
        return { 
          icon: Wallet, 
          label: 'Cash',
          color: '#f59e0b',
          description: 'Paiement en espèces'
        };
      default:
        return { 
          icon: CreditCard, 
          label: moyen,
          color: '#6b7280',
          description: 'Autre moyen de paiement'
        };
    }
  }, []);

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Boisson', 'Machine', 'Localisation', 'Montant', 'Paiement', 'Statut'];
    const csvData = filteredTransactions.map(t => [
      t.id,
      new Date(t.date).toISOString(),
      t.boisson?.nom || 'N/A',
      t.machine?.nom || `Machine #${t.machine}`,
      t.machine?.localisation || 'N/A',
      t.montant,
      getPaymentInfo(t.moyen_paiement).label,
      getStatusInfo(t.statut).label
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Implémentation simplifiée - dans une vraie app, utiliser une librairie comme jsPDF
    alert('Export PDF - Fonctionnalité à implémenter');
  };

  const printTransactions = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return formatDate(dateString);
    }
  };

  const dateFilters = [
    { id: 'all', label: 'Toutes les dates' },
    { id: 'today', label: 'Aujourd\'hui' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' }
  ];

  const paymentMethods = [
    { id: 'all', label: 'Tous les paiements' },
    { id: 'carte', label: 'Carte' },
    { id: 'mobile_money', label: 'Mobile Money' },
    { id: 'cash_simulation', label: 'Cash' }
  ];

  const sortOptions = [
    { id: 'date_desc', label: 'Date récente' },
    { id: 'date_asc', label: 'Date ancienne' },
    { id: 'amount_desc', label: 'Montant élevé' },
    { id: 'amount_asc', label: 'Montant faible' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <motion.div 
      className="ch-stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="ch-stat-icon" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className="ch-stat-content">
        <p className="ch-stat-label">{title}</p>
        <h3 className="ch-stat-value">{typeof value === 'number' ? value.toFixed(2) : value}</h3>
        {subtitle && <p className="ch-stat-subtitle">{subtitle}</p>}
        {trend && (
          <div className="ch-stat-trend">
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="ch-page">
      {/* Header */}
      <header className="ch-header">
        <button className="ch-back-btn" onClick={() => navigate('/client/dashboard')}>
          <ChevronLeft size={20} />
          <span>Retour au tableau de bord</span>
        </button>
        
        <div className="ch-header-content">
          <div className="ch-header-main">
            <div className="ch-header-icon">
              <History size={32} />
            </div>
            <div className="ch-header-text">
              <h1 className="ch-title">Mon Historique</h1>
              <p className="ch-subtitle">Suivez toutes vos transactions</p>
            </div>
          </div>

          <div className="ch-header-actions">
            <motion.button 
              className="ch-action-btn ch-action-secondary"
              onClick={fetchTransactions}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} />
              <span>Actualiser</span>
            </motion.button>
            
            <motion.button 
              className="ch-action-btn ch-action-primary"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              <span>Exporter CSV</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="ch-stats-overview">
        <StatCard 
          title="Total dépensé" 
          value={stats.totalSpent} 
          icon={DollarSign} 
          color="#7c3aed"
          subtitle={`${stats.success} transactions`}
        />
        
        <StatCard 
          title="Moyenne par commande" 
          value={stats.averageSpent} 
          icon={BarChart3} 
          color="#10b981"
          subtitle="Prix moyen"
        />
        
        <StatCard 
          title="Dépense du mois" 
          value={stats.lastMonthSpent} 
          icon={TrendingUp} 
          color="#3b82f6"
          subtitle="Ce mois-ci"
        />
        
        <StatCard 
          title="Transactions" 
          value={stats.total} 
          icon={History} 
          color="#f59e0b"
          subtitle={`${stats.success} réussies`}
        />
      </div>

      {/* Filters and Search */}
      <div className="ch-controls">
        <div className="ch-search-container">
          <div className="ch-search-box">
            <Search size={20} className="ch-search-icon" />
            <input
              type="text"
              className="ch-search-input"
              placeholder="Rechercher par ID, boisson ou machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ch-search-clear" onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
        </div>

        <div className="ch-filters-container">
          <button 
            className="ch-filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span>Filtres</span>
            {showFilters ? '▲' : '▼'}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                className="ch-filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="ch-filters-grid">
                  <div className="ch-filter-group">
                    <label className="ch-filter-label">
                      <Calendar size={14} />
                      Période
                    </label>
                    <select 
                      className="ch-filter-select"
                      value={filterDate} 
                      onChange={(e) => setFilterDate(e.target.value)}
                    >
                      {dateFilters.map(filter => (
                        <option key={filter.id} value={filter.id}>
                          {filter.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ch-filter-group">
                    <label className="ch-filter-label">
                      <CheckCircle size={14} />
                      Statut
                    </label>
                    <select 
                      className="ch-filter-select"
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="success">Succès</option>
                      <option value="pending">En cours</option>
                      <option value="failed">Échoué</option>
                    </select>
                  </div>

                  <div className="ch-filter-group">
                    <label className="ch-filter-label">
                      <CreditCard size={14} />
                      Paiement
                    </label>
                    <select 
                      className="ch-filter-select"
                      value={filterPayment} 
                      onChange={(e) => setFilterPayment(e.target.value)}
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ch-filter-group">
                    <label className="ch-filter-label">
                      <BarChart3 size={14} />
                      Trier par
                    </label>
                    <select 
                      className="ch-filter-select"
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ch-export-actions">
          <button className="ch-export-btn" onClick={exportToPDF}>
            <FileText size={16} />
            PDF
          </button>
          <button className="ch-export-btn" onClick={printTransactions}>
            <Printer size={16} />
            Imprimer
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="ch-results-info">
        <h3 className="ch-results-title">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} trouvée{filteredTransactions.length !== 1 ? 's' : ''}
        </h3>
        <div className="ch-results-stats">
          <span className="ch-result-stat">
            <CheckCircle size={12} style={{ color: '#10b981' }} />
            {stats.success} réussies
          </span>
          <span className="ch-result-stat">
            <Clock size={12} style={{ color: '#f59e0b' }} />
            {stats.pending} en cours
          </span>
          <span className="ch-result-stat">
            <XCircle size={12} style={{ color: '#ef4444' }} />
            {stats.failed} échouées
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="ch-loading">
          <div className="ch-loading-spinner"></div>
          <p className="ch-loading-text">Chargement de l'historique...</p>
        </div>
      ) : (
        <>
          {/* Transactions Table */}
          <div className="ch-transactions-container">
            <div className="ch-transactions-table">
              <div className="ch-table-header">
                <div className="ch-table-row ch-table-header-row">
                  <div className="ch-table-cell ch-table-cell-header">ID</div>
                  <div className="ch-table-cell ch-table-cell-header">Date</div>
                  <div className="ch-table-cell ch-table-cell-header">Boisson</div>
                  <div className="ch-table-cell ch-table-cell-header">Machine</div>
                  <div className="ch-table-cell ch-table-cell-header">Montant</div>
                  <div className="ch-table-cell ch-table-cell-header">Paiement</div>
                  <div className="ch-table-cell ch-table-cell-header">Statut</div>
                  <div className="ch-table-cell ch-table-cell-header">Actions</div>
                </div>
              </div>

              <div className="ch-table-body">
                {filteredTransactions.length === 0 ? (
                  <div className="ch-empty-state">
                    <History size={64} />
                    <h3>Aucune transaction trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredTransactions.map((transaction, index) => {
                      const statusInfo = getStatusInfo(transaction.statut);
                      const StatusIcon = statusInfo.icon;
                      const paymentInfo = getPaymentInfo(transaction.moyen_paiement);
                      const PaymentIcon = paymentInfo.icon;

                      return (
                        <motion.div
                          key={transaction.id}
                          className="ch-table-row ch-table-data-row"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                        >
                          <div className="ch-table-cell">
                            <span className="ch-transaction-id">#{transaction.id}</span>
                          </div>
                          
                          <div className="ch-table-cell">
                            <div className="ch-transaction-date">
                              <div className="ch-date">{formatDate(transaction.date)}</div>
                              <div className="ch-time-ago">{formatRelativeTime(transaction.date)}</div>
                            </div>
                          </div>
                          
                          <div className="ch-table-cell">
                            <div className="ch-transaction-boisson">
                              <Coffee size={16} />
                              <div>
                                <div className="ch-boisson-name">{transaction.boisson?.nom || 'Boisson inconnue'}</div>
                                <div className="ch-boisson-category">{transaction.boisson?.category || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ch-table-cell">
                            <div className="ch-transaction-machine">
                              <div className="ch-machine-name">{transaction.machine?.nom || `Machine #${transaction.machine}`}</div>
                              <div className="ch-machine-location">{transaction.machine?.localisation || 'Localisation inconnue'}</div>
                            </div>
                          </div>
                          
                          <div className="ch-table-cell">
                            <div className="ch-transaction-amount">
                              <span className="ch-amount-value">{parseFloat(transaction.montant).toFixed(2)}</span>
                              <span className="ch-amount-currency">Ar</span>
                            </div>
                          </div>
                          
                          <div className="ch-table-cell">
                            <div className="ch-transaction-payment" style={{ color: paymentInfo.color }}>
                              <PaymentIcon size={14} />
                              <span>{paymentInfo.label}</span>
                            </div>
                          </div>
                          
                          <div className="ch-table-cell">
                            <div className={`ch-transaction-status ${statusInfo.class}`}>
                              <StatusIcon size={12} />
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                          
                          <div className="ch-table-cell">
                            <button 
                              className="ch-action-view"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye size={16} />
                              <span>Détails</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* Pagination/Summary */}
          {filteredTransactions.length > 0 && (
            <div className="ch-table-footer">
              <div className="ch-results-summary">
                Affichage de 1 à {filteredTransactions.length} sur {transactions.length} transactions
              </div>
              <div className="ch-total-summary">
                <div className="ch-total-label">Total de cette page :</div>
                <div className="ch-total-amount">
                  {filteredTransactions.reduce((sum, t) => sum + parseFloat(t.montant), 0).toFixed(2)} Ar
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div 
            className="ch-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div 
              className="ch-modal"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ch-modal-header">
                <h3>Détails de la transaction</h3>
                <button className="ch-modal-close" onClick={() => setSelectedTransaction(null)}>
                  ×
                </button>
              </div>

              <div className="ch-modal-content">
                <div className="ch-modal-section">
                  <h4>Informations générales</h4>
                  <div className="ch-modal-info-grid">
                    <div className="ch-modal-info-item">
                      <span className="ch-modal-info-label">ID de transaction</span>
                      <span className="ch-modal-info-value">#{selectedTransaction.id}</span>
                    </div>
                    <div className="ch-modal-info-item">
                      <span className="ch-modal-info-label">Date et heure</span>
                      <span className="ch-modal-info-value">{formatDate(selectedTransaction.date)}</span>
                    </div>
                    <div className="ch-modal-info-item">
                      <span className="ch-modal-info-label">Référence</span>
                      <span className="ch-modal-info-value">TRX-{selectedTransaction.id.toString().padStart(8, '0')}</span>
                    </div>
                  </div>
                </div>

                <div className="ch-modal-section">
                  <h4>Détails de la commande</h4>
                  <div className="ch-modal-order-details">
                    <div className="ch-order-item">
                      <Coffee size={20} />
                      <div>
                        <div className="ch-order-item-name">{selectedTransaction.boisson?.nom || 'Boisson inconnue'}</div>
                        <div className="ch-order-item-description">
                          {selectedTransaction.boisson?.description || 'Aucune description disponible'}
                        </div>
                      </div>
                      <div className="ch-order-item-price">
                        {parseFloat(selectedTransaction.montant).toFixed(2)} Ar
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ch-modal-section">
                  <h4>Informations de paiement</h4>
                  <div className="ch-modal-info-grid">
                    <div className="ch-modal-info-item">
                      <span className="ch-modal-info-label">Montant total</span>
                      <span className="ch-modal-info-value">{parseFloat(selectedTransaction.montant).toFixed(2)} Ar</span>
                    </div>
                    <div className="ch-modal-info-item">
                      <span className="ch-modal-info-label">Moyen de paiement</span>
                      <div className="ch-modal-info-value">
                        {(() => {
                          const paymentInfo = getPaymentInfo(selectedTransaction.moyen_paiement);
                          const PaymentIcon = paymentInfo.icon;
                          return (
                            <div className="ch-payment-method" style={{ color: paymentInfo.color }}>
                              <PaymentIcon size={16} />
                              <span>{paymentInfo.label}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="ch-modal-info-item">
                      <span className="ch-modal-info-label">Statut du paiement</span>
                      <div className="ch-modal-info-value">
                        {(() => {
                          const statusInfo = getStatusInfo(selectedTransaction.statut);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <div className={`ch-status-indicator ${statusInfo.class}`}>
                              <StatusIcon size={12} />
                              <span>{statusInfo.label}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ch-modal-section">
                  <h4>Machine utilisée</h4>
                  <div className="ch-machine-details">
                    <div className="ch-machine-info">
                      <Monitor size={20} />
                      <div>
                        <div className="ch-machine-name">{selectedTransaction.machine?.nom || 'Machine inconnue'}</div>
                        <div className="ch-machine-location">
                          {selectedTransaction.machine?.localisation || 'Localisation non spécifiée'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ch-modal-footer">
                <button className="ch-modal-btn ch-modal-btn-secondary" onClick={() => setSelectedTransaction(null)}>
                  Fermer
                </button>
                <button className="ch-modal-btn ch-modal-btn-primary" onClick={() => {
                  alert('Réimpression du ticket...');
                }}>
                  <Printer size={16} />
                  Réimprimer le ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientHistorique;
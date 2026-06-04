import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  Filter,
  Download,
  AlertTriangle,
  Coffee,
  Monitor,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowDown,
  Battery,
  TrendingDown,
  RefreshCw,
  Clipboard,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStocks, createStock, updateStock, deleteStock, getBoissons, getMachines } from '../../../services/api';
import '../css/AdminStocks.css';

const AdminStocks = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [boissons, setBoissons] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMachine, setFilterMachine] = useState('all');
  const [filterAlert, setFilterAlert] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockToDelete, setStockToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    machine: '',
    boisson_id: '',
    stock_initial: '',
    stock_restante: '',
    seuil_rupture: 5
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStocks();
    calculateStats();
  }, [searchTerm, filterMachine, filterAlert, stocks]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stocksData, boissonsData, machinesData] = await Promise.all([
        getStocks(),
        getBoissons(),
        getMachines()
      ]);
      setStocks(stocksData);
      setBoissons(boissonsData);
      setMachines(machinesData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
      showNotification('error', 'Erreur', 'Impossible de charger les données');
    }
  };

  const filterStocks = () => {
    let filtered = stocks;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.boisson?.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMachine !== 'all') {
      filtered = filtered.filter(s => s.machine === parseInt(filterMachine));
    }

    if (filterAlert === 'low') {
      filtered = filtered.filter(s => s.stock_restante <= s.seuil_rupture && s.stock_restante > 0);
    } else if (filterAlert === 'empty') {
      filtered = filtered.filter(s => s.stock_restante === 0);
    }

    setFilteredStocks(filtered);
  };

  const calculateStats = () => {
    return {
      total: stocks.length,
      ok: stocks.filter(s => s.stock_restante > s.seuil_rupture).length,
      low: stocks.filter(s => s.stock_restante <= s.seuil_rupture && s.stock_restante > 0).length,
      empty: stocks.filter(s => s.stock_restante === 0).length
    };
  };

  const stats = calculateStats();

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      machine: '',
      boisson_id: '',
      stock_initial: '',
      stock_restante: '',
      seuil_rupture: 5
    });
    setShowModal(true);
  };

  const handleEdit = (stock) => {
    setModalMode('edit');
    setSelectedStock(stock);
    setFormData({
      machine: stock.machine,
      boisson_id: stock.boisson.id,
      stock_initial: stock.stock_initial,
      stock_restante: stock.stock_restante,
      seuil_rupture: stock.seuil_rupture
    });
    setShowModal(true);
  };

  const handleViewDetail = (stock) => {
    setSelectedStock(stock);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (stock) => {
    setStockToDelete(stock);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!stockToDelete) return;

    try {
      await deleteStock(stockToDelete.id);
      fetchData();
      setShowDeleteModal(false);
      setStockToDelete(null);
      showNotification('success', 'Succès', 'Stock supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('error', 'Erreur', 'Impossible de supprimer le stock');
      setShowDeleteModal(false);
      setStockToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await createStock(formData);
        showNotification('success', 'Succès', 'Stock créé avec succès');
      } else {
        await updateStock(selectedStock.id, formData);
        showNotification('success', 'Succès', 'Stock modifié avec succès');
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('error', 'Erreur', 'Impossible de sauvegarder le stock');
    }
  };

  const getStockStatus = (stock) => {
    if (stock.stock_restante === 0) {
      return { 
        icon: AlertCircle, 
        class: 'stocks-empty', 
        label: 'Rupture', 
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      };
    } else if (stock.stock_restante <= stock.seuil_rupture) {
      return { 
        icon: AlertTriangle, 
        class: 'stocks-low', 
        label: 'Stock Faible', 
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      };
    } else {
      return { 
        icon: CheckCircle, 
        class: 'stocks-ok', 
        label: 'OK', 
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)'
      };
    }
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.nom : `Machine #${machineId}`;
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Machine', 'Boisson', 'Stock Initial', 'Stock Restant', 'Seuil Rupture', 'Statut'];
    const csvData = filteredStocks.map(s => {
      const status = getStockStatus(s);
      return [
        s.id,
        getMachineName(s.machine),
        s.boisson?.nom || 'N/A',
        s.stock_initial,
        s.stock_restante,
        s.seuil_rupture,
        status.label
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stocks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('info', 'Export réussi', 'Le fichier CSV a été téléchargé');
  };

  const statsCards = [
    {
      title: 'Total Stocks',
      value: stats.total,
      icon: Package,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: '+3'
    },
    {
      title: 'Stocks OK',
      value: stats.ok,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${Math.round((stats.ok / stats.total) * 100)}% du total`
    },
    {
      title: 'Stocks Faibles',
      value: stats.low,
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      subtitle: `${Math.round((stats.low / stats.total) * 100)}% du total`
    },
    {
      title: 'Ruptures',
      value: stats.empty,
      icon: AlertCircle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: `${Math.round((stats.empty / stats.total) * 100)}% du total`
    }
  ];

  return (
    <div className="admin-stocks-page">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`stocks-notification ${notification.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="stocks-notification-icon">
              {notification.type === 'success' && <CheckCircle size={20} />}
              {notification.type === 'error' && <AlertCircle size={20} />}
              {notification.type === 'info' && <Info size={20} />}
            </div>
            <div className="stocks-notification-content">
              <div className="stocks-notification-title">{notification.title}</div>
              <div className="stocks-notification-message">{notification.message}</div>
            </div>
            <button 
              className="stocks-notification-close" 
              onClick={() => setNotification(null)}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="stocks-header">
        <div className="stocks-header-main">
          <div className="stocks-header-left">
            <button 
              className="stocks-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="stocks-page-title">
              <div className="stocks-title-icon">
                <Package size={32} />
                <div className="stocks-icon-badge">
                  <span>{stocks.length}</span>
                </div>
              </div>
              <div>
                <h1>Suivi des Stocks</h1>
                <p>Gestion des stocks des distributeurs</p>
              </div>
            </div>
          </div>
          <div className="stocks-header-actions">
            <motion.button 
              className="stocks-header-btn stocks-export-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Exporter
            </motion.button>
            <motion.button 
              className="stocks-header-btn stocks-create-btn"
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Nouveau Stock
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stocks-stats-overview">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="stocks-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: `linear-gradient(135deg, ${stat.bgColor}, rgba(255, 255, 255, 0.05))`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div className="stocks-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="stocks-stat-content">
                <h3>{stat.value}</h3>
                <p className="stocks-stat-label">{stat.title}</p>
                {stat.trend && (
                  <div className="stocks-stat-trend" style={{ color: stat.color }}>
                    <span>+{stat.trend}</span>
                  </div>
                )}
                {stat.subtitle && (
                  <p className="stocks-stat-subtitle">{stat.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      {/* Information Card */}
      <motion.div 
        className="stocks-stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        <div className="stocks-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <Info size={20} style={{ color: '#f59e0b' }} />
        </div>
        <div className="stocks-stat-content">
          <h3 style={{ fontSize: '18px', color: '#f59e0b' }}>Rôle de l'Administrateur</h3>
          <p style={{ color: 'var(--stocks-text-secondary)', fontSize: '14px', lineHeight: '1.5', marginTop: '8px' }}>
            En tant qu'administrateur, vous pouvez <strong>créer</strong>, <strong>consulter</strong> et <strong>modifier</strong> les stocks. 
            Les <strong>approvisionnements physiques</strong> sont effectués par les <strong>techniciens</strong> sur le terrain.
          </p>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="stocks-filters-section">
        <div className="stocks-filters-main">
          <div className="stocks-search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher par boisson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="stocks-search-input"
            />
            {searchTerm && (
              <button 
                className="stocks-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="stocks-filter-controls">
            <div className="stocks-filter-group">
              <Monitor size={18} />
              <select 
                value={filterMachine} 
                onChange={(e) => setFilterMachine(e.target.value)}
                className="stocks-filter-select"
              >
                <option value="all">Toutes les machines</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>{machine.nom}</option>
                ))}
              </select>
            </div>

            <div className="stocks-filter-group">
              <AlertTriangle size={18} />
              <select 
                value={filterAlert} 
                onChange={(e) => setFilterAlert(e.target.value)}
                className="stocks-filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="low">Stocks faibles</option>
                <option value="empty">Ruptures</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="stocks-content">
        {loading ? (
          <div className="stocks-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="stocks-loader"
            />
            <p>Chargement des stocks...</p>
          </div>
        ) : (
          <>
            <div className="stocks-table-header">
              <h3>Liste des stocks ({filteredStocks.length})</h3>
              <div className="stocks-table-info">
                <span className="stocks-info-item">
                  <Package size={16} />
                  {filteredStocks.length} résultat(s)
                </span>
                <span className="stocks-info-item">
                  <RefreshCw size={16} />
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Stocks Grid */}
            <div className="stocks-grid">
              {filteredStocks.map((stock) => {
                const statusInfo = getStockStatus(stock);
                const StatusIcon = statusInfo.icon;
                const percentage = (stock.stock_restante / stock.stock_initial) * 100;
                const machine = machines.find(m => m.id === stock.machine);
                const boisson = stock.boisson;

                return (
                  <motion.div
                    key={stock.id}
                    className="stocks-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
                  >
                    <div className="stocks-card-header">
                      <div className="stocks-card-info">
                        <h4>
                          <Package size={18} color={statusInfo.color} />
                          Stock #{stock.id}
                        </h4>
                        <p>
                          <Monitor size={14} />
                          {machine?.nom || `Machine #${stock.machine}`}
                        </p>
                      </div>
                      <span className={`stocks-card-status ${statusInfo.class}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="stocks-card-body">
                      <div className="stocks-card-details">
                        <div className="stocks-detail-item">
                          <Coffee size={14} />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 500, color: 'var(--stocks-text)' }}>{boisson?.nom}</span>
                            <div style={{ fontSize: '12px', color: 'var(--stocks-text-tertiary)' }}>
                              {boisson?.category || 'Non catégorisé'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="stocks-detail-item">
                          <Battery size={14} />
                          <span>Stock: <strong>{stock.stock_restante}</strong> / {stock.stock_initial}</span>
                        </div>
                        
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--stocks-text-secondary)' }}>Niveau du stock</span>
                            <span style={{ fontSize: '12px', color: statusInfo.color, fontWeight: 600 }}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'var(--stocks-glass)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              style={{
                                height: '100%',
                                background: statusInfo.color,
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--stocks-border)'
                        }}>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--stocks-text-tertiary)' }}>Seuil d'alerte</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>
                              {stock.seuil_rupture}
                            </div>
                          </div>
                          {stock.stock_restante <= stock.seuil_rupture && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <TrendingDown size={12} color="#ef4444" />
                              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                                {stock.stock_restante === 0 ? 'RUPTURE' : 'FAIBLE'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="stocks-card-footer">
                      <div className="stocks-last-active">
                        <Clock size={12} />
                        <span>ID: #{stock.id}</span>
                      </div>
                      <div className="stocks-action-buttons">
                        <motion.button
                          className="stocks-action-btn"
                          style={{ background: 'var(--stocks-glass)', color: 'var(--stocks-info)' }}
                          onClick={() => handleViewDetail(stock)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Voir détails"
                        >
                          <Eye size={14} />
                        </motion.button>
                        <motion.button
                          className="stocks-action-btn stocks-edit"
                          onClick={() => handleEdit(stock)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button
                          className="stocks-action-btn stocks-delete"
                          onClick={() => handleDeleteClick(stock)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredStocks.length === 0 && (
              <div className="stocks-empty-state">
                <Package size={80} />
                <h3>Aucun stock trouvé</h3>
                <p>Modifiez vos critères de recherche ou ajoutez un nouveau stock</p>
                <button className="stocks-add-first-btn" onClick={handleCreate}>
                  <Plus size={18} />
                  Ajouter votre premier stock
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Ajout/Édition */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="stocks-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="stocks-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stocks-modal-header">
                <h2>
                  {modalMode === 'create' ? (
                    <>
                      <Plus size={24} />
                      Nouveau Stock
                    </>
                  ) : (
                    <>
                      <Edit2 size={24} />
                      Modifier Stock #{selectedStock?.id}
                    </>
                  )}
                </h2>
                <button className="stocks-close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="stocks-modal-form">
                <div className="stocks-form-group">
                  <label>Machine *</label>
                  <select
                    value={formData.machine}
                    onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                    required
                    disabled={modalMode === 'edit'}
                    className="stocks-form-select"
                  >
                    <option value="">Sélectionnez une machine</option>
                    {machines.map(machine => (
                      <option key={machine.id} value={machine.id}>{machine.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="stocks-form-group">
                  <label>Boisson *</label>
                  <select
                    value={formData.boisson_id}
                    onChange={(e) => setFormData({ ...formData, boisson_id: e.target.value })}
                    required
                    disabled={modalMode === 'edit'}
                    className="stocks-form-select"
                  >
                    <option value="">Sélectionnez une boisson</option>
                    {boissons.map(boisson => (
                      <option key={boisson.id} value={boisson.id}>{boisson.nom}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="stocks-form-group">
                    <label>Stock Initial *</label>
                    <input
                      type="number"
                      value={formData.stock_initial}
                      onChange={(e) => setFormData({ ...formData, stock_initial: parseInt(e.target.value) || '' })}
                      required
                      min="0"
                      placeholder="100"
                    />
                  </div>

                  <div className="stocks-form-group">
                    <label>Stock Restant *</label>
                    <input
                      type="number"
                      value={formData.stock_restante}
                      onChange={(e) => setFormData({ ...formData, stock_restante: parseInt(e.target.value) || '' })}
                      required
                      min="0"
                      max={formData.stock_initial}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="stocks-form-group">
                  <label>Seuil de Rupture *</label>
                  <input
                    type="number"
                    value={formData.seuil_rupture}
                    onChange={(e) => setFormData({ ...formData, seuil_rupture: parseInt(e.target.value) || '' })}
                    required
                    min="0"
                    placeholder="5"
                  />
                  <p style={{ fontSize: '12px', color: 'var(--stocks-text-tertiary)', marginTop: '6px' }}>
                    Alerte déclenchée quand le stock atteint ce seuil
                  </p>
                </div>

                {formData.stock_initial > 0 && formData.stock_restante > 0 && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--stocks-text-secondary)' }}>Niveau actuel:</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--stocks-primary)' }}>
                        {Math.round((formData.stock_restante / formData.stock_initial) * 100)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'var(--stocks-glass)',
                      borderRadius: '3px',
                      marginTop: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(formData.stock_restante / formData.stock_initial) * 100}%`,
                        height: '100%',
                        background: 'var(--stocks-primary)',
                        borderRadius: '3px'
                      }}></div>
                    </div>
                  </div>
                )}

                <div className="stocks-modal-footer">
                  <button type="button" className="stocks-btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="stocks-btn-primary">
                    {modalMode === 'create' ? 'Créer le stock' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Détails */}
      <AnimatePresence>
        {showDetailModal && selectedStock && (
          <motion.div
            className="stocks-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="stocks-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <div className="stocks-modal-header">
                <h2>
                  <Clipboard size={24} />
                  Détails du Stock #{selectedStock.id}
                </h2>
                <button className="stocks-close-btn" onClick={() => setShowDetailModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="stocks-modal-form">
                <div style={{
                  padding: '20px',
                  background: 'var(--stocks-surface-light)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: getStockStatus(selectedStock).bgColor,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Monitor size={24} color={getStockStatus(selectedStock).color} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--stocks-text)' }}>
                        {getMachineName(selectedStock.machine)}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--stocks-text-secondary)' }}>
                        Machine ID: #{selectedStock.machine}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Coffee size={24} color="var(--stocks-primary)" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--stocks-text)' }}>
                        {selectedStock.boisson?.nom}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--stocks-text-secondary)' }}>
                        {selectedStock.boisson?.category || 'Non catégorisé'}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--stocks-info)', fontWeight: 600 }}>INITIAL</p>
                      <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 'bold', color: 'var(--stocks-info)' }}>
                        {selectedStock.stock_initial}
                      </p>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: getStockStatus(selectedStock).bgColor,
                      borderRadius: '8px',
                      border: `1px solid ${getStockStatus(selectedStock).color}30`
                    }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '11px', 
                        color: getStockStatus(selectedStock).color,
                        fontWeight: 600 
                      }}>RESTANT</p>
                      <p style={{ 
                        margin: '4px 0 0', 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: getStockStatus(selectedStock).color 
                      }}>
                        {selectedStock.stock_restante}
                      </p>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>SEUIL</p>
                      <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                        {selectedStock.seuil_rupture}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--stocks-text-secondary)' }}>Niveau du stock</span>
                      <span style={{ 
                        fontSize: '13px', 
                        color: getStockStatus(selectedStock).color,
                        fontWeight: 600 
                      }}>
                        {((selectedStock.stock_restante / selectedStock.stock_initial) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--stocks-glass)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedStock.stock_restante / selectedStock.stock_initial) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                          height: '100%',
                          background: getStockStatus(selectedStock).color,
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {getStockStatus(selectedStock).label !== 'OK' && (
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
                    <AlertTriangle size={16} color="#f59e0b" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b' }}>
                      <strong>Approvisionnement nécessaire:</strong> Un technicien doit réapprovisionner ce stock.
                    </p>
                  </div>
                )}

                <div className="stocks-modal-footer">
                  <button 
                    type="button" 
                    className="stocks-btn-secondary" 
                    onClick={() => setShowDetailModal(false)}
                  >
                    Fermer
                  </button>
                  <button 
                    type="button" 
                    className="stocks-btn-primary"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEdit(selectedStock);
                    }}
                  >
                    <Edit2 size={18} />
                    Modifier
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="stocks-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="stocks-delete-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stocks-delete-modal-header">
                <div className="stocks-warning-icon">
                  <AlertTriangle size={48} color="#ef4444" />
                </div>
                <h2>Confirmer la suppression</h2>
                <p className="stocks-delete-modal-text">
                  Êtes-vous sûr de vouloir supprimer le stock <strong>#{stockToDelete?.id}</strong> de la machine <strong>"{getMachineName(stockToDelete?.machine)}"</strong> ?
                </p>
                <p className="stocks-delete-modal-warning">
                  Cette action est irréversible. Toutes les données associées seront définitivement supprimées.
                </p>
              </div>

              <div className="stocks-delete-modal-footer">
                <button 
                  type="button" 
                  className="stocks-btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="stocks-btn-danger" 
                  onClick={confirmDelete}
                >
                  <Trash2 size={18} />
                  Supprimer définitivement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStocks;
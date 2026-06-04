import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ChevronLeft,
  Filter,
  Monitor,
  CheckCircle,
  ShoppingBag,
  AlertCircle,
  Coffee,
  Clock,
  Thermometer,
  BarChart3,
  Droplets,
  X,
  Battery,
  Wifi,
  Activity,
  Package,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/ClientMachines.css';
import { getMachines, getMachineStocks, getMachine } from '../../../services/api';

const ClientMachines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [machineStocks, setMachineStocks] = useState({});
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [machineDetails, setMachineDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    filterMachines();
  }, [searchTerm, filterStatus, machines]);

  useEffect(() => {
    if (machines.length > 0) {
      fetchMachineStocks();
    }
  }, [machines]);

  const fetchMachines = async () => {
    try {
      const data = await getMachines();
      setMachines(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement machines:', error);
      setLoading(false);
    }
  };

  const fetchMachineStocks = async () => {
    try {
      setLoadingStocks(true);
      const stocksData = {};
      
      for (const machine of machines) {
        try {
          const stocks = await getMachineStocks(machine.id);
          stocksData[machine.id] = {
            totalStocks: stocks.reduce((sum, stock) => sum + stock.stock_restante, 0),
            availableDrinks: stocks.filter(stock => stock.stock_restante > 0).length,
            lowStockItems: stocks.filter(stock => 
              stock.stock_restante > 0 && stock.stock_restante <= stock.seuil_rupture
            ).length,
            totalDrinks: stocks.length,
            outOfStock: stocks.filter(stock => stock.stock_restante === 0).length,
            stocks: stocks
          };
        } catch (error) {
          console.error(`Erreur chargement stocks machine ${machine.id}:`, error);
          stocksData[machine.id] = {
            totalStocks: 0,
            availableDrinks: 0,
            lowStockItems: 0,
            totalDrinks: 0,
            outOfStock: 0,
            stocks: []
          };
        }
      }
      
      setMachineStocks(stocksData);
    } catch (error) {
      console.error('Erreur chargement des stocks:', error);
    } finally {
      setLoadingStocks(false);
    }
  };

  const fetchMachineDetails = async (machineId) => {
    try {
      setLoadingDetails(true);
      const details = await getMachine(machineId);
      setMachineDetails(details);
    } catch (error) {
      console.error('Erreur chargement détails machine:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openMachineModal = async (machine) => {
    setSelectedMachine(machine);
    await fetchMachineDetails(machine.id);
    setIsModalOpen(true);
  };

  const closeMachineModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
    setMachineDetails(null);
  };

  const filterMachines = () => {
    let filtered = machines;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.localisation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    setFilteredMachines(filtered);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { 
          icon: CheckCircle, 
          class: 'cm-status-active', 
          label: 'Disponible',
          description: 'Machine en service et opérationnelle',
          color: '#10b981'
        };
      case 'panne':
        return { 
          icon: AlertCircle, 
          class: 'cm-status-panne', 
          label: 'En Panne',
          description: 'Maintenance requise - Indisponible',
          color: '#ef4444'
        };
      case 'hors_service':
        return { 
          icon: AlertCircle, 
          class: 'cm-status-hs', 
          label: 'Hors Service',
          description: 'Temporairement indisponible',
          color: '#6b7280'
        };
      default:
        return { 
          icon: Monitor, 
          class: 'cm-status-default', 
          label: status,
          description: 'Statut inconnu',
          color: '#7c3aed'
        };
    }
  };

  const getMachineStats = (machineId) => {
    const stats = machineStocks[machineId] || {
      totalStocks: 0,
      availableDrinks: 0,
      lowStockItems: 0,
      totalDrinks: 0,
      outOfStock: 0,
      stocks: []
    };
    
    return stats;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
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
    } else {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };

  const stats = {
    total: machines.length,
    active: machines.filter(m => m.status === 'active').length,
    panne: machines.filter(m => m.status === 'panne').length,
    horsService: machines.filter(m => m.status === 'hors_service').length,
    totalAvailableDrinks: Object.values(machineStocks).reduce(
      (sum, s) => sum + s.availableDrinks, 0
    ),
    totalStocks: Object.values(machineStocks).reduce(
      (sum, s) => sum + s.totalStocks, 0
    )
  };

  const StatusFilterButton = ({ status, label, count, color }) => {
    const statusInfo = getStatusInfo(status);
    const isActive = filterStatus === status;
    
    return (
      <motion.button
        className={`cm-filter-chip ${isActive ? 'cm-filter-chip-active' : ''}`}
        onClick={() => setFilterStatus(status)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={isActive ? { backgroundColor: color } : {}}
      >
        <statusInfo.icon size={14} />
        <span>{label}</span>
        <span className="cm-filter-chip-count">{count}</span>
      </motion.button>
    );
  };

  // Modal pour les détails de la machine
  const MachineDetailsModal = () => {
    if (!selectedMachine || !machineDetails) return null;

    const statusInfo = getStatusInfo(selectedMachine.status);
    const StatusIcon = statusInfo.icon;
    const machineStats = getMachineStats(selectedMachine.id);

    return (
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="cm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMachineModal}
          >
            <motion.div
              className="cm-modal"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="cm-modal-header">
                <div className="cm-modal-header-left">
                  <div className="cm-modal-icon">
                    <Monitor size={28} />
                  </div>
                  <div className="cm-modal-title">
                    <h3>Détails de la machine</h3>
                    <p className="cm-modal-subtitle">Informations complètes</p>
                  </div>
                </div>
                <button className="cm-modal-close" onClick={closeMachineModal}>
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="cm-modal-content">
                {loadingDetails ? (
                  <div className="cm-modal-loading">
                    <div className="cm-loading-spinner"></div>
                    <p>Chargement des détails...</p>
                  </div>
                ) : (
                  <>
                    {/* Machine Info Section */}
                    <div className="cm-modal-section">
                      <div className="cm-modal-section-header">
                        <h4>
                          <Monitor size={18} />
                          Informations générales
                        </h4>
                      </div>
                      <div className="cm-modal-info-grid">
                        <div className="cm-modal-info-item">
                          <span className="cm-modal-info-label">
                            <Tag size={14} />
                            Nom
                          </span>
                          <span className="cm-modal-info-value">{selectedMachine.nom}</span>
                        </div>
                        <div className="cm-modal-info-item">
                          <span className="cm-modal-info-label">
                            <MapPin size={14} />
                            Localisation
                          </span>
                          <span className="cm-modal-info-value">{selectedMachine.localisation || 'Non spécifiée'}</span>
                        </div>
                        <div className="cm-modal-info-item">
                          <span className="cm-modal-info-label">
                            <Activity size={14} />
                            Statut
                          </span>
                          <span className={`cm-modal-info-value ${statusInfo.class}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="cm-modal-info-item">
                          <span className="cm-modal-info-label">
                            <Calendar size={14} />
                            Date d'ajout
                          </span>
                          <span className="cm-modal-info-value">{formatDate(selectedMachine.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Section */}
                    <div className="cm-modal-section">
                      <div className="cm-modal-section-header">
                        <h4>
                          <BarChart3 size={18} />
                          Statistiques de stock
                        </h4>
                      </div>
                      <div className="cm-modal-stats-grid">
                        <div className="cm-modal-stat-card">
                          <div className="cm-modal-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                            <Coffee size={20} style={{ color: '#10b981' }} />
                          </div>
                          <div className="cm-modal-stat-content">
                            <span className="cm-modal-stat-value">{machineStats.totalDrinks}</span>
                            <span className="cm-modal-stat-label">Types de boissons</span>
                          </div>
                        </div>
                        <div className="cm-modal-stat-card">
                          <div className="cm-modal-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <Droplets size={20} style={{ color: '#3b82f6' }} />
                          </div>
                          <div className="cm-modal-stat-content">
                            <span className="cm-modal-stat-value">{machineStats.availableDrinks}</span>
                            <span className="cm-modal-stat-label">Disponibles</span>
                          </div>
                        </div>
                        <div className="cm-modal-stat-card">
                          <div className="cm-modal-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                            <Battery size={20} style={{ color: '#f59e0b' }} />
                          </div>
                          <div className="cm-modal-stat-content">
                            <span className="cm-modal-stat-value">{machineStats.lowStockItems}</span>
                            <span className="cm-modal-stat-label">Stock faible</span>
                          </div>
                        </div>
                        <div className="cm-modal-stat-card">
                          <div className="cm-modal-stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                            <Package size={20} style={{ color: '#ef4444' }} />
                          </div>
                          <div className="cm-modal-stat-content">
                            <span className="cm-modal-stat-value">{machineStats.outOfStock}</span>
                            <span className="cm-modal-stat-label">Épuisées</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Details Section */}
                    {machineStats.stocks.length > 0 && (
                      <div className="cm-modal-section">
                        <div className="cm-modal-section-header">
                          <h4>
                            <Package size={18} />
                            Détail des stocks
                          </h4>
                          <span className="cm-modal-section-subtitle">
                            {machineStats.stocks.length} produits enregistrés
                          </span>
                        </div>
                        <div className="cm-modal-stock-list">
                          {machineStats.stocks.map((stock, index) => (
                            <div key={index} className="cm-modal-stock-item">
                              <div className="cm-modal-stock-info">
                                <span className="cm-modal-stock-name">{stock.boisson.nom}</span>
                                <span className="cm-modal-stock-price">{stock.boisson.prix} Ar</span>
                              </div>
                              <div className="cm-modal-stock-status">
                                <div className={`cm-modal-stock-indicator ${
                                  stock.stock_restante === 0 ? 'cm-modal-stock-empty' :
                                  stock.stock_restante <= stock.seuil_rupture ? 'cm-modal-stock-low' :
                                  'cm-modal-stock-good'
                                }`}>
                                  {stock.stock_restante === 0 ? 'Épuisé' :
                                   stock.stock_restante <= stock.seuil_rupture ? 'Stock faible' :
                                   'Disponible'}
                                </div>
                                <div className="cm-modal-stock-quantity">
                                  <span>{stock.stock_restante} / {stock.stock_initial}</span>
                                  <span className="cm-modal-stock-percent">
                                    {stock.stock_initial > 0 ? 
                                      Math.round((stock.stock_restante / stock.stock_initial) * 100) : 0}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Machine Description */}
                    <div className="cm-modal-section">
                      <div className="cm-modal-section-header">
                        <h4>
                          <Info size={18} />
                          Description
                        </h4>
                      </div>
                      <div className="cm-modal-description">
                        <p>
                          Machine {selectedMachine.nom} située à {selectedMachine.localisation || 'un emplacement non spécifié'}.
                          {statusInfo.description} {machineStats.availableDrinks > 0 ? 
                            `Actuellement ${machineStats.availableDrinks} type${machineStats.availableDrinks > 1 ? 's' : ''} de boissons disponibles.` :
                            'Aucune boisson disponible pour le moment.'}
                        </p>
                        <div className="cm-modal-meta">
                          <span className="cm-modal-meta-item">
                            <Clock size={12} />
                            Dernière mise à jour: {formatTimeAgo(selectedMachine.updated_at || selectedMachine.created_at)}
                          </span>
                          <span className="cm-modal-meta-item">
                            <Wifi size={12} />
                            ID: {selectedMachine.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="cm-modal-footer">
                <button className="cm-modal-btn cm-modal-btn-secondary" onClick={closeMachineModal}>
                  Fermer
                </button>
                {selectedMachine.status === 'active' && machineStats.availableDrinks > 0 && (
                  <button 
                    className="cm-modal-btn cm-modal-btn-primary"
                    onClick={() => {
                      closeMachineModal();
                      navigate(`/client/machines/${selectedMachine.id}`);
                    }}
                  >
                    <ShoppingBag size={16} />
                    Commander maintenant
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="cm-page">
      <header className="cm-header">
        <button className="cm-back-btn" onClick={() => navigate('/client/dashboard')}>
          <ChevronLeft size={20} />
          <span>Retour au tableau de bord</span>
        </button>
        
        <div className="cm-header-content">
          <div className="cm-header-main">
            <div className="cm-header-icon">
              <Monitor size={32} />
            </div>
            <div className="cm-header-text">
              <h1 className="cm-title">Nos Machines</h1>
              <p className="cm-subtitle">Trouvez et commandez vos boissons préférées</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="cm-stats-overview">
        <motion.div 
          className="cm-stat-card cm-stat-card-primary"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="cm-stat-card-content">
            <div className="cm-stat-icon">
              <Monitor size={24} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-label">Total machines</span>
              <span className="cm-stat-value">{stats.total}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="cm-stat-card cm-stat-card-success"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="cm-stat-card-content">
            <div className="cm-stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-label">Machines actives</span>
              <span className="cm-stat-value">{stats.active}</span>
              <span className="cm-stat-percent">
                {stats.total > 0 ? `${Math.round((stats.active/stats.total)*100)}%` : '0%'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="cm-stat-card cm-stat-card-info"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="cm-stat-card-content">
            <div className="cm-stat-icon">
              <Droplets size={24} />
            </div>
            <div className="cm-stat-info">
              <span className="cm-stat-label">Stock total</span>
              <span className="cm-stat-value">{stats.totalStocks}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="cm-controls">
        <div className="cm-search-container">
          <div className="cm-search-box">
            <Search size={20} className="cm-search-icon" />
            <input
              type="text"
              className="cm-search-input"
              placeholder="Rechercher une machine ou une localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cm-search-clear" onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
        </div>

        <div className="cm-filters">
          <div className="cm-filter-group">
            <Filter size={16} />
            <select 
              className="cm-filter-select"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Disponibles</option>
              <option value="panne">En panne</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Status Filters */}
      <div className="cm-quick-filters">
        <StatusFilterButton 
          status="all" 
          label="Toutes" 
          count={stats.total} 
          color="#7c3aed" 
        />
        <StatusFilterButton 
          status="active" 
          label="Disponibles" 
          count={stats.active} 
          color="#10b981" 
        />
        <StatusFilterButton 
          status="panne" 
          label="En panne" 
          count={stats.panne} 
          color="#ef4444" 
        />
        <StatusFilterButton 
          status="hors_service" 
          label="Hors service" 
          count={stats.horsService} 
          color="#6b7280" 
        />
      </div>

      {/* Results Info */}
      <div className="cm-results-info">
        <h3 className="cm-results-title">
          {filteredMachines.length} machine{filteredMachines.length !== 1 ? 's' : ''} trouvée{filteredMachines.length !== 1 ? 's' : ''}
        </h3>
        {searchTerm && (
          <p className="cm-results-search-term">
            Résultats pour : "<strong>{searchTerm}</strong>"
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="cm-loading">
          <div className="cm-loading-spinner"></div>
          <p className="cm-loading-text">Chargement des machines...</p>
        </div>
      ) : (
        <>
          {/* Machines Grid */}
          <div className="cm-machines-grid">
            {filteredMachines.map((machine, index) => {
              const statusInfo = getStatusInfo(machine.status);
              const StatusIcon = statusInfo.icon;
              const machineStats = getMachineStats(machine.id);

              return (
                <motion.div
                  key={machine.id}
                  className="cm-machine-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  {/* Machine Header */}
                  <div className="cm-machine-card-header">
                    <div className="cm-machine-icon">
                      <Monitor size={24} />
                    </div>
                    <div className="cm-machine-header-info">
                      <div className={`cm-machine-status ${statusInfo.class}`}>
                        <StatusIcon size={12} />
                        <span>{statusInfo.label}</span>
                      </div>
                      <span className="cm-machine-date">
                        Ajoutée {formatTimeAgo(machine.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Machine Content */}
                  <div className="cm-machine-card-content">
                    <h3 className="cm-machine-name">{machine.nom || 'Machine sans nom'}</h3>
                    
                    <div className="cm-machine-location">
                      <MapPin size={14} />
                      <span>{machine.localisation || 'Localisation non spécifiée'}</span>
                    </div>
                    
                    <p className="cm-machine-description">
                      {statusInfo.description}
                    </p>

                    {/* Machine Stats */}
                    <div className="cm-machine-stats">
                      <div className="cm-machine-stat">
                        <Coffee size={14} />
                        <div>
                          <span className="cm-machine-stat-value">
                            {machineStats.availableDrinks}
                          </span>
                          <span className="cm-machine-stat-label">Disponibles</span>
                        </div>
                      </div>
                      
                      <div className="cm-machine-stat">
                        <Droplets size={14} />
                        <div>
                          <span className="cm-machine-stat-value">
                            {machineStats.totalStocks}
                          </span>
                          <span className="cm-machine-stat-label">Stock total</span>
                        </div>
                      </div>
                      
                      <div className="cm-machine-stat">
                        <AlertCircle size={14} />
                        <div>
                          <span className="cm-machine-stat-value">
                            {machineStats.lowStockItems}
                          </span>
                          <span className="cm-machine-stat-label">Stock faible</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Machine Footer */}
                  <div className="cm-machine-card-footer">
                    {machine.status === 'active' && machineStats.availableDrinks > 0 ? (
                      <motion.button
                        className="cm-machine-action-btn cm-machine-action-primary"
                        onClick={() => navigate(`/client/machines/${machine.id}`)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingBag size={16} />
                        <span>Commander</span>
                      </motion.button>
                    ) : machine.status === 'active' ? (
                      <button className="cm-machine-action-btn cm-machine-action-warning" disabled>
                        <AlertCircle size={16} />
                        <span>Stock épuisé</span>
                      </button>
                    ) : (
                      <button className="cm-machine-action-btn cm-machine-action-disabled" disabled>
                        <AlertCircle size={16} />
                        <span>{statusInfo.label}</span>
                      </button>
                    )}
                    
                    <button 
                      className="cm-machine-details-btn"
                      onClick={() => openMachineModal(machine)}
                    >
                      Voir détails
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredMachines.length === 0 && !loading && (
            <motion.div 
              className="cm-empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="cm-empty-icon">
                <Monitor size={64} />
              </div>
              <h3 className="cm-empty-title">Aucune machine trouvée</h3>
              <p className="cm-empty-text">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche ou de filtrage.'
                  : 'Aucune machine n\'est disponible pour le moment.'}
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <button 
                  className="cm-empty-action"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Réinitialiser les filtres
                </button>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Machine Details Modal */}
      <MachineDetailsModal />
    </div>
  );
};

export default ClientMachines;
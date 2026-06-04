import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Plus,
  X,
  ChevronLeft,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Monitor,
  User,
  Eye,
  AlertCircle,
  Info,
  Trash2,
  Wrench,
  AlertOctagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/AdminPannes.css';
import { getPannes, createPanne, getMachines, deletePanne } from '../../../services/api';

const AdminPannes = () => {
  const navigate = useNavigate();
  const [pannes, setPannes] = useState([]);
  const [filteredPannes, setFilteredPannes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMachine, setFilterMachine] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [panneToDelete, setPanneToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    machine: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPannes();
    calculateStats();
  }, [searchTerm, filterStatus, filterMachine, pannes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pannesData, machinesData] = await Promise.all([
        getPannes(),
        getMachines()
      ]);
      setPannes(pannesData);
      setMachines(machinesData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
      showNotification('error', 'Erreur', 'Impossible de charger les données');
    }
  };

  const filterPannes = () => {
    let filtered = pannes;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (filterMachine !== 'all') {
      filtered = filtered.filter(p => p.machine === parseInt(filterMachine));
    }

    setFilteredPannes(filtered);
  };

  const calculateStats = () => {
    return {
      total: pannes.length,
      nonResolu: pannes.filter(p => p.status === 'non_resolu').length,
      resolu: pannes.filter(p => p.status === 'resolu').length
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
    setFormData({
      machine: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleViewDetail = (panne) => {
    setSelectedPanne(panne);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (panne) => {
    setPanneToDelete(panne);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!panneToDelete) return;

    try {
      await deletePanne(panneToDelete.id);
      fetchData();
      setShowDeleteModal(false);
      setPanneToDelete(null);
      showNotification('success', 'Succès', 'Panne supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('error', 'Erreur', 'Impossible de supprimer la panne');
      setShowDeleteModal(false);
      setPanneToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createPanne(formData);
      setShowModal(false);
      fetchData();
      showNotification('success', 'Succès', 'Panne déclarée avec succès');
    } catch (error) {
      console.error('Erreur création panne:', error);
      showNotification('error', 'Erreur', 'Impossible de créer la panne');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'non_resolu':
        return { 
          icon: AlertTriangle, 
          label: 'Non Résolu', 
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      case 'resolu':
        return { 
          icon: CheckCircle, 
          label: 'Résolu', 
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      default:
        return { 
          icon: Clock, 
          label: status, 
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)'
        };
    }
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.nom : `Machine #${machineId}`;
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Machine', 'Description', 'Déclaré par', 'Date', 'Statut'];
    const csvData = filteredPannes.map(p => [
      p.id,
      getMachineName(p.machine),
      `"${p.description.replace(/"/g, '""')}"`,
      p.declared_by || 'N/A',
      new Date(p.created_at).toLocaleString('fr-FR'),
      getStatusInfo(p.status).label
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pannes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('info', 'Export réussi', 'Le fichier CSV a été téléchargé');
  };

  const statsCards = [
    {
      title: 'Total Pannes',
      value: stats.total,
      icon: AlertOctagon,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Pannes Actives',
      value: stats.nonResolu,
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: `${Math.round((stats.nonResolu / stats.total) * 100)}% du total`
    },
    {
      title: 'Pannes Résolues',
      value: stats.resolu,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${Math.round((stats.resolu / stats.total) * 100)}% du total`
    }
  ];

  return (
    <div className="admin-pannes-page">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`pannes-notification ${notification.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="pannes-notification-icon">
              {notification.type === 'success' && <CheckCircle size={20} />}
              {notification.type === 'error' && <AlertCircle size={20} />}
              {notification.type === 'info' && <Info size={20} />}
            </div>
            <div className="pannes-notification-content">
              <div className="pannes-notification-title">{notification.title}</div>
              <div className="pannes-notification-message">{notification.message}</div>
            </div>
            <button 
              className="pannes-notification-close" 
              onClick={() => setNotification(null)}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="pannes-header">
        <div className="pannes-header-main">
          <div className="pannes-header-left">
            <button 
              className="pannes-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="pannes-page-title">
              <div className="pannes-title-icon">
                <AlertTriangle size={32} />
                <div className="pannes-icon-badge">
                  <span>{pannes.length}</span>
                </div>
              </div>
              <div>
                <h1>Suivi des Pannes</h1>
                <p>Gestion des incidents machines</p>
              </div>
            </div>
          </div>
          <div className="pannes-header-actions">
            <motion.button 
              className="pannes-header-btn pannes-export-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Exporter
            </motion.button>
            <motion.button 
              className="pannes-header-btn pannes-create-btn"
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Déclarer une Panne
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="pannes-stats-overview">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="pannes-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: `linear-gradient(135deg, ${stat.bgColor}, rgba(255, 255, 255, 0.05))`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div className="pannes-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="pannes-stat-content">
                <h3>{stat.value}</h3>
                <p className="pannes-stat-label">{stat.title}</p>
                {stat.subtitle && (
                  <p className="pannes-stat-subtitle">{stat.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      {/* Information Card */}
      <motion.div 
        className="pannes-stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        <div className="pannes-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <Info size={20} style={{ color: '#f59e0b' }} />
        </div>
        <div className="pannes-stat-content">
          <h3 style={{ fontSize: '18px', color: '#f59e0b' }}>Rôle de l'Administrateur</h3>
          <p style={{ color: 'var(--pannes-text-secondary)', fontSize: '14px', lineHeight: '1.5', marginTop: '8px' }}>
            En tant qu'administrateur, vous pouvez <strong>consulter</strong> et <strong>déclarer</strong> les pannes. 
            La <strong>résolution des pannes</strong> est effectuée par les <strong>techniciens</strong> sur le terrain.
          </p>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="pannes-filters-section">
        <div className="pannes-filters-main">
          <div className="pannes-search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher une panne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pannes-search-input"
            />
            {searchTerm && (
              <button 
                className="pannes-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="pannes-filter-controls">
            <div className="pannes-filter-group">
              <AlertTriangle size={18} />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pannes-filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="non_resolu">Non Résolu</option>
                <option value="resolu">Résolu</option>
              </select>
            </div>

            <div className="pannes-filter-group">
              <Monitor size={18} />
              <select 
                value={filterMachine} 
                onChange={(e) => setFilterMachine(e.target.value)}
                className="pannes-filter-select"
              >
                <option value="all">Toutes les machines</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>{machine.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pannes-content">
        {loading ? (
          <div className="pannes-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="pannes-loader"
            />
            <p>Chargement des pannes...</p>
          </div>
        ) : (
          <>
            <div className="pannes-table-header">
              <h3>Liste des pannes ({filteredPannes.length})</h3>
              <div className="pannes-table-info">
                <span className="pannes-info-item">
                  <AlertTriangle size={16} />
                  {filteredPannes.length} résultat(s)
                </span>
                <span className="pannes-info-item">
                  <Clock size={16} />
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Pannes Grid */}
            <div className="pannes-grid">
              {filteredPannes.map((panne) => {
                const statusInfo = getStatusInfo(panne.status);
                const StatusIcon = statusInfo.icon;
                const machine = machines.find(m => m.id === panne.machine);
                const createdDate = new Date(panne.created_at);
                const isUrgent = panne.status === 'non_resolu';

                return (
                  <motion.div
                    key={panne.id}
                    className="pannes-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
                    style={{
                      borderLeft: isUrgent ? `4px solid ${statusInfo.color}` : undefined
                    }}
                  >
                    <div className="pannes-card-header">
                      <div className="pannes-card-info">
                        <h4>
                          <AlertTriangle size={18} color={statusInfo.color} />
                          Panne #{panne.id}
                        </h4>
                        <p>
                          <Monitor size={14} />
                          {machine?.nom || `Machine #${panne.machine}`}
                        </p>
                      </div>
                      <span className={`pannes-card-status ${panne.status === 'non_resolu' ? 'pannes-panne' : 'pannes-active'}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="pannes-card-body">
                      <div className="pannes-card-details">
                        <div style={{ 
                          background: 'var(--pannes-glass)', 
                          padding: '12px', 
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '13px', 
                            color: 'var(--pannes-text-secondary)',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {panne.description}
                          </p>
                        </div>

                        <div className="pannes-detail-item">
                          <User size={14} />
                          <span>Déclaré par: <strong>User #{panne.declared_by || 'N/A'}</strong></span>
                        </div>
                        
                        <div className="pannes-detail-item">
                          <Clock size={14} />
                          <span>
                            {createdDate.toLocaleDateString('fr-FR')} à{' '}
                            {createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isUrgent && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            marginTop: '8px'
                          }}>
                            <Wrench size={12} color="#ef4444" />
                            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                              Intervention technicien requise
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pannes-card-footer">
                      <div className="pannes-last-active">
                        <span>ID: #{panne.id}</span>
                      </div>
                      <div className="pannes-action-buttons">
                        <motion.button
                          className="pannes-action-btn"
                          style={{ background: 'var(--pannes-glass)', color: 'var(--pannes-info)' }}
                          onClick={() => handleViewDetail(panne)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Voir détails"
                        >
                          <Eye size={14} />
                        </motion.button>
                        <motion.button
                          className="pannes-action-btn pannes-delete"
                          onClick={() => handleDeleteClick(panne)}
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

            {filteredPannes.length === 0 && (
              <div className="pannes-empty-state">
                <AlertTriangle size={80} />
                <h3>Aucune panne trouvée</h3>
                <p>Modifiez vos critères de recherche ou déclarez une nouvelle panne</p>
                <button className="pannes-add-first-btn" onClick={handleCreate}>
                  <Plus size={18} />
                  Déclarer une panne
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Déclarer une Panne */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="pannes-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="pannes-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pannes-modal-header">
                <h2>
                  <Plus size={24} />
                  Déclarer une Panne
                </h2>
                <button className="pannes-close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="pannes-modal-form">
                <div className="pannes-form-group">
                  <label>Machine *</label>
                  <select
                    value={formData.machine}
                    onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                    required
                    className="pannes-form-select"
                  >
                    <option value="">Sélectionnez une machine</option>
                    {machines.map(machine => (
                      <option key={machine.id} value={machine.id}>{machine.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="pannes-form-group">
                  <label>Description de la panne *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="5"
                    required
                    placeholder="Décrivez le problème rencontré en détail..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'var(--pannes-glass)',
                      border: '1px solid var(--pannes-glass-border)',
                      borderRadius: '10px',
                      color: 'var(--pannes-text)',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Info size={16} color="#f59e0b" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b', lineHeight: '1.4' }}>
                      <strong>Note:</strong> La panne sera assignée à un technicien pour résolution.
                    </p>
                  </div>
                </div>

                <div className="pannes-modal-footer">
                  <button type="button" className="pannes-btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="pannes-btn-primary">
                    Déclarer la Panne
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Détails */}
      <AnimatePresence>
        {showDetailModal && selectedPanne && (
          <motion.div
            className="pannes-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="pannes-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '500px' }}
            >
              <div className="pannes-modal-header">
                <h2>
                  <AlertTriangle size={24} />
                  Détails de la Panne #{selectedPanne.id}
                </h2>
                <button className="pannes-close-btn" onClick={() => setShowDetailModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="pannes-modal-form">
                <div style={{
                  padding: '20px',
                  background: 'var(--pannes-surface-light)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: getStatusInfo(selectedPanne.status).bgColor,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Monitor size={24} color={getStatusInfo(selectedPanne.status).color} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--pannes-text)' }}>
                        {getMachineName(selectedPanne.machine)}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--pannes-text-secondary)' }}>
                        Machine ID: #{selectedPanne.machine}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ 
                      margin: '0 0 8px', 
                      fontSize: '13px', 
                      color: 'var(--pannes-text-secondary)',
                      fontWeight: 600 
                    }}>
                      Description:
                    </p>
                    <div style={{
                      padding: '12px',
                      background: 'var(--pannes-glass)',
                      borderRadius: '8px',
                      border: '1px solid var(--pannes-glass-border)'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--pannes-text)', lineHeight: '1.6' }}>
                        {selectedPanne.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--pannes-text-secondary)' }}>
                        <strong>Statut:</strong>
                      </p>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: getStatusInfo(selectedPanne.status).bgColor,
                        border: `1px solid ${getStatusInfo(selectedPanne.status).color}30`,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: getStatusInfo(selectedPanne.status).color
                      }}>
                        {selectedPanne.status === 'non_resolu' && <AlertTriangle size={12} />}
                        {selectedPanne.status === 'resolu' && <CheckCircle size={12} />}
                        {selectedPanne.status !== 'non_resolu' && selectedPanne.status !== 'resolu' && <Clock size={12} />}
                        {getStatusInfo(selectedPanne.status).label}
                      </div>
                    </div>

                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--pannes-text-secondary)' }}>
                        <strong>Déclaré par:</strong>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} color="var(--pannes-text-tertiary)" />
                        <span style={{ fontSize: '14px', color: 'var(--pannes-text)' }}>
                          User #{selectedPanne.declared_by || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--pannes-border)' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--pannes-text-secondary)' }}>
                      <strong>Date de déclaration:</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} color="var(--pannes-text-tertiary)" />
                      <span style={{ fontSize: '14px', color: 'var(--pannes-text)' }}>
                        {new Date(selectedPanne.created_at).toLocaleString('fr-FR', {
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

                {selectedPanne.status === 'non_resolu' && (
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
                    <AlertTriangle size={16} color="#ef4444" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>
                      <strong>En attente d'intervention:</strong> Un technicien doit traiter cette panne.
                    </p>
                  </div>
                )}

                {selectedPanne.status === 'resolu' && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} color="#10b981" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#10b981' }}>
                      <strong>Résolue:</strong> Cette panne a été traitée par un technicien.
                    </p>
                  </div>
                )}

                <div className="pannes-modal-footer">
                  <button 
                    type="button" 
                    className="pannes-btn-secondary" 
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

      {/* Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="pannes-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="pannes-delete-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pannes-delete-modal-header">
                <div className="pannes-warning-icon">
                  <AlertTriangle size={48} color="#ef4444" />
                </div>
                <h2>Confirmer la suppression</h2>
                <p className="pannes-delete-modal-text">
                  Êtes-vous sûr de vouloir supprimer la panne <strong>#{panneToDelete?.id}</strong> de la machine <strong>"{getMachineName(panneToDelete?.machine)}"</strong> ?
                </p>
                <p className="pannes-delete-modal-warning">
                  Cette action est irréversible. Toutes les données associées seront définitivement supprimées.
                </p>
              </div>

              <div className="pannes-delete-modal-footer">
                <button 
                  type="button" 
                  className="pannes-btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="pannes-btn-danger" 
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

export default AdminPannes;
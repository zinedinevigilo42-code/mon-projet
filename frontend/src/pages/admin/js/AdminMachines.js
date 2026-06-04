import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  Filter,
  Download,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  HardDrive,
  Shield,
  AlertTriangle,
  Check,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMachines, createMachine, updateMachine, deleteMachine } from '../../../services/api';
import '../css/AdminMachines.css';

const AdminMachines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    localisation: '',
    status: 'active'
  });
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    panne: 0,
    hors_service: 0
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    filterMachines();
    calculateStats();
  }, [searchTerm, filterStatus, machines]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const data = await getMachines();
      setMachines(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement machines:', error);
      setLoading(false);
      showNotification('error', 'Erreur', 'Impossible de charger les machines');
    }
  };

  const calculateStats = () => {
    const total = machines.length;
    const active = machines.filter(m => m.status === 'active').length;
    const panne = machines.filter(m => m.status === 'panne').length;
    const hors_service = machines.filter(m => m.status === 'hors_service').length;
    
    setStats({ total, active, panne, hors_service });
  };

  const filterMachines = () => {
    let filtered = machines;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.localisation && m.localisation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    setFilteredMachines(filtered);
  };

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      nom: '',
      localisation: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (machine) => {
    setModalMode('edit');
    setSelectedMachine(machine);
    setFormData({
      nom: machine.nom,
      localisation: machine.localisation || '',
      status: machine.status
    });
    setShowModal(true);
  };

  const handleDeleteClick = (machine) => {
    setMachineToDelete(machine);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!machineToDelete) return;

    try {
      await deleteMachine(machineToDelete.id);
      fetchMachines();
      setShowDeleteModal(false);
      setMachineToDelete(null);
      showNotification('success', 'Succès', 'Machine supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('error', 'Erreur', 'Impossible de supprimer la machine');
      setShowDeleteModal(false);
      setMachineToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await createMachine(formData);
        showNotification('success', 'Succès', 'Machine créée avec succès');
      } else {
        await updateMachine(selectedMachine.id, formData);
        showNotification('success', 'Succès', 'Machine modifiée avec succès');
      }

      setShowModal(false);
      fetchMachines();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('error', 'Erreur', 'Impossible de sauvegarder la machine');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { 
          icon: CheckCircle, 
          label: 'Active',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 'panne':
        return { 
          icon: AlertCircle, 
          label: 'En Panne',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      case 'hors_service':
        return { 
          icon: Activity, 
          label: 'Hors Service',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      default:
        return { 
          icon: Activity, 
          label: status,
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)'
        };
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Localisation', 'Statut', 'Date de Création'];
    const csvData = filteredMachines.map(m => [
      m.id,
      m.nom,
      m.localisation || 'Non spécifié',
      getStatusInfo(m.status).label,
      new Date(m.created_at).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machines_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('info', 'Export réussi', 'Le fichier CSV a été téléchargé');
  };

  const statsCards = [
    {
      title: 'Total Machines',
      value: stats.total,
      icon: Monitor,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Actives',
      value: stats.active,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${Math.round((stats.active / stats.total) * 100)}% du total`
    },
    {
      title: 'En Panne',
      value: stats.panne,
      icon: AlertCircle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: `${Math.round((stats.panne / stats.total) * 100)}% du total`
    },
    {
      title: 'Hors Service',
      value: stats.hors_service,
      icon: Activity,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      subtitle: `${Math.round((stats.hors_service / stats.total) * 100)}% du total`
    }
  ];

  return (
    <div className="admin-machines-page">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`machines-notification ${notification.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="machines-notification-icon">
              {notification.type === 'success' && <Check size={20} />}
              {notification.type === 'error' && <AlertTriangle size={20} />}
              {notification.type === 'info' && <Info size={20} />}
            </div>
            <div className="machines-notification-content">
              <div className="machines-notification-title">{notification.title}</div>
              <div className="machines-notification-message">{notification.message}</div>
            </div>
            <button 
              className="machines-notification-close" 
              onClick={() => setNotification(null)}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="machines-header">
        <div className="machines-header-main">
          <div className="machines-header-left">
            <button 
              className="machines-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="machines-page-title">
              <div className="machines-title-icon">
                <Monitor size={32} />
                <div className="machines-icon-badge">
                  <span>{machines.length}</span>
                </div>
              </div>
              <div>
                <h1>Gestion des Machines</h1>
                <p>Administrez vos distributeurs automatiques</p>
              </div>
            </div>
          </div>
          <div className="machines-header-actions">
            <motion.button 
              className="machines-header-btn machines-export-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Exporter
            </motion.button>
            <motion.button 
              className="machines-header-btn machines-create-btn"
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Nouvelle Machine
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="machines-stats-overview">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="machines-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: `linear-gradient(135deg, ${stat.bgColor}, rgba(255, 255, 255, 0.05))`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div className="machines-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="machines-stat-content">
                <h3>{stat.value}</h3>
                <p className="machines-stat-label">{stat.title}</p>
                {stat.subtitle && (
                  <p className="machines-stat-subtitle">{stat.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      {/* Filters Section */}
      <div className="machines-filters-section">
        <div className="machines-filters-main">
          <div className="machines-search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher une machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="machines-search-input"
            />
            {searchTerm && (
              <button 
                className="machines-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="machines-filter-controls">
            <div className="machines-filter-group">
              <Filter size={18} />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="machines-filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives seulement</option>
                <option value="panne">En panne seulement</option>
                <option value="hors_service">Hors service seulement</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="machines-content">
        {loading ? (
          <div className="machines-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="machines-loader"
            />
            <p>Chargement des machines...</p>
          </div>
        ) : (
          <>
            <div className="machines-table-header">
              <h3>Liste des machines ({filteredMachines.length})</h3>
              <div className="machines-table-info">
                <span className="machines-info-item">
                  <Monitor size={16} />
                  {filteredMachines.length} résultat(s)
                </span>
              </div>
            </div>

            <div className="machines-grid">
              {filteredMachines.map((machine) => {
                const statusInfo = getStatusInfo(machine.status);
                const StatusIcon = statusInfo.icon;
                const createdDate = new Date(machine.created_at);

                return (
                  <motion.div
                    key={machine.id}
                    className="machines-machine-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
                  >
                    <div className="machines-card-header">
                      <div className="machines-machine-info">
                        <h4>
                          <Monitor size={18} color={statusInfo.color} />
                          {machine.nom}
                        </h4>
                        <p>
                          <MapPin size={14} />
                          {machine.localisation || 'Localisation non spécifiée'}
                        </p>
                      </div>
                      <span className={`machines-card-status machines-${machine.status}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="machines-card-body">
                      <div className="machines-machine-details">
                        <div className="machines-detail-item">
                          <HardDrive size={14} />
                          <span>ID: #{machine.id}</span>
                        </div>
                        <div className="machines-detail-item">
                          <Calendar size={14} />
                          <span>Créée le: {createdDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="machines-detail-item">
                          <Clock size={14} />
                          <span>Heure: {createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {machine.last_maintenance && (
                          <div className="machines-detail-item">
                            <Shield size={14} />
                            <span>Dernière maintenance: {new Date(machine.last_maintenance).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="machines-card-footer">
                      <div className="machines-last-active">
                        <Clock size={12} />
                        <span>Ajoutée {createdDate.toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="machines-action-buttons">
                        <motion.button
                          className="machines-action-btn machines-edit"
                          onClick={() => handleEdit(machine)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button
                          className="machines-action-btn machines-delete"
                          onClick={() => handleDeleteClick(machine)}
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

            {filteredMachines.length === 0 && (
              <div className="machines-empty-state">
                <Monitor size={80} />
                <h3>Aucune machine trouvée</h3>
                <p>Modifiez vos critères de recherche ou ajoutez une nouvelle machine</p>
                <button className="machines-add-first-btn" onClick={handleCreate}>
                  <Plus size={18} />
                  Ajouter votre première machine
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
            className="machines-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="machines-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="machines-modal-header">
                <h2>
                  {modalMode === 'create' ? (
                    <>
                      <Plus size={24} />
                      Nouvelle Machine
                    </>
                  ) : (
                    <>
                      <Edit2 size={24} />
                      Modifier {selectedMachine?.nom}
                    </>
                  )}
                </h2>
                <button className="machines-close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="machines-modal-form">
                <div className="machines-form-group">
                  <label>Nom de la machine *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Machine A - Bâtiment 1"
                    required
                  />
                </div>

                <div className="machines-form-group">
                  <label>Localisation *</label>
                  <input
                    type="text"
                    value={formData.localisation}
                    onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                    placeholder="Ex: Hall d'entrée, Étage 2"
                    required
                  />
                </div>

                <div className="machines-form-group">
                  <label>Statut *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="panne">En Panne</option>
                    <option value="hors_service">Hors Service</option>
                  </select>
                </div>

                <div className="machines-modal-footer">
                  <button type="button" className="machines-btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="machines-btn-primary">
                    {modalMode === 'create' ? 'Créer la machine' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="machines-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="machines-delete-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="machines-delete-modal-header">
                <div className="machines-warning-icon">
                  <AlertTriangle size={48} color="#ef4444" />
                </div>
                <h2>Confirmer la suppression</h2>
                <p className="machines-delete-modal-text">
                  Êtes-vous sûr de vouloir supprimer la machine <strong>"{machineToDelete?.nom}"</strong> ?
                </p>
                <p className="machines-delete-modal-warning">
                  Cette action est irréversible. Toutes les données associées seront définitivement supprimées.
                </p>
              </div>

              <div className="machines-delete-modal-footer">
                <button 
                  type="button" 
                  className="machines-btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="machines-btn-danger" 
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

export default AdminMachines;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Plus,
  X,
  ChevronLeft,
  Filter,
  CheckCircle,
  Clock,
  Monitor,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPannes, createPanne, updatePanne, getMachines } from '../../../services/api';
import '../css/TechnicienPannes.css';

const TechnicienPannes = () => {
  const navigate = useNavigate();
  const [pannes, setPannes] = useState([]);
  const [filteredPannes, setFilteredPannes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMachine, setFilterMachine] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [formData, setFormData] = useState({
    machine: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPannes();
  }, [searchTerm, filterStatus, filterMachine, pannes]);

  const fetchData = async () => {
    try {
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

  const handleCreate = () => {
    setFormData({
      machine: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleResolve = (panne) => {
    setSelectedPanne(panne);
    setShowResolveModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createPanne(formData);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur création panne:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleResolveSubmit = async () => {
    try {
      await updatePanne(selectedPanne.id, { status: 'resolu' });
      setShowResolveModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur résolution panne:', error);
      alert('Erreur lors de la résolution');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'non_resolu':
        return { icon: AlertTriangle, class: 'tp-role-admin', label: 'Non Résolu' };
      case 'resolu':
        return { icon: CheckCircle, class: 'tp-role-client', label: 'Résolu' };
      default:
        return { icon: Clock, class: '', label: status };
    }
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.nom : `Machine #${machineId}`;
  };

  const stats = {
    total: pannes.length,
    nonResolu: pannes.filter(p => p.status === 'non_resolu').length,
    resolu: pannes.filter(p => p.status === 'resolu').length
  };

  return (
    <div className="tp-admin-users-page" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
      {/* Header */}
      <header className="tp-page-header">
        <button className="tp-back-btn" onClick={() => navigate('/technicien/dashboard')}>
          <ChevronLeft size={20} />
          Retour
        </button>
        <div className="tp-header-content">
          <div className="tp-header-left">
            <div className="tp-page-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <AlertTriangle size={32} />
            </div>
            <div>
              <h1>Gestion des Pannes</h1>
              <p>{filteredPannes.length} panne(s) trouvée(s)</p>
            </div>
          </div>
          <div className="tp-header-actions">
            <button className="tp-create-btn" onClick={handleCreate}>
              <Plus size={18} />
              Déclarer une Panne
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="tp-stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <motion.div
          className="tp-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="tp-stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="tp-stat-content">
            <p className="tp-stat-label">Pannes Actives</p>
            <h3 className="tp-stat-value">{stats.nonResolu}</h3>
          </div>
        </motion.div>

        <motion.div
          className="tp-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="tp-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="tp-stat-content">
            <p className="tp-stat-label">Pannes Résolues</p>
            <h3 className="tp-stat-value">{stats.resolu}</h3>
          </div>
        </motion.div>

        <motion.div
          className="tp-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="tp-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Clock size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div className="tp-stat-content">
            <p className="tp-stat-label">Total</p>
            <h3 className="tp-stat-value">{stats.total}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="tp-filters-bar">
        <div className="tp-search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher une panne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tp-filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="non_resolu">Non Résolu</option>
            <option value="resolu">Résolu</option>
          </select>
        </div>
        <div className="tp-filter-group">
          <Filter size={18} />
          <select value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)}>
            <option value="all">Toutes les machines</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>{machine.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="tp-loading-container">
          <div className="tp-loader"></div>
        </div>
      ) : (
        <div className="tp-users-table-container">
          <table className="tp-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Machine</th>
                <th>Description</th>
                <th>Déclaré par</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPannes.map((panne) => {
                const statusInfo = getStatusInfo(panne.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.tr
                    key={panne.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td><strong>#{panne.id}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={16} color="#10b981" />
                        {getMachineName(panne.machine)}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {panne.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <User size={14} />
                        <span>User #{panne.declared_by || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        <div>{new Date(panne.created_at).toLocaleDateString('fr-FR')}</div>
                        <div style={{ color: '#64748b' }}>
                          {new Date(panne.created_at).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`tp-role-badge ${statusInfo.class}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      {panne.status === 'non_resolu' && (
                        <button
                          className="tp-action-btn"
                          style={{ background: '#d1fae5', color: '#059669', width: 'auto', padding: '8px 16px' }}
                          onClick={() => handleResolve(panne)}
                        >
                          <CheckCircle size={16} />
                          <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: 600 }}>
                            Résoudre
                          </span>
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredPannes.length === 0 && (
            <div className="tp-empty-state">
              <AlertTriangle size={64} />
              <h3>Aucune panne trouvée</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Create Panne */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="tp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="tp-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tp-modal-header">
                <h2>Déclarer une Panne</h2>
                <button className="tp-close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="tp-modal-form">
                <div className="tp-form-group">
                  <label>Machine *</label>
                  <select
                    value={formData.machine}
                    onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                    required
                  >
                    <option value="">Sélectionnez une machine</option>
                    {machines.map(machine => (
                      <option key={machine.id} value={machine.id}>{machine.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="tp-form-group">
                  <label>Description de la panne *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="5"
                    required
                    placeholder="Décrivez le problème rencontré..."
                  />
                </div>

                <div className="tp-modal-actions">
                  <button type="button" className="tp-cancel-btn" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="tp-save-btn">
                    Déclarer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Resolve */}
      <AnimatePresence>
        {showResolveModal && (
          <motion.div
            className="tp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResolveModal(false)}
          >
            <motion.div
              className="tp-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px' }}
            >
              <div className="tp-modal-header">
                <h2>Résoudre la Panne</h2>
                <button className="tp-close-btn" onClick={() => setShowResolveModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="tp-modal-form">
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    <strong>Machine:</strong> {getMachineName(selectedPanne?.machine)}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
                    <strong>Description:</strong> {selectedPanne?.description}
                  </p>
                </div>

                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
                  Êtes-vous sûr de vouloir marquer cette panne comme résolue ?
                </p>

                <div className="tp-modal-actions">
                  <button type="button" className="tp-cancel-btn" onClick={() => setShowResolveModal(false)}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="tp-save-btn"
                    onClick={handleResolveSubmit}
                  >
                    Confirmer
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

export default TechnicienPannes;
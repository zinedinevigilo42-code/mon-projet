import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Search,
  ChevronLeft,
  Filter,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Wrench,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMachines, updateMachine } from '../../../services/api';
import '../css/TechnicienMachines.css';

const TechnicienMachines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    filterMachines();
  }, [searchTerm, filterStatus, machines]);

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

  const filterMachines = () => {
    let filtered = machines;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.localisation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    setFilteredMachines(filtered);
  };

  const handleChangeStatus = (machine) => {
    setSelectedMachine(machine);
    setNewStatus(machine.status);
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateMachine(selectedMachine.id, { status: newStatus });
      setShowStatusModal(false);
      fetchMachines();
      alert('Statut modifié avec succès !');
    } catch (error) {
      console.error('Erreur modification statut:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, class: 'tm-role-client', label: 'Active', color: '#10b981' };
      case 'panne':
        return { icon: AlertCircle, class: 'tm-role-admin', label: 'En Panne', color: '#ef4444' };
      case 'hors_service':
        return { icon: AlertCircle, class: 'tm-role-tech', label: 'Hors Service', color: '#f59e0b' };
      default:
        return { icon: Activity, class: '', label: status, color: '#64748b' };
    }
  };

  const stats = {
    total: machines.length,
    active: machines.filter(m => m.status === 'active').length,
    panne: machines.filter(m => m.status === 'panne').length,
    horsService: machines.filter(m => m.status === 'hors_service').length
  };

  return (
    <div className="tm-admin-users-page" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
      <header className="tm-page-header">
        <button className="tm-back-btn" onClick={() => navigate('/technicien/dashboard')}>
          <ChevronLeft size={20} />
          Retour
        </button>
        <div className="tm-header-content">
          <div className="tm-header-left">
            <div className="tm-page-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Monitor size={32} />
            </div>
            <div>
              <h1>État des Machines</h1>
              <p>{filteredMachines.length} machine(s) trouvée(s)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="tm-stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <motion.div className="tm-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="tm-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="tm-stat-content">
            <p className="tm-stat-label">Machines Actives</p>
            <h3 className="tm-stat-value">{stats.active}/{stats.total}</h3>
          </div>
        </motion.div>

        <motion.div className="tm-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="tm-stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="tm-stat-content">
            <p className="tm-stat-label">En Panne</p>
            <h3 className="tm-stat-value">{stats.panne}</h3>
          </div>
        </motion.div>

        <motion.div className="tm-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="tm-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="tm-stat-content">
            <p className="tm-stat-label">Hors Service</p>
            <h3 className="tm-stat-value">{stats.horsService}</h3>
          </div>
        </motion.div>
      </div>

      <div className="tm-filters-bar">
        <div className="tm-search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher une machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tm-filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="panne">En Panne</option>
            <option value="hors_service">Hors Service</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="tm-loading-container">
          <div className="tm-loader"></div>
        </div>
      ) : (
        <div className="tm-users-table-container">
          <table className="tm-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Localisation</th>
                <th>Statut</th>
                <th>Date de Création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => {
                const statusInfo = getStatusBadge(machine.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.tr
                    key={machine.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>#{machine.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={18} color="#10b981" />
                        <strong>{machine.nom}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <MapPin size={14} />
                        {machine.localisation || 'Non spécifié'}
                      </div>
                    </td>
                    <td>
                      <span className={`tm-role-badge ${statusInfo.class}`}>
                        <StatusIcon size={12} /> {statusInfo.label}
                      </span>
                    </td>
                    <td>{new Date(machine.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="tm-action-buttons">
                        <button
                          className="tm-action-btn"
                          style={{ background: '#dbeafe', color: '#1e40af', width: 'auto', padding: '8px 12px' }}
                          onClick={() => handleChangeStatus(machine)}
                          title="Changer le statut"
                        >
                          <Activity size={14} />
                          <span style={{ marginLeft: '6px', fontSize: '12px', fontWeight: 600 }}>
                            Changer statut
                          </span>
                        </button>
                        <button
                          className="tm-action-btn"
                          style={{ background: '#d1fae5', color: '#059669' }}
                          onClick={() => navigate(`/technicien/pannes?machine=${machine.id}`)}
                          title="Voir pannes"
                        >
                          <Wrench size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredMachines.length === 0 && (
            <div className="tm-empty-state">
              <Monitor size={64} />
              <h3>Aucune machine trouvée</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Changement de Statut */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            className="tm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              className="tm-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '450px' }}
            >
              <div className="tm-modal-header">
                <h2>Modifier le Statut</h2>
                <button className="tm-close-btn" onClick={() => setShowStatusModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="tm-modal-form">
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Monitor size={18} color="#10b981" />
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                      {selectedMachine?.nom}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#64748b" />
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      {selectedMachine?.localisation}
                    </p>
                  </div>
                </div>

                <div className="tm-form-group">
                  <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                    Nouveau Statut *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    <option value="active">✅ Active</option>
                    <option value="panne">⚠️ En Panne</option>
                    <option value="hors_service">🔴 Hors Service</option>
                  </select>
                </div>

                <div style={{
                  padding: '12px',
                  background: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  marginTop: '16px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                    ℹ️ <strong>Note:</strong> Ce changement sera immédiatement visible par tous les utilisateurs.
                  </p>
                </div>

                <div className="tm-modal-actions">
                  <button type="button" className="tm-cancel-btn" onClick={() => setShowStatusModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="tm-save-btn">
                    Modifier le Statut
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicienMachines;
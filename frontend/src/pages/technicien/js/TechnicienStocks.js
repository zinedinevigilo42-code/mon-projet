import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Edit2,
  ChevronLeft,
  Filter,
  AlertTriangle,
  TrendingUp,
  Coffee,
  Monitor,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStocks, createStock, updateStock, getBoissons, getMachines, createApprovisionnement } from '../../../services/api';
import '../css/TechnicienStocks.css';

const TechnicienStocks = () => {
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
  const [showApprovModal, setShowApprovModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    machine: '',
    boisson_id: '',
    stock_initial: '',
    stock_restante: '',
    seuil_rupture: 5
  });
  const [approvData, setApprovData] = useState({
    machine_boisson: '',
    quantite: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchTerm, filterMachine, filterAlert, stocks]);

  const fetchData = async () => {
    try {
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

  const handleApprovisionnement = (stock) => {
    setSelectedStock(stock);
    setApprovData({
      machine_boisson: stock.id,
      quantite: ''
    });
    setShowApprovModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await createStock(formData);
      } else {
        await updateStock(selectedStock.id, formData);
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleApprovSubmit = async (e) => {
    e.preventDefault();

    try {
      await createApprovisionnement(approvData);
      setShowApprovModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur approvisionnement:', error);
      alert('Erreur lors de l\'approvisionnement');
    }
  };

  const getStockStatus = (stock) => {
    if (stock.stock_restante === 0) {
      return { class: 'ts-role-admin', label: 'Rupture', color: '#ef4444' };
    } else if (stock.stock_restante <= stock.seuil_rupture) {
      return { class: 'ts-role-tech', label: 'Stock Faible', color: '#f59e0b' };
    } else {
      return { class: 'ts-role-client', label: 'OK', color: '#10b981' };
    }
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.nom : `Machine #${machineId}`;
  };

  const stats = {
    total: stocks.length,
    ok: stocks.filter(s => s.stock_restante > s.seuil_rupture).length,
    low: stocks.filter(s => s.stock_restante <= s.seuil_rupture && s.stock_restante > 0).length,
    empty: stocks.filter(s => s.stock_restante === 0).length
  };

  return (
    <div className="ts-admin-users-page" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
      <header className="ts-page-header">
        <button className="ts-back-btn" onClick={() => navigate('/technicien/dashboard')}>
          <ChevronLeft size={20} />
          Retour
        </button>
        <div className="ts-header-content">
          <div className="ts-header-left">
            <div className="ts-page-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Package size={32} />
            </div>
            <div>
              <h1>Gestion des Stocks</h1>
              <p>{filteredStocks.length} stock(s) trouvé(s)</p>
            </div>
          </div>
          <div className="ts-header-actions">
            <button className="ts-create-btn" onClick={handleCreate}>
              <Plus size={18} />
              Nouveau Stock
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="ts-stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <motion.div className="ts-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="ts-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Package size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="ts-stat-content">
            <p className="ts-stat-label">Stocks OK</p>
            <h3 className="ts-stat-value">{stats.ok}</h3>
          </div>
        </motion.div>

        <motion.div className="ts-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="ts-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="ts-stat-content">
            <p className="ts-stat-label">Stocks Faibles</p>
            <h3 className="ts-stat-value">{stats.low}</h3>
          </div>
        </motion.div>

        <motion.div className="ts-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="ts-stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="ts-stat-content">
            <p className="ts-stat-label">Ruptures</p>
            <h3 className="ts-stat-value">{stats.empty}</h3>
          </div>
        </motion.div>
      </div>

      <div className="ts-filters-bar">
        <div className="ts-search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher par boisson..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ts-filter-group">
          <Filter size={18} />
          <select value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)}>
            <option value="all">Toutes les machines</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>{machine.nom}</option>
            ))}
          </select>
        </div>
        <div className="ts-filter-group">
          <Filter size={18} />
          <select value={filterAlert} onChange={(e) => setFilterAlert(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="low">Stocks faibles</option>
            <option value="empty">Ruptures</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="ts-loading-container">
          <div className="ts-loader"></div>
        </div>
      ) : (
        <div className="ts-users-table-container">
          <table className="ts-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Machine</th>
                <th>Boisson</th>
                <th>Stock Initial</th>
                <th>Stock Restant</th>
                <th>Seuil Rupture</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => {
                const status = getStockStatus(stock);
                const percentage = (stock.stock_restante / stock.stock_initial) * 100;

                return (
                  <motion.tr
                    key={stock.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>#{stock.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={16} color="#10b981" />
                        {getMachineName(stock.machine)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Coffee size={16} color="#8b5cf6" />
                        <strong>{stock.boisson?.nom || 'N/A'}</strong>
                      </div>
                    </td>
                    <td>{stock.stock_initial}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: status.color }}>{stock.stock_restante}</strong>
                        <div className="ts-progress-bar">
                          <div 
                            className="ts-progress-fill"
                            style={{
                              width: `${percentage}%`,
                              background: status.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>{stock.seuil_rupture}</td>
                    <td>
                      <span className={`ts-role-badge ${status.class}`}>
                        {stock.stock_restante <= stock.seuil_rupture && <AlertTriangle size={12} />}
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="ts-action-buttons">
                        <button
                          className="ts-action-btn"
                          style={{ background: '#d1fae5', color: '#059669' }}
                          onClick={() => handleApprovisionnement(stock)}
                          title="Approvisionner"
                        >
                          <TrendingUp size={16} />
                        </button>
                        <button
                          className="ts-action-btn edit"
                          onClick={() => handleEdit(stock)}
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredStocks.length === 0 && (
            <div className="ts-empty-state">
              <Package size={64} />
              <h3>Aucun stock trouvé</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Create/Edit Stock */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="ts-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="ts-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ts-modal-header">
                <h2>{modalMode === 'create' ? 'Nouveau Stock' : 'Modifier Stock'}</h2>
                <button className="ts-close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="ts-modal-form">
                <div className="ts-form-group">
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

                <div className="ts-form-group">
                  <label>Boisson *</label>
                  <select
                    value={formData.boisson_id}
                    onChange={(e) => setFormData({ ...formData, boisson_id: e.target.value })}
                    required
                  >
                    <option value="">Sélectionnez une boisson</option>
                    {boissons.map(boisson => (
                      <option key={boisson.id} value={boisson.id}>{boisson.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="ts-form-row">
                  <div className="ts-form-group">
                    <label>Stock Initial *</label>
                    <input
                      type="number"
                      value={formData.stock_initial}
                      onChange={(e) => setFormData({ ...formData, stock_initial: e.target.value })}
                      required
                      min="0"
                    />
                  </div>

                  <div className="ts-form-group">
                    <label>Stock Restant *</label>
                    <input
                      type="number"
                      value={formData.stock_restante}
                      onChange={(e) => setFormData({ ...formData, stock_restante: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="ts-form-group">
                  <label>Seuil de Rupture *</label>
                    <input
                      type="number"
                      value={formData.seuil_rupture}
                      onChange={(e) => setFormData({ ...formData, seuil_rupture: e.target.value })}
                      required
                      min="0"
                    />
                </div>

                <div className="ts-modal-actions">
                  <button type="button" className="ts-cancel-btn" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="ts-save-btn">
                    {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Approvisionnement */}
      <AnimatePresence>
        {showApprovModal && (
          <motion.div
            className="ts-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApprovModal(false)}
          >
            <motion.div
              className="ts-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px' }}
            >
              <div className="ts-modal-header">
                <h2>Approvisionner</h2>
                <button className="ts-close-btn" onClick={() => setShowApprovModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleApprovSubmit} className="ts-modal-form">
                <div className="ts-form-group">
                  <label>Stock actuel</label>
                  <input
                    type="text"
                    value={`${selectedStock?.boisson?.nom} - ${selectedStock?.stock_restante} unités`}
                    disabled
                  />
                </div>

                <div className="ts-form-group">
                  <label>Quantité à ajouter *</label>
                  <input
                    type="number"
                    value={approvData.quantite}
                    onChange={(e) => setApprovData({ ...approvData, quantite: e.target.value })}
                    required
                    min="1"
                    placeholder="Ex: 50"
                  />
                </div>

                <div className="ts-info-box">
                  <p>
                    <strong>Nouveau stock:</strong> {(parseInt(selectedStock?.stock_restante || 0) + parseInt(approvData.quantite || 0))} unités
                  </p>
                </div>

                <div className="ts-modal-actions">
                  <button type="button" className="ts-cancel-btn" onClick={() => setShowApprovModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="ts-save-btn">
                    Approvisionner
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

export default TechnicienStocks;
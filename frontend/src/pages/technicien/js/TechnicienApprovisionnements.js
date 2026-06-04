import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  ChevronLeft,
  Filter,
  Download,
  User,
  Package,
  Monitor,
  Coffee,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getApprovisionnements } from '../../../services/api';
import '../css/TechnicienApprovisionnements.css';

const TechnicienApprovisionnements = () => {
  const navigate = useNavigate();
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [filteredApprovs, setFilteredApprovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMachine, setFilterMachine] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    totalQuantity: 0
  });

  useEffect(() => {
    fetchApprovisionnements();
  }, []);

  useEffect(() => {
    filterApprovisionnements();
  }, [searchTerm, filterMachine, approvisionnements]);

  const fetchApprovisionnements = async () => {
    try {
      const data = await getApprovisionnements();
      setApprovisionnements(data);
      calculateStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement approvisionnements:', error);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const todayCount = data.filter(a => {
      const approvDate = new Date(a.date);
      approvDate.setHours(0, 0, 0, 0);
      return approvDate.getTime() === today.getTime();
    }).length;

    const weekCount = data.filter(a => {
      const approvDate = new Date(a.date);
      return approvDate >= oneWeekAgo;
    }).length;

    const totalQty = data.reduce((sum, a) => sum + parseInt(a.quantite || 0), 0);

    setStats({
      total: data.length,
      today: todayCount,
      thisWeek: weekCount,
      totalQuantity: totalQty
    });
  };

  const filterApprovisionnements = () => {
    let filtered = approvisionnements;

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.id.toString().includes(searchTerm)
      );
    }

    if (filterMachine !== 'all') {
      filtered = filtered.filter(a => 
        a.machine_boisson?.machine === parseInt(filterMachine)
      );
    }

    setFilteredApprovs(filtered);
  };

  const getMachines = () => {
    const machinesMap = new Map();
    approvisionnements.forEach(a => {
      if (a.machine_boisson?.machine) {
        machinesMap.set(a.machine_boisson.machine, true);
      }
    });
    return Array.from(machinesMap.keys());
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Machine', 'Boisson', 'Quantité', 'Utilisateur'];
    const csvData = filteredApprovs.map(a => [
      a.id,
      new Date(a.date).toLocaleString('fr-FR'),
      `Machine #${a.machine_boisson?.machine || 'N/A'}`,
      a.machine_boisson?.boisson || 'N/A',
      a.quantite,
      `User #${a.user || 'N/A'}`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approvisionnements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="ta-admin-users-page" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
      <header className="ta-page-header">
        <button className="ta-back-btn" onClick={() => navigate('/technicien/dashboard')}>
          <ChevronLeft size={20} />
          Retour
        </button>
        <div className="ta-header-content">
          <div className="ta-header-left">
            <div className="ta-page-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <h1>Historique des Approvisionnements</h1>
              <p>{filteredApprovs.length} approvisionnement(s) trouvé(s)</p>
            </div>
          </div>
          <div className="ta-header-actions">
            <button className="ta-export-btn" onClick={exportToCSV}>
              <Download size={18} />
              Exporter CSV
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="ta-stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <motion.div
          className="ta-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="ta-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Calendar size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div className="ta-stat-content">
            <p className="ta-stat-label">Aujourd'hui</p>
            <h3 className="ta-stat-value">{stats.today}</h3>
          </div>
        </motion.div>

        <motion.div
          className="ta-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="ta-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="ta-stat-content">
            <p className="ta-stat-label">Cette Semaine</p>
            <h3 className="ta-stat-value">{stats.thisWeek}</h3>
          </div>
        </motion.div>

        <motion.div
          className="ta-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="ta-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Package size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="ta-stat-content">
            <p className="ta-stat-label">Quantité Totale</p>
            <h3 className="ta-stat-value">{stats.totalQuantity}</h3>
          </div>
        </motion.div>
      </div>

      <div className="ta-filters-bar">
        <div className="ta-search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher par ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ta-filter-group">
          <Filter size={18} />
          <select value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)}>
            <option value="all">Toutes les machines</option>
            {getMachines().map(machineId => (
              <option key={machineId} value={machineId}>Machine #{machineId}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="ta-loading-container">
          <div className="ta-loader"></div>
        </div>
      ) : (
        <div className="ta-users-table-container">
          <table className="ta-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Heure</th>
                <th>Machine</th>
                <th>Boisson</th>
                <th>Quantité</th>
                <th>Réalisé par</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovs.map((approv) => (
                <motion.tr
                  key={approv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td><strong>#{approv.id}</strong></td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {new Date(approv.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ color: '#64748b', marginTop: '2px' }}>
                        {new Date(approv.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Monitor size={14} />
                      <span>Machine #{approv.machine_boisson?.machine || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Coffee size={16} color="#8b5cf6" />
                      <span style={{ fontWeight: 500 }}>
                        {approv.machine_boisson?.boisson || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ta-quantity-badge">
                      <TrendingUp size={14} />
                      +{approv.quantite}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <User size={14} />
                      <span>User #{approv.user || 'N/A'}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredApprovs.length === 0 && (
            <div className="ta-empty-state">
              <TrendingUp size={64} />
              <h3>Aucun approvisionnement trouvé</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicienApprovisionnements;
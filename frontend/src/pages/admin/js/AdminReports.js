import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Coffee,
  ShoppingCart,
  DollarSign,
  Printer,
  Eye,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../css/AdminReports.css';

const AdminReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [reportType, setReportType] = useState('sales');
  const [data, setData] = useState(null);

  const reportTypes = [
    { id: 'sales', label: 'Ventes', icon: ShoppingCart, color: '#10b981' },
    { id: 'revenue', label: 'Revenus', icon: DollarSign, color: '#8b5cf6' },
    { id: 'clients', label: 'Clients', icon: Users, color: '#3b82f6' },
    { id: 'products', label: 'Produits', icon: Coffee, color: '#ec4899' },
    { id: 'performance', label: 'Performance', icon: Activity, color: '#f59e0b' }
  ];

  const timeRanges = [
    { label: '7 jours', value: 7 },
    { label: '30 jours', value: 30 },
    { label: '90 jours', value: 90 },
    { label: 'Année', value: 365 }
  ];

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Simulation données de rapport
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        sales: {
          title: 'Rapport des Ventes',
          total: 12456,
          change: '+15.2%',
          trend: 'up',
          data: [
            { label: 'Lun', value: 1200 },
            { label: 'Mar', value: 1800 },
            { label: 'Mer', value: 2100 },
            { label: 'Jeu', value: 1900 },
            { label: 'Ven', value: 2500 },
            { label: 'Sam', value: 3000 },
            { label: 'Dim', value: 2000 }
          ],
          metrics: [
            { label: 'Transactions', value: '1,248', change: '+8.2%' },
            { label: 'Montant moyen', value: '2,450 Ar', change: '+3.1%' },
            { label: 'Clients uniques', value: '342', change: '+12.5%' },
            { label: 'Taux de succès', value: '98.5%', change: '+0.5%' }
          ]
        },
        revenue: {
          title: 'Analyse des Revenus',
          total: '156,840 Ar',
          change: '+22.3%',
          trend: 'up',
          data: [
            { label: 'Sem 1', value: 35000 },
            { label: 'Sem 2', value: 42000 },
            { label: 'Sem 3', value: 48000 },
            { label: 'Sem 4', value: 31840 }
          ],
          metrics: [
            { label: 'Revenu journalier', value: '5,228 Ar', change: '+10.1%' },
            { label: 'Revenu machine', value: '1,890 Ar', change: '+5.3%' },
            { label: 'Taux croissance', value: '3.2%', change: '+1.1%' },
            { label: 'Objectif atteint', value: '78%', change: '+8.2%' }
          ]
        },
        clients: {
          title: 'Analyse Clients',
          total: '2,845',
          change: '+8.7%',
          trend: 'up',
          data: [
            { label: 'Nouveaux', value: 250 },
            { label: 'Actifs', value: 1845 },
            { label: 'Inactifs', value: 500 },
            { label: 'Fidèles', value: 250 }
          ],
          metrics: [
            { label: 'Nouveaux/jour', value: '8.3', change: '+2.1%' },
            { label: 'Taux rétention', value: '85.2%', change: '+1.5%' },
            { label: 'Fréquence moyenne', value: '3.2/mois', change: '+0.3%' },
            { label: 'Valeur moyenne', value: '4,250 Ar', change: '+5.1%' }
          ]
        },
        products: {
          title: 'Performance Produits',
          total: '48 produits',
          change: '+12.3%',
          trend: 'up',
          data: [
            { label: 'Populaires', value: 15 },
            { label: 'Standards', value: 25 },
            { label: 'Faible vente', value: 5 },
            { label: 'Nouveaux', value: 3 }
          ],
          metrics: [
            { label: 'Top produit', value: 'Café Latte', change: '+18.2%' },
            { label: 'Ventes totales', value: '8,425', change: '+15.3%' },
            { label: 'Rotation stock', value: '4.2x', change: '+0.8%' },
            { label: 'Satisfaction', value: '96.8%', change: '+0.9%' }
          ]
        },
        performance: {
          title: 'Performance Système',
          total: '99.8%',
          change: '+0.3%',
          trend: 'up',
          data: [
            { label: 'Uptime', value: 99.8 },
            { label: 'Latence', value: 85 },
            { label: 'Erreurs', value: 0.2 },
            { label: 'Satisfaction', value: 95 }
          ],
          metrics: [
            { label: 'Temps réponse', value: '142ms', change: '-12ms' },
            { label: 'Transactions/sec', value: '48', change: '+3.2%' },
            { label: 'Disponibilité', value: '99.98%', change: '+0.02%' },
            { label: 'Sécurité', value: 'A+', change: 'stable' }
          ]
        }
      };

      setData(mockData[reportType]);
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    alert(`Export ${format} du rapport ${reportType} en cours...`);
    // Ici vous ajouteriez la logique d'export réel
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickRange = (days) => {
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - days)),
      endDate: new Date()
    });
  };

  return (
    <div className="reports-admin-page">
      <header className="reports-header">
        <div className="reports-header-main">
          <div className="reports-header-left">
            <button 
              className="reports-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="reports-page-title">
              <div className="reports-title-icon">
                <BarChart3 size={32} />
              </div>
              <div>
                <h1>Rapports & Analytics</h1>
                <p>Analysez les performances de votre système</p>
              </div>
            </div>
          </div>
          
          <div className="reports-header-actions">
            <motion.button
              className="reports-header-btn reports-print-btn"
              onClick={handlePrint}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Printer size={18} />
              Imprimer
            </motion.button>
            
            <div className="reports-dropdown">
              <motion.button
                className="reports-header-btn reports-export-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                Exporter
              </motion.button>
              <div className="dropdown-content">
                <button onClick={() => handleExport('pdf')}>PDF</button>
                <button onClick={() => handleExport('excel')}>Excel</button>
                <button onClick={() => handleExport('csv')}>CSV</button>
              </div>
            </div>
            
            <motion.button
              className="reports-header-btn reports-refresh-btn"
              onClick={fetchReportData}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <RefreshCw size={18} className="spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              Actualiser
            </motion.button>
          </div>
        </div>
      </header>

      <main className="reports-content">
        {/* Filtres et sélection */}
        <div className="reports-controls">
          <div className="reports-filters">
            <div className="filter-group">
              <Calendar size={18} />
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                selectsStart
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                className="date-picker"
                dateFormat="dd/MM/yyyy"
              />
              <span className="date-separator">au</span>
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                selectsEnd
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                minDate={dateRange.startDate}
                className="date-picker"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            
            <div className="filter-group">
              <Filter size={18} />
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="reports-select"
              >
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="quick-ranges">
            {timeRanges.map(range => (
              <button
                key={range.value}
                className="quick-range-btn"
                onClick={() => handleQuickRange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sélection type rapport */}
        <div className="report-types">
          {reportTypes.map(type => (
            <motion.button
              key={type.id}
              className={`report-type-btn ${reportType === type.id ? 'active' : ''}`}
              onClick={() => setReportType(type.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                borderColor: type.color,
                background: reportType === type.id ? `${type.color}20` : 'transparent'
              }}
            >
              <type.icon size={20} style={{ color: type.color }} />
              {type.label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="reports-loading">
            <RefreshCw size={40} className="spin" />
            <p>Chargement du rapport...</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Overview */}
            <div className="report-overview">
              <div className="overview-header">
                <div>
                  <h2>{data.title}</h2>
                  <p className="date-range">
                    {dateRange.startDate.toLocaleDateString('fr-FR')} - {dateRange.endDate.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div className="overview-stats">
                  <div className="stat-total">
                    <h3>{data.total}</h3>
                    <div className={`stat-change ${data.trend}`}>
                      {data.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span>{data.change}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="kpi-grid">
                {data.metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    className="kpi-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="kpi-content">
                      <span className="kpi-label">{metric.label}</span>
                      <h4>{metric.value}</h4>
                      <div className={`kpi-change ${metric.change.startsWith('+') ? 'positive' : 'negative'}`}>
                        {metric.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="charts-section">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Évolution</h3>
                  <div className="chart-controls">
                    <button className="chart-btn">
                      <LineChart size={16} />
                      Ligne
                    </button>
                    <button className="chart-btn active">
                      <BarChart3 size={16} />
                      Barres
                    </button>
                    <button className="chart-btn">
                      <PieChart size={16} />
                      Secteurs
                    </button>
                  </div>
                </div>
                
                <div className="chart-container">
                  <div className="chart-bars">
                    {data.data.map((item, index) => (
                      <div key={index} className="chart-bar-wrapper">
                        <div className="chart-bar-label">{item.label}</div>
                        <div className="chart-bar-container">
                          <motion.div
                            className="chart-bar"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.value / Math.max(...data.data.map(d => d.value))) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ backgroundColor: reportTypes.find(t => t.id === reportType)?.color }}
                          />
                        </div>
                        <div className="chart-bar-value">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="insights-card">
                <h3>Insights & Recommandations</h3>
                <div className="insights-list">
                  {reportType === 'sales' && (
                    <>
                      <div className="insight positive">
                        <TrendingUp size={16} />
                        <p>Les ventes du weekend ont augmenté de 25%</p>
                      </div>
                      <div className="insight info">
                        <Activity size={16} />
                        <p>Période de pointe : 12h-14h et 17h-19h</p>
                      </div>
                      <div className="insight suggestion">
                        <Coffee size={16} />
                        <p>Augmenter le stock des produits populaires le weekend</p>
                      </div>
                    </>
                  )}
                  
                  {reportType === 'revenue' && (
                    <>
                      <div className="insight positive">
                        <TrendingUp size={16} />
                        <p>Revenus hebdomadaires en croissance constante</p>
                      </div>
                      <div className="insight warning">
                        <DollarSign size={16} />
                        <p>Semaine 4 montre une baisse, vérifier les promotions</p>
                      </div>
                      <div className="insight suggestion">
                        <Users size={16} />
                        <p>Introduire des offres spéciales les jeudis et vendredis</p>
                      </div>
                    </>
                  )}
                  
                  {/* Ajouter les autres insights pour chaque type de rapport */}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="data-table-section">
              <h3>Données Détail</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Période</th>
                      <th>Valeur</th>
                      <th>Évolution</th>
                      <th>Part</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((item, index) => (
                      <tr key={index}>
                        <td>{item.label}</td>
                        <td>
                          <div className="value-cell">
                            <strong>{item.value}</strong>
                            <small>{reportType === 'revenue' ? 'Ar' : ''}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`trend-cell ${index % 3 === 0 ? 'positive' : 'negative'}`}>
                            {index % 3 === 0 ? '+12.5%' : '-2.3%'}
                          </span>
                        </td>
                        <td>
                          <div className="percentage-bar">
                            <div 
                              className="percentage-fill"
                              style={{ 
                                width: `${(item.value / data.data.reduce((sum, d) => sum + d.value, 0)) * 100}%`,
                                backgroundColor: reportTypes.find(t => t.id === reportType)?.color
                              }}
                            ></div>
                            <span className="percentage-text">
                              {((item.value / data.data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            <BarChart3 size={80} />
            <h3>Aucune donnée disponible</h3>
            <p>Sélectionnez une période et un type de rapport</p>
          </div>
        )}

        {/* Actions supplémentaires */}
        <div className="reports-actions">
          <button className="action-btn">
            <Eye size={18} />
            Vue détaillée
          </button>
          <button className="action-btn">
            <Download size={18} />
            Exporter données brutes
          </button>
          <button className="action-btn">
            <MoreVertical size={18} />
            Plus d'options
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
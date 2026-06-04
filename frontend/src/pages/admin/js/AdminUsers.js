import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  Filter,
  Download,
  Wrench,
  Shield,
  Mail,
  User as UserIcon,
  Calendar,
  Key,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, deleteUser } from '../../../services/api';
import axios from 'axios';
import '../css/AdminUsers.css';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'technicien'
  });
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      // ✅ FILTER: Seulement techniciens et admins (PAS les clients)
      const employees = data.filter(user => 
        user.role === 'technicien' || user.role === 'admin'
      );
      setUsers(employees);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      showNotification('error', 'Erreur', 'Impossible de charger les utilisateurs');
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
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
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'technicien'
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    });
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteUser(deleteConfirm.id);
      fetchUsers();
      setDeleteConfirm(null);
      showNotification('success', 'Succès', 'Employé supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('error', 'Erreur', 'Impossible de supprimer l\'employé');
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (modalMode === 'create') {
        const userData = {
          ...formData,
          password: 'TempPass123!' // Mot de passe temporaire
        };
        await axios.post(`${API_BASE_URL}/users/`, userData, config);
        showNotification('success', 'Succès', 'Employé créé avec succès');
      } else {
        const updateData = { ...formData };
        await axios.put(`${API_BASE_URL}/users/${selectedUser.id}/`, updateData, config);
        showNotification('success', 'Succès', 'Employé modifié avec succès');
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      const errorMsg = error.response?.data?.username?.[0] || 
                      error.response?.data?.email?.[0] || 
                      'Erreur lors de la sauvegarde';
      showNotification('error', 'Erreur', errorMsg);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Username', 'Email', 'Prénom', 'Nom', 'Rôle', 'Date d\'ajout'];
    const csvData = filteredUsers.map(user => [
      user.id,
      user.username,
      user.email,
      user.first_name,
      user.last_name,
      getRoleLabel(user.role),
      new Date(user.date_joined).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('info', 'Export réussi', 'Le fichier CSV a été téléchargé');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'user-role-admin';
      case 'technicien': return 'user-role-tech';
      default: return '';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'technicien': return 'Technicien';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? Shield : Wrench;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (role, id) => {
    if (role === 'admin') {
      return 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else {
      // Generate consistent color based on user ID
      const colors = [
        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #ec4899, #be185d)'
      ];
      return colors[id % colors.length];
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    techniciens: users.filter(u => u.role === 'technicien').length
  };

  const statsCards = [
    {
      title: 'Total Employés',
      value: stats.total,
      icon: Users,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    {
      title: 'Administrateurs',
      value: stats.admins,
      icon: Shield,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: `${Math.round((stats.admins / stats.total) * 100)}% du total`
    },
    {
      title: 'Techniciens',
      value: stats.techniciens,
      icon: Wrench,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${Math.round((stats.techniciens / stats.total) * 100)}% du total`
    }
  ];

  return (
    <div className="user-admin-page">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`user-notification user-${notification.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="user-notification-icon">
              {notification.type === 'success' && <CheckCircle size={20} />}
              {notification.type === 'error' && <AlertCircle size={20} />}
              {notification.type === 'info' && <Info size={20} />}
            </div>
            <div className="user-notification-content">
              <div className="user-notification-title">{notification.title}</div>
              <div className="user-notification-message">{notification.message}</div>
            </div>
            <button 
              className="user-notification-close" 
              onClick={() => setNotification(null)}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="user-header">
        <div className="user-header-main">
          <div className="user-header-left">
            <button 
              className="user-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="user-page-title">
              <div className="user-title-icon">
                <Users size={32} />
                <div className="user-icon-badge">
                  <span>{users.length}</span>
                </div>
              </div>
              <div>
                <h1>Gestion des Employés</h1>
                <p>Administrateurs et techniciens</p>
              </div>
            </div>
          </div>
          <div className="user-header-actions">
            <motion.button 
              className="user-header-btn user-export-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Exporter
            </motion.button>
            <motion.button 
              className="user-header-btn user-create-btn"
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Nouvel Employé
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="user-stats-overview">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="user-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: `linear-gradient(135deg, ${stat.bgColor}, rgba(255, 255, 255, 0.05))`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div className="user-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="user-stat-content">
                <h3>{stat.value}</h3>
                <p className="user-stat-label">{stat.title}</p>
                {stat.subtitle && (
                  <p className="user-stat-subtitle">{stat.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      {/* Information Card */}
      <motion.div 
        className="user-stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
      >
        <div className="user-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <AlertCircle size={20} style={{ color: '#3b82f6' }} />
        </div>
        <div className="user-stat-content">
          <h3 style={{ fontSize: '18px', color: '#3b82f6' }}>Gestion sécurisée des employés</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginTop: '8px' }}>
            Cette section permet de gérer les <strong>administrateurs</strong> et <strong>techniciens</strong>. 
            Les <strong>clients</strong> s'inscrivent eux-mêmes via l'application. 
            Les employés reçoivent leurs identifiants par email et doivent changer leur mot de passe lors de leur première connexion.
          </p>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="user-filters-section">
        <div className="user-filters-main">
          <div className="user-search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-search-input"
            />
            {searchTerm && (
              <button 
                className="user-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="user-filter-controls">
            <div className="user-filter-group">
              <Filter size={18} />
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="user-filter-select"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="technicien">Techniciens</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="user-main-content">
        {loading ? (
          <div className="user-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="user-loader"
            />
            <p>Chargement des employés...</p>
          </div>
        ) : (
          <>
            <div className="user-table-header">
              <h3>Liste des employés ({filteredUsers.length})</h3>
              <div className="user-table-info">
                <span className="user-info-item">
                  <Users size={16} />
                  {filteredUsers.length} employé(s)
                </span>
                <span className="user-info-item">
                  <Calendar size={16} />
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Users Grid */}
            <div className="user-grid">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                const statusInfo = getStatusInfo(user.status);
                const isAdmin = user.role === 'admin';

                return (
                  <motion.div
                    key={user.id}
                    className="user-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
                    style={{
                      borderLeft: isAdmin ? `4px solid #ef4444` : `4px solid #10b981`
                    }}
                  >
                    <div className="user-card-header">
                      <div className="user-card-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            className="user-avatar"
                            style={{
                              background: getAvatarColor(user.role, user.id),
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '16px',
                              color: 'white'
                            }}
                          >
                            {getInitials(user.first_name, user.last_name)}
                          </div>
                          <div>
                            <h4>
                              {user.first_name} {user.last_name}
                            </h4>
                            <p>
                              <UserIcon size={14} />
                              {user.username}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className={`user-card-status ${isAdmin ? 'user-panne' : 'user-active'}`}>
                        <RoleIcon size={12} />
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="user-card-body">
                      <div className="user-details">
                        <div className="user-detail-item">
                          <Mail size={14} />
                          <span>{user.email}</span>
                        </div>
                        
                        <div className="user-detail-item">
                          <Key size={14} />
                          <span>ID: <strong>#{user.id}</strong></span>
                        </div>

                        <div className="user-detail-item">
                          <Calendar size={14} />
                          <span>
                            Inscrit le {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        {user.is_active === false && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px',
                            background: 'rgba(148, 163, 184, 0.1)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            borderRadius: '6px',
                            marginTop: '8px'
                          }}>
                            <AlertCircle size={12} color="#94a3b8" />
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                              Compte désactivé
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="user-card-footer">
                      <div className="user-last-active">
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {user.last_login ? 
                            `Dernière connexion: ${new Date(user.last_login).toLocaleDateString('fr-FR')}` :
                            'Jamais connecté'
                          }
                        </span>
                      </div>
                      <div className="user-action-buttons">
                        <motion.button
                          className="user-action-btn user-edit"
                          onClick={() => handleEdit(user)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button
                          className="user-action-btn user-delete"
                          onClick={() => handleDeleteClick(user)}
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

            {filteredUsers.length === 0 && (
              <div className="user-empty-state">
                <Users size={80} />
                <h3>Aucun employé trouvé</h3>
                <p>Modifiez vos critères de recherche ou ajoutez un nouvel employé</p>
                <button className="user-add-first-btn" onClick={handleCreate}>
                  <Plus size={18} />
                  Ajouter un employé
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Create/Edit Employee */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="user-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-modal-header">
                <h2>
                  {modalMode === 'create' ? (
                    <>
                      <Plus size={24} />
                      Nouvel Employé
                    </>
                  ) : (
                    <>
                      <Edit2 size={24} />
                      Modifier Employé
                    </>
                  )}
                </h2>
                <button className="user-close-btn" onClick={() => setShowModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="user-modal-form">
                <div className="user-form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Ex: Jean"
                    required
                    className="user-form-input"
                  />
                </div>

                <div className="user-form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Ex: Dupont"
                    required
                    className="user-form-input"
                  />
                </div>

                <div className="user-form-group">
                  <label>Nom d'utilisateur *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ex: jdupont"
                    required
                    className="user-form-input"
                  />
                </div>

                <div className="user-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ex: jean.dupont@example.com"
                    required
                    className="user-form-input"
                  />
                </div>

                <div className="user-form-group">
                  <label>Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="user-form-select"
                  >
                    <option value="technicien">🔧 Technicien</option>
                    <option value="admin">🛡️ Administrateur</option>
                  </select>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  marginTop: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertCircle size={16} color="#f59e0b" />
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b', lineHeight: '1.4' }}>
                        <strong>Information importante:</strong> L'employé recevra un email avec ses identifiants et sera invité à changer son mot de passe lors de sa première connexion.
                      </p>
                      {modalMode === 'edit' && (
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#f59e0b', lineHeight: '1.4' }}>
                          Pour réinitialiser le mot de passe, demandez à l'utilisateur d'utiliser la fonction "Mot de passe oublié".
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="user-modal-footer">
                  <button type="button" className="user-btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="user-btn-primary">
                    {modalMode === 'create' ? 'Créer l\'Employé' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="user-delete-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-delete-modal-header">
                <div className="user-warning-icon">
                  <AlertCircle size={48} color="#ef4444" />
                </div>
                <h2>Confirmer la suppression</h2>
                <p className="user-delete-modal-text">
                  Êtes-vous sûr de vouloir supprimer l'employé <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong> ({deleteConfirm.username}) ?
                </p>
                <p className="user-delete-modal-warning">
                  Cette action est irréversible. Toutes les données associées seront définitivement supprimées.
                </p>
              </div>

              <div className="user-delete-modal-footer">
                <button 
                  type="button" 
                  className="user-btn-secondary" 
                  onClick={() => setDeleteConfirm(null)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="user-btn-danger" 
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

// Helper functions
const getStatusInfo = (status) => {
  switch (status) {
    case 'active':
      return { 
        icon: CheckCircle, 
        label: 'Actif', 
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)'
      };
    case 'inactive':
      return { 
        icon: AlertCircle, 
        label: 'Inactif', 
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      };
    default:
      return { 
        icon: AlertCircle, 
        label: 'Inconnu', 
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.1)'
      };
  }
};

const Info = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default AdminUsers;
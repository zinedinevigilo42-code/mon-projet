import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ChevronLeft,
  Save,
  Mail,
  Smartphone,
  Lock,
  Globe,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Key,
  Bell,
  Activity,
  Calendar,
  RefreshCw,
  AlertCircle,
  Trash2,
  History,
  HelpCircle,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../../../services/api';
import axios from 'axios';
import '../css/AccountSettings.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [passwordScore, setPasswordScore] = useState(0);
  
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    language: 'fr',
    timezone: 'Indian/Antananarivo',
    notifications: {
      email: true,
      push: true,
      marketing: false,
      security: true
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchActivityLog();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      
      // Récupérer les détails complets du profil via l'API
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get(`${API_BASE_URL}/users/${currentUser.id}/`, config);
      const userData = response.data;
      
      setProfileForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        language: userData.language || 'fr',
        timezone: userData.timezone || 'Indian/Antananarivo',
        notifications: userData.notifications || {
          email: true,
          push: true,
          marketing: false,
          security: true
        }
      });

      if (userData.profile_image) {
        setProfileImage(userData.profile_image);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const fetchActivityLog = async () => {
    try {
      // Simulation log d'activité
      const mockLogs = [
        { id: 1, action: 'Connexion', description: 'Connecté depuis Antananarivo', timestamp: new Date(Date.now() - 3600000), ip: '192.168.1.1' },
        { id: 2, action: 'Modification profil', description: 'Email mis à jour', timestamp: new Date(Date.now() - 86400000), ip: '192.168.1.1' },
        { id: 3, action: 'Changement mot de passe', description: 'Mot de passe modifié', timestamp: new Date(Date.now() - 172800000), ip: '192.168.1.1' },
        { id: 4, action: 'Création', description: 'Nouvel employé ajouté', timestamp: new Date(Date.now() - 259200000), ip: '192.168.1.1' },
        { id: 5, action: 'Déconnexion', description: 'Session terminée', timestamp: new Date(Date.now() - 604800000), ip: '192.168.1.1' }
      ];
      setActivityLog(mockLogs);
    } catch (error) {
      console.error('Erreur chargement activité:', error);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let feedback = '';
    
    if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    if (score <= 40) feedback = 'Faible';
    else if (score <= 60) feedback = 'Moyen';
    else if (score <= 80) feedback = 'Fort';
    else feedback = 'Très fort';
    
    return { score, feedback };
  };

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type, checked) => {
    setProfileForm(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked
      }
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'new_password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.current_password) {
      errors.current_password = 'Le mot de passe actuel est requis';
    }
    
    if (!passwordForm.new_password) {
      errors.new_password = 'Le nouveau mot de passe est requis';
    } else if (passwordForm.new_password.length < 8) {
      errors.new_password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (passwordStrength.score < 60) {
      errors.new_password = 'Le mot de passe est trop faible';
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Les mots de passe ne correspondent pas';
    }
    
    if (passwordForm.current_password === passwordForm.new_password) {
      errors.new_password = 'Le nouveau mot de passe doit être différent de l\'actuel';
    }
    
    return errors;
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const updateData = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        language: profileForm.language,
        timezone: profileForm.timezone,
        notifications: profileForm.notifications
      };
      
      await axios.put(`${API_BASE_URL}/users/${user.id}/`, updateData, config);
      
      // Mettre à jour l'image de profil si nécessaire
      if (profileImage && typeof profileImage !== 'string') {
        const formData = new FormData();
        formData.append('profile_image', profileImage);
        await axios.patch(`${API_BASE_URL}/users/${user.id}/upload-image/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      alert('Profil mis à jour avec succès!');
      
      // Rafraîchir les données utilisateur
      fetchUserData();
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setPasswordLoading(true);
    setPasswordErrors({});
    
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const passwordData = {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      };
      
      await axios.post(`${API_BASE_URL}/auth/change-password/`, passwordData, config);
      
      alert('Mot de passe changé avec succès!');
      
      // Réinitialiser le formulaire
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordStrength({ score: 0, feedback: '' });
      setPasswordErrors({});
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      const errorMsg = error.response?.data?.detail || 'Mot de passe actuel incorrect';
      setPasswordErrors({ current_password: errorMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir déconnecter toutes les sessions?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.post(`${API_BASE_URL}/auth/logout-all/`, {}, config);
      alert('Toutes les sessions ont été déconnectées');
    } catch (error) {
      console.error('Erreur déconnexion sessions:', error);
    }
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('ATTENTION: Cette action est irréversible. Toutes vos données seront définitivement supprimées. Êtes-vous absolument sûr?')) {
      return;
    }
    
    if (!window.prompt('Pour confirmer la suppression, tapez "SUPPRIMER MON COMPTE" ci-dessous:') === 'SUPPRIMER MON COMPTE') {
      alert('Suppression annulée');
      return;
    }
    
    // Logique de suppression ici
    alert('Fonctionnalité de suppression à implémenter');
  };

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Préférences', icon: Globe },
    { id: 'activity', label: 'Activité', icon: Activity },
    { id: 'danger', label: 'Zone dangereuse', icon: AlertCircle }
  ];

  const [activeSection, setActiveSection] = useState('profile');

  const getInitials = () => {
    return `${profileForm.first_name?.[0] || ''}${profileForm.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="account-settings-page">
      <header className="account-settings-header">
        <div className="account-settings-header-main">
          <div className="account-settings-header-left">
            <button 
              className="account-settings-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="account-settings-page-title">
              <div className="account-settings-title-icon">
                <User size={32} />
              </div>
              <div>
                <h1>Paramètres du Compte</h1>
                <p>Gérez votre profil et vos préférences</p>
              </div>
            </div>
          </div>
          
          <div className="account-settings-header-actions">
            <motion.button
              className="account-settings-header-btn account-settings-cancel-btn"
              onClick={() => navigate('/admin/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Annuler
            </motion.button>
            
            <motion.button
              className="account-settings-header-btn account-settings-save-btn"
              onClick={handleSaveProfile}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <RefreshCw size={18} className="spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="account-settings-content">
        <div className="account-settings-layout">
          {/* Sidebar Navigation */}
          <div className="account-settings-sidebar">
            <div className="user-profile-summary">
              <div className="profile-image-container">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    {getInitials() || <User size={32} />}
                  </div>
                )}
                <label className="image-upload-btn" title="Changer la photo">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden-file-input"
                  />
                </label>
                {profileImage && (
                  <button 
                    className="image-remove-btn"
                    onClick={handleRemoveImage}
                    title="Supprimer la photo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <div className="profile-info-summary">
                <h3>{profileForm.first_name} {profileForm.last_name}</h3>
                <p className="user-email">{profileForm.email}</p>
                <p className="user-role">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>Membre depuis {new Date(user?.date_joined).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="stat-item">
                  <Activity size={16} />
                  <span>Dernière activité: À l'instant</span>
                </div>
              </div>
            </div>
            
            <nav className="settings-nav">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon size={18} />
                  <span>{section.label}</span>
                  {section.id === 'danger' && <AlertCircle size={14} className="danger-icon" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="account-settings-main">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="section-title">
                  <User size={24} />
                  Informations du profil
                </h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => handleProfileChange('first_name', e.target.value)}
                      className="account-form-input"
                      placeholder="Votre prénom"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => handleProfileChange('last_name', e.target.value)}
                      className="account-form-input"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email *</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="account-form-input"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Téléphone</label>
                    <div className="input-with-icon">
                      <Smartphone size={18} />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="account-form-input"
                        placeholder="+261 34 00 000 00"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      className="account-form-textarea"
                      placeholder="Décrivez-vous en quelques mots..."
                      rows="4"
                    />
                  </div>
                </div>
                
                <div className="section-divider"></div>
                
                <div className="social-links-section">
                  <h3 className="subsection-title">Liens sociaux (optionnel)</h3>
                  <div className="social-links">
                    <div className="social-input">
                      <span className="social-prefix">linkedin.com/in/</span>
                      <input type="text" placeholder="votre-profil" className="account-form-input" />
                    </div>
                    <div className="social-input">
                      <span className="social-prefix">twitter.com/</span>
                      <input type="text" placeholder="votre-profil" className="account-form-input" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="section-title">
                  <Lock size={24} />
                  Sécurité du compte
                </h2>
                
                <div className="security-options">
                  <div className="security-item">
                    <div className="security-info">
                      <h4>Authentification à deux facteurs</h4>
                      <p>Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                    </div>
                    <div className="security-action">
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-info">
                      <h4>Déconnexion de toutes les sessions</h4>
                      <p>Déconnectez-vous de tous les appareils sauf celui-ci</p>
                    </div>
                    <div className="security-action">
                      <button 
                        className="secondary-btn"
                        onClick={handleLogoutAllSessions}
                      >
                        Déconnecter tout
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="section-divider"></div>
                
                <h3 className="subsection-title">Changer le mot de passe</h3>
                
                <div className="password-form">
                  <div className="form-group">
                    <label>Mot de passe actuel *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                        className={`account-form-input ${passwordErrors.current_password ? 'error' : ''}`}
                        placeholder="Votre mot de passe actuel"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.current_password && (
                      <div className="error-message">
                        <XCircle size={14} />
                        {passwordErrors.current_password}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Nouveau mot de passe *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new_password}
                        onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                        className={`account-form-input ${passwordErrors.new_password ? 'error' : ''}`}
                        placeholder="Minimum 8 caractères"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordForm.new_password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className="strength-fill"
                            style={{ width: `${passwordStrength.score}%` }}
                            data-strength={passwordStrength.feedback.toLowerCase()}
                          ></div>
                        </div>
                        <span className="strength-text">
                          Force: {passwordStrength.feedback}
                        </span>
                      </div>
                    )}
                    {passwordErrors.new_password && (
                      <div className="error-message">
                        <XCircle size={14} />
                        {passwordErrors.new_password}
                      </div>
                    )}
                    <div className="password-requirements">
                      <p>Le mot de passe doit contenir:</p>
                      <ul>
                        <li className={passwordForm.new_password.length >= 8 ? 'met' : ''}>
                          {passwordForm.new_password.length >= 8 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          Au moins 8 caractères
                        </li>
                        <li className={/[A-Z]/.test(passwordForm.new_password) ? 'met' : ''}>
                          {/[A-Z]/.test(passwordForm.new_password) ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          Une majuscule
                        </li>
                        <li className={/[0-9]/.test(passwordForm.new_password) ? 'met' : ''}>
                          {/[0-9]/.test(passwordForm.new_password) ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          Un chiffre
                        </li>
                        <li className={/[^A-Za-z0-9]/.test(passwordForm.new_password) ? 'met' : ''}>
                          {/[^A-Za-z0-9]/.test(passwordForm.new_password) ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          Un caractère spécial
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Confirmer le nouveau mot de passe *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirm_password}
                        onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                        className={`account-form-input ${passwordErrors.confirm_password ? 'error' : ''}`}
                        placeholder="Répétez le nouveau mot de passe"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.confirm_password && (
                      <div className="error-message">
                        <XCircle size={14} />
                        {passwordErrors.confirm_password}
                      </div>
                    )}
                  </div>
                  
                  <motion.button
                    className="primary-btn"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {passwordLoading ? (
                      <>
                        <RefreshCw size={18} className="spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Key size={18} />
                        Changer le mot de passe
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="section-title">
                  <Bell size={24} />
                  Préférences de notifications
                </h2>
                
                <div className="notification-settings">
                  <div className="notification-category">
                    <h3>Notifications par email</h3>
                    <div className="notification-options">
                      <label className="notification-item">
                        <div className="notification-info">
                          <h4>Notifications système</h4>
                          <p>Mises à jour importantes du système</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profileForm.notifications.email}
                            onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </label>
                      
                      <label className="notification-item">
                        <div className="notification-info">
                          <h4>Alertes de sécurité</h4>
                          <p>Connexions suspectes et changements de sécurité</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profileForm.notifications.security}
                            onChange={(e) => handleNotificationChange('security', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </label>
                      
                      <label className="notification-item">
                        <div className="notification-info">
                          <h4>Newsletter et offres</h4>
                          <p>Nouveautés et promotions</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profileForm.notifications.marketing}
                            onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </label>
                    </div>
                  </div>
                  
                  <div className="notification-category">
                    <h3>Notifications push</h3>
                    <div className="notification-options">
                      <label className="notification-item">
                        <div className="notification-info">
                          <h4>Notifications en temps réel</h4>
                          <p>Alertes immédiates sur l'appareil</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={profileForm.notifications.push}
                            onChange={(e) => handleNotificationChange('push', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="notification-preview">
                  <h3>Aperçu des notifications</h3>
                  <div className="preview-card">
                    <div className="preview-header">
                      <Bell size={16} />
                      <div>
                        <h4>Exemple de notification</h4>
                        <p>Il y a 2 minutes</p>
                      </div>
                    </div>
                    <p className="preview-content">
                      Votre mot de passe a été changé avec succès. Si vous n'êtes pas à l'origine de cette action, contactez le support immédiatement.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="section-title">
                  <Globe size={24} />
                  Préférences générales
                </h2>
                
                <div className="preferences-grid">
                  <div className="form-group">
                    <label>Langue</label>
                    <select
                      value={profileForm.language}
                      onChange={(e) => handleProfileChange('language', e.target.value)}
                      className="account-form-select"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="mg">Malagasy</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Fuseau horaire</label>
                    <select
                      value={profileForm.timezone}
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                      className="account-form-select"
                    >
                      <option value="Indian/Antananarivo">Antananarivo (GMT+3)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/Paris">Paris (GMT+1)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                    </select>
                  </div>
                </div>
                
                <div className="section-divider"></div>
                
                <div className="appearance-settings">
                  <h3 className="subsection-title">Apparence</h3>
                  <div className="theme-options">
                    <label className="theme-option">
                      <input type="radio" name="theme" value="light" />
                      <div className="theme-preview light">
                        <div className="preview-header"></div>
                        <div className="preview-content"></div>
                      </div>
                      <span>Clair</span>
                    </label>
                    
                    <label className="theme-option active">
                      <input type="radio" name="theme" value="dark" defaultChecked />
                      <div className="theme-preview dark">
                        <div className="preview-header"></div>
                        <div className="preview-content"></div>
                      </div>
                      <span>Sombre</span>
                    </label>
                    
                    <label className="theme-option">
                      <input type="radio" name="theme" value="auto" />
                      <div className="theme-preview auto">
                        <div className="preview-header"></div>
                        <div className="preview-content"></div>
                      </div>
                      <span>Automatique</span>
                    </label>
                  </div>
                </div>
                
                <div className="section-divider"></div>
                
                <div className="privacy-settings">
                  <h3 className="subsection-title">Confidentialité</h3>
                  <div className="privacy-options">
                    <label className="privacy-item">
                      <div className="privacy-info">
                        <h4>Profil public</h4>
                        <p>Rendre votre profil visible aux autres utilisateurs</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </label>
                    
                    <label className="privacy-item">
                      <div className="privacy-info">
                        <h4>Statut d'activité</h4>
                        <p>Afficher quand vous êtes en ligne</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Activity Section */}
            {activeSection === 'activity' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="section-title">
                  <Activity size={24} />
                  Activité récente
                </h2>
                
                <div className="activity-filters">
                  <div className="filter-group">
                    <select className="account-form-select">
                      <option>Toutes les activités</option>
                      <option>Connexions</option>
                      <option>Modifications</option>
                      <option>Sécurité</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <select className="account-form-select">
                      <option>30 derniers jours</option>
                      <option>7 derniers jours</option>
                      <option>24 heures</option>
                      <option>Tout l'historique</option>
                    </select>
                  </div>
                </div>
                
                <div className="activity-list">
                  {activityLog.map(log => (
                    <div key={log.id} className="activity-item">
                      <div className="activity-icon">
                        <Activity size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-header">
                          <h4>{log.action}</h4>
                          <span className="activity-time">
                            {new Date(log.timestamp).toLocaleDateString('fr-FR')} à {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="activity-description">{log.description}</p>
                        <div className="activity-meta">
                          <span className="activity-ip">IP: {log.ip}</span>
                          <span className="activity-location">Antananarivo, Madagascar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="activity-summary">
                  <div className="summary-item">
                    <h4>Activités ce mois</h4>
                    <p className="summary-value">{activityLog.length}</p>
                  </div>
                  <div className="summary-item">
                    <h4>Dernière activité</h4>
                    <p className="summary-value">À l'instant</p>
                  </div>
                  <div className="summary-item">
                    <h4>Pays le plus actif</h4>
                    <p className="summary-value">Madagascar</p>
                  </div>
                </div>
                
                <button className="secondary-btn full-width">
                  <History size={18} />
                  Voir l'historique complet
                </button>
              </motion.div>
            )}

            {/* Danger Zone Section */}
            {activeSection === 'danger' && (
              <motion.div
                className="settings-section danger-zone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="section-title">
                  <AlertCircle size={24} />
                  Zone dangereuse
                </h2>
                
                <div className="warning-banner">
                  <AlertCircle size={24} />
                  <div>
                    <h3>Attention</h3>
                    <p>Ces actions sont irréversibles. Veuillez agir avec prudence.</p>
                  </div>
                </div>
                
                <div className="danger-actions">
                  <div className="danger-action">
                    <div className="danger-info">
                      <h4>Supprimer le compte</h4>
                      <p>
                        Supprime définitivement votre compte, votre profil, vos données et toutes les informations associées.
                        Cette action ne peut pas être annulée.
                      </p>
                    </div>
                    <button
                      className="danger-btn delete-btn"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 size={18} />
                      Supprimer mon compte
                    </button>
                  </div>
                  
                  <div className="danger-action">
                    <div className="danger-info">
                      <h4>Exporter mes données</h4>
                      <p>
                        Téléchargez une copie de toutes vos données personnelles stockées dans notre système.
                      </p>
                    </div>
                    <button className="danger-btn export-btn">
                      <Download size={18} />
                      Exporter mes données
                    </button>
                  </div>
                  
                  <div className="danger-action">
                    <div className="danger-info">
                      <h4>Désactiver le compte</h4>
                      <p>
                        Désactive temporairement votre compte. Vous pourrez le réactiver plus tard.
                      </p>
                    </div>
                    <button className="danger-btn disable-btn">
                      Désactiver mon compte
                    </button>
                  </div>
                </div>
                
                <div className="danger-support">
                  <HelpCircle size={20} />
                  <div>
                    <h4>Besoin d'aide ?</h4>
                    <p>
                      Si vous avez des questions ou rencontrez des problèmes, contactez notre 
                      <a href="mailto:support@vibedrink.mg"> équipe de support</a> avant de prendre des actions irréversibles.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
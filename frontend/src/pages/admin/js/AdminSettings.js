import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  ChevronLeft,
  Save,
  Globe,
  Bell,
  Shield,
  Users,
  Database,
  Coffee,
  Lock,
  RefreshCw,
  AlertCircle,
  Moon,
  Sun,
  Mail,
  Smartphone,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../css/AdminSettings.css';
const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Application
    appName: 'VibeDrink Admin',
    appLogo: '',
    theme: 'dark',
    language: 'fr',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    salesAlerts: true,
    stockAlerts: true,
    maintenanceAlerts: true,
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipRestriction: false,
    
    // API
    apiEnabled: true,
    apiRateLimit: 100,
    
    // Système
    autoBackup: true,
    backupFrequency: 'daily',
    logsRetention: 30,
    
    // Paiement
    paymentEnabled: true,
    minAmount: 100,
    maxAmount: 100000
  });

  const sections = [
    {
      id: 'general',
      title: 'Général',
      icon: Settings,
      color: '#8b5cf6',
      fields: [
        { 
          type: 'text', 
          label: 'Nom de l\'application', 
          key: 'appName',
          placeholder: 'VibeDrink Admin'
        },
        { 
          type: 'select', 
          label: 'Thème', 
          key: 'theme',
          options: [
            { value: 'dark', label: 'Sombre' },
            { value: 'light', label: 'Clair' },
            { value: 'auto', label: 'Automatique' }
          ]
        },
        { 
          type: 'select', 
          label: 'Langue', 
          key: 'language',
          options: [
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'Anglais' },
            { value: 'mg', label: 'Malagasy' }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: '#3b82f6',
      fields: [
        { 
          type: 'checkbox', 
          label: 'Notifications par email', 
          key: 'emailNotifications',
          description: 'Recevoir les alertes par email'
        },
        { 
          type: 'checkbox', 
          label: 'Notifications push', 
          key: 'pushNotifications',
          description: 'Notifications en temps réel'
        },
        { 
          type: 'checkbox', 
          label: 'Alertes de ventes', 
          key: 'salesAlerts',
          description: 'Alertes pour ventes importantes'
        },
        { 
          type: 'checkbox', 
          label: 'Alertes de stock', 
          key: 'stockAlerts',
          description: 'Alertes stocks faibles'
        }
      ]
    },
    {
      id: 'security',
      title: 'Sécurité',
      icon: Shield,
      color: '#ef4444',
      fields: [
        { 
          type: 'checkbox', 
          label: 'Authentification à 2 facteurs', 
          key: 'twoFactorAuth',
          description: 'Sécurité renforcée'
        },
        { 
          type: 'number', 
          label: 'Timeout session (minutes)', 
          key: 'sessionTimeout',
          min: 5,
          max: 240
        },
        { 
          type: 'checkbox', 
          label: 'Restriction IP', 
          key: 'ipRestriction',
          description: 'Accès limité à certaines IP'
        }
      ]
    },
    {
      id: 'api',
      title: 'API & Intégrations',
      icon: Database,
      color: '#10b981',
      fields: [
        { 
          type: 'checkbox', 
          label: 'API activée', 
          key: 'apiEnabled',
          description: 'Activer l\'API REST'
        },
        { 
          type: 'number', 
          label: 'Limite de requêtes API', 
          key: 'apiRateLimit',
          description: 'Requêtes par heure',
          min: 10,
          max: 1000
        }
      ]
    },
    {
      id: 'system',
      title: 'Système',
      icon: RefreshCw,
      color: '#f59e0b',
      fields: [
        { 
          type: 'checkbox', 
          label: 'Sauvegarde automatique', 
          key: 'autoBackup',
          description: 'Sauvegardes automatiques'
        },
        { 
          type: 'select', 
          label: 'Fréquence sauvegarde', 
          key: 'backupFrequency',
          options: [
            { value: 'daily', label: 'Quotidienne' },
            { value: 'weekly', label: 'Hebdomadaire' },
            { value: 'monthly', label: 'Mensuelle' }
          ]
        },
        { 
          type: 'number', 
          label: 'Rétention logs (jours)', 
          key: 'logsRetention',
          min: 7,
          max: 365
        }
      ]
    },
    {
      id: 'payment',
      title: 'Paiements',
      icon: CreditCard,
      color: '#8b5cf6',
      fields: [
        { 
          type: 'checkbox', 
          label: 'Paiements activés', 
          key: 'paymentEnabled',
          description: 'Activer les paiements'
        },
        { 
          type: 'number', 
          label: 'Montant minimum (Ar)', 
          key: 'minAmount',
          min: 0,
          step: 100
        },
        { 
          type: 'number', 
          label: 'Montant maximum (Ar)', 
          key: 'maxAmount',
          min: 1000,
          step: 1000
        }
      ]
    }
  ];

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulation sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Paramètres sauvegardés avec succès!');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser tous les paramètres?')) {
      setSettings({
        appName: 'VibeDrink Admin',
        theme: 'dark',
        language: 'fr',
        emailNotifications: true,
        pushNotifications: true,
        salesAlerts: true,
        stockAlerts: true,
        twoFactorAuth: false,
        sessionTimeout: 30,
        ipRestriction: false,
        apiEnabled: true,
        apiRateLimit: 100,
        autoBackup: true,
        backupFrequency: 'daily',
        logsRetention: 30,
        paymentEnabled: true,
        minAmount: 100,
        maxAmount: 100000
      });
    }
  };

  return (
    <div className="settings-admin-page">
      <header className="settings-header">
        <div className="settings-header-main">
          <div className="settings-header-left">
            <button 
              className="settings-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="settings-page-title">
              <div className="settings-title-icon">
                <Settings size={32} />
              </div>
              <div>
                <h1>Paramètres Système</h1>
                <p>Configurez votre application VibeDrink</p>
              </div>
            </div>
          </div>
          
          <div className="settings-header-actions">
            <motion.button
              className="settings-header-btn settings-reset-btn"
              onClick={handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AlertCircle size={18} />
              Réinitialiser
            </motion.button>
            
            <motion.button
              className="settings-header-btn settings-save-btn"
              onClick={handleSave}
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

      <main className="settings-content">
        <div className="settings-grid">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              className="settings-section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <div className="settings-section-header">
                <div className="section-icon" style={{ backgroundColor: `${section.color}20` }}>
                  <section.icon size={20} style={{ color: section.color }} />
                </div>
                <h3>{section.title}</h3>
              </div>
              
              <div className="settings-fields">
                {section.fields.map((field, fieldIndex) => (
                  <div key={field.key} className="settings-field">
                    <label>
                      {field.label}
                      {field.description && (
                        <span className="field-description">{field.description}</span>
                      )}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={settings[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="settings-input"
                      />
                    )}
                    
                    {field.type === 'number' && (
                      <div className="number-input-wrapper">
                        <input
                          type="number"
                          value={settings[field.key]}
                          onChange={(e) => handleInputChange(field.key, parseInt(e.target.value))}
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          className="settings-input"
                        />
                        {field.unit && <span className="input-unit">{field.unit}</span>}
                      </div>
                    )}
                    
                    {field.type === 'select' && (
                      <select
                        value={settings[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="settings-select"
                      >
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'checkbox' && (
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          id={field.key}
                          checked={settings[field.key]}
                          onChange={(e) => handleInputChange(field.key, e.target.checked)}
                          className="settings-checkbox"
                        />
                        <label htmlFor={field.key} className="checkbox-label">
                          <span className="checkbox-custom"></span>
                          <span>{field.description}</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="settings-info-card">
          <div className="info-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="info-content">
            <h3>Sécurité et Confidentialité</h3>
            <p>
              Toutes vos données sont sécurisées et chiffrées. Les paramètres sont sauvegardés 
              automatiquement après chaque modification. Pour toute question concernant la 
              configuration, contactez l'administrateur système.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
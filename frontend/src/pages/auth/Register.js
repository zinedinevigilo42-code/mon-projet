import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Briefcase, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { register } from '../../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'client'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.first_name) {
      newErrors.first_name = 'Prénom requis';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'Minimum 2 caractères';
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Nom requis';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Minimum 2 caractères';
    }
    if (!formData.role) {
      newErrors.role = 'Rôle requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Nom d\'utilisateur requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 caractères';
    }
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }
    if (!formData.password2) {
      newErrors.password2 = 'Confirmez le mot de passe';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Les mots de passe ne correspondent pas';
    }
    if (!agreed) {
      newErrors.agreement = 'Vous devez accepter les conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { password2, ...registrationData } = formData;
      
      console.log('📤 Envoi des données:', registrationData);
      
      const response = await register(registrationData);
      
      console.log('✅ Inscription réussie:', response);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
      
    } catch (err) {
      console.error('❌ Erreur d\'inscription:', err);
      
      if (err.response?.data) {
        const backendErrors = {};
        const errorData = err.response.data;
        
        Object.keys(errorData).forEach(key => {
          const errorValue = errorData[key];
          
          if (Array.isArray(errorValue)) {
            backendErrors[key] = errorValue[0];
          } 
          else if (typeof errorValue === 'string') {
            backendErrors[key] = errorValue;
          } 
          else if (typeof errorValue === 'object' && errorValue !== null) {
            backendErrors[key] = Object.values(errorValue)[0];
          }
        });
        
        if (backendErrors.username) {
          if (backendErrors.username.includes('already exists') || 
              backendErrors.username.includes('A user with that username')) {
            backendErrors.username = 'Ce nom d\'utilisateur est déjà utilisé';
          }
        }
        
        if (backendErrors.email) {
          if (backendErrors.email.includes('already exists') ||
              backendErrors.email.includes('user with this email')) {
            backendErrors.email = 'Cet email est déjà utilisé';
          }
        }
        
        if (Object.keys(backendErrors).length === 0) {
          backendErrors.general = 'Une erreur est survenue lors de l\'inscription';
        }
        
        setErrors(backendErrors);
        
      } else if (err.message) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Erreur de connexion au serveur. Veuillez réessayer.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-background-gradient"></div>
        <div className="register-floating-elements">
          <motion.div 
            className="register-floating-circle register-circle-1"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="register-floating-circle register-circle-2"
            animate={{ 
              x: [0, -25, 0],
              y: [0, 15, 0],
              rotate: [0, -180, -360]
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <motion.div 
          className="register-success-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="register-success-card">
            <motion.div 
              className="register-success-icon-wrapper"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <CheckCircle size={80} />
              <div className="register-success-glow"></div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Bienvenue à bord !
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Votre compte a été créé avec succès.
            </motion.p>
            <motion.p 
              className="register-redirect-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Redirection vers la connexion...
            </motion.p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="register-loading-spinner" size={40} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <motion.div 
              className="register-step-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="register-step-title">Commençons par vos informations personnelles</h1>
              <p className="register-step-description">Ces informations nous aideront à personnaliser votre expérience</p>
            </motion.div>

            <div className="register-form-grid">
              <motion.div 
                className="register-input-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className={`register-input-container ${errors.first_name ? 'register-error' : ''}`}>
                  <User className="register-input-icon" size={20} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className="register-modern-input"
                  />
                </div>
                {errors.first_name && (
                  <span className="register-error-text">{errors.first_name}</span>
                )}
              </motion.div>

              <motion.div 
                className="register-input-field"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={`register-input-container ${errors.last_name ? 'register-error' : ''}`}>
                  <User className="register-input-icon" size={20} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="register-modern-input"
                  />
                </div>
                {errors.last_name && (
                  <span className="register-error-text">{errors.last_name}</span>
                )}
              </motion.div>
            </div>

            <motion.div 
              className="register-input-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`register-input-container ${errors.role ? 'register-error' : ''}`}>
                <Briefcase className="register-input-icon" size={20} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="register-modern-select"
                >
                  <option value="client">Client</option>
                  <option value="technicien">Technicien</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              {errors.role && (
                <span className="register-error-text">{errors.role}</span>
              )}
            </motion.div>
          </>
        );

      case 2:
        return (
          <>
            <motion.div 
              className="register-step-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="register-step-title">Créez vos identifiants</h1>
              <p className="register-step-description">Choisissez un nom d'utilisateur unique et fournissez votre email</p>
            </motion.div>

            <motion.div 
              className="register-input-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`register-input-container ${errors.username ? 'register-error' : ''}`}>
                <User className="register-input-icon" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nom d'utilisateur"
                  className="register-modern-input"
                />
              </div>
              {errors.username && (
                <span className="register-error-text">{errors.username}</span>
              )}
            </motion.div>

            <motion.div 
              className="register-input-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={`register-input-container ${errors.email ? 'register-error' : ''}`}>
                <Mail className="register-input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="register-modern-input"
                />
              </div>
              {errors.email && (
                <span className="register-error-text">{errors.email}</span>
              )}
            </motion.div>
          </>
        );

      case 3:
        return (
          <>
            <motion.div 
              className="register-step-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="register-step-title">Sécurisez votre compte</h1>
              <p className="register-step-description">Créez un mot de passe robuste pour protéger votre compte</p>
            </motion.div>

            <div className="register-form-grid">
              <motion.div 
                className="register-input-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className={`register-input-container ${errors.password ? 'register-error' : ''}`}>
                  <Lock className="register-input-icon" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                    className="register-modern-input"
                  />
                  <button 
                    type="button" 
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="register-error-text">{errors.password}</span>
                )}
              </motion.div>

              <motion.div 
                className="register-input-field"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className={`register-input-container ${errors.password2 ? 'register-error' : ''}`}>
                  <Lock className="register-input-icon" size={20} />
                  <input
                    type={showPassword2 ? "text" : "password"}
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
                    className="register-modern-input"
                  />
                  <button 
                    type="button" 
                    className="register-password-toggle"
                    onClick={() => setShowPassword2(!showPassword2)}
                  >
                    {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password2 && (
                  <span className="register-error-text">{errors.password2}</span>
                )}
              </motion.div>
            </div>

            <motion.div 
              className="register-agreement-field"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="register-checkbox-container">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="register-checkbox-input"
                />
                <span className="register-checkbox-custom"></span>
                <span className="register-agreement-text">
                  J'accepte les <Link to="/terms" className="register-terms-link">Conditions d'utilisation</Link> et la <Link to="/privacy" className="register-terms-link">Politique de confidentialité</Link>
                </span>
              </label>
              {errors.agreement && (
                <span className="register-error-text register-agreement-error">{errors.agreement}</span>
              )}
            </motion.div>
          </>
        );
    }
  };

  return (
    <div className="register-page">
      <div className="register-background-gradient"></div>
      <div className="register-floating-elements">
        <motion.div 
          className="register-floating-circle register-circle-1"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div 
          className="register-floating-circle register-circle-2"
          animate={{ 
            x: [0, -35, 0],
            y: [0, 25, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 30, repeat: Infinity }}
        />
        <motion.div 
          className="register-floating-circle register-circle-3"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -15, 0],
            rotate: [0, 120, 240, 360]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="register-wrapper">
        <motion.div 
          className="register-left-panel"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="register-drink-background">
            <div className="register-drink-overlay"></div>
          </div>
          
          <div className="register-content-overlay">
            <div className="register-brand-section">
              <motion.div 
                className="register-logo-wrapper"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Coffee className="register-logo-icon" size={48} />
                <div className="register-logo-sparkle">
                  <Sparkles size={16} />
                </div>
              </motion.div>
              <h1 className="register-brand-name">VibeDrink</h1>
              <p className="register-brand-tagline">La fraîcheur dans chaque gorgée</p>
            </div>

            <div className="register-benefits-list">
              <div className="register-benefit-item">
                <div className="register-benefit-icon">✓</div>
                <span>Accès à toutes nos boissons</span>
              </div>
              <div className="register-benefit-item">
                <div className="register-benefit-icon">✓</div>
                <span>Commandes personnalisées</span>
              </div>
              <div className="register-benefit-item">
                <div className="register-benefit-icon">✓</div>
                <span>Livraison rapide</span>
              </div>
              <div className="register-benefit-item">
                <div className="register-benefit-icon">✓</div>
                <span>Promotions exclusives</span>
              </div>
            </div>

            <div className="register-progress-info">
              <p className="register-step-indicator">Étape {step} sur 3</p>
              <div className="register-progress-bar">
                <motion.div 
                  className="register-progress-fill"
                  initial={{ width: `${(step - 1) * 33.33}%` }}
                  animate={{ width: `${(step - 1) * 33.33}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="register-navigation-hint">
              <div className="register-hint-content">
                <ChevronLeft size={16} />
                <span>Informations personnelles</span>
              </div>
              <div className="register-hint-content">
                <span>Identifiants</span>
                <ChevronRight size={16} />
              </div>
              <div className="register-hint-content">
                <span>Sécurité</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="register-right-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="register-form-container">
            <form onSubmit={handleSubmit} className="register-form">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {errors.general && (
                <motion.div 
                  className="register-error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <AlertCircle size={20} />
                  <span>{errors.general}</span>
                </motion.div>
              )}

              <div className="register-form-actions">
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="register-secondary-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ChevronLeft size={20} />
                    Retour
                  </motion.button>
                )}
                
                {step < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="register-primary-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continuer
                    <ChevronRight size={20} />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="register-submit-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 size={20} />
                        </motion.div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <ChevronRight size={20} />
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              <p className="register-login-link">
                Déjà un compte ?{" "}
                <Link to="/login" className="register-login-text">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
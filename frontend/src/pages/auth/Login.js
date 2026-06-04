import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, User, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username.trim()) {
      setError('Nom d\'utilisateur requis');
      return;
    }

    if (!formData.password) {
      setError('Mot de passe requis');
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData);
      
      // Les tokens sont déjà stockés dans la fonction login() du service api.js
      // Redirection selon le rôle
      const userRole = response.user.role;
      
      switch(userRole) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'technicien':
          navigate('/technicien/dashboard');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      } else if (err.response?.status === 400) {
        setError('Veuillez remplir tous les champs correctement');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-gradient"></div>
      <div className="login-floating-elements">
        <motion.div 
          className="login-floating-circle login-circle-1"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div 
          className="login-floating-circle login-circle-2"
          animate={{ 
            x: [0, -35, 0],
            y: [0, 25, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 30, repeat: Infinity }}
        />
        <motion.div 
          className="login-floating-circle login-circle-3"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -15, 0],
            rotate: [0, 120, 240, 360]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="login-wrapper">
        <motion.div 
          className="login-left-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="login-drink-background">
            <div className="login-drink-overlay"></div>
          </div>
          
          <div className="login-content-overlay">
            <div className="login-brand-section">
              <motion.div 
                className="login-logo-wrapper"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Coffee className="login-logo-icon" size={36} />
                <div className="login-logo-sparkle">
                  <Sparkles size={12} />
                </div>
              </motion.div>
              <h1 className="login-brand-name">VibeDrink</h1>
              <p className="login-brand-tagline">Reconnectez-vous à votre univers</p>
            </div>

            <div className="login-welcome-message">
              <h2>Bienvenue de retour !</h2>
              <p>Accédez à votre espace personnel et gérez vos commandes</p>
            </div>

            <div className="login-benefits-list">
              <div className="login-benefit-item">
                <div className="login-benefit-icon">✓</div>
                <span>Gérez vos commandes</span>
              </div>
              <div className="login-benefit-item">
                <div className="login-benefit-icon">✓</div>
                <span>Suivez vos livraisons</span>
              </div>
              <div className="login-benefit-item">
                <div className="login-benefit-icon">✓</div>
                <span>Accédez à l'historique</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="login-right-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="login-form-container">
            <div className="login-form-header">
              <h1 className="login-form-title">Connexion</h1>
              <p className="login-form-subtitle">Entrez vos identifiants pour accéder à votre compte</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="login-error-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                className="login-input-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`login-input-container ${focused.username || formData.username ? 'login-focused' : ''} ${error && !formData.username ? 'login-error' : ''}`}>
                  <User className="login-input-icon" size={18} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocused({ ...focused, username: true })}
                    onBlur={() => setFocused({ ...focused, username: false })}
                    placeholder="Nom d'utilisateur ou email"
                    className="login-modern-input"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="login-input-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className={`login-input-container ${focused.password || formData.password ? 'login-focused' : ''} ${error && !formData.password ? 'login-error' : ''}`}>
                  <Lock className="login-input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused({ ...focused, password: true })}
                    onBlur={() => setFocused({ ...focused, password: false })}
                    placeholder="Mot de passe"
                    className="login-modern-input"
                  />
                  <button 
                    type="button" 
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <div className="login-form-options">
                <label className="login-remember-me">
                  <input type="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="login-forgot-password">
                  Mot de passe oublié ?
                </Link>
              </div>

              <motion.button
                type="submit"
                className="login-submit-button"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={16} />
                    </motion.div>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

              <div className="login-divider">
                <span>Ou</span>
              </div>

              <p className="login-register-link">
                Pas encore de compte ?{" "}
                <Link to="/register" className="login-register-text">
                  Créer un compte
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
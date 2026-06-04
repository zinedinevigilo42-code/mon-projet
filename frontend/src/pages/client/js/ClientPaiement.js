import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ChevronLeft,
  Plus,
  Smartphone,
  Wallet,
  CheckCircle,
  Edit2,
  Trash2,
  Shield,
  Lock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../css/ClientPaiement.css';

const ClientPaiement = () => {
  const navigate = useNavigate();
  
  // Méthodes de paiement simulées
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'carte',
      label: 'Carte Bancaire',
      number: '**** **** **** 1234',
      expiry: '12/25',
      holderName: 'Jean Dupont',
      isDefault: true,
      addedDate: '2023-10-15'
    },
    {
      id: 2,
      type: 'mobile_money',
      label: 'Mobile Money',
      number: '+261 34 12 345 67',
      provider: 'Orange Money',
      isDefault: false,
      addedDate: '2023-11-20'
    },
    {
      id: 3,
      type: 'cash_simulation',
      label: 'Cash (Portefeuille)',
      balance: '25 000',
      isDefault: false,
      addedDate: '2023-12-01'
    }
  ]);

  const getMethodIcon = (type) => {
    switch (type) {
      case 'carte':
        return CreditCard;
      case 'mobile_money':
        return Smartphone;
      case 'cash_simulation':
        return Wallet;
      default:
        return CreditCard;
    }
  };

  const getMethodColor = (type) => {
    switch (type) {
      case 'carte':
        return '#3b82f6';
      case 'mobile_money':
        return '#10b981';
      case 'cash_simulation':
        return '#f59e0b';
      default:
        return '#8b5cf6';
    }
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(methods =>
      methods.map(m => ({
        ...m,
        isDefault: m.id === id
      }))
    );
  };

  const handleDelete = (id) => {
    const methodToDelete = paymentMethods.find(m => m.id === id);
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${methodToDelete?.label} ?`)) {
      return;
    }
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
  };

  const handleAddMethod = () => {
    const newMethod = {
      id: Date.now(),
      type: 'carte',
      label: 'Nouvelle Carte',
      number: '**** **** **** 9999',
      expiry: '12/27',
      holderName: 'Nouveau Titulaire',
      isDefault: false,
      addedDate: new Date().toISOString().split('T')[0]
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const handleEditMethod = (id) => {
    const method = paymentMethods.find(m => m.id === id);
    alert(`Édition de ${method.label} - Fonctionnalité complète à implémenter`);
  };

  return (
    <div className="cp-page">
      {/* Header */}
      <header className="cp-header">
        <button className="cp-back-btn" onClick={() => navigate('/client/dashboard')}>
          <ChevronLeft size={20} />
          <span>Retour au tableau de bord</span>
        </button>
        
        <div className="cp-header-content">
          <div className="cp-header-main">
            <div className="cp-header-icon">
              <CreditCard size={32} />
            </div>
            <div className="cp-header-text">
              <h1 className="cp-title">Moyens de Paiement</h1>
              <p className="cp-subtitle">Gérez vos méthodes de paiement sécurisées</p>
            </div>
          </div>

          <div className="cp-header-actions">
            <motion.button 
              className="cp-action-btn cp-action-primary"
              onClick={handleAddMethod}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>Ajouter un moyen</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="cp-container">
        {/* Security Info */}
        <motion.div
          className="cp-security-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="cp-security-icon">
            <Shield size={24} />
          </div>
          <div className="cp-security-content">
            <h3>Paiements 100% Sécurisés</h3>
            <p>
              Vos informations de paiement sont chiffrées et protégées. 
              Nous ne stockons jamais votre code CVV.
            </p>
          </div>
          <div className="cp-security-features">
            <span className="cp-feature">
              <Lock size={14} />
              Chiffrement SSL
            </span>
            <span className="cp-feature">
              <Shield size={14} />
              Protection des données
            </span>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <div className="cp-payment-methods">
          <div className="cp-section-header">
            <h2>Vos moyens de paiement</h2>
            <span className="cp-count-badge">
              {paymentMethods.length} moyen{paymentMethods.length > 1 ? 's' : ''}
            </span>
          </div>

          {paymentMethods.length === 0 ? (
            <motion.div
              className="cp-empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="cp-empty-icon">
                <CreditCard size={64} />
              </div>
              <h3>Aucun moyen de paiement enregistré</h3>
              <p>Ajoutez votre première méthode de paiement pour faciliter vos achats</p>
              <motion.button
                className="cp-add-method-btn"
                onClick={handleAddMethod}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                <span>Ajouter un moyen de paiement</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="cp-methods-grid">
              {paymentMethods.map((method, index) => {
                const MethodIcon = getMethodIcon(method.type);
                const color = getMethodColor(method.type);

                return (
                  <motion.div
                    key={method.id}
                    className={`cp-method-card ${method.isDefault ? 'cp-method-default' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    {/* Card Header */}
                    <div className="cp-method-header">
                      <div className="cp-method-icon" style={{ backgroundColor: `${color}15` }}>
                        <MethodIcon size={24} style={{ color }} />
                      </div>
                      <div className="cp-method-title">
                        <h3>{method.label}</h3>
                        {method.isDefault && (
                          <span className="cp-default-badge">
                            <CheckCircle size={12} />
                            Par défaut
                          </span>
                        )}
                      </div>
                      <div className="cp-method-actions">
                        <button
                          className="cp-action-icon cp-edit-btn"
                          onClick={() => handleEditMethod(method.id)}
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="cp-action-icon cp-delete-btn"
                          onClick={() => handleDelete(method.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="cp-method-body">
                      <div className="cp-method-info">
                        <div className="cp-info-item">
                          <span className="cp-info-label">Numéro</span>
                          <span className="cp-info-value cp-number">{method.number}</span>
                        </div>
                        
                        {method.expiry && (
                          <div className="cp-info-item">
                            <span className="cp-info-label">Expiration</span>
                            <span className="cp-info-value">{method.expiry}</span>
                          </div>
                        )}

                        {method.holderName && (
                          <div className="cp-info-item">
                            <span className="cp-info-label">Titulaire</span>
                            <span className="cp-info-value">{method.holderName}</span>
                          </div>
                        )}

                        {method.provider && (
                          <div className="cp-info-item">
                            <span className="cp-info-label">Fournisseur</span>
                            <span className="cp-info-value">{method.provider}</span>
                          </div>
                        )}

                        {method.balance && (
                          <div className="cp-info-item">
                            <span className="cp-info-label">Solde</span>
                            <span className="cp-info-value cp-balance">{method.balance} Ar</span>
                          </div>
                        )}

                        <div className="cp-info-item">
                          <span className="cp-info-label">Ajoutée le</span>
                          <span className="cp-info-value">{method.addedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="cp-method-footer">
                      {!method.isDefault && (
                        <motion.button
                          className="cp-set-default-btn"
                          onClick={() => handleSetDefault(method.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle size={16} />
                          <span>Définir par défaut</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Methods */}
        <motion.div
          className="cp-available-methods"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="cp-section-header">
            <h2>Méthodes de paiement acceptées</h2>
          </div>
          
          <div className="cp-methods-list">
            <div className="cp-method-item">
              <div className="cp-method-item-icon" style={{ backgroundColor: '#dbeafe' }}>
                <CreditCard size={24} color="#3b82f6" />
              </div>
              <div className="cp-method-item-content">
                <h4>Carte Bancaire</h4>
                <p>Visa, Mastercard, American Express - Paiement instantané sécurisé</p>
              </div>
            </div>
            
            <div className="cp-method-item">
              <div className="cp-method-item-icon" style={{ backgroundColor: '#dcfce7' }}>
                <Smartphone size={24} color="#10b981" />
              </div>
              <div className="cp-method-item-content">
                <h4>Mobile Money</h4>
                <p>Orange Money, MVola, Airtel Money - Transfert mobile instantané</p>
              </div>
            </div>
            
            <div className="cp-method-item">
              <div className="cp-method-item-icon" style={{ backgroundColor: '#fef3c7' }}>
                <Wallet size={24} color="#f59e0b" />
              </div>
              <div className="cp-method-item-content">
                <h4>Cash (Simulation)</h4>
                <p>Paiement en espèces directement à la machine - Simulation pour test</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          className="cp-security-note"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AlertCircle size={20} color="#f59e0b" />
          <div className="cp-note-content">
            <h4>Conseils de sécurité</h4>
            <p>
              • Ne partagez jamais vos codes de sécurité (CVV)<br />
              • Vérifiez toujours l'adresse URL avant de saisir vos informations<br />
              • Signalez immédiatement toute activité suspecte
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientPaiement;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  ChevronLeft,
  Coffee,
  Monitor,
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle,
  Loader2,
  Star,
  AlertTriangle,
  Package,
  PartyPopper,
  Plus,
  Minus,
  MapPin,
  Info,
  Shield,
  Sparkles,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/ClientAcheter.css';
import { getMachines, getBoissons, getStocks, createTransaction, getCurrentUser } from '../../../services/api';

const ClientAcheter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  
  const [machines, setMachines] = useState([]);
  const [boissons, setBoissons] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedBoisson, setSelectedBoisson] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('carte');
  const [quantity, setQuantity] = useState(1);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.machineId && machines.length > 0) {
      const machine = machines.find(m => m.id === location.state.machineId);
      if (machine) {
        setSelectedMachine(machine);
        setActiveStep(2);
      }
    }
  }, [location.state, machines]);

  useEffect(() => {
    if (selectedMachine && selectedBoisson) {
      const availableBoissons = getAvailableBoissons();
      const boissonStillAvailable = availableBoissons.find(b => b.id === selectedBoisson.id);
      
      if (!boissonStillAvailable) {
        setSelectedBoisson(null);
        setQuantity(1);
      } else if (boissonStillAvailable.stock_restante !== selectedBoisson.stock_restante) {
        setSelectedBoisson(boissonStillAvailable);
        if (quantity > boissonStillAvailable.stock_restante) {
          setQuantity(boissonStillAvailable.stock_restante);
        }
      }
    }
  }, [stocks, selectedMachine]);

  const handleSelectBoisson = (boisson) => {
    setSelectedBoisson(boisson);
    setQuantity(1);
    setActiveStep(3);
  };

  const fetchData = async () => {
    try {
      const [machinesData, boissonsData, stocksData] = await Promise.all([
        getMachines(),
        getBoissons({ active: 'true' }),
        getStocks()
      ]);
      
      const activeMachines = machinesData.filter(m => m.status === 'active');
      
      setMachines(activeMachines);
      setBoissons(boissonsData);
      setStocks(stocksData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  const getAvailableBoissons = useCallback(() => {
    if (!selectedMachine) return [];

    const machineStocks = stocks.filter(
      s => s.machine === selectedMachine.id && s.stock_restante > 0
    );

    return machineStocks.map(stock => {
      const boisson = boissons.find(b => b.id === stock.boisson.id);
      return boisson ? {
        ...boisson,
        stock_restante: stock.stock_restante,
        rating: boisson.rating || 4.2 + Math.random() * 0.6,
        popularity: Math.floor(Math.random() * 100) + 50
      } : null;
    }).filter(b => b);
  }, [selectedMachine, stocks, boissons]);

  const handlePurchase = async () => {
    if (!selectedMachine || !selectedBoisson || !selectedPayment) {
      alert('Veuillez sélectionner une machine, une boisson et un moyen de paiement');
      return;
    }

    if (quantity < 1) {
      alert('La quantité doit être au moins 1');
      return;
    }

    if (quantity > selectedBoisson.stock_restante) {
      alert(`Stock insuffisant. Il ne reste que ${selectedBoisson.stock_restante} unité(s)`);
      return;
    }

    setProcessing(true);

    try {
      const transactions = [];
      for (let i = 0; i < quantity; i++) {
        const transactionData = {
          machine: selectedMachine.id,
          boisson: selectedBoisson.id,
          montant: selectedBoisson.prix,
          moyen_paiement: selectedPayment,
          statut: 'success'
        };
        transactions.push(createTransaction(transactionData));
      }

      await Promise.all(transactions);
      await fetchData();
      
      setShowSuccess(true);
      setActiveStep(5);
      
      setTimeout(() => {
        navigate('/client/historique');
      }, 5000);
      
    } catch (error) {
      console.error('Erreur transaction:', error);
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
      setProcessing(false);
    }
  };

  const handleNewOrder = () => {
    setShowSuccess(false);
    setProcessing(false);
    setSelectedBoisson(null);
    setSelectedMachine(null);
    setQuantity(1);
    setActiveStep(1);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Épuisé', color: '#ef4444', badge: true };
    if (stock <= 5) return { label: 'Stock Limité', color: '#f59e0b', badge: true };
    return { label: 'Disponible', color: '#10b981', badge: false };
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        stroke={i < Math.floor(rating) ? '#fbbf24' : '#d1d5db'}
      />
    ));
  };

  const paymentMethods = [
    { id: 'carte', label: 'Carte Bancaire', icon: CreditCard, color: '#3b82f6', description: 'Paiement sécurisé par carte' },
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: '#10b981', description: 'Paiement via Orange Money ou MVola' },
    { id: 'cash_simulation', label: 'Cash (Simulation)', icon: Wallet, color: '#f59e0b', description: 'Paiement en espèces - simulation' }
  ];

  const availableBoissons = getAvailableBoissons();

  const steps = [
    { number: 1, title: 'Choisir une machine', active: activeStep >= 1, completed: selectedMachine !== null },
    { number: 2, title: 'Sélectionner une boisson', active: activeStep >= 2, completed: selectedBoisson !== null },
    { number: 3, title: 'Moyen de paiement', active: activeStep >= 3, completed: selectedPayment !== null },
    { number: 4, title: 'Confirmer la commande', active: activeStep >= 4, completed: false },
  ];

  if (showSuccess) {
    return (
      <div className="ca-page">
        <header className="ca-header">
          <button className="ca-back-btn" onClick={handleNewOrder}>
            <ChevronLeft size={20} />
            <span>Retour au tableau de bord</span>
          </button>
          
          <div className="ca-header-content">
            <div className="ca-header-main">
              <div className="ca-header-icon">
                <CheckCircle size={32} />
              </div>
              <div className="ca-header-text">
                <h1 className="ca-title">Commande Confirmée !</h1>
                <p className="ca-subtitle">Votre achat a été réalisé avec succès</p>
              </div>
            </div>
          </div>
        </header>

        <div className="ca-success-container">
          <motion.div
            className="ca-success-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="ca-success-animation">
              <div className="ca-success-circle">
                <CheckCircle size={64} />
              </div>
              <div className="ca-confetti">
                <PartyPopper className="ca-confetti-left" size={32} />
                <PartyPopper className="ca-confetti-right" size={32} />
                <Sparkles className="ca-confetti-top" size={24} />
                <Sparkles className="ca-confetti-bottom" size={24} />
              </div>
            </div>
            
            <h2 className="ca-success-title">Merci pour votre achat ! 🎉</h2>
            <p className="ca-success-message">
              Votre commande a été enregistrée et sera préparée immédiatement
            </p>

            {/* Récapitulatif */}
            <div className="ca-order-summary">
              <div className="ca-summary-header">
                <h3>Récapitulatif de commande</h3>
                <span className="ca-order-id">#ORD{Date.now().toString().slice(-6)}</span>
              </div>
              
              <div className="ca-summary-content">
                <div className="ca-summary-item">
                  <div className="ca-summary-label">
                    <Coffee size={16} />
                    <span>Boisson</span>
                  </div>
                  <div className="ca-summary-value">
                    <span className="ca-summary-name">{selectedBoisson?.nom}</span>
                    <span className="ca-summary-quantity">{quantity} unité{quantity > 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="ca-summary-item">
                  <div className="ca-summary-label">
                    <Monitor size={16} />
                    <span>Machine</span>
                  </div>
                  <div className="ca-summary-value">
                    <span className="ca-summary-machine-name">{selectedMachine?.nom}</span>
                    <span className="ca-summary-machine-location">
                      <MapPin size={12} />
                      {selectedMachine?.localisation}
                    </span>
                  </div>
                </div>
                
                <div className="ca-summary-item">
                  <div className="ca-summary-label">
                    <CreditCard size={16} />
                    <span>Paiement</span>
                  </div>
                  <div className="ca-summary-value">
                    <span className="ca-summary-payment">
                      {paymentMethods.find(p => p.id === selectedPayment)?.label}
                    </span>
                    <span className="ca-summary-payment-status">
                      <Shield size={12} />
                      Paiement confirmé
                    </span>
                  </div>
                </div>
                
                <div className="ca-summary-divider"></div>
                
                <div className="ca-summary-total">
                  <div className="ca-total-label">
                    <span>Total</span>
                    <span className="ca-total-description">TVA incluse</span>
                  </div>
                  <div className="ca-total-amount">
                    {(parseFloat(selectedBoisson?.prix) * quantity).toFixed(2)} Ar
                  </div>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="ca-success-info">
              <div className="ca-info-item">
                <Clock size={16} />
                <span>Préparation estimée : {selectedBoisson?.preparation_time || 5} minutes</span>
              </div>
              <div className="ca-info-item">
                <Info size={16} />
                <span>Le code de retrait vous sera envoyé par SMS</span>
              </div>
            </div>

            {/* Redirection */}
            <div className="ca-redirect-info">
              <Loader2 className="ca-spinning-loader" size={20} />
              <span>Redirection automatique vers l'historique dans 5 secondes...</span>
            </div>

            {/* Actions */}
            <div className="ca-success-actions">
              <motion.button
                className="ca-action-btn ca-action-primary"
                onClick={handleNewOrder}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingBag size={18} />
                <span>Nouvelle commande</span>
              </motion.button>
              
              <motion.button
                className="ca-action-btn ca-action-secondary"
                onClick={() => navigate('/client/historique')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Voir l'historique</span>
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-page">
      <header className="ca-header">
        <button className="ca-back-btn" onClick={() => navigate('/client/dashboard')}>
          <ChevronLeft size={20} />
          <span>Retour au tableau de bord</span>
        </button>
        
        <div className="ca-header-content">
          <div className="ca-header-main">
            <div className="ca-header-icon">
              <ShoppingBag size={32} />
            </div>
            <div className="ca-header-text">
              <h1 className="ca-title">Acheter une Boisson</h1>
              <p className="ca-subtitle">Choisissez et commandez votre boisson préférée</p>
            </div>
          </div>
        </div>
      </header>

      {/* Steps Progress */}
      <div className="ca-steps-progress">
        {steps.map((step) => (
          <div key={step.number} className={`ca-step ${step.active ? 'ca-step-active' : ''} ${step.completed ? 'ca-step-completed' : ''}`}>
            <div className="ca-step-circle">
              {step.completed ? <CheckCircle size={16} /> : step.number}
            </div>
            <span className="ca-step-title">{step.title}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="ca-loading">
          <div className="ca-loading-spinner"></div>
          <p className="ca-loading-text">Chargement des données...</p>
        </div>
      ) : (
        <div className="ca-purchase-container">
          {/* Étape 1: Sélection Machine */}
          <motion.div
            className={`ca-purchase-step ${activeStep >= 1 ? 'ca-step-active' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="ca-step-header">
              <div className="ca-step-number">1</div>
              <div className="ca-step-info">
                <h3 className="ca-step-title">Choisissez une Machine</h3>
                <p className="ca-step-subtitle">{machines.length} machine(s) disponible(s)</p>
              </div>
            </div>

            <div className="ca-machines-grid">
              {machines.map((machine) => (
                <motion.div
                  key={machine.id}
                  className={`ca-machine-card ${selectedMachine?.id === machine.id ? 'ca-card-selected' : ''}`}
                  onClick={() => {
                    setSelectedMachine(machine);
                    setActiveStep(2);
                  }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="ca-machine-icon">
                    <Monitor size={24} />
                  </div>
                  <div className="ca-machine-content">
                    <h4 className="ca-machine-name">{machine.nom}</h4>
                    <div className="ca-machine-location">
                      <MapPin size={14} />
                      <span>{machine.localisation}</span>
                    </div>
                    <div className="ca-machine-status">
                      <CheckCircle size={12} />
                      <span>Disponible</span>
                    </div>
                  </div>
                  <div className="ca-machine-selector">
                    {selectedMachine?.id === machine.id ? (
                      <CheckCircle size={20} className="ca-check-icon" />
                    ) : (
                      <div className="ca-select-indicator"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Étape 2: Sélection Boisson */}
          {selectedMachine && (
            <motion.div
              className={`ca-purchase-step ${activeStep >= 2 ? 'ca-step-active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="ca-step-header">
                <div className="ca-step-number">2</div>
                <div className="ca-step-info">
                  <h3 className="ca-step-title">Choisissez votre Boisson</h3>
                  <p className="ca-step-subtitle">
                    {availableBoissons.length} boisson(s) disponible(s) dans cette machine
                  </p>
                </div>
              </div>

              <div className="ca-boissons-grid">
                {availableBoissons.length === 0 ? (
                  <div className="ca-empty-state">
                    <Coffee size={48} />
                    <h4>Aucune boisson disponible</h4>
                    <p>Cette machine est actuellement en réapprovisionnement</p>
                  </div>
                ) : (
                  availableBoissons.map((boisson) => {
                    const stockStatus = getStockStatus(boisson.stock_restante);
                    return (
                      <motion.div
                        key={boisson.id}
                        className={`ca-boisson-card ${selectedBoisson?.id === boisson.id ? 'ca-card-selected' : ''}`}
                        onClick={() => handleSelectBoisson(boisson)}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Header avec badges */}
                        <div className="ca-boisson-header">
                          <div className="ca-boisson-category">{boisson.category}</div>
                          {boisson.on_promotion && (
                            <div className="ca-boisson-promo">
                              <span>-{boisson.promotion_percent}%</span>
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        <div className="ca-boisson-image">
                          {boisson.image_url ? (
                            <img src={boisson.image_url} alt={boisson.nom} className="ca-boisson-img" />
                          ) : (
                            <div className="ca-boisson-placeholder">
                              <Coffee size={32} />
                            </div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="ca-boisson-content">
                          <h4 className="ca-boisson-name">{boisson.nom}</h4>
                          
                          {boisson.description && (
                            <p className="ca-boisson-description">{boisson.description}</p>
                          )}

                          {/* Rating et popularité */}
                          <div className="ca-boisson-meta">
                            <div className="ca-boisson-rating">
                              <div className="ca-stars">
                                {renderStars(boisson.rating)}
                              </div>
                              <span className="ca-rating-value">{boisson.rating.toFixed(1)}</span>
                            </div>
                            <div className="ca-boisson-popularity">
                              <Sparkles size={12} />
                              <span>{boisson.popularity} ventes</span>
                            </div>
                          </div>

                          {/* Prix */}
                          <div className="ca-boisson-price">
                            {boisson.on_promotion ? (
                              <>
                                <span className="ca-price-old">{parseFloat(boisson.prix).toFixed(2)} Ar</span>
                                <span className="ca-price-new">{parseFloat(boisson.prix_promotion).toFixed(2)} Ar</span>
                              </>
                            ) : (
                              <span className="ca-price-current">{parseFloat(boisson.prix).toFixed(2)} Ar</span>
                            )}
                          </div>

                          {/* Stock */}
                          <div className="ca-boisson-stock" style={{ color: stockStatus.color }}>
                            <Package size={14} />
                            <span>{boisson.stock_restante} unité{boisson.stock_restante > 1 ? 's' : ''} disponible{boisson.stock_restante > 1 ? 's' : ''}</span>
                            {stockStatus.badge && (
                              <span className="ca-stock-badge" style={{ backgroundColor: stockStatus.color }}>
                                {stockStatus.label}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Overlay sélection */}
                        {selectedBoisson?.id === boisson.id && (
                          <div className="ca-selected-overlay">
                            <CheckCircle size={24} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* Étape 3: Paiement */}
          {selectedBoisson && (
            <motion.div
              className={`ca-purchase-step ${activeStep >= 3 ? 'ca-step-active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="ca-step-header">
                <div className="ca-step-number">3</div>
                <div className="ca-step-info">
                  <h3 className="ca-step-title">Moyen de Paiement</h3>
                  <p className="ca-step-subtitle">Choisissez comment vous souhaitez payer</p>
                </div>
              </div>

              <div className="ca-payment-grid">
                {paymentMethods.map((method) => {
                  const PaymentIcon = method.icon;
                  return (
                    <motion.div
                      key={method.id}
                      className={`ca-payment-card ${selectedPayment === method.id ? 'ca-card-selected' : ''}`}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setActiveStep(4);
                      }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="ca-payment-icon" style={{ backgroundColor: `${method.color}15` }}>
                        <PaymentIcon size={24} style={{ color: method.color }} />
                      </div>
                      <div className="ca-payment-content">
                        <h4 className="ca-payment-name">{method.label}</h4>
                        <p className="ca-payment-description">{method.description}</p>
                      </div>
                      <div className="ca-payment-selector">
                        {selectedPayment === method.id ? (
                          <CheckCircle size={20} className="ca-check-icon" />
                        ) : (
                          <div className="ca-select-indicator"></div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Étape 4: Quantité et Confirmation */}
          {selectedBoisson && selectedPayment && (
            <motion.div
              className={`ca-purchase-step ${activeStep >= 4 ? 'ca-step-active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="ca-step-header">
                <div className="ca-step-number">4</div>
                <div className="ca-step-info">
                  <h3 className="ca-step-title">Quantité et Confirmation</h3>
                  <p className="ca-step-subtitle">Finalisez votre commande</p>
                </div>
              </div>

              <div className="ca-quantity-section">
                <div className="ca-quantity-selector">
                  <button
                    className="ca-quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus size={20} />
                  </button>
                  <div className="ca-quantity-display">
                    <span className="ca-quantity-number">{quantity}</span>
                    <span className="ca-quantity-label">unité{quantity > 1 ? 's' : ''}</span>
                  </div>
                  <button
                    className="ca-quantity-btn"
                    onClick={() => setQuantity(Math.min(selectedBoisson.stock_restante, quantity + 1))}
                    disabled={quantity >= selectedBoisson.stock_restante}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="ca-quantity-info">
                  <div className="ca-info-item">
                    <span>Prix unitaire :</span>
                    <strong>{parseFloat(selectedBoisson.prix).toFixed(2)} Ar</strong>
                  </div>
                  <div className="ca-info-item">
                    <span>Stock disponible :</span>
                    <strong>{selectedBoisson.stock_restante} unité{selectedBoisson.stock_restante > 1 ? 's' : ''}</strong>
                  </div>
                  <div className="ca-info-item ca-total-item">
                    <span>Sous-total :</span>
                    <strong>{(parseFloat(selectedBoisson.prix) * quantity).toFixed(2)} Ar</strong>
                  </div>
                </div>
              </div>

              {/* Récapitulatif final */}
              <div className="ca-order-summary-final">
                <div className="ca-summary-header">
                  <h4>Récapitulatif de commande</h4>
                </div>
                <div className="ca-summary-details">
                  <div className="ca-summary-row">
                    <span>Machine</span>
                    <strong>{selectedMachine?.nom}</strong>
                  </div>
                  <div className="ca-summary-row">
                    <span>Boisson</span>
                    <strong>{selectedBoisson?.nom}</strong>
                  </div>
                  <div className="ca-summary-row">
                    <span>Quantité</span>
                    <strong>{quantity} unité{quantity > 1 ? 's' : ''}</strong>
                  </div>
                  <div className="ca-summary-row">
                    <span>Paiement</span>
                    <strong>{paymentMethods.find(p => p.id === selectedPayment)?.label}</strong>
                  </div>
                  <div className="ca-summary-row ca-summary-total-row">
                    <span>Total à payer</span>
                    <strong className="ca-final-total">
                      {(parseFloat(selectedBoisson.prix) * quantity).toFixed(2)} Ar
                    </strong>
                  </div>
                </div>
              </div>

              <motion.button
                className="ca-purchase-btn"
                onClick={() => {
                  setActiveStep(5);
                  handlePurchase();
                }}
                disabled={processing}
                whileHover={{ scale: processing ? 1 : 1.05 }}
                whileTap={{ scale: processing ? 1 : 0.95 }}
              >
                {processing ? (
                  <>
                    <Loader2 className="ca-spinning" size={20} />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>Confirmer et payer</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientAcheter;
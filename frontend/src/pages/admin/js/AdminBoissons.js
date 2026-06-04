import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  Filter,
  Download,
  DollarSign,
  Power,
  PowerOff,
  Upload,
  Image as ImageIcon,
  Star,
  Package,
  MoreVertical,
  Copy,
  AlertTriangle,
  Thermometer,
  Flame,
  Snowflake,
  Tag,
  Clock,
  Percent,
  Zap,
  Check,
  XCircle,
  List,
  Droplets,
  Coffee as CoffeeIcon,
  Leaf,
  Citrus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/AdminBoissons.css';
import { getBoissons, createBoisson, updateBoisson, deleteBoisson } from '../../../services/api';

const AdminBoissons = () => {
  const navigate = useNavigate();
  const [boissons, setBoissons] = useState([]);
  const [filteredBoissons, setFilteredBoissons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterPopularity, setFilterPopularity] = useState('all');
  const [filterPromotion, setFilterPromotion] = useState('all');
  const [filterTemperature, setFilterTemperature] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedBoisson, setSelectedBoisson] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    popular: 0,
    onPromotion: 0,
    hot: 0,
    cold: 0,
    new: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boissonToDelete, setBoissonToDelete] = useState(null);
  const [ingredients, setIngredients] = useState(['']);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedBoissonIngredients, setSelectedBoissonIngredients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Référence pour le timeout
  const fetchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    prix_promotion: '',
    description: '',
    active: true,
    popular: false,
    is_new: false,
    on_promotion: false,
    promotion_percent: 0,
    temperature: 'hot',
    category: 'cafe',
    preparation_time: 5,
    calories: 0,
    ingredients: []
  });

  const temperatureOptions = [
    { value: 'hot', label: '🔥 Chaud', icon: Flame },
    { value: 'cold', label: '🧊 Froid', icon: Snowflake },
    { value: 'both', label: '🌡️ Chaud/Froid', icon: Thermometer }
  ];

  const categoryOptions = [
    { value: 'cafe', label: '☕ Café', icon: CoffeeIcon },
    { value: 'the', label: '🍵 Thé', icon: Leaf },
    { value: 'jus', label: '🧃 Jus', icon: Citrus },
    { value: 'soda', label: '🥤 Soda', icon: Droplets },
    { value: 'alcool', label: '🍺 Alcoolisé', icon: '🍺' },
    { value: 'autre', label: '📦 Autre', icon: Package }
  ];

  useEffect(() => {
    fetchBoissons();
    
    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    filterBoissons();
    calculateStats();
  }, [searchTerm, filterActive, filterPopularity, filterPromotion, filterTemperature, boissons]);

  const fetchBoissons = async () => {
    try {
      setLoading(true);
      const data = await getBoissons();
      setBoissons(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement boissons:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = boissons.length;
    const active = boissons.filter(b => b.active).length;
    const popular = boissons.filter(b => b.popular).length;
    const onPromotion = boissons.filter(b => b.on_promotion).length;
    const hot = boissons.filter(b => b.temperature === 'hot').length;
    const cold = boissons.filter(b => b.temperature === 'cold').length;
    const isNew = boissons.filter(b => b.is_new).length;
    
    setStats({ total, active, popular, onPromotion, hot, cold, new: isNew });
  };

  const filterBoissons = () => {
    let filtered = [...boissons];

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.ingredients && b.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (filterActive !== 'all') {
      filtered = filtered.filter(b => b.active === (filterActive === 'active'));
    }

    if (filterPopularity !== 'all') {
      filtered = filtered.filter(b => {
        if (filterPopularity === 'popular') return b.popular;
        if (filterPopularity === 'not-popular') return !b.popular;
        return true;
      });
    }

    if (filterPromotion !== 'all') {
      filtered = filtered.filter(b => {
        if (filterPromotion === 'promotion') return b.on_promotion;
        if (filterPromotion === 'no-promotion') return !b.on_promotion;
        return true;
      });
    }

    if (filterTemperature !== 'all') {
      filtered = filtered.filter(b => b.temperature === filterTemperature);
    }

    setFilteredBoissons(filtered);
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      nom: '',
      prix: '',
      prix_promotion: '',
      description: '',
      active: true,
      popular: false,
      is_new: false,
      on_promotion: false,
      promotion_percent: 0,
      temperature: 'hot',
      category: 'cafe',
      preparation_time: 5,
      calories: 0,
      ingredients: []
    });
    setIngredients(['']);
    setImagePreview(null);
    setImageFile(null);
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleEdit = (boisson) => {
    setModalMode('edit');
    setSelectedBoisson(boisson);
    setFormData({
      nom: boisson.nom,
      prix: boisson.prix,
      prix_promotion: boisson.prix_promotion || '',
      description: boisson.description || '',
      active: boisson.active,
      popular: boisson.popular || false,
      is_new: boisson.is_new || false,
      on_promotion: boisson.on_promotion || false,
      promotion_percent: boisson.promotion_percent || 0,
      temperature: boisson.temperature || 'hot',
      category: boisson.category || 'cafe',
      preparation_time: boisson.preparation_time || 5,
      calories: boisson.calories || 0,
      ingredients: boisson.ingredients || []
    });
    
    if (boisson.ingredients && boisson.ingredients.length > 0) {
      setIngredients([...boisson.ingredients, '']);
    } else {
      setIngredients(['']);
    }
    
    if (boisson.image_url) {
      setImagePreview(boisson.image_url);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleDeleteClick = (boisson) => {
    setBoissonToDelete(boisson);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!boissonToDelete) return;

    try {
      await deleteBoisson(boissonToDelete.id);
      fetchBoissons();
      setShowDeleteModal(false);
      setBoissonToDelete(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
      setShowDeleteModal(false);
      setBoissonToDelete(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setImageFile(file);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(0);
      }
    }, 50);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
    
    if (index === newIngredients.length - 1 && value.trim() !== '') {
      setIngredients([...newIngredients, '']);
    }
    
    const filteredIngredients = newIngredients.filter((ing, idx) => 
      ing.trim() !== '' || idx === newIngredients.length - 1
    );
    setIngredients(filteredIngredients);
    
    setFormData({
      ...formData,
      ingredients: filteredIngredients.filter(ing => ing.trim() !== '')
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    setFormData({
      ...formData,
      ingredients: newIngredients.filter(ing => ing.trim() !== '')
    });
  };

  const handlePromotionToggle = () => {
    const newPromotionState = !formData.on_promotion;
    setFormData({
      ...formData,
      on_promotion: newPromotionState,
      prix_promotion: newPromotionState ? (formData.prix * (1 - formData.promotion_percent / 100)).toFixed(2) : ''
    });
  };

  const handlePromotionPercentChange = (percent) => {
    const newPercent = parseInt(percent);
    setFormData({
      ...formData,
      promotion_percent: newPercent,
      prix_promotion: formData.on_promotion ? (formData.prix * (1 - newPercent / 100)).toFixed(2) : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
  
    try {
      const boissonData = {
        ...formData,
        ingredients: ingredients.filter(ing => ing.trim() !== '')
      };

      if (modalMode === 'create') {
        const formDataToSend = new FormData();
        
        Object.keys(boissonData).forEach(key => {
          if (key === 'ingredients') {
            boissonData.ingredients.forEach(ingredient => {
              formDataToSend.append('ingredients', ingredient);
            });
          } else if (key !== 'prix_promotion' || boissonData[key]) {
            formDataToSend.append(key, boissonData[key]);
          }
        });
        
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }

        await createBoisson(formDataToSend);
      } else {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        const formDataToSend = new FormData();
        
        Object.keys(boissonData).forEach(key => {
          if (key === 'ingredients') {
            boissonData.ingredients.forEach(ingredient => {
              formDataToSend.append('ingredients', ingredient);
            });
          } else if (key !== 'prix_promotion' || boissonData[key]) {
            formDataToSend.append(key, boissonData[key]);
          }
        });
        
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }
        
        const response = await fetch(`${baseUrl}/boissons/${selectedBoisson.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formDataToSend
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
      }

      // Fermer le modal immédiatement
      setShowModal(false);
      setImageFile(null);
      setImagePreview(null);
      setIsSubmitting(false);
      
      // Montrer un message de succès
      setShowSuccessMessage(true);
      
      // Rafraîchir les données après un court délai
      setTimeout(() => {
        fetchBoissons();
        setShowSuccessMessage(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
      setIsSubmitting(false);
    }
  };

  const duplicateBoisson = async (boisson) => {
    try {
      const duplicateData = new FormData();
      duplicateData.append('nom', `${boisson.nom} (Copie)`);
      duplicateData.append('prix', boisson.prix);
      duplicateData.append('description', boisson.description || '');
      duplicateData.append('active', boisson.active);
      duplicateData.append('popular', boisson.popular || false);
      duplicateData.append('is_new', false);
      duplicateData.append('on_promotion', boisson.on_promotion || false);
      duplicateData.append('promotion_percent', boisson.promotion_percent || 0);
      duplicateData.append('temperature', boisson.temperature || 'hot');
      duplicateData.append('category', boisson.category || 'cafe');
      duplicateData.append('preparation_time', boisson.preparation_time || 5);
      duplicateData.append('calories', boisson.calories || 0);
      
      if (boisson.ingredients && Array.isArray(boisson.ingredients)) {
        boisson.ingredients.forEach(ingredient => {
          duplicateData.append('ingredients', ingredient);
        });
      }
      
      if (boisson.prix_promotion) {
        duplicateData.append('prix_promotion', boisson.prix_promotion);
      }
      
      await createBoisson(duplicateData);
      fetchBoissons();
    } catch (error) {
      console.error('Erreur duplication:', error);
      alert('Erreur lors de la duplication');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Prix', 'Prix Promo', 'Description', 'Catégorie', 'Température', 'Ingrédients', 'Calories', 'Temps Préparation', 'Active', 'Populaire', 'Nouveau', 'En Promotion', '% Promotion', 'Image URL'];
    const csvData = filteredBoissons.map(b => [
      b.id,
      b.nom,
      b.prix,
      b.prix_promotion || '',
      b.description,
      b.category,
      b.temperature,
      b.ingredients ? b.ingredients.join('; ') : '',
      b.calories || 0,
      b.preparation_time || 5,
      b.active ? 'Oui' : 'Non',
      b.popular ? 'Oui' : 'Non',
      b.is_new ? 'Oui' : 'Non',
      b.on_promotion ? 'Oui' : 'Non',
      b.promotion_percent || 0,
      b.image_url || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boissons_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const viewIngredients = (boisson) => {
    setSelectedBoissonIngredients(boisson.ingredients || []);
    setShowIngredientsModal(true);
  };

  const statsCards = [
    {
      title: 'Total Boissons',
      value: stats.total,
      icon: Coffee,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: '+5'
    },
    {
      title: 'Actives',
      value: stats.active,
      icon: Power,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      subtitle: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% du total`
    },
    {
      title: 'Populaires',
      value: stats.popular,
      icon: Star,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      trend: '+3'
    },
    {
      title: 'En Promotion',
      value: stats.onPromotion,
      icon: Percent,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      subtitle: `${stats.total > 0 ? Math.round((stats.onPromotion / stats.total) * 100) : 0}% du total`
    },
    {
      title: 'Chaudes',
      value: stats.hot,
      icon: Flame,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      subtitle: 'Boissons chaudes'
    },
    {
      title: 'Froides',
      value: stats.cold,
      icon: Snowflake,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      subtitle: 'Boissons froides'
    },
    {
      title: 'Nouveautés',
      value: stats.new,
      icon: Zap,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      subtitle: 'Nouvelles boissons'
    }
  ];

  return (
    <div className="ab-page">
      <header className="ab-header">
        <div className="ab-header-main">
          <div className="ab-header-left">
            <button 
              className="ab-back-btn" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ChevronLeft size={20} />
              Tableau de bord
            </button>
            <div className="ab-page-title">
              <div className="ab-title-icon">
                <Coffee size={32} />
                <div className="ab-icon-badge">
                  <span>{boissons.length}</span>
                </div>
              </div>
              <div>
                <h1>Gestion des Boissons</h1>
                <p>Administrez votre menu de boissons</p>
              </div>
            </div>
          </div>
          <div className="ab-header-actions">
            <motion.button 
              className="ab-header-btn ab-export-btn"
              onClick={exportToCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
              Exporter
            </motion.button>
            <motion.button 
              className="ab-header-btn ab-create-btn"
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Nouvelle Boisson
            </motion.button>
          </div>
        </div>

        <div className="ab-stats-overview">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="ab-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: `linear-gradient(135deg, ${stat.bgColor}, rgba(255, 255, 255, 0.05))`,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div className="ab-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="ab-stat-content">
                <h3>{stat.value}</h3>
                <p className="ab-stat-label">{stat.title}</p>
                {stat.trend && (
                  <div className="ab-stat-trend" style={{ color: stat.color }}>
                    <span>+{stat.trend}</span>
                  </div>
                )}
                {stat.subtitle && (
                  <p className="ab-stat-subtitle">{stat.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </header>

      <div className="ab-filters-section">
        <div className="ab-filters-main">
          <div className="ab-search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher une boisson, ingrédient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ab-search-input"
            />
            {searchTerm && (
              <button 
                className="ab-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="ab-filter-controls">
            <div className="ab-filter-group">
              <Filter size={18} />
              <select 
                value={filterActive} 
                onChange={(e) => setFilterActive(e.target.value)}
                className="ab-filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives seulement</option>
                <option value="inactive">Inactives seulement</option>
              </select>
            </div>

            <div className="ab-filter-group">
              <Star size={18} />
              <select 
                value={filterPopularity} 
                onChange={(e) => setFilterPopularity(e.target.value)}
                className="ab-filter-select"
              >
                <option value="all">Toutes</option>
                <option value="popular">Populaires</option>
                <option value="not-popular">Non populaires</option>
              </select>
            </div>

            <div className="ab-filter-group">
              <Tag size={18} />
              <select 
                value={filterPromotion} 
                onChange={(e) => setFilterPromotion(e.target.value)}
                className="ab-filter-select"
              >
                <option value="all">Promo & Standard</option>
                <option value="promotion">En promotion</option>
                <option value="no-promotion">Standard</option>
              </select>
            </div>

            <div className="ab-filter-group">
              <Thermometer size={18} />
              <select 
                value={filterTemperature} 
                onChange={(e) => setFilterTemperature(e.target.value)}
                className="ab-filter-select"
              >
                <option value="all">Toutes températures</option>
                <option value="hot">Chaudes</option>
                <option value="cold">Froides</option>
                <option value="both">Chaud/Froid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Message de succès */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            className="ab-success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Check size={20} />
            <span>Boisson {modalMode === 'create' ? 'ajoutée' : 'modifiée'} avec succès!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="ab-content">
        {loading ? (
          <div className="ab-loading-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="ab-loader-icon"
            >
              <Coffee size={40} color="#8b5cf6" />
            </motion.div>
            <p>Chargement des boissons...</p>
          </div>
        ) : (
          <>
            <div className="ab-table-header">
              <h3>Liste des boissons ({filteredBoissons.length})</h3>
              <div className="ab-table-info">
                <span className="ab-info-item">
                  <Package size={16} />
                  {filteredBoissons.length} résultat(s)
                </span>
                <span className="ab-info-item">
                  <DollarSign size={16} />
                  Moyenne: {filteredBoissons.length > 0 ? 
                    (filteredBoissons.reduce((sum, b) => sum + parseFloat(b.prix), 0) / filteredBoissons.length).toFixed(2) 
                    : '0.00'} Ar
                </span>
              </div>
            </div>

            <div className="ab-grid">
              {filteredBoissons.map((boisson) => (
                <motion.div
                  key={boisson.id}
                  className="ab-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}
                >
                  <div className="ab-card-header">
                    <div className="ab-image">
                      {boisson.image_url ? (
                        <img 
                          src={boisson.image_url} 
                          alt={boisson.nom}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.nextElementSibling;
                            if (placeholder && placeholder.classList.contains('ab-image-placeholder')) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`ab-image-placeholder ${boisson.image_url ? '' : 'ab-show'}`}>
                        {boisson.category === 'cafe' && <Coffee size={32} />}
                        {boisson.category === 'the' && <Leaf size={32} />}
                        {boisson.category === 'jus' && <Citrus size={32} />}
                        {boisson.category === 'soda' && <Droplets size={32} />}
                        {boisson.category === 'alcool' && <span style={{ fontSize: '32px' }}>🍺</span>}
                        {boisson.category === 'autre' && <Package size={32} />}
                      </div>
                      
                      <div className="ab-badges-container">
                        {boisson.popular && (
                          <div className="ab-badge ab-popular-badge">
                            <Star size={12} />
                            <span>Populaire</span>
                          </div>
                        )}
                        {boisson.is_new && (
                          <div className="ab-badge ab-new-badge">
                            <Zap size={12} />
                            <span>Nouveau</span>
                          </div>
                        )}
                        {boisson.on_promotion && (
                          <div className="ab-badge ab-promotion-badge">
                            <Percent size={12} />
                            <span>-{boisson.promotion_percent}%</span>
                          </div>
                        )}
                        <div className={`ab-badge ab-temperature-badge ${boisson.temperature}`}>
                          {boisson.temperature === 'hot' && <Flame size={12} />}
                          {boisson.temperature === 'cold' && <Snowflake size={12} />}
                          {boisson.temperature === 'both' && <Thermometer size={12} />}
                          <span>
                            {boisson.temperature === 'hot' && 'Chaud'}
                            {boisson.temperature === 'cold' && 'Froid'}
                            {boisson.temperature === 'both' && 'Chaud/Froid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ab-card-body">
                    <div className="ab-info">
                      <h4>{boisson.nom}</h4>
                      <p className="ab-description">
                        {boisson.description || 'Aucune description'}
                      </p>
                      
                      <div className="ab-meta-info">
                        <span className="ab-category-tag">
                          {categoryOptions.find(cat => cat.value === boisson.category)?.label}
                        </span>
                        
                        {boisson.ingredients && boisson.ingredients.length > 0 && (
                          <button 
                            className="ab-ingredients-btn"
                            onClick={() => viewIngredients(boisson)}
                            title="Voir les ingrédients"
                          >
                            <List size={14} />
                            <span>{boisson.ingredients.length} ingrédient(s)</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="ab-details-row">
                        <span className="ab-detail-item">
                          <Clock size={14} />
                          {boisson.preparation_time || 5} min
                        </span>
                        {boisson.calories > 0 && (
                          <span className="ab-detail-item">
                            🔥 {boisson.calories} cal
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ab-price">
                      <div className="ab-price-info">
                        {boisson.on_promotion ? (
                          <>
                            <div className="ab-price-tag ab-promo-price">
                              <DollarSign size={16} />
                              <strong>{parseFloat(boisson.prix_promotion).toFixed(2)} Ar</strong>
                              <span className="ab-original-price">
                                {parseFloat(boisson.prix).toFixed(2)} Ar
                              </span>
                            </div>
                            <div className="ab-promotion-label">
                              <Percent size={12} />
                              <span>-{boisson.promotion_percent}%</span>
                            </div>
                          </>
                        ) : (
                          <div className="ab-price-tag">
                            <DollarSign size={16} />
                            <strong>{parseFloat(boisson.prix).toFixed(2)} Ar</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ab-card-footer">
                    <div className={`ab-status-badge ${boisson.active ? 'ab-active' : 'ab-inactive'}`}>
                      {boisson.active ? (
                        <><Power size={12} /> Active</>
                      ) : (
                        <><PowerOff size={12} /> Inactive</>
                      )}
                    </div>
                    <div className="ab-action-buttons">
                      <motion.button
                        className="ab-action-btn ab-view-ingredients"
                        onClick={() => viewIngredients(boisson)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Voir les ingrédients"
                      >
                        <List size={14} />
                      </motion.button>
                      <motion.button
                        className="ab-action-btn ab-duplicate"
                        onClick={() => duplicateBoisson(boisson)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Dupliquer"
                      >
                        <Copy size={14} />
                      </motion.button>
                      <motion.button
                        className="ab-action-btn ab-edit"
                        onClick={() => handleEdit(boisson)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </motion.button>
                      <motion.button
                        className="ab-action-btn ab-delete"
                        onClick={() => handleDeleteClick(boisson)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredBoissons.length === 0 && (
              <div className="ab-empty-state">
                <Coffee size={80} />
                <h3>Aucune boisson trouvée</h3>
                <p>Modifiez vos critères de recherche ou ajoutez une nouvelle boisson</p>
                <button className="ab-add-first-btn" onClick={handleCreate}>
                  <Plus size={18} />
                  Ajouter votre première boisson
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="ab-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && setShowModal(false)}
          >
            <motion.div
              className="ab-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ab-modal-header">
                <h2>
                  {modalMode === 'create' ? (
                    <>
                      <Plus size={24} />
                      Nouvelle Boisson
                    </>
                  ) : (
                    <>
                      <Edit2 size={24} />
                      Modifier {selectedBoisson?.nom}
                    </>
                  )}
                </h2>
                <button 
                  className="ab-close-btn" 
                  onClick={() => !isSubmitting && setShowModal(false)}
                  disabled={isSubmitting}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="ab-modal-form">
                <div className="ab-form-grid">
                  <div className="ab-form-section ab-image-upload">
                    <label>Image de la boisson</label>
                    <div className="ab-upload-area">
                      <input
                        type="file"
                        id="boisson-image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="ab-file-input"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="boisson-image" className="ab-upload-label">
                        {imagePreview ? (
                          <div className="ab-image-preview">
                            <img src={imagePreview} alt="Preview" />
                            <div className="ab-preview-overlay">
                              <Upload size={24} />
                              <span>Changer l'image</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon size={48} />
                            <p>Cliquez pour télécharger</p>
                            <small>PNG, JPG, WebP (max 5MB)</small>
                          </>
                        )}
                      </label>
                      {uploadProgress > 0 && (
                        <div className="ab-upload-progress">
                          <div 
                            className="ab-progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                          <span>{uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ab-form-section ab-details">
                    <div className="ab-form-row-2">
                      <div className="ab-form-group">
                        <label>Nom de la boisson *</label>
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          placeholder="Ex: Café Latte"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="ab-form-group">
                        <label>Catégorie *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="ab-form-select"
                          required
                          disabled={isSubmitting}
                        >
                          {categoryOptions.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="ab-form-row-2">
                      <div className="ab-form-group">
                        <label>Température *</label>
                        <div className="ab-temperature-selector">
                          {temperatureOptions.map((temp) => (
                            <button
                              key={temp.value}
                              type="button"
                              className={`ab-temperature-btn ${formData.temperature === temp.value ? 'ab-selected' : ''}`}
                              onClick={() => !isSubmitting && setFormData({ ...formData, temperature: temp.value })}
                              disabled={isSubmitting}
                            >
                              <temp.icon size={18} />
                              <span>{temp.label.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="ab-form-group">
                        <label>Temps de préparation (min)</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={formData.preparation_time}
                          onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                          placeholder="5"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="ab-form-row-2">
                      <div className="ab-form-group">
                        <label>Prix standard (Ar) *</label>
                        <div className="ab-price-input">
                          <DollarSign size={20} />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.prix}
                            onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                            placeholder="1000.00"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="ab-form-group">
                        <label>Calories</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.calories}
                          onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                          placeholder="0"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="ab-promotion-section">
                      <div className="ab-promotion-header">
                        <label className="ab-checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.on_promotion}
                            onChange={handlePromotionToggle}
                            disabled={isSubmitting}
                          />
                          <span>Mettre en promotion</span>
                        </label>
                        
                        {formData.on_promotion && (
                          <div className="ab-promotion-controls">
                            <div className="ab-promotion-slider">
                              <label>Pourcentage de réduction:</label>
                              <div className="ab-percent-buttons">
                                {[5, 10, 15, 20, 25, 30].map((percent) => (
                                  <button
                                    key={percent}
                                    type="button"
                                    className={`ab-percent-btn ${formData.promotion_percent === percent ? 'ab-selected' : ''}`}
                                    onClick={() => !isSubmitting && handlePromotionPercentChange(percent)}
                                    disabled={isSubmitting}
                                  >
                                    {percent}%
                                  </button>
                                ))}
                              </div>
                              <div className="ab-slider-container">
                                <input
                                  type="range"
                                  min="0"
                                  max="80"
                                  step="5"
                                  value={formData.promotion_percent}
                                  onChange={(e) => !isSubmitting && handlePromotionPercentChange(e.target.value)}
                                  className="ab-promotion-slider-input"
                                  disabled={isSubmitting}
                                />
                                <span className="ab-slider-value">{formData.promotion_percent}%</span>
                              </div>
                            </div>
                            
                            <div className="ab-promotion-result">
                              <div className="ab-price-comparison">
                                <span className="ab-original">Prix original: {parseFloat(formData.prix).toFixed(2)} Ar</span>
                                <span className="ab-promo">Prix promo: {formData.prix_promotion || (formData.prix * (1 - formData.promotion_percent / 100)).toFixed(2)} Ar</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ab-form-group">
                      <label>Ingrédients</label>
                      <div className="ab-ingredients-container">
                        {ingredients.map((ingredient, index) => (
                          <div key={index} className="ab-ingredient-input-group">
                            <input
                              type="text"
                              value={ingredient}
                              onChange={(e) => !isSubmitting && handleIngredientChange(index, e.target.value)}
                              placeholder={`Ingrédient ${index + 1}`}
                              className="ab-ingredient-input"
                              disabled={isSubmitting}
                            />
                            {index < ingredients.length - 1 && (
                              <button
                                type="button"
                                className="ab-remove-ingredient"
                                onClick={() => !isSubmitting && removeIngredient(index)}
                                title="Supprimer cet ingrédient"
                                disabled={isSubmitting}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <small className="ab-hint">Appuyez sur Entrée ou laissez vide pour ajouter un nouvel ingrédient</small>
                    </div>

                    <div className="ab-form-group">
                      <label>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Décrivez la boisson..."
                        rows="3"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="ab-checkbox-group">
                      <label className="ab-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          disabled={isSubmitting}
                        />
                        <span>Boisson active</span>
                      </label>

                      <label className="ab-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.popular}
                          onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                          disabled={isSubmitting}
                        />
                        <span>Marquer comme populaire</span>
                      </label>

                      <label className="ab-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.is_new}
                          onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                          disabled={isSubmitting}
                        />
                        <span>Marquer comme nouveau</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="ab-modal-footer">
                  <button 
                    type="button" 
                    className="ab-btn-secondary" 
                    onClick={() => !isSubmitting && setShowModal(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="ab-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ display: 'inline-block', marginRight: '8px' }}
                        >
                          ⏳
                        </motion.span>
                        Enregistrement...
                      </>
                    ) : modalMode === 'create' ? (
                      'Créer la boisson'
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="ab-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="ab-delete-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ab-delete-modal-header">
                <div className="ab-warning-icon">
                  <AlertTriangle size={48} color="#ef4444" />
                </div>
                <h2>Confirmer la suppression</h2>
                <p className="ab-delete-modal-text">
                  Êtes-vous sûr de vouloir supprimer la boisson <strong>"{boissonToDelete?.nom}"</strong> ?
                </p>
                <p className="ab-delete-modal-warning">
                  Cette action est irréversible. Toutes les données associées seront définitivement supprimées.
                </p>
              </div>

              <div className="ab-delete-modal-footer">
                <button 
                  type="button" 
                  className="ab-btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="ab-btn-danger" 
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

      <AnimatePresence>
        {showIngredientsModal && (
          <motion.div
            className="ab-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIngredientsModal(false)}
          >
            <motion.div
              className="ab-ingredients-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ab-ingredients-modal-header">
                <h2>
                  <List size={24} />
                  Ingrédients
                </h2>
                <button className="ab-close-btn" onClick={() => setShowIngredientsModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="ab-ingredients-modal-content">
                {selectedBoissonIngredients.length > 0 ? (
                  <ul className="ab-ingredients-list">
                    {selectedBoissonIngredients.map((ingredient, index) => (
                      <li key={index} className="ab-ingredient-item">
                        <Check size={16} color="#10b981" />
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="ab-no-ingredients">
                    <AlertTriangle size={48} />
                    <p>Aucun ingrédient défini pour cette boisson</p>
                  </div>
                )}
              </div>

              <div className="ab-ingredients-modal-footer">
                <button 
                  type="button" 
                  className="ab-btn-secondary" 
                  onClick={() => setShowIngredientsModal(false)}
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBoissons;
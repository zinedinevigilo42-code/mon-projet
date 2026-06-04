import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  Search,
  Filter,
  X,
  ChevronLeft,
  Flame,
  Snowflake,
  Thermometer,
  Star,
  Percent,
  Clock,
  DollarSign,
  ShoppingBag,
  List,
  Check,
  AlertTriangle,
  Heart,
  Eye,
  Package,
  Leaf,
  Citrus,
  Droplets,
  Zap,
  Sparkles,
  TrendingUp,
  Tag,
  ChevronDown,
  ChevronUp,
  Grid,
  Menu as MenuIcon,
  Crown,
  Award,
  TrendingDown,
  Clock4,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/ClientBoissons.css';
import { getBoissons } from '../../../services/api';

const ClientBoissons = () => {
  const navigate = useNavigate();
  const [boissons, setBoissons] = useState([]);
  const [filteredBoissons, setFilteredBoissons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemperature, setSelectedTemperature] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showPromotion, setShowPromotion] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedBoisson, setSelectedBoisson] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = [
    { value: 'all', label: 'Toutes', icon: Package, color: '#9ca3af', gradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' },
    { value: 'cafe', label: 'Cafés', icon: Coffee, color: '#92400e', gradient: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' },
    { value: 'the', label: 'Thés', icon: Leaf, color: '#059669', gradient: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)' },
    { value: 'jus', label: 'Jus', icon: Citrus, color: '#d97706', gradient: 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)' },
    { value: 'soda', label: 'Sodas', icon: Droplets, color: '#1d4ed8', gradient: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)' },
    { value: 'alcool', label: 'Cocktails', icon: Award, color: '#dc2626', gradient: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)' },
    { value: 'autre', label: 'Autres', icon: Package, color: '#7c3aed', gradient: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)' }
  ];

  const temperatureOptions = [
    { value: 'all', label: 'Toutes', icon: Thermometer },
    { value: 'hot', label: 'Chaudes', icon: Flame, color: '#dc2626' },
    { value: 'cold', label: 'Froides', icon: Snowflake, color: '#1d4ed8' },
    { value: 'both', label: 'Mixtes', icon: Thermometer, color: '#7c3aed' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Tous prix', icon: DollarSign },
    { value: 'low', label: 'Moins de 2000 Ar', min: 0, max: 2000, icon: TrendingDown },
    { value: 'medium', label: '2000 - 5000 Ar', min: 2000, max: 5000, icon: DollarSign },
    { value: 'high', label: 'Plus de 5000 Ar', min: 5000, max: 100000, icon: TrendingUp }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Plus populaires', icon: Crown },
    { value: 'price-low', label: 'Prix croissant', icon: TrendingUp },
    { value: 'price-high', label: 'Prix décroissant', icon: TrendingDown },
    { value: 'new', label: 'Nouveautés', icon: Zap },
    { value: 'name', label: 'Ordre alphabétique', icon: Tag },
    { value: 'time', label: 'Préparation rapide', icon: Clock4 }
  ];

  useEffect(() => {
    fetchBoissons();
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteBoissons') || '[]');
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    filterAndSortBoissons();
  }, [searchTerm, selectedCategory, selectedTemperature, selectedPriceRange, showPromotion, showPopular, sortBy, boissons]);

  const fetchBoissons = async () => {
    try {
      setLoading(true);
      const data = await getBoissons();
      const activeBoissons = data.filter(boisson => boisson.active);
      setBoissons(activeBoissons);
      setFilteredBoissons(activeBoissons);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement boissons:', error);
      setLoading(false);
    }
  };

  const filterAndSortBoissons = () => {
    let filtered = [...boissons];

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.ingredients && b.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    if (selectedTemperature !== 'all') {
      filtered = filtered.filter(b => b.temperature === selectedTemperature);
    }

    if (selectedPriceRange !== 'all') {
      const range = priceRanges.find(r => r.value === selectedPriceRange);
      if (range) {
        filtered = filtered.filter(b => {
          const price = b.on_promotion && b.prix_promotion ? parseFloat(b.prix_promotion) : parseFloat(b.prix);
          return price >= range.min && price <= range.max;
        });
      }
    }

    if (showPromotion) {
      filtered = filtered.filter(b => b.on_promotion);
    }

    if (showPopular) {
      filtered = filtered.filter(b => b.popular);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          if (b.popular !== a.popular) return b.popular ? 1 : -1;
          if (b.is_new !== a.is_new) return b.is_new ? 1 : -1;
          return b.created_at.localeCompare(a.created_at);
        
        case 'price-low':
          const priceA = a.on_promotion && a.prix_promotion ? parseFloat(a.prix_promotion) : parseFloat(a.prix);
          const priceB = b.on_promotion && b.prix_promotion ? parseFloat(b.prix_promotion) : parseFloat(b.prix);
          return priceA - priceB;
        
        case 'price-high':
          const priceAHigh = a.on_promotion && a.prix_promotion ? parseFloat(a.prix_promotion) : parseFloat(a.prix);
          const priceBHigh = b.on_promotion && b.prix_promotion ? parseFloat(b.prix_promotion) : parseFloat(b.prix);
          return priceBHigh - priceAHigh;
        
        case 'new':
          if (b.is_new !== a.is_new) return b.is_new ? 1 : -1;
          return new Date(b.created_at) - new Date(a.created_at);
        
        case 'name':
          return a.nom.localeCompare(b.nom);
        
        case 'time':
          return (a.preparation_time || 5) - (b.preparation_time || 5);
        
        default:
          return 0;
      }
    });

    setFilteredBoissons(filtered);
  };

  const handleViewIngredients = (boisson) => {
    setSelectedBoisson(boisson);
    setShowIngredientsModal(true);
  };

  const handleBuyBoisson = (boisson) => {
    navigate('/client/acheter', { state: { selectedBoisson: boisson } });
  };

  const toggleFavorite = (boissonId) => {
    const newFavorites = favorites.includes(boissonId)
      ? favorites.filter(id => id !== boissonId)
      : [...favorites, boissonId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteBoissons', JSON.stringify(newFavorites));
  };

  const toggleDescription = (boissonId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [boissonId]: !prev[boissonId]
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTemperature('all');
    setSelectedPriceRange('all');
    setShowPromotion(false);
    setShowPopular(false);
    setSortBy('popular');
    setShowFilters(false);
  };

  const getCategoryIcon = (category) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat ? cat.icon : Package;
  };

  const getTemperatureColor = (temperature) => {
    switch (temperature) {
      case 'hot': return '#dc2626';
      case 'cold': return '#1d4ed8';
      case 'both': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const categoryStats = categoryOptions.map(cat => ({
    ...cat,
    count: boissons.filter(b => b.category === cat.value).length
  })).filter(cat => cat.value !== 'all');

  return (
    <div className="cb-container">
      {/* Header */}
      <header className="cb-header">
        <div className="cb-header-top">
          <div className="cb-header-left">
            <button 
              className="cb-back-btn" 
              onClick={() => navigate('/client/dashboard')}
            >
              <ChevronLeft size={20} />
              Retour
            </button>
            <div className="cb-header-title">
              <div className="cb-logo">
                <div className="cb-logo-icon">
                  <Crown size={28} color="#dc2626" />
                </div>
                <div>
                  <h1>Menu Boissons</h1>
                  <p>Découvrez nos délicieuses boissons</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="cb-header-actions">
            <button 
              className="cb-action-btn cart-btn"
              onClick={() => navigate('/client/panier')}
            >
              <ShoppingCart size={20} />
              <span>Panier</span>
            </button>
            <button 
              className="cb-action-btn filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              <span>Filtres</span>
            </button>
            <div className="cb-view-toggle">
              <button 
                className={`cb-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vue grille"
              >
                <Grid size={18} />
              </button>
              <button 
                className={`cb-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vue liste"
              >
                <MenuIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="cb-search-container">
          <div className="cb-search-wrapper">
            <Search size={20} className="cb-search-icon" />
            <input
              type="text"
              placeholder="Rechercher une boisson, un ingrédient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cb-search-input"
            />
            {searchTerm && (
              <button 
                className="cb-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="cb-categories-scroll">
          <button
            className={`cb-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
            style={{ background: selectedCategory === 'all' ? '#dc2626' : '#f3f4f6' }}
          >
            <Package size={18} color={selectedCategory === 'all' ? 'white' : '#6b7280'} />
            <span>Toutes ({boissons.length})</span>
          </button>
          {categoryStats.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = selectedCategory === cat.value;
            
            return (
              <button
                key={cat.value}
                className={`cb-category-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  background: isActive ? cat.gradient : '#f3f4f6',
                  border: isActive ? `2px solid ${cat.color}` : '2px solid transparent'
                }}
              >
                <IconComponent size={18} color={isActive ? cat.color : '#6b7280'} />
                <span style={{ color: isActive ? '#1f2937' : '#6b7280' }}>
                  {cat.label} ({cat.count})
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="cb-filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="cb-filters-header">
              <div className="cb-filters-title">
                <Filter size={20} />
                <h3>Filtres et Tri</h3>
              </div>
              <div className="cb-filters-actions">
                <button className="cb-apply-filters" onClick={() => setShowFilters(false)}>
                  Appliquer
                </button>
                <button className="cb-clear-filters" onClick={clearFilters}>
                  Tout effacer
                </button>
              </div>
            </div>
            
            <div className="cb-filters-grid">
              {/* Temperature Filter */}
              <div className="cb-filter-group">
                <label className="cb-filter-label">
                  <Thermometer size={18} />
                  Température
                </label>
                <div className="cb-temperature-filters">
                  {temperatureOptions.map((temp) => (
                    <button
                      key={temp.value}
                      className={`cb-temperature-btn ${selectedTemperature === temp.value ? 'active' : ''}`}
                      onClick={() => setSelectedTemperature(temp.value)}
                      style={{
                        background: selectedTemperature === temp.value ? getTemperatureColor(temp.value) + '15' : '#f9fafb',
                        borderColor: selectedTemperature === temp.value ? getTemperatureColor(temp.value) : '#e5e7eb',
                        color: selectedTemperature === temp.value ? getTemperatureColor(temp.value) : '#6b7280'
                      }}
                    >
                      <temp.icon size={16} />
                      <span>{temp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="cb-filter-group">
                <label className="cb-filter-label">
                  <DollarSign size={18} />
                  Gamme de prix
                </label>
                <div className="cb-price-filters">
                  {priceRanges.map((range) => {
                    const IconComponent = range.icon;
                    const isActive = selectedPriceRange === range.value;
                    
                    return (
                      <button
                        key={range.value}
                        className={`cb-price-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedPriceRange(range.value)}
                        style={{
                          background: isActive ? '#dc2626' : '#f9fafb',
                          color: isActive ? 'white' : '#6b7280'
                        }}
                      >
                        <IconComponent size={14} />
                        <span>{range.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="cb-filter-group">
                <label className="cb-filter-label">
                  <Filter size={18} />
                  Options
                </label>
                <div className="cb-quick-filters">
                  <label className="cb-checkbox-label">
                    <input
                      type="checkbox"
                      checked={showPromotion}
                      onChange={(e) => setShowPromotion(e.target.checked)}
                      className="cb-checkbox"
                    />
                    <span className={`cb-checkbox-custom ${showPromotion ? 'checked' : ''}`}>
                      <Check size={12} />
                    </span>
                    <span className="cb-checkbox-text">
                      <Percent size={14} />
                      En promotion
                    </span>
                  </label>
                  <label className="cb-checkbox-label">
                    <input
                      type="checkbox"
                      checked={showPopular}
                      onChange={(e) => setShowPopular(e.target.checked)}
                      className="cb-checkbox"
                    />
                    <span className={`cb-checkbox-custom ${showPopular ? 'checked' : ''}`}>
                      <Check size={12} />
                    </span>
                    <span className="cb-checkbox-text">
                      <Crown size={14} />
                      Populaires seulement
                    </span>
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="cb-filter-group">
                <label className="cb-filter-label">
                  <TrendingUp size={18} />
                  Trier par
                </label>
                <div className="cb-sort-options">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`cb-sort-btn ${sortBy === option.value ? 'active' : ''}`}
                      onClick={() => setSortBy(option.value)}
                      style={{
                        background: sortBy === option.value ? '#dc2626' : '#f9fafb',
                        color: sortBy === option.value ? 'white' : '#6b7280'
                      }}
                    >
                      <option.icon size={16} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="cb-content">
        {/* Results Info */}
        <div className="cb-results-info">
          <div className="cb-results-stats">
            <div className="cb-results-count">
              <h3>Nos Boissons</h3>
              <span className="cb-results-number">{filteredBoissons.length} produits</span>
            </div>
            <div className="cb-active-filters">
              {selectedCategory !== 'all' && (
                <span className="cb-active-filter">
                  {categoryOptions.find(c => c.value === selectedCategory)?.label}
                </span>
              )}
              {selectedTemperature !== 'all' && (
                <span className="cb-active-filter">
                  {temperatureOptions.find(t => t.value === selectedTemperature)?.label}
                </span>
              )}
              {showPromotion && (
                <span className="cb-active-filter promo">
                  <Percent size={12} />
                  Promotion
                </span>
              )}
              {showPopular && (
                <span className="cb-active-filter popular">
                  <Crown size={12} />
                  Populaire
                </span>
              )}
            </div>
          </div>
          <div className="cb-sort-mobile">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="cb-sort-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="cb-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="cb-loader"
            >
              <Crown size={48} color="#dc2626" />
            </motion.div>
            <p>Chargement du menu...</p>
          </div>
        ) : filteredBoissons.length > 0 ? (
          <div className={`cb-${viewMode}`}>
            {filteredBoissons.map((boisson) => {
              const isFavorite = favorites.includes(boisson.id);
              const isDescriptionExpanded = expandedDescriptions[boisson.id];
              const CategoryIcon = getCategoryIcon(boisson.category);
              const TemperatureIcon = temperatureOptions.find(t => t.value === boisson.temperature)?.icon || Thermometer;
              const category = categoryOptions.find(c => c.value === boisson.category);
              
              return (
                <motion.div
                  key={boisson.id}
                  className="cb-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(220, 38, 38, 0.1)' }}
                >
                  {/* Image Section */}
                  <div className="cb-card-image">
                    {boisson.image_url ? (
                      <img 
                        src={boisson.image_url} 
                        alt={boisson.nom}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`cb-image-placeholder ${boisson.image_url ? '' : 'visible'}`}
                         style={{ background: category?.gradient || 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
                      <CategoryIcon size={48} color={category?.color || '#6b7280'} />
                    </div>
                    
                    {/* Badges */}
                    <div className="cb-card-badges">
                      {boisson.popular && (
                        <div className="cb-badge cb-badge-popular">
                          <Crown size={12} />
                          <span>Populaire</span>
                        </div>
                      )}
                      {boisson.is_new && (
                        <div className="cb-badge cb-badge-new">
                          <Zap size={12} />
                          <span>Nouveau</span>
                        </div>
                      )}
                      {boisson.on_promotion && (
                        <div className="cb-badge cb-badge-promo">
                          <Percent size={12} />
                          <span>-{boisson.promotion_percent}%</span>
                        </div>
                      )}
                      <div 
                        className="cb-badge cb-badge-temperature"
                        style={{ 
                          backgroundColor: getTemperatureColor(boisson.temperature) + '15',
                          borderColor: getTemperatureColor(boisson.temperature),
                          color: getTemperatureColor(boisson.temperature)
                        }}
                      >
                        <TemperatureIcon size={12} />
                        <span>
                          {boisson.temperature === 'hot' && 'Chaud'}
                          {boisson.temperature === 'cold' && 'Froid'}
                          {boisson.temperature === 'both' && 'Mixte'}
                        </span>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button 
                      className={`cb-favorite-btn ${isFavorite ? 'active' : ''}`}
                      onClick={() => toggleFavorite(boisson.id)}
                      style={{
                        background: isFavorite ? '#dc2626' : 'white',
                        color: isFavorite ? 'white' : '#dc2626'
                      }}
                    >
                      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="cb-card-content">
                    <div className="cb-card-header">
                      <div className="cb-card-category">
                        <CategoryIcon size={16} color={category?.color} />
                        <span style={{ color: category?.color }}>{category?.label}</span>
                      </div>
                      <h3 className="cb-card-title">{boisson.nom}</h3>
                      
                      {/* Description with expand/collapse */}
                      <div className="cb-card-description">
                        <p className={`cb-description-text ${isDescriptionExpanded ? 'expanded' : ''}`}>
                          {boisson.description || 'Une délicieuse boisson préparée avec soin.'}
                        </p>
                        {boisson.description && boisson.description.length > 80 && (
                          <button 
                            className="cb-expand-btn"
                            onClick={() => toggleDescription(boisson.id)}
                          >
                            {isDescriptionExpanded ? (
                              <>
                                <span>Voir moins</span>
                                <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                <span>Voir plus</span>
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ingredients Preview */}
                    {boisson.ingredients && boisson.ingredients.length > 0 && (
                      <div className="cb-ingredients-preview">
                        <List size={14} />
                        <span className="cb-ingredients-count">
                          {boisson.ingredients.length} ingrédient{boisson.ingredients.length > 1 ? 's' : ''}
                        </span>
                        <button 
                          className="cb-view-ingredients-btn"
                          onClick={() => handleViewIngredients(boisson)}
                        >
                          Voir liste
                        </button>
                      </div>
                    )}

                    {/* Details Row */}
                    <div className="cb-card-details">
                      <div className="cb-detail-item">
                        <Clock size={14} />
                        <span>{boisson.preparation_time || 5} min</span>
                      </div>
                      {boisson.calories > 0 && (
                        <div className="cb-detail-item">
                          <Flame size={14} />
                          <span>{boisson.calories} cal</span>
                        </div>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="cb-card-footer">
                      <div className="cb-price-section">
                        {boisson.on_promotion ? (
                          <div className="cb-promo-price">
                            <div className="cb-price-tag">
                              <strong className="cb-current-price">
                                {parseFloat(boisson.prix_promotion).toFixed(2)} Ar
                              </strong>
                              <span className="cb-original-price">
                                {parseFloat(boisson.prix).toFixed(2)} Ar
                              </span>
                            </div>
                            <div className="cb-discount-badge">
                              <Percent size={12} />
                              <span>-{boisson.promotion_percent}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="cb-price-tag">
                            <strong className="cb-current-price">
                              {parseFloat(boisson.prix).toFixed(2)} Ar
                            </strong>
                          </div>
                        )}
                      </div>
                      
                      <div className="cb-action-buttons">
                        <button 
                          className="cb-view-details-btn"
                          onClick={() => handleViewIngredients(boisson)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                        <motion.button
                          className="cb-buy-btn"
                          onClick={() => handleBuyBoisson(boisson)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                          }}
                        >
                          <ShoppingBag size={16} />
                          <span>Acheter</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="cb-empty">
            <div className="cb-empty-icon">
              <Coffee size={80} color="#dc2626" />
            </div>
            <h3>Aucune boisson trouvée</h3>
            <p>Essayez de modifier vos critères de recherche ou découvrez toutes nos boissons</p>
            <button 
              className="cb-clear-search-btn"
              onClick={clearFilters}
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
            >
              Voir toutes les boissons
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {!loading && filteredBoissons.length > 0 && (
          <div className="cb-stats-summary">
            <div className="cb-stat-item">
              <div className="cb-stat-icon">
                <Package size={24} />
              </div>
              <div>
                <span className="cb-stat-value">{boissons.length}</span>
                <span className="cb-stat-label">Boissons</span>
              </div>
            </div>
            <div className="cb-stat-item">
              <div className="cb-stat-icon">
                <Percent size={24} />
              </div>
              <div>
                <span className="cb-stat-value">
                  {boissons.filter(b => b.on_promotion).length}
                </span>
                <span className="cb-stat-label">Promotions</span>
              </div>
            </div>
            <div className="cb-stat-item">
              <div className="cb-stat-icon">
                <Crown size={24} />
              </div>
              <div>
                <span className="cb-stat-value">
                  {boissons.filter(b => b.popular).length}
                </span>
                <span className="cb-stat-label">Populaires</span>
              </div>
            </div>
            <div className="cb-stat-item">
              <div className="cb-stat-icon">
                <Zap size={24} />
              </div>
              <div>
                <span className="cb-stat-value">
                  {boissons.filter(b => b.is_new).length}
                </span>
                <span className="cb-stat-label">Nouveautés</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ingredients Modal */}
      <AnimatePresence>
        {showIngredientsModal && selectedBoisson && (
          <motion.div
            className="cb-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIngredientsModal(false)}
          >
            <motion.div
              className="cb-modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cb-modal-header">
                <div className="cb-modal-title">
                  <div className="cb-modal-title-icon">
                    <List size={24} />
                  </div>
                  <div>
                    <h2>{selectedBoisson.nom}</h2>
                    <p className="cb-modal-subtitle">Ingrédients et détails</p>
                  </div>
                </div>
                <button 
                  className="cb-modal-close"
                  onClick={() => setShowIngredientsModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="cb-modal-content">
                {/* Image */}
                {selectedBoisson.image_url && (
                  <div className="cb-modal-image">
                    <img src={selectedBoisson.image_url} alt={selectedBoisson.nom} />
                  </div>
                )}

                {/* Description */}
                <div className="cb-modal-section">
                  <h3>Description</h3>
                  <p className="cb-modal-description">
                    {selectedBoisson.description || 'Aucune description disponible.'}
                  </p>
                </div>

                {/* Ingredients */}
                <div className="cb-modal-section">
                  <h3>Ingrédients</h3>
                  {selectedBoisson.ingredients && selectedBoisson.ingredients.length > 0 ? (
                    <ul className="cb-ingredients-list">
                      {selectedBoisson.ingredients.map((ingredient, index) => (
                        <li key={index} className="cb-ingredient-item">
                          <div className="cb-ingredient-icon">
                            <Check size={16} />
                          </div>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="cb-no-ingredients">
                      <AlertTriangle size={24} />
                      <p>Aucun ingrédient défini pour cette boisson</p>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                <div className="cb-modal-grid">
                  <div className="cb-modal-detail">
                    <div className="cb-modal-detail-icon">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="cb-modal-detail-label">Prix</p>
                      <p className="cb-modal-detail-value">
                        {selectedBoisson.on_promotion ? (
                          <>
                            <span className="cb-modal-price-promo">
                              {parseFloat(selectedBoisson.prix_promotion).toFixed(2)} Ar
                            </span>
                            <span className="cb-modal-price-original">
                              {parseFloat(selectedBoisson.prix).toFixed(2)} Ar
                            </span>
                          </>
                        ) : (
                          <span className="cb-modal-price-normal">
                            {parseFloat(selectedBoisson.prix).toFixed(2)} Ar
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="cb-modal-detail">
                    <div className="cb-modal-detail-icon">
                      <Thermometer size={20} />
                    </div>
                    <div>
                      <p className="cb-modal-detail-label">Température</p>
                      <p className="cb-modal-detail-value">
                        {selectedBoisson.temperature === 'hot' && 'Chaud'}
                        {selectedBoisson.temperature === 'cold' && 'Froid'}
                        {selectedBoisson.temperature === 'both' && 'Chaud/Froid'}
                      </p>
                    </div>
                  </div>

                  <div className="cb-modal-detail">
                    <div className="cb-modal-detail-icon">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="cb-modal-detail-label">Préparation</p>
                      <p className="cb-modal-detail-value">{selectedBoisson.preparation_time || 5} min</p>
                    </div>
                  </div>

                  <div className="cb-modal-detail">
                    <div className="cb-modal-detail-icon">
                      <Flame size={20} />
                    </div>
                    <div>
                      <p className="cb-modal-detail-label">Calories</p>
                      <p className="cb-modal-detail-value">{selectedBoisson.calories || 0} cal</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cb-modal-footer">
                <button 
                  className="cb-modal-secondary-btn"
                  onClick={() => setShowIngredientsModal(false)}
                >
                  Retour au menu
                </button>
                <button 
                  className="cb-modal-primary-btn"
                  onClick={() => {
                    handleBuyBoisson(selectedBoisson);
                    setShowIngredientsModal(false);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  }}
                >
                  <ShoppingBag size={18} />
                  Ajouter au panier
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientBoissons;
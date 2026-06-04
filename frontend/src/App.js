import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from './services/api';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/js/AdminDashboard';
import AdminUsers from './pages/admin/js/AdminUsers';
import AdminBoissons from './pages/admin/js/AdminBoissons';
import AdminMachines from './pages/admin/js/AdminMachines';
import AdminStocks from './pages/admin/js/AdminStocks';
import AdminTransactions from './pages/admin/js/AdminTransactions';
import AdminPannes from './pages/admin/js/AdminPannes';
import AccountSettings from './pages/admin/js/AccountSettigns';
// Technicien Pages
import TechnicienDashboard from './pages/technicien/js/TechnicienDashboard';
import TechnicienMachines from './pages/technicien/js/TechnicienMachines';
import TechnicienStocks from './pages/technicien/js/TechnicienStocks';
import TechnicienPannes from './pages/technicien/js/TechnicienPannes';
import TechnicienApprovisionnements from './pages/technicien/js/TechnicienApprovisionnements';

// Client Pages
import ClientDashboard from './pages/client/js/ClientDashboard';
import ClientMachines from './pages/client/js/ClientMachines';
import ClientAcheter from './pages/client/js/ClientAcheter';
import ClientHistorique from './pages/client/js/ClientHistorique';
import ClientPaiement from './pages/client/js/ClientPaiement';
import ClientBoissons from './pages/client/js/ClientBoissons';


// ========== PROTECTED ROUTE COMPONENT ==========
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Vérifier l'authentification
  if (!isAuthenticated()) {
    console.warn('⚠️ Accès refusé: Utilisateur non authentifié');
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  // Double vérification (au cas où)
  if (!user) {
    console.warn('⚠️ Accès refusé: Aucune donnée utilisateur');
    return <Navigate to="/login" replace />;
  }

  // Vérifier les permissions de rôle
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`⚠️ Accès refusé: Rôle "${user.role}" non autorisé pour cette page`);
    
    // Redirection intelligente selon le rôle
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'technicien':
        return <Navigate to="/technicien/dashboard" replace />;
      case 'client':
        return <Navigate to="/client/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// ========== HOME REDIRECT COMPONENT ==========
const HomeRedirect = () => {
  // CRITIQUE: Vérifier l'authentification avant tout
  if (!isAuthenticated()) {
    console.log('🔒 Non authentifié - Redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  
  // Double vérification de sécurité
  if (!user) {
    console.log('⚠️ Aucun utilisateur - Redirection vers /login');
    return <Navigate to="/login" replace />;
  }
  
  // Redirection selon le rôle
  console.log(`✅ Utilisateur connecté (${user.role}) - Redirection vers dashboard`);
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'technicien':
      return <Navigate to="/technicien/dashboard" replace />;
    case 'client':
      return <Navigate to="/client/dashboard" replace />;
    default:
      console.log('⚠️ Rôle inconnu - Redirection vers /login');
      return <Navigate to="/login" replace />;
  }
};

// ========== APP COMPONENT ==========
function App() {
  return (
    <Router>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========== ADMIN ROUTES ========== */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/boissons"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBoissons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/machines"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMachines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stocks"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminStocks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pannes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPannes />
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/account-settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AccountSettings  />
            </ProtectedRoute>
          }
        />
        {/* ========== TECHNICIEN ROUTES ========== */}
        <Route
          path="/technicien/dashboard"
          element={
            <ProtectedRoute allowedRoles={['technicien', 'admin']}>
              <TechnicienDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicien/machines"
          element={
            <ProtectedRoute allowedRoles={['technicien', 'admin']}>
              <TechnicienMachines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicien/stocks"
          element={
            <ProtectedRoute allowedRoles={['technicien', 'admin']}>
              <TechnicienStocks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicien/pannes"
          element={
            <ProtectedRoute allowedRoles={['technicien', 'admin']}>
              <TechnicienPannes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicien/approvisionnements"
          element={
            <ProtectedRoute allowedRoles={['technicien', 'admin']}>
              <TechnicienApprovisionnements />
            </ProtectedRoute>
          }
        />
        
        {/* ========== CLIENT ROUTES ========== */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/machines"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientMachines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/boissons"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientBoissons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/acheter"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientAcheter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/historique"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientHistorique />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/paiements"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientPaiement />
            </ProtectedRoute>
          }
        />

        {/* ========== REDIRECTIONS ========== */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
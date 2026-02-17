import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MonCompte from './pages/MonCompte';
import Impetrants from './pages/Impetrants';
import Enseignants from './pages/Enseignants';
import Themes from './pages/Themes';
import Attribution from './pages/Attribution';
import Soutenances from './pages/Soutenances';
import Memoires from './pages/Memoires';
import MesEncadrements from './pages/MesEncadrements';
import MonDirecteur from './pages/MonDirecteur';
import Archives from './pages/Archives';
import GestionComptes from './pages/GestionComptes';
// Styles will be handled by Tailwind via `src/index.css`

/**
 * Composant ProtectedRoute pour protéger les routes
 * Vérifie que l'utilisateur est connecté et a les permissions requises
 */
const ProtectedRoute = ({ children, user, requiredPermission }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermission) {
        const hasPermission = user.permissions?.some(p => p.code === requiredPermission);
        if (!hasPermission) {
            return (
                <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f', backgroundColor: '#ffebee', borderRadius: '8px' }}>
                    ❌ Accès refusé : vous n'avez pas la permission pour cette page.
                </div>
            );
        }
    }

    return children;
};

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger l'utilisateur depuis localStorage au démarrage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const permissions = localStorage.getItem('permissions');
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                if (permissions) {
                    userData.permissions = JSON.parse(permissions);
                }
                setCurrentUser(userData);
            } catch (e) {
                console.error('Erreur au chargement de l\'utilisateur:', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('permissions');
            }
        }
        setLoading(false);
    }, []);

    // Gère la connexion réussie
    const handleLogin = (userData) => {
        setCurrentUser(userData);
    };

    // Gère la déconnexion
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Chargement...</div>;
    }

    return (
        <Routes>
                {/* Routes publiques - LOGIN & REGISTER */}
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />

                {/* Routes protégées - Avec Sidebar */}
                {currentUser ? (
                    <Route
                        path="/*"
                        element={
                            <div style={{ display: 'flex', minHeight: '100vh' }}>
                                <Sidebar user={currentUser} onLogout={handleLogout} />
                                <div style={{ marginLeft: '260px', flex: 1, overflow: 'auto', padding: '20px', backgroundColor: '#f4f7f6' }}>
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard user={currentUser} onLogout={handleLogout} />} />
                                        <Route path="/mon-compte" element={<MonCompte user={currentUser} />} />
                                        
                                        {/* Routes IMPETRANTS (P1) */}
                                        <Route path="/impetrants" element={
                                            <ProtectedRoute user={currentUser} requiredPermission="UC-GImp-01">
                                                <Impetrants user={currentUser} />
                                            </ProtectedRoute>
                                        } />
                                        
                                        {/* Routes ENSEIGNANTS (P2) */}
                                        <Route path="/enseignants" element={
                                            <ProtectedRoute user={currentUser} requiredPermission="UC-GEns-01">
                                                <Enseignants user={currentUser} />
                                            </ProtectedRoute>
                                        } />
                                        
                                        {/* Routes THEMES (P3) */}
                                        <Route path="/themes" element={
                                            <ProtectedRoute user={currentUser}>
                                                <Themes user={currentUser} />
                                            </ProtectedRoute>
                                        } />
                                        
                                        {/* Routes ATTRIBUTIONS (P4) */}
                                        <Route path="/attributions" element={
                                            <ProtectedRoute user={currentUser} requiredPermission="UC-ADM-01">
                                                <Attribution user={currentUser} />
                                            </ProtectedRoute>
                                        } />
                                        
                                        {/* Routes SOUTENANCES (P5) */}
                                        <Route path="/soutenances" element={
                                            <ProtectedRoute user={currentUser}>
                                                <Soutenances user={currentUser} />
                                            </ProtectedRoute>
                                        } />
                                        
                                        {/* Routes MEMOIRES (P5) */}
                                        <Route path="/memoires" element={
                                            <ProtectedRoute user={currentUser}>
                                                <Memoires user={currentUser} />
                                            </ProtectedRoute>
                                        } />

                                        {/* Routes ENCADREMENTS (P5) */}
                                        <Route path="/mes-encadrements" element={
                                            <ProtectedRoute user={currentUser}>
                                                <MesEncadrements user={currentUser} />
                                            </ProtectedRoute>
                                        } />

                                        {/* Routes DIRECTEUR (P5) */}
                                        <Route path="/mon-directeur" element={
                                            <ProtectedRoute user={currentUser}>
                                                <MonDirecteur user={currentUser} />
                                            </ProtectedRoute>
                                        } />

                                        {/* Routes ARCHIVES (P6) */}
                                        <Route path="/archives" element={
                                            <ProtectedRoute user={currentUser} requiredPermission="UC-AM-03">
                                                <Archives user={currentUser} />
                                            </ProtectedRoute>
                                        } />

                                        {/* Routes GESTION COMPTES (P7) */}
                                        <Route path="/gestion-comptes" element={
                                            <ProtectedRoute user={currentUser} requiredPermission="UC-GCU-01">
                                                <GestionComptes user={currentUser} />
                                            </ProtectedRoute>
                                        } />

                                        {/* Redirection par défaut */}
                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </div>
                            </div>
                        }
                    />
                ) : (
                    <Route path="*" element={<Navigate to="/login" replace />} />
                )}
            </Routes>
    );
}

export default App;
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('login'); // 'login', 'register', ou 'dashboard'

    // Gère la connexion réussie
    const handleLogin = (userData) => {
        setCurrentUser(userData);
        setView('dashboard'); 
    };

    // Gère la déconnexion
    const handleLogout = () => {
    localStorage.removeItem('token'); // On vide le badge de sécurité
    setCurrentUser(null);
    setView('login');
};

    // Fonctions de navigation simple
    const goToRegister = () => setView('register');
    const goToLogin = () => setView('login');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            {currentUser ? (
                /* --- SI CONNECTÉ --- */
                <Dashboard user={currentUser} onLogout={handleLogout} />
            ) : (
                /* --- SI DÉCONNECTÉ --- */
                <>
                    {view === 'login' && (
                        <Login 
                            onLogin={handleLogin} 
                            onGoToRegister={goToRegister} 
                        />
                    )}
                    
                    {view === 'register' && (
                        <Register 
                            onGoToLogin={goToLogin} 
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;
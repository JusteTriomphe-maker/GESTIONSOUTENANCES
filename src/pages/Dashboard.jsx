import { useState, useEffect, useCallback } from 'react';
import Impetrants from './Impetrants';
import Enseignants from './Enseignants';
import Themes from './Themes';
import Attribution from './Attribution';
import Memoires from './Memoires';
import Soutenances from './Soutenances';
import Archives from './Archives';
import MonCompte from './MonCompte';
import GestionComptes from './GestionComptes';
import MesEncadrements from './MesEncadrements';
import MonDirecteur from './MonDirecteur';

// --- CONFIGURATION DES MENUS PAR RÔLE ---
// C'est ICI que tu gères le titre et l'ordre des boutons comme "GESTION DES SOUTENANCES"
const MENU_CONFIG = {
    'ADMIN': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'impetrants', icon: '🎓', label: 'Gestion des Impétrants' },
        { id: 'enseignants', icon: '👨‍🏫', label: 'Gestion des Enseignants' },
        { id: 'themes', icon: '📝', label: 'Gestion des Thèmes' },
        { id: 'attribution', icon: '🤝', label: 'Attribution Directeur' },
        { id: 'soutenances', icon: '📅', label: 'Planification' },
        { id: 'archives', icon: '📁', label: 'Archivage' },
        { id: 'comptes', icon: '🔐', label: 'Gestion des Comptes' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' } // Présent dans la config, mais affiché en bas via le JSX
    ],
    'GESTIONNAIRE': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'impetrants', icon: '🎓', label: 'Gestion des Impétrants' },
        { id: 'enseignants', icon: '👨‍🏫', label: 'Gestion des Enseignants' },
        { id: 'themes', icon: '📝', label: 'Gestion des Thèmes' },
        { id: 'attribution', icon: '🤝', label: 'Attribution Directeur' },
        { id: 'soutenances', icon: '📅', label: 'Planification' },
        { id: 'archives', icon: '📁', label: 'Archivage' },
        { id: 'comptes', icon: '🔐', label: 'Gestion des Comptes' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'COORDONNATEUR': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'impetrants', icon: '🎓', label: 'Gestion des Impétrants' },
        { id: 'enseignants', icon: '👨‍🏫', label: 'Gestion des Enseignants' },
        { id: 'themes', icon: '✅', label: 'Validation Thèmes' },
        { id: 'attribution', icon: '🤝', label: 'Attribution Directeur' },
        { id: 'soutenances', icon: '📅', label: 'Planification' },
        { id: 'archives', icon: '📁', label: 'Archivage' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'ENSEIGNANT': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'themes', icon: '📝', label: 'Mes Thèmes' },
        { id: 'encadrements', icon: '👥', label: 'Mes Encadrements' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'ETUDIANT': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'themes', icon: '📝', label: 'Mon Thème' },
        { id: 'mon-directeur', icon: '🤝', label: 'Mon Directeur' },
        { id: 'memoires', icon: '📄', label: 'Mon Mémoire' },
        { id: 'soutenances', icon: '📅', label: 'Ma Soutenance' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'PRESIDENT_JURY': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'jurys', icon: '⚖️', label: 'Mes Jurys' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'MEMBRE_JURY': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'jurys', icon: '⚖️', label: 'Mes Jurys' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'COMMISSION': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'themes', icon: '✅', label: 'Validation Thèmes' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'PARTENAIRE': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'themes', icon: '📝', label: 'Mes Thèmes Proposés' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ],
    'BIBLIOTHECAIRE': [
        { id: 'home', icon: '📊', label: 'Vue d\'ensemble' },
        { id: 'archives', icon: '📁', label: 'Archives' },
        { id: 'profile', icon: '👤', label: 'Mon Compte' }
    ]
};

const getMenuForRole = (role) => MENU_CONFIG[role] || [];

// Helper function to safely fetch data
const safeFetch = async (url, options = {}) => {
    try {
        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        
        const response = await fetch(url, { 
            ...options, 
            headers: { ...headers, ...options.headers } 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return { success: false, error: error.message, data: [] };
    }
};

const Dashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    // States pour les données réelles
    const [stats, setStats] = useState({
        totalSoutenances: 0,
        soutenancesValidees: 0,
        soutenancesPlanifiees: 0,
        memoiresTotal: 0,
        memoiresDeposés: 0,
        memoiresEnAttente: 0,
        memoiresRejetes: 0,
        themesTotal: 0,
        themesValidés: 0,
        themesEnAttente: 0,
        totalImpetrants: 0,
        totalEnseignants: 0,
        attributionsTotal: 0
    });
    const [soutenances, setSoutenances] = useState([]);
    const [upcomingSoutenances, setUpcomingSoutenances] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Theme colors
    const theme = {
        sidebarWidth: '280px',
        colors: {
            sidebarBg: '#1C2434',
            sidebarHover: '#2E3A47',
            bodyBg: '#F1F5F9',
            white: '#FFFFFF',
            primary: '#234666',
            accent: '#3C50E0',
            textTitle: '#1C2434',
            textBody: '#64748B',
            textLight: '#94A3B8',
            danger: '#D34053',
            success: '#10B981',
            warning: '#F0950E',
            border: '#E2E8F0',
            cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
    };

    // Fonction pour récupérer TOUTES les données du dashboard
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('📊 Fetching dashboard data...');
            
            const [soutRes, memRes, attrRes, themeRes, impRes, ensRes] = await Promise.all([
                safeFetch('/api/soutenances'),
                safeFetch('/api/memoires'),
                safeFetch('/api/attributions'),
                safeFetch('/api/themes'),
                safeFetch('/api/impetrants'),
                safeFetch('/api/enseignants')
            ]);

            const soutenancesData = soutRes.success && Array.isArray(soutRes.data) ? soutRes.data : [];
            const now = new Date();
            const upcoming = soutenancesData
                .filter(s => new Date(s.date_soutenance) >= now)
                .sort((a, b) => new Date(a.date_soutenance) - new Date(b.date_soutenance))
                .slice(0, 5);

            const memoiresData = memRes.success && Array.isArray(memRes.data) ? memRes.data : [];
            const attributionsData = attrRes.success && Array.isArray(attrRes.data) ? attrRes.data : [];
            const themesData = themeRes.success && Array.isArray(themeRes.data) ? themeRes.data : [];
            const impetrantsData = impRes.success && Array.isArray(impRes.data) ? impRes.data : [];
            const enseignantsData = ensRes.success && Array.isArray(ensRes.data) ? ensRes.data : [];

            const newStats = {
                totalSoutenances: soutenancesData.length,
                soutenancesValidees: soutenancesData.filter(s => s.statut_soutenance === 'Validée').length,
                soutenancesPlanifiees: soutenancesData.filter(s => s.statut_soutenance === 'Planifiée' || !s.statut_soutenance).length,
                memoiresTotal: memoiresData.length,
                memoiresDeposés: memoiresData.filter(m => m.statut_validation === 'Validé').length,
                memoiresEnAttente: memoiresData.filter(m => m.statut_validation === 'En attente' || !m.statut_validation).length,
                memoiresRejetes: memoiresData.filter(m => m.statut_validation === 'Rejeté').length,
                themesTotal: themesData.length,
                themesValidés: themesData.filter(t => t.statut_theme === 'Validé').length,
                themesEnAttente: themesData.filter(t => t.statut_theme === 'En attente').length,
                totalImpetrants: impetrantsData.length,
                totalEnseignants: enseignantsData.length,
                attributionsTotal: attributionsData.length
            };

            console.log('✅ Stats calculated:', newStats);
            setStats(newStats);
            setSoutenances(soutenancesData.filter(s => !s.est_archivee));
            setUpcomingSoutenances(upcoming);

            const recent = soutenancesData
                .slice(0, 5)
                .map(s => ({
                    id: s.id_soutenance,
                    title: `${s.prenom_etudiant || 'Étudiant'} ${s.nom_etudiant || ''}`,
                    subtitle: s.theme_titre || 'Sujet non défini',
                    date: s.date_soutenance,
                    heure: s.heure_soutenance,
                    status: s.statut_soutenance,
                    salle: s.salle
                }));
            setRecentActivity(recent);

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setError('Erreur lors du chargement des données.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'home') {
            fetchDashboardData();
        }
    }, [view, fetchDashboardData]);

    // --- LOGIQUE CALENDRIER ---
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const getSoutenancesForDay = (day) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return soutenances.filter(s => {
            const dateSout = new Date(s.date_soutenance).toISOString().split('T')[0];
            return dateSout === dateStr;
        });
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = [];
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

        for (let i = 0; i < firstDayOfMonth(year, month); i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '12px' }}></div>);
        }

        for (let d = 1; d <= daysInMonth(year, month); d++) {
            const soutenancesCeJour = getSoutenancesForDay(d);
            const isSoutenance = soutenancesCeJour.length > 0;
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div 
                    key={d} 
                    style={{
                        padding: '8px', 
                        textAlign: 'center', 
                        borderRadius: '8px',
                        backgroundColor: isSoutenance ? `${theme.colors.accent}15` : isToday ? `${theme.colors.primary}10` : 'transparent',
                        color: isSoutenance ? theme.colors.accent : isToday ? theme.colors.primary : theme.colors.textTitle,
                        fontWeight: isSoutenance || isToday ? 'bold' : 'normal',
                        fontSize: '14px',
                        border: isSoutenance ? `1px solid ${theme.colors.accent}` : isToday ? `1px solid ${theme.colors.primary}` : '1px solid transparent',
                        cursor: isSoutenance ? 'pointer' : 'default'
                    }}
                    title={isSoutenance ? soutenancesCeJour.map(s => `${s.prenom_etudiant || ''} ${s.nom_etudiant || ''} - ${s.salle || ''}`).join('\n') : ''}
                >
                    <span style={{ fontSize: '13px' }}>{d}</span>
                    {isSoutenance && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
                            {soutenancesCeJour.slice(0, 3).map((_, idx) => (
                                <div key={idx} style={{ width: '5px', height: '5px', backgroundColor: theme.colors.accent, borderRadius: '50%' }} />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: theme.colors.cardShadow, border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: theme.colors.textTitle, fontWeight: '600' }}>
                        📅 {monthNames[month]} {year}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setCurrentMonth(new Date(year, month - 1))} style={{ padding: '6px 12px', border: `1px solid ${theme.colors.border}`, background: 'white', cursor: 'pointer', borderRadius: '6px', color: theme.colors.textBody }}>←</button>
                        <button onClick={() => setCurrentMonth(new Date(year, month + 1))} style={{ padding: '6px 12px', border: `1px solid ${theme.colors.border}`, background: 'white', cursor: 'pointer', borderRadius: '6px', color: theme.colors.textBody }}>→</button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                        <div key={day} style={{ fontWeight: '600', textAlign: 'center', paddingBottom: '10px', color: theme.colors.textBody, fontSize: '12px', textTransform: 'uppercase' }}>{day}</div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    // Carte statistique stylisée
    const StatCard = ({ title, value, color, icon, subtitle }) => (
        <div style={{ backgroundColor: theme.colors.white, padding: '20px', borderRadius: '12px', flex: '1', minWidth: '180px', boxShadow: theme.colors.cardShadow, border: `1px solid ${theme.colors.border}`, transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                    {icon}
                </div>
                {subtitle && <span style={{ fontSize: '11px', color: color, backgroundColor: `${color}15`, padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>{subtitle}</span>}
            </div>
            <p style={{ margin: 0, color: theme.colors.textBody, fontSize: '13px', fontWeight: '500' }}>{title}</p>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '28px', color: theme.colors.textTitle, fontWeight: '700' }}>{loading ? '...' : value}</h3>
        </div>
    );

    const NavButton = ({ id, icon, label }) => {
        const active = view === id;
        return (
            <button onClick={() => setView(id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', marginBottom: '4px', backgroundColor: active ? theme.colors.sidebarHover : 'transparent', color: active ? theme.colors.white : '#8A99AF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
                <span style={{ fontSize: '16px' }}>{icon}</span> {label}
            </button>
        );
    };

    const userMenu = getMenuForRole(user.role);

    // --- RENDU PRINCIPAL ---
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: theme.colors.bodyBg, fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden' }}>
            {/* --- SIDEBAR --- */}
            <aside style={{ width: theme.sidebarWidth, backgroundColor: theme.colors.sidebarBg, padding: '25px 18px', display: 'flex', flexDirection: 'column' }}>
                {/* Titre Application */}
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🎓</span> <span>GESTION DES SOUTENANCES</span>
                </div>

                {/* Liste Navigation Principale (Scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                    {userMenu.filter(item => item.id !== 'profile').map(item => <NavButton key={item.id} id={item.id} icon={item.icon} label={item.label} />)}
                </div>

                {/* Pied de page Sidebar (Fixe en bas) */}
                <div style={{ borderTop: `1px solid ${theme.colors.sidebarHover}`, paddingTop: '20px' }}>
                    
                    {/* Bouton Mon Compte (Visible et Fixe) */}
                    <NavButton id="profile" icon="👤" label="Mon Compte" />

                    {/* Infos Utilisateur */}
                    <div style={{ padding: '16px', backgroundColor: theme.colors.sidebarHover, borderRadius: '10px', marginBottom: '12px', marginTop: '12px' }}>
                        <p style={{ color: 'white', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{user.nom} {user.prenom}</p>
                        <p style={{ color: '#8A99AF', margin: 0, fontSize: '12px' }}>{user.role}</p>
                    </div>

                    {/* Bouton Déconnexion */}
                    <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', backgroundColor: 'transparent', color: theme.colors.danger, border: `1px solid ${theme.colors.danger}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                        🚪 Déconnexion
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '30px', color: theme.colors.textTitle, fontWeight: '700' }}>{view === 'home' ? 'Dashboard' : userMenu.find(m => m.id === view)?.label || 'Dashboard'}</h1>
                        <p style={{ margin: '6px 0 0 0', color: theme.colors.textBody, fontSize: '14px' }}>Bienvenue sur la plateforme de gestion des soutenances. Consultez les statistiques et gérez les activités académiques.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={fetchDashboardData} style={{ padding: '10px 16px', backgroundColor: theme.colors.white, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.colors.textBody }}>🔄 Actualiser</button>
                        <span style={{ padding: '10px 16px', backgroundColor: theme.colors.white, borderRadius: '8px', fontSize: '13px', color: theme.colors.textBody, border: `1px solid ${theme.colors.border}` }}>
                            📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </header>

                {error && (
                    <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: theme.colors.danger, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* --- VUES GÉNÉRALES --- */}
                {view === 'impetrants' && <Impetrants />}
                {view === 'enseignants' && <Enseignants />}
                {view === 'themes' && <Themes user={user} />}
                {view === 'attribution' && <Attribution />}
                {view === 'memoires' && <Memoires user={user} />}
                {view === 'soutenances' && <Soutenances user={user} />}
                {view === 'archives' && <Archives />}
                
                {/* --- VUES SPÉCIFIQUES --- */}
                {view === 'comptes' && <GestionComptes />}
                {view === 'profile' && <MonCompte user={user} onLogout={onLogout} />}
                {view === 'mon-directeur' && <MonDirecteur user={user} />}
                {view === 'encadrements' && <MesEncadrements user={user} />}
                
                {/* Placeholder pour les Jurys */}
                {view === 'jurys' && (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
                        <h2>⚖️ Gestion des Jurys</h2>
                        <p>Cette fonctionnalité est en cours de développement.</p>
                    </div>
                )}

                {/* --- DASHBOARD HOME --- */}
                {view === 'home' && (
                    <>
                        {/* CARTES STATISTIQUES */}
                        <div style={{ marginBottom: '28px' }}>
                            <h3 style={{ marginBottom: '16px', color: theme.colors.textTitle, fontSize: '18px', fontWeight: '600' }}>📊 Vue d'ensemble</h3>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <StatCard title="Total Soutenances" value={stats.totalSoutenances} color={theme.colors.accent} icon="📅" subtitle={`${stats.soutenancesValidees} validées`} />
                                <StatCard title="Mémoires Déposés" value={stats.memoiresDeposés} color={theme.colors.success} icon="📄" subtitle={`${stats.memoiresEnAttente} en attente`} />
                                <StatCard title="Thèmes Validés" value={stats.themesValidés} color={theme.colors.primary} icon="✅" subtitle={`${stats.themesEnAttente} en attente`} />
                                <StatCard title="Impétrants" value={stats.totalImpetrants} color={theme.colors.warning} icon="🎓" subtitle={`${stats.attributionsTotal} attribués`} />
                                <StatCard title="Enseignants" value={stats.totalEnseignants} color={theme.colors.danger} icon="👨‍🏫" />
                            </div>
                        </div>

                        {/* CALENDRIER ET ACTIVITÉS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                            {/* Calendrier */}
                            <div>
                                <h3 style={{ marginBottom: '14px', color: theme.colors.textTitle, fontSize: '18px', fontWeight: '600' }}>📆 Calendrier des Soutenances</h3>
                                {renderCalendar()}
                            </div>

                            {/* Activité Récente */}
                            <div>
                                <h3 style={{ marginBottom: '14px', color: theme.colors.textTitle, fontSize: '18px', fontWeight: '600' }}>📋 Activité Récente</h3>
                                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: theme.colors.cardShadow, border: `1px solid ${theme.colors.border}` }}>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.textBody }}>
                                            <span style={{ fontSize: '24px' }}>⏳</span>
                                            <p>Chargement des données...</p>
                                        </div>
                                    ) : recentActivity.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.textBody }}>
                                            <span style={{ fontSize: '32px' }}>📭</span>
                                            <p>Aucune activité récente</p>
                                        </div>
                                    ) : (
                                        recentActivity.map((activity, index) => (
                                            <div key={activity.id || index} style={{ padding: '14px', borderBottom: index < recentActivity.length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: 0, fontWeight: '600', color: theme.colors.textTitle, fontSize: '14px' }}>{activity.title}</p>
                                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.colors.textBody }}>{activity.subtitle}</p>
                                                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.colors.textLight }}>🏠 {activity.salle || 'Salle non définie'}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                                                        <p style={{ margin: 0, fontSize: '12px', color: theme.colors.textBody, fontWeight: '500' }}>{activity.date ? new Date(activity.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Date non définie'}</p>
                                                        {activity.heure && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.colors.textLight }}>⏰ {activity.heure}</p>}
                                                        <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', backgroundColor: activity.status === 'Validée' ? '#D1FAE5' : '#FEF3C7', color: activity.status === 'Validée' ? '#059669' : '#D97706' }}>
                                                            {activity.status || 'Planifiée'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* LIENS RAPIDES */}
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ marginBottom: '15px', color: theme.colors.textTitle, fontSize: '18px', fontWeight: '600' }}>⚡ Accès Rapides</h3>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                {userMenu.slice(0, 4).map(item => (
                                    <button key={item.id} onClick={() => setView(item.id)} style={{ padding: '15px 25px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: theme.colors.textTitle, transition: '0.3s' }}>
                                        <span>{item.icon}</span> {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
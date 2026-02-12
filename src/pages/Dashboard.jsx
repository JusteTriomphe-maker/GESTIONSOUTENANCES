import { useState } from 'react';
import Impetrants from './Impetrants';
import Enseignants from './Enseignants';
import Themes from './Themes';
import Attribution from './Attribution';
import Memoires from './Memoires';
import Soutenances from './Soutenances';
import Archives from './Archives';

const Dashboard = ({ user, onLogout }) => {
    const [view, setView] = useState('home');
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // Janvier 2026

    const isAdmin = user.role === 'ADMIN' || user.role === 'GESTIONNAIRE';

    const theme = {
        sidebarWidth: '280px',
        headerHeight: '70px',
        colors: {
            sidebarBg: '#1C2434',
            bodyBg: '#F1F5F9',
            white: '#FFFFFF',
            primary: '#234666', 
            accent: '#3C50E0',
            textTitle: '#1C2434',
            textBody: '#64748B',
            danger: '#D34053',
            success: '#10B981'
        }
    };

    // --- LOGIQUE CALENDRIER FONCTIONNELLE ---
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = [];
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

        // Cases vides
        for (let i = 0; i < firstDayOfMonth(year, month); i++) {
            days.push(<div key={`empty-${i}`} style={{ padding: '12px' }}></div>);
        }

        // Jours réels
        for (let d = 1; d <= daysInMonth(year, month); d++) {
            const isSoutenance = (month === 0 && (d === 15 || d === 22)); // Simulation pour Janvier
            days.push(
                <div key={d} style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    backgroundColor: isSoutenance ? '#EBF0FF' : 'transparent',
                    color: isSoutenance ? theme.colors.accent : theme.colors.textTitle,
                    fontWeight: isSoutenance ? 'bold' : 'normal',
                    fontSize: '14px',
                    border: isSoutenance ? `1px solid ${theme.colors.accent}` : '1px solid transparent',
                    transition: '0.3s'
                }}>
                    {d}
                    {isSoutenance && <div style={{ width: '4px', height: '4px', backgroundColor: theme.colors.accent, borderRadius: '50%', margin: '2px auto 0' }}></div>}
                </div>
            );
        }

        return (
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: theme.colors.textTitle }}>{monthNames[month]} {year}</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setCurrentMonth(new Date(year, month - 1))} style={{ padding: '5px 12px', border: '1px solid #eee', background: 'white', cursor: 'pointer', borderRadius: '6px' }}>&lt;</button>
                        <button onClick={() => setCurrentMonth(new Date(year, month + 1))} style={{ padding: '5px 12px', border: '1px solid #eee', background: 'white', cursor: 'pointer', borderRadius: '6px' }}>&gt;</button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                        <div key={day} style={{ fontWeight: 'bold', textAlign: 'center', paddingBottom: '12px', color: theme.colors.textBody, fontSize: '12px' }}>{day}</div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    // --- SOUS-COMPOSANTS (TES PROPRES COMPOSANTS) ---
    const StatCard = ({ title, value, color }) => (
        <div style={{
            backgroundColor: theme.colors.white,
            padding: '20px',
            borderRadius: '12px',
            flex: '1',
            minWidth: '220px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            borderLeft: `5px solid ${color}`
        }}>
            <p style={{ margin: 0, color: theme.colors.textBody, fontSize: '14px' }}>{title}</p>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '26px', color: theme.colors.textTitle, fontWeight: '700' }}>{value}</h3>
        </div>
    );

    const NavButton = ({ id, icon, label }) => {
        const active = view === id;
        return (
            <button onClick={() => setView(id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 15px', marginBottom: '8px',
                backgroundColor: active ? '#2E3A47' : 'transparent', color: active ? '#FFFFFF' : '#8A99AF',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', transition: '0.3s', textAlign: 'left'
            }}>
                <span style={{ fontSize: '18px' }}>{icon}</span> {label}
            </button>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: theme.colors.bodyBg, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            
            {/* SIDEBAR */}
            <aside style={{ width: theme.sidebarWidth, backgroundColor: theme.colors.sidebarBg, padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.colors.accent }}></div> CFI-CIRAS
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <NavButton id="home" icon="🏠" label="Vue d'ensemble" />
                    {isAdmin && (
                        <>
                            <div style={{ color: '#5C677D', fontSize: '11px', margin: '25px 0 10px 15px', fontWeight: 'bold', letterSpacing: '1px' }}>GESTION ACADÉMIQUE</div>
                            <NavButton id="impetrants" icon="🎓" label="Impétrants" />
                            <NavButton id="enseignants" icon="👨‍🏫" label="Enseignants" />
                            <NavButton id="themes" icon="📝" label="Thèmes" />
                            <NavButton id="soutenances" icon="📅" label="Soutenances" />
                            <NavButton id="archives" icon="📁" label="Archives" />
                        </>
                    )}
                </div>
                <button onClick={onLogout} style={{ padding: '12px', background: 'rgba(211, 64, 83, 0.1)', color: theme.colors.danger, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}>Déconnexion</button>
            </aside>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ height: theme.headerHeight, backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 35px', borderBottom: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textTitle }}>{view === 'home' ? 'Tableau de Bord' : view.toUpperCase()}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: theme.colors.textTitle }}>{user.nom}</div>
                            <div style={{ fontSize: '11px', color: theme.colors.accent, fontWeight: '600' }}>{user.role}</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '35px', overflowY: 'auto' }}>
                    {view === 'home' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            
                            {/* STATS RAPIDES */}
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <StatCard title="Total Soutenances" value="0" color={theme.colors.primary} />
                                <StatCard title="Mémoires Déposés" value="0" color={theme.colors.success} />
                                <StatCard title="En attente de Jury" value="0" color="#F0950E" />
                                <StatCard title="Taux de Réussite" value="0%" color="#8A99AF" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                                
                                {/* SECTION GAUCHE */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    {/* RACCOURCIS */}
                                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 20px 0' }}>Raccourcis rapides</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                                            <button onClick={() => setView('impetrants')} style={quickLinkStyle}>➕ Nouvel Impétrant</button>
                                            <button onClick={() => setView('themes')} style={quickLinkStyle}>📄 Déposer Thème</button>
                                            <button onClick={() => setView('soutenances')} style={quickLinkStyle}>🕒 Programmer</button>
                                        </div>
                                    </div>

                                    {/* FLUX */}
                                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px' }}>
                                        <h4 style={{ marginTop: 0, borderBottom: '1px solid #F1F5F9', paddingBottom: '15px' }}>Flux des Soutenances</h4>
                                        <div style={{ padding: '30px', borderRadius: '8px', border: '1px dashed #D1D5DB', textAlign: 'center', color: '#8A99AF', marginTop: '15px' }}>
                                            Aucune soutenance prévue aujourd'hui.
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION DROITE */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    {renderCalendar()}
                                    
                                    <div style={{ backgroundColor: theme.colors.primary, color: 'white', padding: '25px', borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>Prochains événements</h4>
                                        <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: '1.6' }}>
                                            Les dates de jury et les soutenances à venir s'afficheront ici automatiquement après saisie.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', minHeight: '80%' }}>
                            {view === 'impetrants' && <Impetrants />}
                            {view === 'enseignants' && <Enseignants />}
                            {view === 'themes' && <Themes />}
                            {view === 'attribution' && <Attribution />}
                            {view === 'memoires' && <Memoires />}
                            {view === 'soutenances' && <Soutenances />}
                            {view === 'archives' && <Archives />}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const quickLinkStyle = {
    padding: '15px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    background: '#F8FAFC',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#234666',
    transition: '0.2s',
    textAlign: 'center'
};

export default Dashboard;
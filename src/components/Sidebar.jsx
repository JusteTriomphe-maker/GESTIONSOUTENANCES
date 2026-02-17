import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Sidebar dynamique basée sur le rôle utilisateur
 * Affiche uniquement les menus auxquels l'utilisateur a accès
 */

const Sidebar = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    // Déterminer les menus disponibles selon le rôle
    const getMenusByRole = (codeRole) => {
        const menuMap = {
            ADMIN: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P7' },
                { label: 'Gestion Comptes', path: '/gestion-comptes', icon: '👥', package: 'P7' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            COORDONNATEUR: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'Multi' },
                { label: 'Impétrants', path: '/impetrants', icon: '👨‍🎓', package: 'P1' },
                { label: 'Enseignants', path: '/enseignants', icon: '👨‍🏫', package: 'P2' },
                { label: 'Thèmes', path: '/themes', icon: '📚', package: 'P3' },
                { label: 'Attributions', path: '/attributions', icon: '🔗', package: 'P4' },
                { label: 'Soutenances', path: '/soutenances', icon: '🎓', package: 'P5' },
                { label: 'Archivage', path: '/archives', icon: '📦', package: 'P6' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            ENSEIGNANT: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P3/P5' },
                { label: 'Mes Thèmes', path: '/themes', icon: '📚', package: 'P3' },
                { label: 'Mes Encadrements', path: '/mes-encadrements', icon: '👨‍🎓', package: 'P5' },
                { label: 'Mon Directeur', path: '/mon-directeur', icon: '👥', package: 'P5' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            IMPETRANT: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P3/P5/P6' },
                { label: 'Mon Thème', path: '/themes', icon: '📚', package: 'P3' },
                { label: 'Mon Directeur', path: '/mon-directeur', icon: '👥', package: 'P5' },
                { label: 'Mon Mémoire', path: '/memoires', icon: '📄', package: 'P5' },
                { label: 'Ma Soutenance', path: '/soutenances', icon: '🎓', package: 'P5' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            PRESIDENT_JURY: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P6' },
                { label: 'Mes Jurys', path: '/mes-jurys', icon: '⚖️', package: 'P6' },
                { label: 'Validations', path: '/validations', icon: '✅', package: 'P6' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            MEMBRE_JURY: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P6' },
                { label: 'Mes Jurys', path: '/mes-jurys', icon: '⚖️', package: 'P6' },
                { label: 'Évaluations', path: '/evaluations', icon: '📋', package: 'P6' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            COMMISSION_VALIDATION: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P3' },
                { label: 'Validation Thèmes', path: '/themes', icon: '📚', package: 'P3' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            PARTENAIRE: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P3' },
                { label: 'Mes Thèmes', path: '/themes', icon: '📚', package: 'P3' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ],
            BIBLIOTHECAIRE: [
                { label: 'Dashboard', path: '/dashboard', icon: '📊', package: 'P6' },
                { label: 'Archives', path: '/archives', icon: '📦', package: 'P6' },
                { label: 'Gestion Exemplaires', path: '/exemplaires', icon: '📚', package: 'P6' },
                { label: 'Mon Profil', path: '/mon-compte', icon: '⚙️', package: 'P7' }
            ]
        };
        return menuMap[codeRole] || [];
    };

    const menus = getMenusByRole(user?.codeRole);

    // Tailwind-based classes. width toggles between w-64 and w-20
    const sidebarBase = isOpen ? 'w-64' : 'w-20';

    const handleMenuClick = (path) => {
        navigate(path);
    };

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-primary text-white px-4 py-6 ${sidebarBase} transition-width duration-300 shadow-md z-50 flex flex-col`}
               aria-hidden={false}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 h-12">
                <div className={`text-2xl font-bold transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    GESTION DES 
                    SOUTENANCES
                </div>
                <button className="text-xl text-white p-1" onClick={() => setIsOpen(!isOpen)} aria-label="toggle sidebar">
                    {isOpen ? '' : '☰'}
                </button>
            </div>

            {/* User info */}
            {user && (
                <div className={`mb-6 p-3 rounded-md bg-white/10 ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="font-semibold">{user.nom} {user.prenom}</div>
                    <div className="text-sm text-white/80">{user.email}</div>
                    <div className="mt-2 text-xs font-bold text-green-300">🎭 {user.nomRole}</div>
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                    {menus.map((menu, index) => (
                        <li key={index}>
                            <button
                                onClick={() => handleMenuClick(menu.path)}
                                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                            >
                                <span className="text-lg" aria-hidden>{menu.icon}</span>
                                <span className={`flex-1 truncate ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{menu.label}</span>
                                <span className={`text-xs text-white/70 ml-auto ${isOpen ? 'opacity-80' : 'opacity-0'}`}>{menu.package}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-6">
                <button
                    onClick={onLogout}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md font-bold transition-colors"
                >
                    {isOpen ? '🚪 Déconnexion' : '🚪'}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

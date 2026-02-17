import { useNavigate } from 'react-router-dom';

/**
 * Dashboard dynamique selon le rôle utilisateur
 * Affiche les packages et actions disponibles
 */
const Dashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();

    // Définir les cartes affichées par rôle
    const getCardsByRole = (codeRole) => {
        const cardMap = {
            ADMIN: [
                {
                    title: '👥 Gestion Comptes',
                    desc: 'Gérer les utilisateurs et leurs rôles',
                    action: () => navigate('/gestion-comptes'),
                    package: 'P7'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations personnelles',
                    action: () => navigate('/mon-compte'),
                    package: 'P7'
                }
            ],
            COORDONNATEUR: [
                {
                    title: '👨‍🎓 Gestion Impétrants',
                    desc: 'Ajouter, modifier et gérer les étudiants',  
                    action: () => navigate('/impetrants'),
                    package: 'P1',
                    color: '#4CAF50'
                },
                {
                    title: '👨‍🏫 Gestion Enseignants',
                    desc: 'Gérer les directeurs et encadreurs',
                    action: () => navigate('/enseignants'),
                    package: 'P2',
                    color: '#2196F3'
                },
                {
                    title: '📚 Gestion Thèmes',
                    desc: 'Créer et valider les thèmes de recherche',
                    action: () => navigate('/themes'),
                    package: 'P3',
                    color: '#FF9800'
                },
                {
                    title: '🔗 Attributions',
                    desc: 'Assigner directeurs et thèmes aux impétrants',
                    action: () => navigate('/attributions'),
                    package: 'P4',
                    color: '#9C27B0'
                },
                {
                    title: '🎓 Soutenances',
                    desc: 'Planifier et gérer les soutenances',
                    action: () => navigate('/soutenances'),
                    package: 'P5',
                    color: '#FF5722'
                },
                {
                    title: '📦 Archives',
                    desc: 'Archiver les mémoires et documents',
                    action: () => navigate('/archives'),
                    package: 'P6',
                    color: '#607D8B'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            ENSEIGNANT: [
                {
                    title: '📚 Mes Thèmes',
                    desc: 'Consulter et proposer des thèmes',
                    action: () => navigate('/themes'),
                    package: 'P3',
                    color: '#FF9800'
                },
                {
                    title: '👨‍🎓 Mes Encadrements',
                    desc: 'Voir les étudiants dont je suis directeur',
                    action: () => navigate('/mes-encadrements'),
                    package: 'P5',
                    color: '#2196F3'
                },
                {
                    title: '🎓 Mes Soutenances',
                    desc: 'Consulter mes jurys et évaluations',
                    action: () => navigate('/soutenances'),
                    package: 'P5',
                    color: '#FF5722'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            IMPETRANT: [
                {
                    title: '📚 Mon Thème',
                    desc: 'Consulter et changer mon thème de recherche',
                    action: () => navigate('/themes'),
                    package: 'P3',
                    color: '#FF9800'
                },
                {
                    title: '👥 Mon Directeur',
                    desc: 'Contacter mon directeur de mémoire',
                    action: () => navigate('/mon-directeur'),
                    package: 'P5',
                    color: '#4CAF50'
                },
                {
                    title: '📄 Mon Mémoire',
                    desc: 'Déposer et suivre mon mémoire',
                    action: () => navigate('/memoires'),
                    package: 'P5',
                    color: '#2196F3'
                },
                {
                    title: '🎓 Ma Soutenance',
                    desc: 'Consulter la date et la composition du jury',
                    action: () => navigate('/soutenances'),
                    package: 'P5',
                    color: '#FF5722'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            PRESIDENT_JURY: [
                {
                    title: '⚖️ Mes Jurys',
                    desc: 'Consulter les soutenances présidées',
                    action: () => navigate('/soutenances'),
                    package: 'P6',
                    color: '#FF5722'
                },
                {
                    title: '✅ Validations',
                    desc: 'Valider les résultats des évaluations',
                    action: () => navigate('/validations'),
                    package: 'P6',
                    color: '#4CAF50'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            MEMBRE_JURY: [
                {
                    title: '⚖️ Mes Jurys',
                    desc: 'Consulter les soutenances auxquelles je participe',
                    action: () => navigate('/soutenances'),
                    package: 'P6',
                    color: '#FF5722'
                },
                {
                    title: '📋 Évaluations',
                    desc: 'Évaluer et noter les étudiants',
                    action: () => navigate('/evaluations'),
                    package: 'P6',
                    color: '#2196F3'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            COMMISSION_VALIDATION: [
                {
                    title: '📚 Validation Thèmes',
                    desc: 'Valider les thèmes proposés',
                    action: () => navigate('/themes'),
                    package: 'P3',
                    color: '#FF9800'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            PARTENAIRE: [
                {
                    title: '📚 Mes Thèmes',
                    desc: 'Consulter mes domaines de recherche',
                    action: () => navigate('/themes'),
                    package: 'P3',
                    color: '#FF9800'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ],
            BIBLIOTHECAIRE: [
                {
                    title: '📦 Archives',
                    desc: 'Gérer l\'archivage des mémoires',
                    action: () => navigate('/archives'),
                    package: 'P6',
                    color: '#607D8B'
                },
                {
                    title: '📚 Exemplaires',
                    desc: 'Gérer les exemplaires physiques',
                    action: () => navigate('/exemplaires'),
                    package: 'P6',
                    color: '#795548'
                },
                {
                    title: '⚙️ Mon Profil',
                    desc: 'Modifier mes informations',
                    action: () => navigate('/mon-compte'),
                    package: 'P7',
                    color: '#666'
                }
            ]
        };
        return cardMap[codeRole] || [];
    };

    const cards = getCardsByRole(user?.codeRole);

    // Tailwind-based layout classes; dynamic colors kept inline where needed
    const containerClass = 'p-8 bg-gray-50 min-h-screen';
    const headerClass = 'mb-10 pb-5 border-b border-gray-200';
    const titleClass = 'text-3xl font-extrabold text-[#234666] mb-2';
    const subtitleClass = 'text-sm text-gray-600';
    const userInfoClass = 'text-sm text-gray-500 mt-2';
    const gridClass = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8';
    const cardBaseClass = 'bg-white rounded-lg p-6 shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer overflow-hidden border-2';
    const infoBoxClass = 'bg-blue-50 border border-blue-200 rounded-md p-4 mb-6';
    const logoutClass = 'mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold';

    return (
        <div className={containerClass}>
            {/* Header */}
            <div className={headerClass}>
                <h1 className={titleClass}>Welcome, {user?.prenom}! 👋</h1>
                <p className={subtitleClass}>Tableau de bord - Gestion des Soutenances CFI</p>
                <div className={userInfoClass}>
                    <strong>{user?.nom} {user?.prenom}</strong> | {user?.email}
                    <span className="ml-3 inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{user?.nomRole}</span>
                </div>
            </div>

            {/* Cards Grid */}
            <div className={gridClass}>
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={cardBaseClass}
                        style={{ borderColor: card.color || '#2196F3' }}
                        onClick={card.action}
                    >
                        <div className="text-lg font-semibold text-gray-800 mb-2">{card.title}</div>
                        <p className="text-sm text-gray-600 mb-4">{card.desc}</p>
                        <span className="inline-block text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: (card.color || '#2196F3') + '20', color: card.color || '#2196F3' }}>{card.package}</span>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className={infoBoxClass}>
                <h3 className="text-blue-600">ℹ️ À propos de votre compte</h3>
                <p className="text-gray-700 mb-1"><strong>Rôle:</strong> {user?.nomRole}</p>
                <p className="text-gray-700"><strong>Permissions:</strong> {user?.permissions?.length || 0} accès disponibles</p>
            </div>

            <button className={logoutClass} onClick={onLogout}>🚪 Se déconnecter</button>
        </div>
    );
};

export default Dashboard;
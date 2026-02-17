import { pool as db } from '../config/db.js';

/**
 * Middleware d'autorisation basé sur les rôles (RBAC)
 * Vérifie si l'utilisateur connecté a la permission requise
 */

// Récupérer les permissions d'un rôle depuis la base de données
const getRolePermissions = async (idRole) => {
    try {
        const [permissions] = await db.query(`
            SELECT p.code_permission 
            FROM role_permissions rp
            JOIN permissions p ON rp.id_permission = p.id_permission
            WHERE rp.id_role = ? AND rp.est_autorise = TRUE
        `, [idRole]);
        return permissions.map(p => p.code_permission);
    } catch (error) {
        console.error('Erreur récupération permissions:', error);
        return [];
    }
};

/**
 * Middleware : vérifier qu'une permission spécifique est autorisée
 * Usage : app.post('/route', checkPermission('UC-ADM-01'), controller);
 */
export const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // L'utilisateur doit déjà être authentifié via authMiddleware
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Non authentifié' });
            }

            // Récupérer le rôle de l'utilisateur
            const [userRole] = await db.query(`
                SELECT u.id_role, r.code_role, r.nom_role
                FROM utilisateurs u
                JOIN roles r ON u.id_role = r.id_role
                WHERE u.id = ? AND u.est_actif = TRUE
            `, [req.user.id]);

            if (!userRole || userRole.length === 0) {
                return res.status(403).json({ message: 'Utilisateur ou rôle introuvable' });
            }

            const { id_role, code_role, nom_role } = userRole[0];

            // Récupérer les permissions du rôle
            const permissions = await getRolePermissions(id_role);

            // Vérifier si la permission est présente
            if (!permissions.includes(requiredPermission)) {
                console.warn(`Accès refusé: ${req.user.email} (${code_role}) tentative d'accès à ${requiredPermission}`);
                return res.status(403).json({ 
                    message: `Permission refusée : ${requiredPermission}`,
                    role: code_role,
                    permission_required: requiredPermission
                });
            }

            // Ajouter les infos du rôle à la requête
            req.user.idRole = id_role;
            req.user.codeRole = code_role;
            req.user.nomRole = nom_role;
            req.user.permissions = permissions;

            next();
        } catch (error) {
            console.error('Erreur middleware autorisation:', error);
            res.status(500).json({ message: 'Erreur serveur (autorisation)' });
        }
    };
};

/**
 * Middleware : vérifier si l'utilisateur est dans une liste de rôles autorisés
 * Usage : app.get('/route', checkRole(['ADMIN', 'COORDONNATEUR']), controller);
 */
export const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Non authentifié' });
            }

            // Récupérer le code du rôle
            const [userRole] = await db.query(`
                SELECT r.code_role, r.nom_role, u.id_role
                FROM utilisateurs u
                JOIN roles r ON u.id_role = r.id_role
                WHERE u.id = ? AND u.est_actif = TRUE
            `, [req.user.id]);

            if (!userRole || userRole.length === 0) {
                return res.status(403).json({ message: 'Utilisateur introuvable ou inactif' });
            }

            const { code_role, nom_role, id_role } = userRole[0];

            if (!allowedRoles.includes(code_role)) {
                return res.status(403).json({ 
                    message: `Rôle refusé : ${code_role}. Rôles autorisés : ${allowedRoles.join(', ')}`,
                    votre_role: code_role
                });
            }

            // Charger les permissions pour ce rôle
            const permissions = await getRolePermissions(id_role);
            req.user.idRole = id_role;
            req.user.codeRole = code_role;
            req.user.nomRole = nom_role;
            req.user.permissions = permissions;

            next();
        } catch (error) {
            console.error('Erreur middleware rôle:', error);
            res.status(500).json({ message: 'Erreur serveur (vérification rôle)' });
        }
    };
};

/**
 * Middleware : vérifier plusieurs permissions (logique AND)
 * Usage : app.post('/route', checkPermissions(['UC-ADM-01', 'UC-PS-04']), controller);
 */
export const checkPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Non authentifié' });
            }

            const [userRole] = await db.query(`
                SELECT u.id_role, r.code_role
                FROM utilisateurs u
                JOIN roles r ON u.id_role = r.id_role
                WHERE u.id = ? AND u.est_actif = TRUE
            `, [req.user.id]);

            if (!userRole || userRole.length === 0) {
                return res.status(403).json({ message: 'Utilisateur introuvable' });
            }

            const { id_role, code_role } = userRole[0];
            const permissions = await getRolePermissions(id_role);

            // Vérifier que TOUTES les permissions requises sont présentes
            const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p));
            
            if (missingPermissions.length > 0) {
                return res.status(403).json({ 
                    message: 'Permissions manquantes',
                    role: code_role,
                    permissions_manquantes: missingPermissions
                });
            }

            req.user.idRole = id_role;
            req.user.codeRole = code_role;
            req.user.permissions = permissions;

            next();
        } catch (error) {
            console.error('Erreur middleware permissions:', error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };
};

/**
 * Middleware : vérifier au moins une permission parmi une liste (logique OR)
 * Usage : app.get('/route', checkAnyPermission(['UC-AM-01', 'UC-AM-02']), controller);
 */
export const checkAnyPermission = (permissionsList) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Non authentifié' });
            }

            const [userRole] = await db.query(`
                SELECT u.id_role, r.code_role
                FROM utilisateurs u
                JOIN roles r ON u.id_role = r.id_role
                WHERE u.id = ? AND u.est_actif = TRUE
            `, [req.user.id]);

            if (!userRole || userRole.length === 0) {
                return res.status(403).json({ message: 'Utilisateur introuvable' });
            }

            const { id_role, code_role } = userRole[0];
            const permissions = await getRolePermissions(id_role);

            // Vérifier qu'AU MOINS une permission est présente
            const hasAnyPermission = permissionsList.some(p => permissions.includes(p));
            
            if (!hasAnyPermission) {
                return res.status(403).json({ 
                    message: 'Aucune des permissions requises',
                    role: code_role,
                    permissions_requises: permissionsList
                });
            }

            req.user.idRole = id_role;
            req.user.codeRole = code_role;
            req.user.permissions = permissions;

            next();
        } catch (error) {
            console.error('Erreur middleware permission (OR):', error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };
};

/**
 * Middleware : charger les permissions sans bloquer (optionnel)
 * Ajoute les permissions à req.user mais ne refuse pas l'accès
 */
export const loadPermissions = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return next();
        }

        const [userRole] = await db.query(`
            SELECT u.id_role, r.code_role, r.nom_role
            FROM utilisateurs u
            JOIN roles r ON u.id_role = r.id_role
            WHERE u.id = ?
        `, [req.user.id]);

        if (userRole && userRole.length > 0) {
            const { id_role, code_role, nom_role } = userRole[0];
            const permissions = await getRolePermissions(id_role);
            
            req.user.idRole = id_role;
            req.user.codeRole = code_role;
            req.user.nomRole = nom_role;
            req.user.permissions = permissions;
        }

        next();
    } catch (error) {
        console.error('Erreur loadPermissions:', error);
        next();
    }
};

export default { checkPermission, checkRole, checkPermissions, checkAnyPermission, loadPermissions };

# 🔐 SYSTÈME RBAC - Guide Complet

## Vue d'ensemble

Un système **Role-Based Access Control (RBAC)** a été intégré au projet **GestionSoutenances**. Chaque utilisateur a un rôle, et chaque rôle a des permissions spécifiques.

---

## 📊 Hiérarchie des 9 Rôles

### 1. **ADMIN** (Administrateur système)
- **Accès complet P7** : Gestion des comptes
- Peut créer/modifier/supprimer tous les utilisateurs
- Peut changer les rôles autres utilisateurs
- **Seul rôle** avec accès à UC-GCU-01 (Créer nouveau utilisateur)

### 2. **COORDONNATEUR** (Gestionnaire du système)
- **Accès complet** : P1, P2, P4, P5 + Partiel P3, P6, P7
- Gère les impétrants, enseignants, attributions
- Planifie les soutenances
- Valide les thèmes
- Accès au menu administratif complet

### 3. **ENSEIGNANT** / Directeur de mémoire
- **Accès partiel** : P3, P5 + P7
- Peut proposer des thèmes
- Confirme/rejette les dépôts de mémoire de ses étudiants
- Consulte ses encadrements

### 4. **IMPÉTRANT** (Étudiant)
- **Accès partiel** : P3, P5, P6 + P7
- Peut proposer ses propres thèmes
- Dépose son mémoire
- Corrige son mémoire après rejet
- Consulte sa soutenance

### 5. **PRESIDENT_JURY**
- **Accès partiel** : P6 + P7
- Valide les mémoires corrigés avant archivage

### 6. **MEMBRE_JURY** / Examinateur / Rapporteur
- **Accès partiel** : P6 + P7
- Participe à l'évaluation des mémoires
- Consultation des jurys auxquels il participe

### 7. **COMMISSION_VALIDATION** (Validation des thèmes)
- **Accès partiel** : P3 + P7
- Valide/rejette/demande reformulation des thèmes

### 8. **PARTENAIRE** (Institutionnel/Entreprise)
- **Accès partiel** : P3 + P7
- Propose ses propres thèmes externes

### 9. **BIBLIOTHECAIRE**
- **Accès partiel** : P6 + P7
- Gère les archives physiques des mémoires

---

## 📚 7 Packages de Fonctionnalités

| Package | Nom | Permissions principales |
|---------|-----|--------------------------|
| **P1** | Gestion Impétrants | UC-GImp-01 à UC-GImp-05 |
| **P2** | Gestion Enseignants | UC-GEns-01 à UC-GEns-05 |
| **P3** | Gestion Thèmes | UC-GTh-01, UC-GTh-02 |
| **P4** | Attribution Directeur | UC-ADM-01 à UC-ADM-03 |
| **P5** | Planification Soutenances | UC-PS-01 à UC-PS-07 |
| **P6** | Archivage Mémoires | UC-AM-01 à UC-AM-03 |
| **P7** | Comptes & Accès | UC-GCU-01 à UC-GCU-05 |

---

## 🔗 Architecture Technique

### Structure de la BD

```sql
-- Rôles (9 profils)
roles(id_role, code_role, nom_role, description, niveau_hierarchie)

-- Utilisateurs liés aux rôles
utilisateurs(id, nom, email, password, id_role, est_actif)

-- Permissions (cas d'utilisation)
permissions(id_permission, code_permission, nom_permission, package_id)

-- Matrice rôle-permission
role_permissions(id_role, id_permission, est_autorise)
```

### Middleware d'Autorisation

**Fichier** : `middleware/authorizationMiddleware.js`

#### Fonctions principales :

```javascript
// Vérifier UNE permission spécifique
checkPermission('UC-ADM-01')

// Vérifier AU MOINS un rôle
checkRole(['ADMIN', 'COORDONNATEUR'])

// Vérifier TOUTES les permissions
checkPermissions(['UC-PS-04', 'UC-PS-06'])

// Vérifier AU MOINS une permission parmi plusieurs
checkAnyPermission(['UC-GTh-01', 'UC-GTh-02'])

// Charger les permissions (optionnel, ne bloque pas)
loadPermissions()
```

---

## 🛣️ Routes Sécurisées

### Exemple : Impétrants (P1)

```javascript
// Créer impétrant → COORDONNATEUR uniquement
router.post('/add', verifyToken, checkPermission('UC-GImp-01'), createImpetrant);

// Lister → COORDONNATEUR
router.get('/', verifyToken, checkPermission('UC-GImp-02'), getAllImpetrants);

// Modifier → COORDONNATEUR
router.put('/update/:id', verifyToken, checkPermission('UC-GImp-03'), updateImpetrant);
```

### Exemple : Thèmes (P3 - Accès Multiple)

```javascript
// Proposer un thème → ENSEIGNANT, IMPÉTRANT, PARTENAIRE
router.post('/add', verifyToken, checkAnyPermission(['UC-GTh-01']), createTheme);

// Valider un thème → COMMISSION, COORDONNATEUR
router.put('/validate/:id', verifyToken, checkAnyPermission(['UC-GTh-02']), validateTheme);
```

---

## 🧪 Tests & Exemples

### 1️⃣ Créer des utilisateurs test

```sql
-- Admin
INSERT INTO utilisateurs (nom, prenom, email, password, id_role, est_actif)
VALUES ('Admin', 'System', 'admin@test.com', '[PASSWORD_HASH]', 1, TRUE);

-- Coordonnateur
INSERT INTO utilisateurs (nom, prenom, email, password, id_role, est_actif)
VALUES ('Guy', 'Coord', 'coord@test.com', '[PASSWORD_HASH]', 2, TRUE);

-- Enseignant
INSERT INTO utilisateurs (nom, prenom, email, password, id_role, est_actif)
VALUES ('Prof', 'Membre', 'prof@test.com', '[PASSWORD_HASH]', 3, TRUE);

-- Impétrant
INSERT INTO utilisateurs (nom, prenom, email, password, id_role, est_actif)
VALUES ('Etud', 'Exemple', 'etud@test.com', '[PASSWORD_HASH]', 4, TRUE);
```

### 2️⃣ Test de Connexion (LOGIN)

**Endpoint** : `POST /api/auth/login`

```json
{
  "email": "coord@test.com",
  "password": "password"
}
```

**Réponse attendue** :

```json
{
  "message": "Connexion réussie !",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "nom": "Guy",
    "prenom": "Coord",
    "email": "coord@test.com",
    "idRole": 2,
    "codeRole": "COORDONNATEUR",
    "nomRole": "Coordonnateur des cycles"
  },
  "permissions": [
    {
      "code": "UC-GImp-01",
      "nom": "Ajouter un impétrant",
      "package": "P1"
    },
    ...
  ]
}
```

---

## 🔒 Fluxde Sécurité Complet

```
1. Utilisateur se connecte `POST /api/auth/login`
   ↓
2. Serveur valide email/password
   ↓
3. Serveur charge le rôle et les permissions
   ↓
4. JWT généré avec [id, email, idRole, codeRole]
   ↓
5. Client envoie requête avec Bearer Token
   ↓
6. `verifyToken` middleware : valide le JWT
   ↓
7. `checkPermission('UC-XXX-XX')` middleware :
     - Récupère id_role du token
     - Vérifie si permission existe dans role_permissions
     - Si OUI → req.user enrichi → NEXT()
     - Si NON → 403 Forbidden
   ↓
8. Contrôleur exécuté avec req.user.permissions
```

---

## 📋 Matrice de Droits Simplifie

```
RÔLE                    P1  P2  P3  P4  P5  P6  P7
─────────────────────────────────────────────────────
ADMIN                   ❌  ❌  ❌  ❌  ❌  ❌  ✅
COORDONNATEUR           ✅  ✅  🟡  ✅  ✅  🟡  🟡
ENSEIGNANT              ❌  ❌  🟡  ❌  🟡  ❌  🟡
IMPÉTRANT               ❌  ❌  🟡  ❌  🟡  🟡  🟡
PRESIDENT_JURY          ❌  ❌  ❌  ❌  ❌  🟡  🟡
MEMBRE_JURY             ❌  ❌  ❌  ❌  ❌  🟡  🟡
COMMISSION_VALIDATION   ❌  ❌  🟡  ❌  ❌  ❌  🟡
PARTENAIRE              ❌  ❌  🟡  ❌  ❌  ❌  🟡
BIBLIOTHECAIRE          ❌  ❌  ❌  ❌  ❌  🟡  🟡

✅ = Accès complet  |  🟡 = Accès partiel  |  ❌ = Aucun accès
```

---

## 🔧 Configuration dans `server.js`

### Importer les middlewares

```javascript
import { verifyToken } from './middleware/securityMiddleware.js';
import { checkPermission, loadPermissions } from './middleware/authorizationMiddleware.js';
```

### Intégrer globalement (optionnel)

```javascript
// Charger les permissions pour TOUTES les requêtes authentifiées
app.use(verifyToken);  // Optionnel: sécuriser d'abord
app.use(loadPermissions);  // Ajouter les permissions à req.user
```

### Ou par route (recommandé)

```javascript
// Routes protégées par permission
app.post('/api/impetrants/add', 
  verifyToken, 
  checkPermission('UC-GImp-01'), 
  impetrantController.createImpetrant
);
```

---

## ✅ Checkpoints de Test

- [ ] **JWT Token** : Contient `idRole` et `codeRole`
- [ ] **Permissions chargées** : `req.user.permissions` doit être un tableau
- [ ] **checkPermission bloque** : Tenter accès sans permission → 403
- [ ] **Rôle ADMIN** : Accès uniquement P7
- [ ] **COORDONNATEUR** : Accès à gestion impétrants/enseignants
- [ ] **ENSEIGNANT** : Peut proposer thèmes mais PAS modifier impétrants
- [ ] **IMPÉTRANT** : Dépose mémoire mais PAS créer utilisateur

---

## 🚀 Prochaines Étapes

1. **Tester chaque rôle** avec Postman/Insomnia
2. **Vérifier les permissions** dans le token JWT (jwt.io)
3. **Implé menter l'affichage du menu** côté front basé sur `req.user.permissions`
4. **Ajouter les roles `enseignants` et `impetrants` tables** pour lier utilisateurs ↔ métier
5. **Audit logs** : tracer les actions par utilisateur

---

## 📞 Support

- **Erreur 403 Forbidden** → Permission manquante pour ce rôle
- **Erreur 401 Unauthorized** → Token invalide/expiré
- **req.user undefined** → `verifyToken` middleware manquant
- **Permissions vides** → Vérifier que les droits sont insérés dans `role_permissions`

Bon test ! 🎉

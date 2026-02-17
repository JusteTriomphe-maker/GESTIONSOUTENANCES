import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'cfi_soutenances'
});

async function checkPermissions() {
    try {
        const db = await pool.getConnection();
        
        console.log('\n=== VÉRIFICATION DES PERMISSIONS ===\n');
        
        // 1. Afficher tous les rôles
        const [roles] = await db.query('SELECT id_role, code_role, nom_role FROM roles ORDER BY id_role');
        console.log('📋 RÔLES:', roles);
        
        // 2. Afficher toutes les permissions
        const [permissions] = await db.query('SELECT id_permission, code_permission, nom_permission FROM permissions ORDER BY code_permission');
        console.log('\n📋 PERMISSIONS:', permissions.map(p => `${p.code_permission} - ${p.nom_permission}`));
        
        // 3. Afficher ce que chaque rôle a
        console.log('\n📋 PERMISSIONS PAR RÔLE:\n');
        for (const role of roles) {
            const [rolePerms] = await db.query(`
                SELECT p.code_permission, p.nom_permission 
                FROM role_permissions rp
                JOIN permissions p ON rp.id_permission = p.id_permission
                WHERE rp.id_role = ? AND rp.est_autorise = TRUE
                ORDER BY p.code_permission
            `, [role.id_role]);
            
            console.log(`\n🔹 ${role.code_role} (${role.nom_role}):`);
            if (rolePerms.length === 0) {
                console.log('   ❌ AUCUNE PERMISSION!');
            } else {
                rolePerms.forEach(p => console.log(`   ✅ ${p.code_permission} - ${p.nom_permission}`));
            }
        }
        
        // 4. Vérifier spécifiquement COORDONNATEUR
        const [coordPerms] = await db.query(`
            SELECT p.code_permission 
            FROM role_permissions rp
            JOIN permissions p ON rp.id_permission = p.id_permission
            WHERE rp.id_role = 2 AND rp.est_autorise = TRUE
        `);
        
        console.log('\n\n🔍 PERMISSIONS COORDONNATEUR (id=2):', coordPerms.map(p => p.code_permission));
        
        db.release();
        pool.end();
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkPermissions();

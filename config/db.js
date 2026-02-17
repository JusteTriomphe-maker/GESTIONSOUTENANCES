import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cfi_soutenances',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    Promise: Promise
});

// Test de connexion au démarrage
pool.getConnection()
    .then(connection => {
        console.log('✓ Connexion MySQL établie avec succès');
        connection.release();
    })
    .catch(err => {
        console.error('✗ Erreur de connexion MySQL:', err.message);
        console.error('\n⚠️  SOLUTIONS :');
        console.error('1. Vérifiez que MySQL est en cours d\'exécution');
        console.error('2. Vérifiez les paramètres dans .env :');
        console.error(`   - DB_HOST=${process.env.DB_HOST || 'localhost'}`);
        console.error(`   - DB_USER=${process.env.DB_USER || 'root'}`);
        console.error(`   - DB_NAME=${process.env.DB_NAME || 'cfi_soutenances'}`);
    });

// IMPORTANT : On utilise une exportation nommée
export { pool }; 
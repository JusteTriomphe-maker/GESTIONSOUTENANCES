import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Nécessaire pour définir __dirname
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import impetrantRoutes from './routes/impetrants.js'; 
import enseignantRoutes from './routes/enseignants.js';
import themeRoutes from './routes/themes.js';
import attributionRoutes from './routes/attribution.js';
import memoireRoutes from './routes/memoires.js';
import soutenanceRoutes from './routes/soutenances.js'; 

import { auditLog } from './middleware/securityMiddleware.js'; 

// Configuration de __dirname car il n'existe pas par défaut en module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/impetrants', impetrantRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/attributions', attributionRoutes);
app.use('/api/memoires', memoireRoutes);
app.use('/api/soutenances', soutenanceRoutes);
app.use('/api', auditLog); // <--- 1. Audit d'abord

// Route de test
app.get('/', (req, res) => {
    res.send('🚀 Serveur CFI Backend OK');
});

// Démarrage
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur Backend lancé sur le port ${PORT}`);
});
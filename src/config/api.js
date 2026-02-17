/**
 * Configuration centralisée des URLs API
 * Permet de changer facilement le port/domaine du backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    // Gestion automatique des erreurs 401
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    return response;
};

export default API_URL;

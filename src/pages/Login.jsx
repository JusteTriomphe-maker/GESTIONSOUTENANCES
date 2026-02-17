import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../config/api.js';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Styles replaced by Tailwind classes (desktop-first)

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await apiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('permissions', JSON.stringify(data.permissions));
                onLogin({ ...data.user, permissions: data.permissions });
                navigate('/dashboard');
            } else {
                setMessage(data.message || "Erreur de connexion");
            }
        } catch (error) {
            console.error('Erreur login:', error);
            setMessage("Erreur serveur - vérifiez que le backend est actif sur http://localhost:5000");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            <div className="bg-white w-full max-w-md p-10 text-center shadow-lg rounded-lg">
                <h2 className="text-[#234666] mb-6 text-2xl">🔒 Connexion</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-100 w-full rounded-md p-3 text-sm outline-none" required />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-100 w-full rounded-md p-3 text-sm outline-none" required />
                    <button type="submit" className={`uppercase w-full py-3 rounded-md text-white font-bold transition ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#234666] hover:brightness-110'}`} disabled={loading}>{loading ? 'Connexion...' : 'Login'}</button>
                </form>
                {message && <p className="text-red-600 text-sm mt-3">{message}</p>}
                <p className="mt-5 text-sm text-gray-500">
                    Pas encore de compte ? <Link to="/register" className="text-[#234666] font-semibold">Créez-en un</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
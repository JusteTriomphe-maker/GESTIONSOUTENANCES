import { useState } from 'react';

const Login = ({ onLogin, onGoToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const styles = {
        container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', fontFamily: '"Poppins", sans-serif' },
        card: { backgroundColor: '#FFFFFF', width: '360px', padding: '45px', textAlign: 'center', boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
        input: { background: '#f2f2f2', width: '100%', border: 0, borderRadius: '7px', margin: '0 0 15px', padding: '15px', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
        button: { textTransform: 'uppercase', background: '#234666', width: '100%', border: 0, padding: '15px', color: '#FFFFFF', borderRadius: '7px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
        link: { color: '#234666', textDecoration: 'none', cursor: 'pointer', fontWeight: 'bold' }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                // AJOUTE CETTE LIGNE :
                localStorage.setItem('token', data.token); 
                onLogin(data.user);
            } else {
                setMessage(data.message || "Erreur de connexion");
            }
        } catch (error) { setMessage("Erreur serveur"); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ color: '#234666', marginBottom: '25px' }}><i className="fas fa-lock"></i> Connexion</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                {message && <p style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>{message}</p>}
                <p style={{ marginTop: '15px', color: '#b3b3b3', fontSize: '12px' }}>
                    Pas encore de compte ? <span onClick={onGoToRegister} style={styles.link}>Créez-en un</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
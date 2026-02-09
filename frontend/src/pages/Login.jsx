import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // 1. Call login function from context
            await login(username, password);

            // 2. redirect to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            // 3. handle errors
            const msg = err.response?.data?.non_field_errors?.[0]
                || err.response?.data?.detail
                || 'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>Login to BhuChain</h2>

            {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {isSubmitting ? 'Logging in....' : 'Login'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Don't have an account? <Link to='/register'>Register here</Link>
            </p>
        </div>
    );
};

export default Login;

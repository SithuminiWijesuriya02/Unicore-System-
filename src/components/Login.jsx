import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const Login = ({ setUserData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    const emailError = !email ? 'Email is required' : (!isValidEmail ? 'Enter a valid email address' : '');
    const passwordError = !password ? 'Password is required' : '';
    const isFormValid = !emailError && !passwordError;

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!isFormValid) {
            setFieldErrors({
                email: emailError,
                password: passwordError,
            });
            return;
        }

        setLoading(true);

        try {
            const data = await api.login({ email, password });
            localStorage.setItem('accessToken', data.token);
            setUserData?.(data.user);
            navigate('/', { replace: true });
        } catch (err) {
            setFieldErrors(err.fieldErrors || {});
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade" style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
            {/* Left side: Branding/Illustration */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', padding: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>UniCore</h1>
                <p style={{ color: '#ffffff', fontSize: '1.2rem', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6, fontWeight: 500 }}>Your Smart Campus Operations Hub.<br/>Log in to manage tickets, resources, and notifications.</p>
            </div>
            
            {/* Right side: Login Form */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', background: 'var(--background)' }}>
                <div className="card text-center" style={{ width: '100%', maxWidth: '440px', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Enter your credentials to access your account.</p>
                    
                    {location.state?.message && (
                        <div style={{ color: 'var(--success)', marginBottom: '1.25rem', background: 'var(--success-bg, #ecfdf5)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 500 }}>
                            {location.state.message}
                        </div>
                    )}
                    {error && <div style={{ color: 'var(--danger)', marginBottom: '1.25rem', background: 'var(--danger-bg, #fef2f2)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 500 }}>{error}</div>}

                    <form onSubmit={handleLocalLogin} style={{ textAlign: 'left' }} className="mt-6 mb-6">
                        <div className="form-group">
                            <label style={{ fontWeight: 600 }}>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                placeholder="student@unicore.edu"
                                value={formData.email} 
                                className={fieldErrors.email || emailError ? 'input-invalid' : ''}
                                style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}
                                onChange={(e) => {
                                    setFormData({...formData, email: e.target.value});
                                    setFieldErrors((current) => ({ ...current, email: '' }));
                                }}
                            />
                            {(fieldErrors.email || emailError) && <div className="field-error">{fieldErrors.email || emailError}</div>}
                        </div>
                        <div className="form-group mb-6 mt-4">
                            <label style={{ fontWeight: 600 }}>Password</label>
                            <input 
                                type="password" 
                                required 
                                placeholder="Enter your password"
                                value={formData.password} 
                                className={fieldErrors.password || passwordError ? 'input-invalid' : ''}
                                style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}
                                onChange={(e) => {
                                    setFormData({...formData, password: e.target.value});
                                    setFieldErrors((current) => ({ ...current, password: '' }));
                                }}
                            />
                            {(fieldErrors.password || passwordError) && <div className="field-error">{fieldErrors.password || passwordError}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !isFormValid} style={{ padding: '0.9rem', fontSize: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                            {loading ? 'Authenticating...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-8 text-muted" style={{ fontSize: '0.95rem' }}>
                        Don't have an account? <Link to="/signup" className="text-primary" style={{ fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

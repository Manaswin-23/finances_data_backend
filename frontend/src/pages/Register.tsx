import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAPI, setAuthToken } from '../services/api';
import { Card } from '../components/Card';
import { Wallet } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      
      setAuthToken(data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" animate delayIndex={1}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Wallet className="text-gradient" size={48} style={{ margin: '0 auto 16px' }} />
          <h1 className="auth-title">Create an Account</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Join NeoFi to access the dashboard.</p>
        </div>
        
        {error && (
          <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="john@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, LogOut, Settings, Clock, Wallet, Users as UsersIcon } from 'lucide-react';
import { clearAuthToken, getCurrentUser } from '../services/api';

export const Sidebar = () => {
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Wallet className="text-gradient" size={32} />
        <span className="text-gradient">NeoFi</span>
      </div>

      {user && (
        <div className="user-profile" style={{ 
          padding: '16px', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '12px', 
          border: '1px solid var(--panel-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: 'white'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'User'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</p>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 600,
                padding: '2px 6px', 
                borderRadius: '10px',
                background: user.status === 'ACTIVE' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: user.status === 'ACTIVE' ? '#14b8a6' : '#ef4444'
              }}>
                {user.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        {(user?.role === 'ADMIN' || user?.role === 'ANALYST' || user?.role === 'VIEWER') && (
          <NavLink to="/transactions" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <ReceiptText size={20} /> Transactions
          </NavLink>
        )}
        {(user?.role === 'ADMIN' || user?.role === 'ANALYST') && (
          <NavLink to="/user-history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Clock size={20} /> User History
          </NavLink>
        )}
        
        {user?.role === 'ADMIN' && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Settings size={20} /> System Users
          </NavLink>
        )}
      </nav>

      <button onClick={handleLogout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

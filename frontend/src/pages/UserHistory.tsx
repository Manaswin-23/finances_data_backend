import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Card } from '../components/Card';
import { fetchAPI, getCurrentUser } from '../services/api';
import { UserCheck, UserX, Clock, Shield, Activity } from 'lucide-react';
import { UserHistoryModal } from '../components/UserHistoryModal';

export const UserHistory = () => {
  const user = getCurrentUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAPI('/users');
        setUsers(res.data.users);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (user?.role !== 'ADMIN' && user?.role !== 'ANALYST') {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Shield size={48} style={{ color: 'var(--accent-rose)', marginBottom: '16px' }} />
            <h2>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)' }}>Only Admins and Managers can view the User History portal.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header animate-in">
          <div>
            <h1>User Activity & History</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Check user statuses (Active/Inactive) and monitor their exact transaction history.
            </p>
          </div>
        </div>

        <Card className="chart-card animate-in" delayIndex={1} style={{ padding: 0 }}>
          {loading ? (
             <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history records...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Current Status</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>History Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ opacity: u.status === 'INACTIVE' ? 0.6 : 1 }}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</p>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: u.status === 'ACTIVE' ? '#14b8a6' : '#ef4444',
                        background: u.status === 'ACTIVE' ? 'rgba(20,184,166,0.1)' : 'rgba(239,68,68,0.1)',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {u.status === 'ACTIVE' ? <UserCheck size={14} /> : <UserX size={14} />}
                        {u.status}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.role}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                      >
                        <Clock size={14} /> View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>

      <UserHistoryModal 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        user={selectedUser} 
      />
    </div>
  );
};

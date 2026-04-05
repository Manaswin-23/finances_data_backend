import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Card } from '../components/Card';
import { fetchAPI, getCurrentUser } from '../services/api';
import { Shield, UserCheck, UserX, Trash2, Plus, Users as UsersIcon, History } from 'lucide-react';
import { UserHistoryModal } from '../components/UserHistoryModal';

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    ADMIN: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'Admin' },
    ANALYST: { bg: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', label: 'Analyst' },
    VIEWER: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', label: 'Viewer' },
  };
  const s = styles[role] || styles.VIEWER;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.03em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      <Shield size={11} /> {s.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      background: isActive ? 'rgba(20, 184, 166, 0.12)' : 'rgba(239, 68, 68, 0.12)',
      color: isActive ? '#14b8a6' : '#ef4444',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      {isActive ? <UserCheck size={11} /> : <UserX size={11} />}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export const Users = () => {
  const user = getCurrentUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'VIEWER' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewHistoryUser, setViewHistoryUser] = useState<any | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/users');
      setUsers(res.data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/users', { method: 'POST', body: JSON.stringify(newUser) });
      setCreateModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'VIEWER' });
      loadUsers();
    } catch (e: any) {
      alert(e.message || 'Failed to create user');
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (id: string, role: string) => {
    setActionLoading(id + '-role');
    try {
      await fetchAPI(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      loadUsers();
    } catch (e: any) {
      alert(e.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setActionLoading(id + '-status');
    try {
      await fetchAPI(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      loadUsers();
    } catch (e: any) {
      alert(e.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    setActionLoading(id + '-delete');
    try {
      await fetchAPI(`/users/${id}`, { method: 'DELETE' });
      loadUsers();
    } catch (e: any) {
      alert(e.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Access guard — only ADMIN can view this page
  if (user?.role !== 'ADMIN') {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Shield size={48} style={{ color: 'var(--accent-purple)', marginBottom: '16px' }} />
            <h2 style={{ marginBottom: '8px' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)' }}>You need Admin privileges to view this page.</p>
          </div>
        </main>
      </div>
    );
  }

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header animate-in">
          <div>
            <h1>User Management</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Manage system access, roles, and status for all users.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setCreateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Add New User
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: users.length, icon: <UsersIcon size={20} />, color: 'var(--accent-purple)' },
            { label: 'Active Users', value: activeCount, icon: <UserCheck size={20} />, color: '#14b8a6' },
            { label: 'Admins', value: adminCount, icon: <Shield size={20} />, color: '#a855f7' },
          ].map((stat) => (
            <Card key={stat.label} className="chart-card animate-in" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stat.value}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create User Modal */}
        {createModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <Card className="auth-card glass-panel" style={{ width: '100%', maxWidth: '420px', transform: 'none' }}>
              <h2 style={{ marginBottom: '6px' }}>Create New User</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Assign a role and set initial credentials.</p>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="input-field" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="input-field" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Initial Role</label>
                  <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="VIEWER">Viewer — Read-only access</option>
                    <option value="ANALYST">Analyst — Can view transactions</option>
                    <option value="ADMIN">Admin — Full access</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="input-field" style={{ flex: 1 }} onClick={() => setCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create User</button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card className="chart-card" animate delayIndex={2} style={{ padding: '0' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Change Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  const roleLoading = actionLoading === u.id + '-role';
                  const statusLoading = actionLoading === u.id + '-status';
                  const deleteLoading = actionLoading === u.id + '-delete';
                  return (
                    <tr key={u.id} style={{ opacity: u.status === 'INACTIVE' ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '1rem', color: 'white', flexShrink: 0
                          }}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {u.name} {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)' }}>(You)</span>}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={u.role} /></td>
                      <td><StatusBadge status={u.status} /></td>
                      <td>
                        <select
                          className="input-field"
                          style={{ width: '130px', padding: '6px 10px', fontSize: '0.85rem' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={isSelf || roleLoading}
                        >
                          <option value="VIEWER">Viewer</option>
                          <option value="ANALYST">Analyst</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => setViewHistoryUser(u)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              border: '1px solid var(--panel-border)',
                              cursor: 'pointer',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text-main)',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                          >
                            <History size={13} /> History
                          </button>
                          
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            disabled={isSelf || statusLoading}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              border: '1px solid',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              opacity: isSelf ? 0.4 : 1,
                              background: u.status === 'ACTIVE' ? 'rgba(239,68,68,0.1)' : 'rgba(20,184,166,0.1)',
                              color: u.status === 'ACTIVE' ? '#ef4444' : '#14b8a6',
                              borderColor: u.status === 'ACTIVE' ? '#ef444440' : '#14b8a640',
                              transition: 'all 0.2s',
                            }}
                          >
                            {statusLoading ? '...' : u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={isSelf || deleteLoading}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              border: '1px solid #ef444440',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              opacity: isSelf ? 0.4 : 1,
                              background: 'rgba(239,68,68,0.08)',
                              color: '#ef4444',
                              display: 'flex', alignItems: 'center', gap: '4px',
                              transition: 'all 0.2s',
                            }}
                          >
                            {deleteLoading ? '...' : <><Trash2 size={13} /> Delete</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </main>

      <UserHistoryModal 
        isOpen={!!viewHistoryUser} 
        onClose={() => setViewHistoryUser(null)} 
        user={viewHistoryUser} 
      />
    </div>
  );
};

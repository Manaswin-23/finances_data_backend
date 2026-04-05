import { useEffect, useState } from 'react';
import { Card } from './Card';
import { fetchAPI } from '../services/api';
import { X, Shield, UserCheck, UserX, Clock } from 'lucide-react';

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
}

export const UserHistoryModal = ({ isOpen, onClose, user }: UserHistoryModalProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const res = await fetchAPI(`/transactions?userId=${user.id}&limit=50`);
          setTransactions(res.data.transactions);
        } catch (e) {
          console.error('Failed to load user history', e);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    } else {
      setTransactions([]);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <Card className="glass-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', transform: 'none', padding: 0, overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>User History</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</p>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Status Strip */}
        <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)', display: 'flex', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} style={{ color: 'var(--accent-purple)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.status === 'ACTIVE' ? <UserCheck size={16} color="#14b8a6" /> : <UserX size={16} color="#ef4444" />}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account Status:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: user.status === 'ACTIVE' ? '#14b8a6' : '#ef4444' }}>
              {user.status}
            </span>
          </div>
        </div>

        {/* Transaction History Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Transaction Audit Log
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading history...</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
              <p style={{ color: 'var(--text-muted)' }}>This user has not created any transactions yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--panel-border)'
                }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>{tx.description || 'Untitled Transaction'}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                      background: tx.type === 'INCOME' ? 'rgba(20,184,166,0.1)' : 'rgba(239,68,68,0.1)',
                      color: tx.type === 'INCOME' ? '#14b8a6' : '#ef4444'
                    }}>
                      {tx.type}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </Card>
    </div>
  );
};

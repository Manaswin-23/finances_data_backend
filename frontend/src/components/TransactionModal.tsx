import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export const TransactionModal = ({ isOpen, onClose, transaction, onSaved }: any) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category || '',
        description: transaction.description || ''
      });
    } else {
      setFormData({ amount: '', type: 'EXPENSE', category: '', description: '' });
    }
    setError('');
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (transaction) {
        await fetchAPI(`/transactions/${transaction.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
        });
      } else {
        await fetchAPI('/transactions', {
          method: 'POST',
          body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
        });
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex',
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel animate-in" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 style={{ marginBottom: '24px' }}>{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
        
        {error && <div style={{ color: 'var(--accent-rose)', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Type</label>
            <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Amount ($)</label>
            <input type="number" step="0.01" className="input-field" required 
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <input type="text" className="input-field" placeholder="e.g. Groceries" required 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <input type="text" className="input-field" required 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

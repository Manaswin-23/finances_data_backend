import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { StatBox } from '../components/StatBox';
import { Card } from '../components/Card';
import { fetchAPI, getCurrentUser } from '../services/api';
import { TransactionModal } from '../components/TransactionModal';
import { Plus, Search, Trash2, Edit2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export const Transactions = () => {
  const user = getCurrentUser();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0 });

  const loadTx = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (type) query.append('type', type);
      if (category) query.append('category', category);
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      query.append('page', page.toString());
      query.append('limit', '10'); // Fixed limit for UI

      const res = await fetchAPI(`/transactions?${query.toString()}`);
      setData(res.data.transactions);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);

      // Fetch summary stats for the dashboard header
      const summaryRes = await fetchAPI('/dashboard/summary');
      setStats({
        totalIncome: summaryRes.data.totalIncome,
        totalExpenses: summaryRes.data.totalExpenses
      });
    } catch (e: any) {
      if (e.message?.includes('Forbidden')) {
        alert('Your viewer account does not have permission to view raw transaction records.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, type, category, startDate, endDate, page]);

  useEffect(() => {
    loadTx();
  }, [loadTx]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, type, category, startDate, endDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await fetchAPI(`/transactions/${id}`, { method: 'DELETE' });
      loadTx();
    } catch (e) {
      alert('Failed to delete transaction');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header animate-in">
          <div>
            <h1>Transaction History</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>View and manage your recorded incomes and expenses.</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditingTx(null); setModalOpen(true); }}>
            <Plus size={18} /> New Record
          </button>
        </div>

        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <StatBox title="History Income" value={stats.totalIncome} icon={<TrendingUp size={18} />} type="income" delayIndex={1} />
          <StatBox title="History Expenses" value={stats.totalExpenses} icon={<TrendingDown size={18} />} type="expense" delayIndex={2} />
          <StatBox title="Total Records" value={totalRecords} icon={<Layers size={18} />} type="count" delayIndex={3} noCurrency={true} />
        </div>

        <Card className="chart-card" animate delayIndex={2} style={{ padding: '0' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search description..." 
                style={{ paddingLeft: '36px' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <input 
              type="date" 
              className="input-field" 
              style={{ width: '150px' }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              title="Start Date"
            />
            <input 
              type="date" 
              className="input-field" 
              style={{ width: '150px' }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              title="End Date"
            />

            <select className="input-field" style={{ width: '130px' }} value={type} onChange={e => setType(e.target.value)}>
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Filter by category..." 
              style={{ width: '180px' }}
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading transactions...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Created By</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    {user?.role === 'ADMIN' && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.date).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--accent-teal)', fontSize: '0.85rem' }}>{tx.user?.name || 'System/Admin'}</td>
                      <td style={{ fontWeight: 500 }}>{tx.description}</td>
                      <td>{tx.category}</td>
                      <td>
                        <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${tx.amount.toLocaleString()}</td>
                      {user?.role === 'ADMIN' && (
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => { setEditingTx(tx); setModalOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '16px' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && data.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found for these filters.</div>
          )}

          {/* Pagination Controls */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Showing {data.length} of {totalRecords} records
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)' }} 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.875rem', padding: '0 8px' }}>Page {page} of {totalPages}</span>
              <button 
                className="btn-primary" 
                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)' }} 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      </main>

      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        transaction={editingTx}
        onSaved={() => {
          setModalOpen(false);
          loadTx();
        }}
      />
    </div>
  );
};

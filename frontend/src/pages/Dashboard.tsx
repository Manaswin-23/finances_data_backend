import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { StatBox } from '../components/StatBox';
import { Card } from '../components/Card';
import { fetchAPI } from '../services/api';
import { TrendingUp, TrendingDown, Wallet, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['var(--accent-teal)', 'var(--accent-purple)', 'var(--accent-rose)', '#3b82f6', '#f59e0b', '#8b5cf6'];

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await fetchAPI('/dashboard/summary');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <div className="dashboard-layout"><Sidebar/><div className="main-content" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div></div>;
  if (!data) return <div className="dashboard-layout"><Sidebar/><div className="main-content">Error loading data.</div></div>;

  // Process data for charts
  const chartData = data.trends?.map((t: any) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    income: t.INCOME,
    expense: t.EXPENSE
  })) || [];

  const pieData = data.categoryBreakdown?.map((cat: any) => ({
    name: cat.category,
    value: cat._sum.amount
  })) || [];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header animate-in">
          <div>
            <h1>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Welcome back! Here's your financial summary.</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatBox title="Total Balance" value={data.netBalance} icon={<Wallet size={18} />} type="balance" delayIndex={1} />
          <StatBox title="Total Income" value={data.totalIncome} icon={<TrendingUp size={18} />} type="income" delayIndex={2} />
          <StatBox title="Total Expenses" value={data.totalExpenses} icon={<TrendingDown size={18} />} type="expense" delayIndex={3} />
        </div>

        <div className="charts-grid">
          <Card className="chart-card" animate delayIndex={4}>
            <h3 className="chart-header"><Activity size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> 7-Day Activity Trends</h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--panel-border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="income" fill="var(--accent-teal)" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--accent-rose)" name="Expense" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="chart-card" animate delayIndex={5}>
            <h3 className="chart-header"><PieChartIcon size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Categories Breakdown</h3>
            <div style={{ height: '280px', width: '100%', position: 'relative' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--panel-border)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No category data yet.
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="chart-card" animate delayIndex={6} style={{ minHeight: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="chart-header" style={{ marginBottom: 0 }}>Recent Transactions</h3>
            <a href="/transactions" style={{ fontSize: '0.875rem', color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 500 }}>View All</a>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.recentActivity?.map((tx: any) => (
              <div 
                key={tx.id} 
                className="glass-panel"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: tx.type === 'INCOME' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: tx.type === 'INCOME' ? 'var(--accent-teal)' : 'var(--accent-rose)'
                  }}>
                    {tx.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.description}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{tx.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    color: tx.type === 'INCOME' ? 'var(--accent-teal)' : 'var(--accent-rose)' 
                  }}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!data.recentActivity || data.recentActivity.length === 0) && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No transactions found. Start by adding your first record!</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

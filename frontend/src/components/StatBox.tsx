import { Card } from './Card';

export const StatBox = ({ title, value, icon, type, delayIndex = 1, noCurrency = false }: any) => {
  return (
    <Card className="stat-card" animate delayIndex={delayIndex}>
      <div className="stat-label">
        <span style={{ 
          color: type === 'income' ? 'var(--accent-teal)' : 
                 type === 'expense' ? 'var(--accent-rose)' : 'var(--accent-purple)' 
        }}>
          {icon}
        </span>
        {title}
      </div>
      <div className="stat-value">
        {type !== 'count' && !noCurrency ? '$' : ''}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </Card>
  );
};

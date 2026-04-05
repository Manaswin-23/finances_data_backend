export const Card = ({ children, className = '', style = {}, animate = false, delayIndex = 0 }: any) => {
  return (
    <div 
      className={`glass-panel ${className} ${animate ? 'animate-in' : ''} delay-${delayIndex}`}
      style={style}
    >
      {children}
    </div>
  );
};

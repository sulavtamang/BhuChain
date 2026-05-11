
const Logo = ({ className = "h-10 w-10", animated = true }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} ${animated ? 'group-hover:scale-110 transition-transform duration-500' : ''}`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="bhuChainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path 
          d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z" 
          stroke="url(#bhuChainGradient)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="fill-blue-50/20 group-hover:fill-blue-50/40 transition-colors"
        />
        <path 
          d="M12 8L16 10V14L12 16L8 14V10L12 8Z" 
          fill="url(#bhuChainGradient)"
        />
      </svg>
    </div>
  );
};

export default Logo;

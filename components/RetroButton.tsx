import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'orange';
}

const RetroButton: React.FC<RetroButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyles = "px-6 py-2 font-bold border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  const variants = {
    primary: "bg-black text-white shadow-[4px_4px_0px_0px_#888] hover:bg-gray-800",
    secondary: "bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100",
    yellow: "bg-retro-yellow text-black shadow-[4px_4px_0px_0px_#000] hover:bg-yellow-400",
    orange: "bg-retro-orange text-black shadow-[4px_4px_0px_0px_#000] hover:bg-orange-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default RetroButton;
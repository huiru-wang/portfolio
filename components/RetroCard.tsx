import React from 'react';

interface RetroCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  badgeColor?: string;
  bgColor?: string; // Expects a tailwind class like 'bg-retro-yellow'
  onClick?: () => void;
}

const companyColor = (company?: string) => {
  if (!company) return undefined;
  const c = company.toLowerCase();
  if (c.includes('alibaba') || c.includes('dingtalk') || c.includes('阿里巴巴') || c.includes('钉钉')) {
    return 'bg-retro-orange text-black';
  }
  if (c.includes('huawei') || c.includes('华为')) {
    return 'bg-retro-purple text-black';
  }
  return 'bg-retro-green text-black';
};

const RetroCard: React.FC<RetroCardProps> = ({ title, subtitle, children, className = '', badge, badgeColor, bgColor = 'bg-white', onClick }) => {
  return (
    <div className={`${bgColor} border-2 border-black shadow-retro p-6 relative ${className} ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2">
        <div>
           {badge && (
            <span className={`inline-block border border-black text-xs px-2 py-0.5 mb-1 font-mono font-bold ${companyColor(badge) || badgeColor || 'bg-black text-white'}`}>
              {badge}
            </span>
          )}
          <h3 className="text-xl font-bold uppercase">{title}</h3>
          {subtitle && <p className="text-sm text-gray-800 font-mono mt-1 font-bold">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full border border-black bg-white"></div>
            <div className="w-3 h-3 rounded-full border border-black bg-black"></div>
        </div>
      </div>
      <div className="text-sm leading-relaxed font-medium flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
};

export default RetroCard;
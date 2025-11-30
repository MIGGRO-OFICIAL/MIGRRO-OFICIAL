
import React from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ score, size = 'md' }) => {
  let color = 'text-gray-400';
  let bgColor = 'bg-gray-100';
  let Icon = Shield;
  let label = 'Não Verificado';

  if (score >= 80) {
    color = 'text-green-600';
    bgColor = 'bg-green-100';
    Icon = ShieldCheck;
    label = 'Alta Confiança';
  } else if (score >= 40) {
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-100';
    Icon = Shield;
    label = 'Parcial';
  } else {
    color = 'text-red-500';
    bgColor = 'bg-red-50';
    Icon = ShieldAlert;
    label = 'Baixo Score';
  }

  const sizeClasses = {
    sm: { icon: 14, text: 'text-[10px]' },
    md: { icon: 18, text: 'text-xs' },
    lg: { icon: 24, text: 'text-sm' },
  };

  return (
    <div className={`flex items-center space-x-1 ${bgColor} px-2 py-0.5 rounded-full inline-flex`}>
      <Icon size={sizeClasses[size].icon} className={color} fill={score >= 80 ? 'currentColor' : 'none'} />
      <span className={`font-bold ${color} ${sizeClasses[size].text}`}>
        {label}
      </span>
    </div>
  );
};

export default TrustBadge;

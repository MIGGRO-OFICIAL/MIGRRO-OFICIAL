import React from 'react';
import { Leaf } from 'lucide-react';

interface CoinBalanceProps {
  amount: number;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ amount }) => {
  return (
    <div className="flex items-center space-x-1.5 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200 shadow-sm">
      <div className="bg-accent-100 p-1 rounded-full">
        <Leaf size={14} className="text-accent-500" fill="currentColor" />
      </div>
      <span className="text-miggro-teal font-bold text-sm">{amount}</span>
      <span className="text-miggro-teal text-xs font-medium uppercase">MIGGRO</span>
    </div>
  );
};

export default CoinBalance;
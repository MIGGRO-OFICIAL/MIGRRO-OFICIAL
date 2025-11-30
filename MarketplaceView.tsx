
import React, { useState } from 'react';
import { SERVICES } from '../services/mockData';
import { Search, Star, ShieldCheck, Filter, Leaf, Briefcase, Plus, Megaphone } from 'lucide-react';
import { ServiceListing, ViewState } from '../types';
import Logo from '../components/Logo';

interface MarketplaceViewProps {
    onChangeView?: (view: ViewState) => void;
    onRequestService?: () => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onChangeView, onRequestService }) => {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Housing', 'Bureaucracy', 'Language', 'Social'];

  const filteredServices = filter === 'All' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === filter);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto h-full overflow-y-auto no-scrollbar">
      <header className="mb-6 flex justify-between items-center">
        <Logo showText={true} />
        {/* My Requests Button */}
        <button 
            onClick={() => onChangeView && onChangeView(ViewState.MY_REQUESTS)}
            className="text-xs font-bold text-miggro-teal bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200 hover:bg-brand-100 transition-colors"
        >
            Meus Pedidos
        </button>
      </header>

      {/* Reverse Marketplace CTA (Auction) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 mb-6 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={onRequestService}>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Megaphone size={120} />
          </div>
          <div className="relative z-10">
              <h2 className="font-bold text-lg mb-1 flex items-center">
                  Pedir um Orçamento <Plus className="ml-2 bg-white/20 rounded-full p-0.5" size={20} />
              </h2>
              <p className="text-blue-100 text-xs mb-3 max-w-[80%]">
                  Não achou o que procura? Lance um pedido e receba propostas de vários prestadores.
              </p>
              <button className="bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
                  Criar Pedido Grátis
              </button>
          </div>
      </div>

      {/* Become a Helper CTA */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-miggro-teal">Quer monetizar sua experiência?</h3>
            <p className="text-xs text-brand-600 mt-1">Ajude recém-chegados e ganhe € ou MiggroCoins.</p>
        </div>
        <button className="bg-miggro-teal text-white p-2 rounded-lg shadow-sm hover:bg-brand-600 transition-colors">
            <Briefcase size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Buscar serviços (ex: tradução, aluguel)..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-miggro-teal"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        <button className="absolute right-3 top-2.5 p-1 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200">
          <Filter size={16} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar mb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat 
                ? 'bg-miggro-teal text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat === 'All' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredServices.map((service: ServiceListing) => (
          <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Currency Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${service.currency === 'RAIZ' ? 'bg-brand-400' : 'bg-blue-400'}`}></div>
            
            <div className="flex justify-between items-start mb-2 pl-2">
              <div className="flex items-center space-x-3">
                <img src={service.providerAvatar} alt={service.providerName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div>
                  <div className="flex items-center">
                    <h3 className="text-sm font-bold text-gray-900">{service.providerName}</h3>
                    {service.verified && <ShieldCheck size={14} className="text-blue-500 ml-1" />}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{service.rating} ({service.reviewsCount})</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center justify-end font-bold ${service.currency === 'RAIZ' ? 'text-brand-700' : 'text-blue-700'}`}>
                  {service.currency === 'RAIZ' ? (
                      <>
                        <Leaf size={14} className="mr-1" />
                        {service.price} MG
                      </>
                  ) : (
                      <>
                        € {service.price}
                      </>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">{service.category}</span>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-800 text-sm mb-1 pl-2">{service.title}</h4>
            <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed pl-2">{service.description}</p>
            
            <button className="w-full py-2 bg-gray-50 hover:bg-brand-50 text-brand-700 font-medium text-sm rounded-lg transition-colors border border-gray-200 hover:border-brand-200 ml-1">
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceView;

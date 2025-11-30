
import React, { useState, useEffect } from 'react';
import { SERVICES } from '../services/mockData';
import { Search, Star, ShieldCheck, Filter, Leaf, Briefcase, Plus, Megaphone, Loader2 } from 'lucide-react';
import { ServiceListing, ViewState } from '../types';
import Logo from '../components/Logo';
import { servicesService } from '../lib/supabase/services';
import { analyticsService } from '../lib/supabase/analytics';
import CreateServiceModal from '../components/CreateServiceModal';

interface MarketplaceViewProps {
    onChangeView?: (view: ViewState) => void;
    onRequestService?: () => void;
    onSelectService?: (serviceId: string) => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onChangeView, onRequestService, onSelectService }) => {
  const [filter, setFilter] = useState('All');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'rating'>('recent');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);

  const categories = ['All', 'Housing', 'Bureaucracy', 'Language', 'Social', 'Jobs'];

  useEffect(() => {
    loadServices();
  }, [filter]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await servicesService.listServices({ limit: 50 });
      if (error) {
        console.error('Erro ao carregar serviços:', error);
        setServices(SERVICES as any);
      } else if (data && data.length > 0) {
        // Se há dados, usar dados reais
        setServices(data);
      } else {
        // Se não há dados (array vazio), usar mock data
        console.log('Nenhum serviço encontrado, usando dados mock');
        setServices(SERVICES as any);
      }
    } catch (err) {
      console.error('Erro:', err);
      setServices(SERVICES as any);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services
    .filter((s: any) => {
      // Filtro de categoria
      if (filter !== 'All') {
        const categoryName = s.category?.name || s.category?.name_pt || s.category;
        if (categoryName !== filter) return false;
      }

      // Filtro de preço
      const price = s.price || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      return true;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'recent':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto h-full overflow-y-auto no-scrollbar">
      <header className="mb-6 flex justify-between items-center">
        <Logo showText={true} />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-bold text-miggro-teal bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            Filtros
          </button>
          <button 
            onClick={() => onChangeView && onChangeView(ViewState.MY_REQUESTS)}
            className="text-xs font-bold text-miggro-teal bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            Meus Pedidos
          </button>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="space-y-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="recent">Mais Recente</option>
                <option value="price_asc">Preço: Menor para Maior</option>
                <option value="price_desc">Preço: Maior para Menor</option>
                <option value="rating">Melhor Avaliação</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa de Preço: €{priceRange[0]} - €{priceRange[1]}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Mínimo"
                />
                <input
                  type="number"
                  min="0"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Máximo"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Open Requests Section (for providers to send proposals) */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-orange-900 text-sm mb-2 flex items-center">
          <Megaphone size={16} className="mr-2" />
          Pedidos Abertos
        </h3>
        <p className="text-xs text-orange-700 mb-3">
          Veja pedidos de clientes e envie suas propostas!
        </p>
        <button
          onClick={() => onChangeView && onChangeView(ViewState.OPEN_REQUESTS)}
          className="w-full bg-orange-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors"
        >
          Ver Pedidos Abertos
        </button>
      </div>

      {/* Become a Helper CTA */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-miggro-teal">Quer monetizar sua experiência?</h3>
            <p className="text-xs text-brand-600 mt-1">Ajude recém-chegados e ganhe € ou MiggroCoins.</p>
        </div>
        <button 
          onClick={() => setIsCreateServiceOpen(true)}
          className="bg-miggro-teal text-white p-2 rounded-lg shadow-sm hover:bg-brand-600 transition-colors"
        >
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-miggro-teal" size={32} />
          <span className="ml-3 text-gray-600">Carregando serviços...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum serviço encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service: any) => {
            const provider = service.provider || {};
            const category = service.category || {};
            const price = service.price || 0;
            const currency = service.currency || 'EUR';
            const rating = service.rating || 0;
            const reviewsCount = service.reviews_count || 0;
            const isVerified = service.is_verified || false;
            
            return (
              <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Currency Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${currency === 'RAIZ' ? 'bg-brand-400' : 'bg-blue-400'}`}></div>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={provider.avatar_url || service.providerAvatar || 'https://via.placeholder.com/40'} 
                      alt={provider.name || service.providerName || 'Prestador'} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                    />
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-sm font-bold text-gray-900">{provider.name || service.providerName || 'Prestador'}</h3>
                        {isVerified && <ShieldCheck size={14} className="text-blue-500 ml-1" />}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                        <span>{rating.toFixed(1)} ({reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center justify-end font-bold ${currency === 'RAIZ' ? 'text-brand-700' : 'text-blue-700'}`}>
                      {currency === 'RAIZ' ? (
                          <>
                            <Leaf size={14} className="mr-1" />
                            {price} MG
                          </>
                      ) : (
                          <>€ {price.toFixed(2)}</>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {category.name_pt || category.name || service.category || 'Geral'}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-800 text-sm mb-1 pl-2">{service.title}</h4>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed pl-2">{service.description}</p>
                
                <button 
                  onClick={() => {
                    if (onSelectService) {
                      analyticsService.trackServiceView(service.id, 'marketplace');
                      onSelectService(service.id);
                    }
                  }}
                  className="w-full py-2 bg-gray-50 hover:bg-brand-50 text-brand-700 font-medium text-sm rounded-lg transition-colors border border-gray-200 hover:border-brand-200 ml-1"
                >
                  Ver Detalhes
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Service Modal */}
      {isCreateServiceOpen && (
        <CreateServiceModal
          onClose={() => setIsCreateServiceOpen(false)}
          onSuccess={() => {
            loadServices();
          }}
        />
      )}
    </div>
  );
};

export default MarketplaceView;

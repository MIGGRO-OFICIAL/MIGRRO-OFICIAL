// Dashboard Completo do Prestador
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Eye, MousePointerClick, DollarSign, 
  MessageSquare, Star, FileText, Calendar, Download, ArrowLeft,
  CreditCard, BarChart3, Users, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../lib/supabase/analytics';
import { paymentsService, Wallet, Transaction } from '../lib/supabase/payments';
import { servicesService } from '../lib/supabase/services';
import { reviewsService } from '../lib/supabase/reviews';
import { badgesService, UserBadge } from '../lib/supabase/badges';

interface ProviderDashboardProps {
  onBack: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'services' | 'profile' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Estados
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, period]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Carregar wallet
      const { data: walletData } = await paymentsService.getWallet(user.id);
      if (walletData) setWallet(walletData);

      // Carregar transações recentes
      const { data: transactionsData } = await paymentsService.listTransactions(user.id, { limit: 10 });
      if (transactionsData) setTransactions(transactionsData);

      // Carregar stats
      const { data: statsData } = await analyticsService.getProviderStats(user.id, period);
      if (statsData) setStats(statsData);

      // Carregar serviços
      const { data: servicesData } = await servicesService.listProviderServices(user.id);
      if (servicesData) setServices(servicesData);

      // Carregar badges
      const { data: badgesData } = await badgesService.getUserBadges(user.id);
      if (badgesData) setBadges(badgesData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-miggro-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard do Prestador</h1>
              <p className="text-sm text-gray-500">Gerencie seus serviços e acompanhe seu desempenho</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-miggro-teal focus:border-transparent"
            >
              <option value="day">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 px-6 border-t border-gray-200">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'financial', label: 'Financeiro', icon: DollarSign },
            { id: 'services', label: 'Serviços', icon: FileText },
            { id: 'profile', label: 'Perfil', icon: Users },
            { id: 'reports', label: 'Relatórios', icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-miggro-teal text-miggro-teal font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Receita do Período</span>
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {wallet ? formatCurrency(wallet.total_earnings) : '€0,00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total acumulado</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Visualizações</span>
                  <Eye size={20} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatNumber(stats.totalViews) : '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Taxa de Conversão</span>
                  <TrendingUp size={20} className="text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? `${stats.conversionRate?.toFixed(1) || 0}%` : '0%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Visualizações → Contatos</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Propostas Aceitas</span>
                  <Star size={20} className="text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatNumber(stats.totalProposalsAccepted) : '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.totalProposalsSent ? `${((stats.totalProposalsAccepted / stats.totalProposalsSent) * 100).toFixed(0)}% de aceitação` : '0%'}
                </p>
              </div>
            </div>

            {/* Gráficos e Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Serviços Mais Visualizados */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Serviços Mais Visualizados</h3>
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{service.title}</p>
                        <p className="text-sm text-gray-500">{service.total_views || 0} visualizações</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-miggro-teal">{formatCurrency(service.price || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges Conquistadas */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Award size={20} className="mr-2 text-yellow-600" />
                  Badges Conquistadas
                </h3>
                <div className="space-y-3">
                  {badges.length > 0 ? (
                    badges.map((userBadge) => (
                      <div key={userBadge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {userBadge.badge?.icon_url ? (
                          <img src={userBadge.badge.icon_url} alt={userBadge.badge.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Award size={20} className="text-yellow-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{userBadge.badge?.name}</p>
                          <p className="text-xs text-gray-500">
                            Conquistado em {new Date(userBadge.earned_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum badge conquistado ainda</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Saldo Disponível</p>
                <p className="text-3xl font-bold text-gray-900">
                  {wallet ? formatCurrency(wallet.balance) : '€0,00'}
                </p>
                <button className="mt-4 w-full bg-miggro-teal text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                  Solicitar Saque
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Pendente</p>
                <p className="text-3xl font-bold text-gray-900">
                  {wallet ? formatCurrency(wallet.pending_balance) : '€0,00'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Aguardando confirmação</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Total Ganho</p>
                <p className="text-3xl font-bold text-gray-900">
                  {wallet ? formatCurrency(wallet.total_earnings) : '€0,00'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Desde o início</p>
              </div>
            </div>

            {/* Histórico de Transações */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Últimas Transações</h3>
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'payment' ? 'bg-green-100' :
                          transaction.type === 'payout' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <CreditCard size={20} className={
                            transaction.type === 'payment' ? 'text-green-600' :
                            transaction.type === 'payout' ? 'text-blue-600' :
                            'text-gray-600'
                          } />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description || transaction.type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'payment' ? 'text-green-600' :
                          transaction.type === 'payout' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {transaction.type === 'payment' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-xs ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {transaction.status === 'completed' ? 'Concluído' :
                           transaction.status === 'pending' ? 'Pendente' :
                           'Falhou'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhuma transação ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Meus Serviços</h3>
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm text-gray-600">
                              <Eye size={16} className="inline mr-1" />
                              {service.total_views || 0} visualizações
                            </span>
                            <span className="text-sm text-gray-600">
                              <MousePointerClick size={16} className="inline mr-1" />
                              {service.total_clicks || 0} cliques
                            </span>
                            <span className="text-sm text-gray-600">
                              <Star size={16} className="inline mr-1" />
                              {service.average_rating?.toFixed(1) || '0.0'} ({service.total_reviews || 0})
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-miggro-teal text-lg">
                            {formatCurrency(service.price || 0)}
                          </p>
                          <p className={`text-xs mt-1 ${
                            service.is_active ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {service.is_active ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum serviço cadastrado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Métricas de Perfil</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Visualizações</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalClicks || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Cliques</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalReviews || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Reviews</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Badges</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Relatórios Disponíveis</h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Relatório Mensal Completo</p>
                      <p className="text-sm text-gray-500">Receitas, visualizações e engajamento</p>
                    </div>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </button>

                <button className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} className="text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Relatório Anual</p>
                      <p className="text-sm text-gray-500">Visão geral do ano</p>
                    </div>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </button>

                <button className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 size={20} className="text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Relatório de Serviços</p>
                      <p className="text-sm text-gray-500">Performance por serviço</p>
                    </div>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;

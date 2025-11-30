
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Megaphone, Users, Settings, TrendingUp, DollarSign, Activity, Plus, Search, MoreHorizontal, CheckCircle, XCircle, LogOut, Wallet, Loader2 } from 'lucide-react';
import { ADMIN_STATS, AD_CAMPAIGNS, SERVICES } from '../services/mockData';
import { ViewState } from '../types';
import Logo from '../components/Logo';
import { adminService, AdminStats, AdCampaign, CreatorPayout } from '../lib/supabase/admin';
import { useAuth } from '../contexts/AuthContext';
import CreateCampaignModal from '../components/CreateCampaignModal';

interface AdminPanelProps {
  exitAdmin: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ exitAdmin }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ads' | 'users' | 'finance'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [creators, setCreators] = useState<CreatorPayout[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  // Verificar se é admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      exitAdmin();
    }
  }, [user, exitAdmin]);

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'dashboard') {
        const { data: statsData, error: statsError } = await adminService.getStats();
        if (statsError) throw statsError;
        setStats(statsData);
      } else if (activeTab === 'ads') {
        const { data: campaignsData, error: campaignsError } = await adminService.listCampaigns();
        if (campaignsError) throw campaignsError;
        setCampaigns(campaignsData || []);
      } else if (activeTab === 'finance') {
        const { data: creatorsData, error: creatorsError } = await adminService.getTopCreators(10);
        if (creatorsError) throw creatorsError;
        setCreators(creatorsData || []);
        // Carregar stats também para finance tab
        const { data: statsData } = await adminService.getStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const { data: requestsData, error: requestsError } = await adminService.getVerificationRequests();
        if (requestsError) throw requestsError;
        setVerificationRequests(requestsData || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
      // Fallback para dados mockados em caso de erro
      if (activeTab === 'dashboard') {
        setStats(ADMIN_STATS);
      } else if (activeTab === 'ads') {
        setCampaigns(AD_CAMPAIGNS as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayouts = async () => {
    const pendingIds = creators.filter(c => c.status === 'pending').map(c => c.id);
    if (pendingIds.length === 0) {
      alert('Nenhum pagamento pendente para processar');
      return;
    }
    
    const { error } = await adminService.processPayouts(pendingIds);
    if (error) {
      alert('Erro ao processar pagamentos: ' + error.message);
    } else {
      alert('Pagamentos processados com sucesso!');
      loadDashboardData();
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    const { error } = await adminService.processPayouts([payoutId]);
    if (error) {
      alert('Erro ao aprovar pagamento: ' + error.message);
    } else {
      loadDashboardData();
    }
  };

  const handleToggleCampaign = async (campaignId: string, newStatus: 'active' | 'paused') => {
    const { error } = await adminService.updateCampaignStatus(campaignId, newStatus);
    if (error) {
      alert('Erro ao atualizar campanha: ' + error.message);
    } else {
      loadDashboardData();
    }
  };

  const handleVerifyProvider = async (userId: string, status: 'verified' | 'rejected', serviceIds?: string[]) => {
    const { error } = await adminService.updateVerificationStatus(userId, status, serviceIds);
    if (error) {
      alert('Erro ao atualizar verificação: ' + error.message);
    } else {
      alert(`Verificação ${status === 'verified' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      loadDashboardData();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <span className="font-bold text-xl text-white">Miggro Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'ads' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Megaphone size={20} />
            <span className="font-medium">Campanhas & Ads</span>
          </button>

           <button 
            onClick={() => setActiveTab('finance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'finance' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Wallet size={20} />
            <span className="font-medium">Financeiro & Repasse</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Users size={20} />
            <span className="font-medium">Usuários & Ajudas</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
            <button onClick={exitAdmin} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm">
                <LogOut size={16} />
                <span>Voltar ao App</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <h2 className="text-xl font-bold text-gray-800 capitalize">
                {activeTab === 'finance' ? 'Miggro Sense (Creator Fund)' : activeTab}
            </h2>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Acesso Total</p>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-gray-500" />
                </div>
            </div>
        </header>

        <div className="p-8">
            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-miggro-teal" size={32} />
                            <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">Erro: {error}</p>
                            <button 
                                onClick={loadDashboardData}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Users className="text-blue-600" size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                                            <TrendingUp size={12} className="mr-1" /> {stats?.growthRate || 0}%
                                        </span>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">Usuários Totais</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{(stats?.totalUsers || 0).toLocaleString()}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                            <DollarSign className="text-emerald-600" size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">MRR</span>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">Receita Recorrente</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">€ {(stats?.mrr || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Megaphone className="text-purple-600" size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">Campanhas Ativas</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeCampaigns || 0}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <Activity className="text-orange-600" size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-medium">Usuários Ativos (MAU)</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{(stats?.activeUsers || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Cards adicionais de receita */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium mb-2">Receita de Ads (Este Mês)</h3>
                                    <p className="text-2xl font-bold text-gray-900">€ {(stats?.adRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium mb-2">Creator Fund Disponível</h3>
                                    <p className="text-2xl font-bold text-gray-900">€ {(stats?.creatorFund || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* FINANCE / CREATOR FUND VIEW */}
            {activeTab === 'finance' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-miggro-teal" size={32} />
                            <span className="ml-3 text-gray-600">Carregando dados financeiros...</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl shadow-lg text-white">
                                    <h3 className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-2">Creator Fund (Miggro Sense)</h3>
                                    <p className="text-3xl font-bold mb-4">€ {(stats?.creatorFund || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                                    </div>
                                    <p className="text-xs mt-2 text-indigo-300">50% da Receita de Ads (Total: € {(stats?.adRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Pagamentos Pendentes</h3>
                                    <p className="text-3xl font-bold text-gray-900">
                                        € {creators
                                            .filter(c => c.status === 'pending')
                                            .reduce((sum, c) => sum + c.estimated_payout, 0)
                                            .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <button 
                                        onClick={handleProcessPayouts}
                                        className="mt-4 w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Processar Pagamentos
                                    </button>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Pago (Este Mês)</h3>
                                    <p className="text-3xl font-bold text-gray-900">
                                        € {creators
                                            .filter(c => c.status === 'paid')
                                            .reduce((sum, c) => sum + c.final_payout, 0)
                                            .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-gray-800 mt-8">Top Creators (Repasse de Receita)</h3>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {creators.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Nenhum creator encontrado ainda
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-4">Criador</th>
                                                <th className="px-6 py-4">Visualizações</th>
                                                <th className="px-6 py-4">Ajuda Verificada</th>
                                                <th className="px-6 py-4">Repasse Estimado</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {creators.map((creator) => (
                                                <tr key={creator.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            {creator.creator_avatar && (
                                                                <img src={creator.creator_avatar} alt={creator.creator_name} className="w-8 h-8 rounded-full" />
                                                            )}
                                                            <span className="font-bold text-gray-900">{creator.creator_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{creator.views.toLocaleString()}</td>
                                                    <td className="px-6 py-4">{creator.verified_helps}</td>
                                                    <td className="px-6 py-4 text-green-600 font-bold">
                                                        € {creator.estimated_payout.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            creator.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            creator.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            creator.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {creator.status === 'pending' ? 'Pendente' :
                                                             creator.status === 'paid' ? 'Pago' :
                                                             creator.status === 'approved' ? 'Aprovado' : creator.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {creator.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleApprovePayout(creator.id)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                            >
                                                                Aprovar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ADS MANAGEMENT VIEW */}
            {activeTab === 'ads' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                         <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar campanha..." 
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                         </div>
                         <button 
                            onClick={() => setIsCreateCampaignOpen(true)}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-brand-700 transition-colors"
                         >
                            <Plus size={18} className="mr-2" /> Nova Campanha
                         </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-miggro-teal" size={32} />
                            <span className="ml-3 text-gray-600">Carregando campanhas...</span>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {campaigns.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Nenhuma campanha encontrada. Crie sua primeira campanha!
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Patrocinador</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Orçamento</th>
                                            <th className="px-6 py-4">Gasto</th>
                                            <th className="px-6 py-4">Performance (CTR)</th>
                                            <th className="px-6 py-4">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {campaigns.map((campaign) => {
                                            const ctr = campaign.impressions > 0 
                                                ? (campaign.clicks / campaign.impressions) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{campaign.sponsor_name}</div>
                                                        <div className="text-gray-500 text-xs">{campaign.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                                                            campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                                                            campaign.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {campaign.status === 'active' ? 'Ativa' :
                                                             campaign.status === 'paused' ? 'Pausada' :
                                                             campaign.status === 'pending' ? 'Pendente' :
                                                             campaign.status === 'completed' ? 'Concluída' : campaign.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">€ {campaign.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 text-gray-500">€ {campaign.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                                                <div 
                                                                    className="bg-blue-500 h-1.5 rounded-full" 
                                                                    style={{ width: `${Math.min(ctr * 10, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-600">{ctr.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-1">{campaign.impressions.toLocaleString()} imps</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            {campaign.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleToggleCampaign(campaign.id, 'paused')}
                                                                    className="text-yellow-600 hover:text-yellow-800 text-xs"
                                                                    title="Pausar"
                                                                >
                                                                    Pausar
                                                                </button>
                                                            )}
                                                            {campaign.status === 'paused' && (
                                                                <button
                                                                    onClick={() => handleToggleCampaign(campaign.id, 'active')}
                                                                    className="text-green-600 hover:text-green-800 text-xs"
                                                                    title="Ativar"
                                                                >
                                                                    Ativar
                                                                </button>
                                                            )}
                                                            <button className="text-gray-400 hover:text-gray-600">
                                                                <MoreHorizontal size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* USERS / PROVIDERS VIEW */}
             {activeTab === 'users' && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Solicitações de Verificação (Prestadores)</h3>
                     </div>

                     {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-miggro-teal" size={32} />
                            <span className="ml-3 text-gray-600">Carregando solicitações...</span>
                        </div>
                     ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {verificationRequests.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Nenhuma solicitação de verificação pendente
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Prestador</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Trust Score</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Serviços</th>
                                            <th className="px-6 py-4">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {verificationRequests.map((request: any) => (
                                            <tr key={request.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 flex items-center space-x-3">
                                                    {request.avatar_url && (
                                                        <img src={request.avatar_url} className="w-8 h-8 rounded-full" alt={request.name} />
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900">{request.name}</div>
                                                        <div className="text-gray-500 text-xs">ID: {request.id.substring(0, 8)}...</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-xs">{request.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-bold ${
                                                        request.trust_score >= 70 ? 'text-green-600' :
                                                        request.trust_score >= 40 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {request.trust_score}/100
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        request.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                                                        request.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {request.verification_status === 'verified' ? 'Verificado' :
                                                         request.verification_status === 'pending' ? 'Pendente' :
                                                         'Não verificado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {request.service_listings && request.service_listings.length > 0 ? (
                                                        <div className="text-xs">
                                                            {request.service_listings.length} serviço(s)
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Nenhum</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {request.verification_status !== 'verified' && (
                                                            <button
                                                                onClick={() => handleVerifyProvider(request.id, 'verified', request.service_listings?.map((s: any) => s.id))}
                                                                className="text-green-600 hover:text-green-800 font-medium text-xs border border-green-200 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                                                            >
                                                                Aprovar
                                                            </button>
                                                        )}
                                                        {request.verification_status === 'pending' && (
                                                            <button
                                                                onClick={() => handleVerifyProvider(request.id, 'rejected')}
                                                                className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                                            >
                                                                Rejeitar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                     )}
                </div>
            )}
        </div>
      </main>

      {/* Modal de Criar Campanha */}
      {isCreateCampaignOpen && (
        <CreateCampaignModal
          onClose={() => setIsCreateCampaignOpen(false)}
          onSuccess={() => {
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;

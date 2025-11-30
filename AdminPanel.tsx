
import React, { useState } from 'react';
import { LayoutDashboard, Megaphone, Users, Settings, TrendingUp, DollarSign, Activity, Plus, Search, MoreHorizontal, CheckCircle, XCircle, LogOut, Wallet } from 'lucide-react';
import { ADMIN_STATS, AD_CAMPAIGNS, SERVICES } from '../services/mockData';
import { ViewState } from '../types';
import Logo from '../components/Logo';

interface AdminPanelProps {
  exitAdmin: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ exitAdmin }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ads' | 'users' | 'finance'>('dashboard');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <Logo variant="light" className="h-8" />
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
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="text-blue-600" size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                                    <TrendingUp size={12} className="mr-1" /> {ADMIN_STATS.growthRate}%
                                </span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Usuários Totais</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{ADMIN_STATS.totalUsers.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <DollarSign className="text-emerald-600" size={24} />
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">MRR</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Receita Recorrente</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">€ {ADMIN_STATS.mrr.toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Megaphone className="text-purple-600" size={24} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Campanhas Ativas</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{ADMIN_STATS.activeCampaigns}</p>
                        </div>

                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <Activity className="text-orange-600" size={24} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Usuários Ativos (MAU)</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{ADMIN_STATS.activeUsers.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* FINANCE / CREATOR FUND VIEW */}
            {activeTab === 'finance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                         <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl shadow-lg text-white">
                             <h3 className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-2">Creator Fund (Miggro Sense)</h3>
                             <p className="text-3xl font-bold mb-4">€ {ADMIN_STATS.creatorFund.toLocaleString()}</p>
                             <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-green-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                             </div>
                             <p className="text-xs mt-2 text-indigo-300">50% da Receita de Ads (Total: € {ADMIN_STATS.adRevenue})</p>
                         </div>

                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                             <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Pagamentos Pendentes</h3>
                             <p className="text-3xl font-bold text-gray-900">€ 450.00</p>
                             <button className="mt-4 w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">Processar Pagamentos</button>
                         </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 mt-8">Top Creators (Repasse de Receita)</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Criador</th>
                                    <th className="px-6 py-4">Visualizações</th>
                                    <th className="px-6 py-4">Ajuda Verificada</th>
                                    <th className="px-6 py-4">Repasse Estimado</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-900">Elena Vistos</td>
                                    <td className="px-6 py-4">125k</td>
                                    <td className="px-6 py-4">450</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">€ 120.00</td>
                                    <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Pendente</span></td>
                                </tr>
                                 <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-900">João Pedro</td>
                                    <td className="px-6 py-4">12k</td>
                                    <td className="px-6 py-4">12</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">€ 5.50</td>
                                    <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Pago</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADS MANAGEMENT VIEW */}
            {activeTab === 'ads' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                         <div className="relative">
                            <input type="text" placeholder="Buscar campanha..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                         </div>
                         <button className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-brand-700 transition-colors">
                            <Plus size={18} className="mr-2" /> Nova Campanha
                         </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                                {AD_CAMPAIGNS.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{campaign.sponsorName}</div>
                                            <div className="text-gray-500 text-xs">{campaign.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                                                campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                                campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">€ {campaign.budget}</td>
                                        <td className="px-6 py-4 text-gray-500">€ {campaign.spent}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(campaign.clicks / campaign.impressions) * 500}%` }}></div>
                                                </div>
                                                <span className="text-xs text-gray-600">{((campaign.clicks / campaign.impressions) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1">{campaign.impressions.toLocaleString()} imps</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* USERS / PROVIDERS VIEW */}
             {activeTab === 'users' && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Solicitações de Verificação (Prestadores)</h3>
                     </div>

                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Prestador</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Preço</th>
                                    <th className="px-6 py-4">Verificado?</th>
                                    <th className="px-6 py-4">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {SERVICES.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 flex items-center space-x-3">
                                            <img src={service.providerAvatar} className="w-8 h-8 rounded-full" alt="" />
                                            <div>
                                                <div className="font-bold text-gray-900">{service.providerName}</div>
                                                <div className="text-gray-500 text-xs">{service.title}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{service.category}</td>
                                        <td className="px-6 py-4 font-medium">
                                            {service.currency === 'EUR' ? `€ ${service.price}` : `${service.price} MG`}
                                        </td>
                                        <td className="px-6 py-4">
                                            {service.verified ? (
                                                <span className="text-green-600 flex items-center text-xs font-bold"><CheckCircle size={14} className="mr-1"/> Sim</span>
                                            ) : (
                                                <span className="text-gray-400 flex items-center text-xs"><XCircle size={14} className="mr-1"/> Não</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                                                Gerenciar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

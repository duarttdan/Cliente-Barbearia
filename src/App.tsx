import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import Clientes from './components/Clientes';
import Servicos from './components/Servicos';
import EntradasSaidas from './components/EntradasSaidas';
import PlanilhaMensal from './components/PlanilhaMensal';
import ActivityLog from './components/ActivityLog';

type TabType = 'dashboard' | 'clientes' | 'servicos' | 'financeiro' | 'planilha' | 'logs';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'servicos', label: 'Serviços', icon: '✂️' },
    { id: 'financeiro', label: 'Financeiro', icon: '💰' },
    { id: 'planilha', label: 'Planilha', icon: '📋' },
    { id: 'logs', label: 'Atividades', icon: '📝' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <Clientes />;
      case 'servicos':
        return <Servicos />;
      case 'financeiro':
        return <EntradasSaidas />;
      case 'planilha':
        return <PlanilhaMensal />;
      case 'logs':
        return <ActivityLog />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✂️</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Hair Style do Grau</h1>
                  <p className="text-xs text-gray-400">Sistema de Gestão</p>
                </div>
              </div>

              {/* Data Atual */}
              <div className="hidden sm:flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-gray-800/50 border-b border-gray-700 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-amber-400 border-amber-400'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-gray-400 text-sm">
                © 2026 Hair Style do Grau - Sistema de Contabilidade
              </p>
              <p className="text-gray-500 text-xs">
                Desenvolvido com ❤️ para barbearias modernas
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;

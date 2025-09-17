import { 
  LayoutDashboard, 
  PiggyBank, 
  FileText, 
  CreditCard, 
  Calculator
} from 'lucide-react'
import Lottie from 'lottie-react'
import { useState, useEffect } from 'react'
import walletAnimation from '../assets/Flying Wallet Money.json'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [homeIconData, setHomeIconData] = useState(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [shouldAnimateWallet, setShouldAnimateWallet] = useState(false)

  useEffect(() => {
    fetch('/home-icon.json')
      .then(response => response.json())
      .then(data => setHomeIconData(data))
      .catch(error => console.error('Erro ao carregar ícone:', error))
  }, [])

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
  }

  const handleDashboardClick = () => {
    if (activeTab === 'dashboard') {
      // Se já está no dashboard, executar animação
      setShouldAnimate(true)
    } else {
      // Se não está no dashboard, apenas navegar
      handleTabChange('dashboard')
    }
  }

  const handleTransactionsClick = () => {
    if (activeTab === 'transactions') {
      // Se já está nas transações, executar animação
      setShouldAnimateWallet(true)
    } else {
      // Se não está nas transações, apenas navegar
      handleTabChange('transactions')
    }
  }

  // Resetar animação quando sair do dashboard
  useEffect(() => {
    if (activeTab !== 'dashboard') {
      setShouldAnimate(false)
    }
  }, [activeTab])

  // Executar animação quando estiver no dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setShouldAnimate(true)
    }
  }, [activeTab])

  // Resetar animação da carteira quando sair das transações
  useEffect(() => {
    if (activeTab !== 'transactions') {
      setShouldAnimateWallet(false)
    }
  }, [activeTab])

  // Executar animação da carteira quando estiver nas transações
  useEffect(() => {
    if (activeTab === 'transactions') {
      setShouldAnimateWallet(true)
    }
  }, [activeTab])

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">FinTrack</div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={handleDashboardClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="w-5 h-5">
                {homeIconData ? (
                  <Lottie 
                    animationData={homeIconData}
                    loop={false}
                    autoplay={shouldAnimate}
                    style={{ width: '20px', height: '20px' }}
                  />
                ) : (
                  <span>📊</span>
                )}
              </div>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={handleTransactionsClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'transactions' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Lottie
                  animationData={walletAnimation}
                  loop={shouldAnimateWallet}
                  autoplay={shouldAnimateWallet}
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <span className="font-medium">Transações</span>
            </button>
            
            <button 
              onClick={() => {
                console.log('🔄 [Sidebar] Clicando na aba Relatórios')
                handleTabChange('budgets')
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'budgets' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>📊</span>
              <span className="font-medium">Relatórios</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>⚙️</span>
              <span className="font-medium">Configurações</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('admin')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-red-50 text-red-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>🔧</span>
              <span className="font-medium">Admin</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg mobile-bottom-nav">
        <div className="px-2 py-2">
          <nav className="flex justify-around items-center">
            <button 
              onClick={handleDashboardClick}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6">
                {homeIconData ? (
                  <Lottie 
                    animationData={homeIconData}
                    loop={false}
                    autoplay={shouldAnimate}
                    style={{ width: '24px', height: '24px' }}
                  />
                ) : (
                  <span className="text-lg">📊</span>
                )}
              </div>
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={handleTransactionsClick}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'transactions' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Lottie
                  animationData={walletAnimation}
                  loop={shouldAnimateWallet}
                  autoplay={shouldAnimateWallet}
                  style={{ width: 24, height: 24 }}
                />
              </div>
              <span className="text-xs font-medium">Transações</span>
            </button>
            
            <button 
              onClick={() => {
                console.log('🔄 [Sidebar] Clicando na aba Relatórios')
                handleTabChange('budgets')
              }}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'budgets' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="text-xs font-medium">Relatórios</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('settings')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span className="text-xs font-medium">Configurações</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('admin')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-red-50 text-red-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">🔧</span>
              <span className="text-xs font-medium">Admin</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar


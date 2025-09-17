import { 
  LayoutDashboard, 
  PiggyBank, 
  FileText, 
  CreditCard, 
  Calculator
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const handleTabChange = (tab: string) => {
    onTabChange(tab)
  }

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
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>📊</span>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('transactions')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'transactions' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>🔄</span>
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
              onClick={() => handleTabChange('dashboard')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('transactions')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'transactions' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">🔄</span>
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


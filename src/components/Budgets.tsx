import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import React, { CSSProperties } from "react";
import { scaleTime, scaleLinear, line as d3line, max, area as d3area, curveMonotoneX } from "d3";
import { useTransactionsContext } from '../contexts/TransactionsContext'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../contexts/AuthContext'

const sales = [
  { date: "2023-04-30", value: 4 },
  { date: "2023-05-01", value: 6 },
  { date: "2023-05-02", value: 8 },
  { date: "2023-05-03", value: 7 },
  { date: "2023-05-04", value: 10 },
  { date: "2023-05-05", value: 12 },
  { date: "2023-05-06", value: 10.5 },
  { date: "2023-05-07", value: 6 },
  { date: "2023-05-08", value: 8 },
  { date: "2023-05-09", value: 7.5 },
  { date: "2023-05-10", value: 6 },
  { date: "2023-05-11", value: 8 },
  { date: "2023-05-12", value: 9 },
  { date: "2023-05-13", value: 10 },
  { date: "2023-05-14", value: 17 },
  { date: "2023-05-15", value: 14 },
  { date: "2023-05-16", value: 15 },
  { date: "2023-05-17", value: 20 },
  { date: "2023-05-18", value: 18 },
  { date: "2023-05-19", value: 16 },
  { date: "2023-05-20", value: 15 },
  { date: "2023-05-21", value: 16 },
  { date: "2023-05-22", value: 13 },
  { date: "2023-05-23", value: 11 },
  { date: "2023-05-24", value: 11 },
  { date: "2023-05-25", value: 13 },
  { date: "2023-05-26", value: 12 },
  { date: "2023-05-27", value: 9 },
  { date: "2023-05-28", value: 8 },
  { date: "2023-05-29", value: 10 },
  { date: "2023-05-30", value: 11 },
  { date: "2023-05-31", value: 8 },
  { date: "2023-06-01", value: 9 },
  { date: "2023-06-02", value: 10 },
  { date: "2023-06-03", value: 12 },
  { date: "2023-06-04", value: 13 },
  { date: "2023-06-05", value: 15 },
  { date: "2023-06-06", value: 13.5 },
  { date: "2023-06-07", value: 13 },
  { date: "2023-06-08", value: 13 },
  { date: "2023-06-09", value: 14 },
  { date: "2023-06-10", value: 13 },
  { date: "2023-06-11", value: 12.5 },
];
let data = sales.map((d) => ({ ...d, date: new Date(d.date) }));

export function AreaChartSemiFilled() {
  // Estados para editar meta
  const [metaMensal, setMetaMensal] = useState(25000)
  const [isEditingMeta, setIsEditingMeta] = useState(false)
  const [novaMeta, setNovaMeta] = useState('')
  
  // Estados para paginação da tabela
  const [currentPage, setCurrentPage] = useState(1)
  const [mobilePage, setMobilePage] = useState(1)
  const itemsPerPage = 5
  
  // Usar dados reais das transações
  const { transactions, loading } = useTransactionsContext()
  
  // Debug: Log quando o componente renderiza
  console.log('🔄 [Budgets] Componente renderizado com', transactions.length, 'transações')

  // Processar dados reais das transações para o GRÁFICO (TODAS as transações, sem filtros)
  const cashFlowData = useMemo(() => {
    console.log('🔄 [Budgets] Iniciando processamento do GRÁFICO com', transactions.length, 'transações')
    
    if (!transactions || transactions.length === 0) {
      console.log('📊 [Budgets] Nenhuma transação encontrada')
      return []
    }

    // Usar TODAS as transações (sem filtros)
    const allTransactions = transactions

    console.log('📊 [Budgets] Usando TODAS as transações para GRÁFICO:', {
      total: allTransactions.length
    })

    // Agrupar transações por data
    const transactionsByDate = allTransactions.reduce((acc, transaction) => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        console.warn('⚠️ [Budgets] Transação sem data válida no gráfico:', transaction)
        return acc;
      }
      
      // Usar a data local para evitar problemas de fuso horário
      const transactionDate = new Date(transaction.date)
      const year = transactionDate.getFullYear()
      const month = String(transactionDate.getMonth() + 1).padStart(2, '0')
      const day = String(transactionDate.getDate()).padStart(2, '0')
      const date = `${year}-${month}-${day}`
      
      if (!acc[date]) {
        acc[date] = { receitas: 0, despesas: 0 }
      }
      
      if (transaction.type === 'receita') {
        acc[date].receitas += transaction.amount
      } else {
        acc[date].despesas += transaction.amount
      }
      
      return acc
    }, {} as Record<string, { receitas: number; despesas: number }>)

    // Converter para array e calcular saldo
    const result = Object.entries(transactionsByDate)
      .map(([date, values]) => {
        const resultItem = {
          date,
          receitas: values.receitas,
          despesas: values.despesas,
          saldo: values.receitas - values.despesas
        }
        
        // Debug: Log para verificar a data processada
        console.log('📊 [AreaChartSemiFilled] Item processado:', {
          dateString: date,
          dateObject: new Date(date),
          localString: new Date(date).toLocaleDateString('pt-BR'),
          receitas: values.receitas,
          despesas: values.despesas
        })
        
        return resultItem
      })
      .sort((a, b) => a.date.localeCompare(b.date)) // Ordenar por string de data (YYYY-MM-DD)

    return result
  }, [transactions]) // Usar apenas transactions como dependência

  // Processar dados para a TABELA "Movimentação Diária" (filtrando TODAS as transações pagas)
  const dailyMovementData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    // Filtrar APENAS transações NÃO PAGAS para a tabela
    const unpaidTransactions = transactions.filter(transaction => {
      return transaction.isPaid !== true;
    });

    // Agrupar APENAS transações NÃO PAGAS por data
    const transactionsByDate = unpaidTransactions.reduce((acc, transaction) => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        return acc;
      }
      
      
      // Usar a data local para evitar problemas de fuso horário
      const transactionDate = new Date(transaction.date)
      const year = transactionDate.getFullYear()
      const month = String(transactionDate.getMonth() + 1).padStart(2, '0')
      const day = String(transactionDate.getDate()).padStart(2, '0')
      const date = `${year}-${month}-${day}`
      
      if (!acc[date]) {
        acc[date] = { receitas: 0, despesas: 0 }
      }
      
      if (transaction.type === 'receita') {
        acc[date].receitas += transaction.amount
      } else {
        acc[date].despesas += transaction.amount
      }
      
      return acc
    }, {} as Record<string, { receitas: number; despesas: number }>)

    // Converter para array e calcular saldo
    const result = Object.entries(transactionsByDate)
      .map(([date, values]) => {
        const resultItem = {
          date,
          receitas: values.receitas,
          despesas: values.despesas,
          saldo: values.receitas - values.despesas
        }
        
        return resultItem
      })
      .sort((a, b) => a.date.localeCompare(b.date)) // Ordenar por string de data (YYYY-MM-DD)

    console.log('📊 [Movimentação Diária] Resultado final após filtragem:', result);
    console.log('📊 [Movimentação Diária] Valores calculados:', result.map(item => ({
      data: item.date,
      receitas: item.receitas,
      despesas: item.despesas,
      saldo: item.saldo
    })));
    
    // Log detalhado para debug
    if (result.length > 0) {
      console.log('🔍 [DEBUG] Primeiro item da tabela:', {
        data: result[0].date,
        receitas: result[0].receitas,
        despesas: result[0].despesas,
        saldo: result[0].saldo,
        tipo: typeof result[0].saldo
      });
    }
    return result
  }, [transactions])

  // Calcular totais do mês atual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyTotals = useMemo(() => {
    const currentMonthTransactions = transactions.filter(transaction => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        return false;
      }
      
      const transactionDate = new Date(transaction.date)
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                            transactionDate.getFullYear() === currentYear
      
      // Incluir apenas transações do mês atual (sem filtros de parcelas pagas)
      return isCurrentMonth
    })

    const receitas = currentMonthTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const despesas = currentMonthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0)

    return { receitas, despesas, saldo: receitas - despesas }
  }, [transactions, currentMonth, currentYear])

  // Calcular dias restantes no mês
  const daysRemaining = useMemo(() => {
    const today = new Date()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return lastDayOfMonth.getDate() - today.getDate()
  }, [])

  // Calcular média diária necessária para atingir a meta
  const dailyAverageNeeded = useMemo(() => {
    if (daysRemaining <= 0) return 0
    const remainingAmount = metaMensal - monthlyTotals.receitas
    return remainingAmount > 0 ? Math.ceil(remainingAmount / daysRemaining) : 0
  }, [metaMensal, monthlyTotals.receitas, daysRemaining])

  const totalReceitas = monthlyTotals.receitas;
  const totalDespesas = monthlyTotals.despesas;
  const saldoAtual = monthlyTotals.saldo;
  const saldoPositivo = saldoAtual >= 0;

  // Lógica de paginação
  const totalPages = Math.ceil(cashFlowData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = cashFlowData.slice(startIndex, endIndex)

  // Função para mudar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleMobilePageChange = (page: number) => {
    setMobilePage(page)
  }
  
  // Funções para editar meta
  const handleEditMeta = () => {
    setIsEditingMeta(true)
    setNovaMeta(metaMensal.toString())
  }
  
  const handleSaveMeta = () => {
    const valor = parseFloat(novaMeta.replace(/[^\d,]/g, '').replace(',', '.'))
    if (!isNaN(valor) && valor > 0) {
      setMetaMensal(valor)
      setIsEditingMeta(false)
      setNovaMeta('')
    }
  }
  
  const handleCancelEdit = () => {
    setIsEditingMeta(false)
    setNovaMeta('')
  }

  // Mostrar loading se estiver carregando
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados do dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar mensagem se não há transações
  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-500 mb-4">Adicione algumas transações para ver seu dashboard personalizado</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Adicionar Transação
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Indicadores de Performance */}
      {/* Mobile: Carrossel horizontal com duas linhas */}
      <div className="lg:hidden space-y-3">
        {/* Linha superior: Meta Mensal */}
        <div className="overflow-x-auto scrollbar-hide mobile-carousel mobile-carousel-container">
          <div className="flex space-x-3 pb-2" style={{ width: 'max-content' }}>
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{ minWidth: '280px' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🎯</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Meta Mensal</p>
                    {!isEditingMeta && (
                      <button
                        onClick={handleEditMeta}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {isEditingMeta ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">R$</span>
                        <input
                          type="text"
                          value={novaMeta}
                          onChange={(e) => setNovaMeta(e.target.value)}
                          className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-24"
                          placeholder="25000"
                          autoFocus
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveMeta}
                          className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {totalReceitas.toLocaleString('pt-BR')} / R$ {metaMensal.toLocaleString('pt-BR')}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (totalReceitas / metaMensal) * 100 < 33 
                              ? 'bg-yellow-500' 
                              : (totalReceitas / metaMensal) * 100 < 66 
                              ? 'bg-blue-600' 
                              : 'bg-green-500'
                          }`}
                          style={{width: `${Math.min((totalReceitas / metaMensal) * 100, 100)}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round((totalReceitas / metaMensal) * 100)}% concluído
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha inferior: Dias Restantes, Média Diária, Tendência */}
        <div className="overflow-x-auto scrollbar-hide mobile-carousel mobile-carousel-container">
          <div className="flex space-x-3 pb-2" style={{ width: 'max-content' }}>
            {/* Dias Restantes */}
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{ minWidth: '180px' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-lg">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Dias Restantes</p>
                  <p className="text-lg font-semibold text-gray-900">{daysRemaining} dias</p>
                  <p className="text-xs text-gray-500">até o fim do mês</p>
                </div>
              </div>
            </div>

            {/* Média Diária */}
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{ minWidth: '180px' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Média Diária</p>
                  <p className="text-lg font-semibold text-gray-900">R$ {dailyAverageNeeded.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-500">necessária para meta</p>
                </div>
              </div>
            </div>

            {/* Tendência */}
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{ minWidth: '180px' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tendência</p>
                  <p className="text-lg font-semibold text-green-600">↗️ Crescendo</p>
                  <p className="text-xs text-gray-500">+15% vs mês anterior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Grid original */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎯</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Meta Mensal</p>
                {!isEditingMeta && (
                  <button
                    onClick={handleEditMeta}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Editar
                  </button>
                )}
              </div>

              {isEditingMeta ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">R$</span>
                    <input
                      type="text"
                      value={novaMeta}
                      onChange={(e) => setNovaMeta(e.target.value)}
                      className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-24"
                      placeholder="25000"
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveMeta}
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    R$ {totalReceitas.toLocaleString('pt-BR')} / R$ {metaMensal.toLocaleString('pt-BR')}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (totalReceitas / metaMensal) * 100 < 33 
                          ? 'bg-yellow-500' 
                          : (totalReceitas / metaMensal) * 100 < 66 
                          ? 'bg-blue-600' 
                          : 'bg-green-500'
                      }`}
                      style={{width: `${Math.min((totalReceitas / metaMensal) * 100, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((totalReceitas / metaMensal) * 100)}% concluído
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dias Restantes</p>
              <p className="text-lg font-semibold text-gray-900">{daysRemaining} dias</p>
              <p className="text-xs text-gray-500">até o fim do mês</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Média Diária</p>
              <p className="text-lg font-semibold text-gray-900">R$ {dailyAverageNeeded.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-500">necessária para meta</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tendência</p>
              <p className="text-lg font-semibold text-green-600">↗️ Crescendo</p>
              <p className="text-xs text-gray-500">+15% vs mês anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabela de Movimentação Diária */}
      <div className="bg-white rounded-xl border-0 lg:border border-gray-200 overflow-hidden">
        <div className="px-2 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Movimentação Diária</h3>
          <p className="text-xs lg:text-sm text-gray-500">Últimos 7 dias de movimentação</p>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {(() => {
            const mobileItemsPerPage = 4
            const mobileStartIndex = (mobilePage - 1) * mobileItemsPerPage
            const mobileEndIndex = mobileStartIndex + mobileItemsPerPage
            const mobileData = dailyMovementData.slice(mobileStartIndex, mobileEndIndex)
            
            return mobileData.map((item, index) => {
            const [year, month, day] = item.date.split('-').map(Number)
            const localDate = new Date(year, month - 1, day)
            
            return (
              <div key={index} className={`p-2 lg:p-3 border-t-2 border-b border-gray-200 last:border-b-0 ${
                item.saldo >= 0 ? 'border-t-green-400' : 'border-t-red-400'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {localDate.toLocaleDateString('pt-BR')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.saldo >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.saldo >= 0 ? 'Positivo' : 'Negativo'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Receitas</span>
                    <span className="text-sm font-medium text-green-600">
                      R$ {item.receitas.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Despesas</span>
                    <span className="text-sm font-medium text-red-600">
                      R$ {item.despesas.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-700">Saldo</span>
                    <span className={`text-sm font-semibold ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {item.saldo.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )
            })
          })()}
          
          {/* Paginação Mobile - só aparece se houver mais de 4 transações */}
          {dailyMovementData.length > 4 && (() => {
            const mobileItemsPerPage = 4
            const mobileTotalPages = Math.ceil(dailyMovementData.length / mobileItemsPerPage)
            const mobileStartIndex = (mobilePage - 1) * mobileItemsPerPage
            const mobileEndIndex = Math.min(mobileStartIndex + mobileItemsPerPage, dailyMovementData.length)
            
            return (
              <div className="px-2 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    Mostrando {mobileStartIndex + 1} a {mobileEndIndex} de {dailyMovementData.length} transações
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-400 cursor-not-allowed" 
                      disabled={mobilePage === 1}
                      onClick={() => handleMobilePageChange(mobilePage - 1)}
                    >
                      Anterior
                    </button>
                    {Array.from({ length: mobileTotalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`px-2 py-1 text-xs rounded-md ${
                          mobilePage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                        onClick={() => handleMobilePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      className="px-2 py-1 text-xs rounded-md bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      disabled={mobilePage === mobileTotalPages}
                      onClick={() => handleMobilePageChange(mobilePage + 1)}
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block overflow-x-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receitas</th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Despesas</th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyMovementData.map((item, index) => {
                // Criar data local para evitar problemas de fuso horário
                const [year, month, day] = item.date.split('-').map(Number)
                const localDate = new Date(year, month - 1, day)
                
                // Debug: Log da data corrigida
                console.log('📊 [Tabela] Data corrigida:', {
                  original: item.date,
                  localDate: localDate,
                  localString: localDate.toLocaleDateString('pt-BR')
                })
                
                return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-gray-900">
                    {localDate.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-green-600 font-medium">
                    R$ {item.receitas.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-3 lg:px-6 py-3 lg:py-4 text-sm text-red-600 font-medium">
                    R$ {item.despesas.toLocaleString('pt-BR')}
                  </td>
                  <td className={`px-3 lg:px-6 py-3 lg:py-4 text-sm font-medium ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {item.saldo.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-3 lg:px-6 py-3 lg:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.saldo >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.saldo >= 0 ? 'Positivo' : 'Negativo'}
                    </span>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Barra de navegação - só aparece se houver mais de 4 transações */}
        {cashFlowData.length > 4 && (
          <div className="hidden lg:block px-2 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-0">
              <div className="text-xs lg:text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(endIndex, cashFlowData.length)} de {cashFlowData.length} transações
              </div>
              <div className="flex space-x-1 lg:space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Mini Indicadores Visuais */}
      <div className="bg-white p-3 lg:p-6 rounded-xl border-0 lg:border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso do Mês</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Receitas</span>
              <span>{Math.round((totalReceitas / metaMensal) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full" 
                style={{width: `${Math.min((totalReceitas / metaMensal) * 100, 100)}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Despesas</span>
              <span>{Math.round((totalDespesas / metaMensal) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full" 
                style={{width: `${Math.min((totalDespesas / metaMensal) * 100, 100)}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Saldo</span>
              <span>{saldoPositivo ? '+' : ''}{Math.round((saldoAtual / metaMensal) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${saldoPositivo ? 'bg-blue-500' : 'bg-red-500'}`}
                style={{width: `${Math.min(Math.abs(saldoAtual / metaMensal) * 100, 100)}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de gráfico de barras fino para receitas por categoria
function BarChartThinBreakdown({ data }: { data: any[] }) {
  const gap = 0.3; // gap between bars
  const totalValue = data.reduce((acc, d) => acc + d.value, 0);
  const barHeight = 12;
  const totalWidth = totalValue + gap * (data.length - 1);
  let cumulativeWidth = 0;

  const cornerRadius = 4; // Adjust this value to change the roundness

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-gray-500">
        <p>Nenhuma receita encontrada</p>
      </div>
    )
  }

  return (
    <div
      className="relative h-[var(--height)] mt-4 mb-8"
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
          "--marginBottom": "0px",
          "--marginLeft": "0px",
          "--height": `${barHeight}px`,
        } as CSSProperties
      }
    >
      {/* Chart Area */}
      <div
        className="absolute inset-0 
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {/* Bars with Gradient Fill */}
        {data.map((d, index) => {
          const barWidth = (d.value / totalWidth) * 100;
          const xPosition = cumulativeWidth;
          const percentage = (d.value / totalValue) * 100;
          cumulativeWidth += barWidth + gap;

          return (
            <div
              key={index}
              className="relative group"
              style={{
                width: `${barWidth}%`,
                height: `${barHeight}px`,
                left: `${xPosition}%`,
                position: "absolute",
              }}
            >
              <div
                className="transition-all duration-200 group-hover:opacity-80 group-hover:scale-105 cursor-pointer"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: `${cornerRadius}px`,
                  backgroundColor: d.color,
                }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="font-semibold">{d.key}</div>
                <div>R$ {d.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div className="text-gray-300">{percentage.toFixed(1)}% do total</div>
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
              
              <div
                className="text-xs text-gray-400 text-center"
                style={{
                  left: `${xPosition + barWidth / 2}%`,
                  top: `${barHeight + 18}px`,
                }}
              >
                {d.key}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


const Budgets = () => {
  try {
    const [activeReport, setActiveReport] = useState('cashflow')
    const [viewMode, setViewMode] = useState('table')
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

  // Estados dos filtros
  const [periodFilter, setPeriodFilter] = useState('este-mes')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('todas')
  
  // Estados para editar meta (mobile)
  const [metaMensal, setMetaMensal] = useState(25000)
  const [isEditingMeta, setIsEditingMeta] = useState(false)
  const [novaMeta, setNovaMeta] = useState('')
  
  // Hook do contexto para transações
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactionsContext()
  
  // Hook para categorias
  const { user } = useAuth()
  const { categories } = useCategories(user?.uid || 'test-user-123')

  // Calcular totais do mês atual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyTotals = useMemo(() => {
    const currentMonthTransactions = transactions.filter(transaction => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        return false;
      }
      
      const transactionDate = new Date(transaction.date)
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                            transactionDate.getFullYear() === currentYear
      
      return isCurrentMonth
    })

    return currentMonthTransactions.reduce((totals, transaction) => {
      if (transaction.type === 'receita') {
        totals.receitas += transaction.amount
      } else if (transaction.type === 'despesa') {
        totals.despesas += transaction.amount
      }
      return totals
    }, { receitas: 0, despesas: 0, saldo: 0 })
  }, [transactions, currentMonth, currentYear])

  // Calcular saldo
  const totalReceitas = monthlyTotals.receitas
  const totalDespesas = monthlyTotals.despesas
  const saldoAtual = totalReceitas - totalDespesas

  // Funções para editar meta
  const handleEditMeta = () => {
    setIsEditingMeta(true)
    setNovaMeta(metaMensal.toString())
  }
  
  const handleSaveMeta = () => {
    const valor = parseFloat(novaMeta.replace(/[^\d,]/g, '').replace(',', '.'))
    if (!isNaN(valor) && valor > 0) {
      setMetaMensal(valor)
      setIsEditingMeta(false)
      setNovaMeta('')
    }
  }
  
  const handleCancelEdit = () => {
    setIsEditingMeta(false)
    setNovaMeta('')
  }

  // Função para calcular datas baseadas no período
  const getDateRange = (period: string) => {
      const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (period) {
        case 'este-mes':
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)
        return {
          start: firstDay.toISOString().split('T')[0],
          end: lastDay.toISOString().split('T')[0]
        }
        case 'mes-passado':
        const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1)
        const lastDayLastMonth = new Date(currentYear, currentMonth, 0)
        return {
          start: firstDayLastMonth.toISOString().split('T')[0],
          end: lastDayLastMonth.toISOString().split('T')[0]
        }
        case 'ultimos-3-meses':
        const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1) // Corrigido: -2 em vez de -3
        const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0)
        return {
          start: threeMonthsAgo.toISOString().split('T')[0],
          end: lastDayCurrentMonth.toISOString().split('T')[0]
        }
      default:
        return { start: '', end: '' }
    }
  }

  // Inicializar datas quando o componente carregar
  useEffect(() => {
    const { start, end } = getDateRange(periodFilter)
    setStartDate(start)
    setEndDate(end)
  }, [periodFilter])



  // Função para calcular crescimento mensal
  const calculateMonthlyGrowth = () => {
    if (!transactions || transactions.length === 0) return 0

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filtrar transações do mês atual
    const currentMonthTransactions = transactions.filter(transaction => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        return false;
      }
      
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'receita'
    })

    // Filtrar transações do mês anterior
    const previousMonthTransactions = transactions.filter(transaction => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        return false;
      }
      
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === previousMonth && 
             transactionDate.getFullYear() === previousYear &&
             transaction.type === 'receita'
    })

    const currentRevenue = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const previousRevenue = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

    if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0

    return ((currentRevenue - previousRevenue) / previousRevenue) * 100
  }

  // Função para calcular projeção dos próximos 6 meses
  const calculateProjection = () => {
    if (!transactions || transactions.length === 0) return 0

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calcular receita média dos últimos 3 meses
    let totalRevenue = 0
    let monthCount = 0

    for (let i = 0; i < 3; i++) {
      const month = currentMonth - i < 0 ? currentMonth - i + 12 : currentMonth - i
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear

      const monthTransactions = transactions.filter(transaction => {
        // Verificar se a transação tem uma data válida
        if (!transaction || !transaction.date) {
          return false;
        }
        
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === month && 
               transactionDate.getFullYear() === year &&
               transaction.type === 'receita'
      })

      const monthRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
      if (monthRevenue > 0) {
        totalRevenue += monthRevenue
        monthCount++
      }
    }

    if (monthCount === 0) return 0

    const averageMonthlyRevenue = totalRevenue / monthCount
    return averageMonthlyRevenue * 6 // Projeção para 6 meses
  }

  // Fechar modal quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('modal-backdrop')) {
        setIsFiltersModalOpen(false)
      }
    }

    if (isFiltersModalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFiltersModalOpen])

  // Função para aplicar filtros nas transações
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    let filtered = [...transactions]

    // Filtro por período - usar as mesmas datas da função getDateRange
    const { start, end } = getDateRange(periodFilter)
    const startDateObj = new Date(start)
    const endDateObj = new Date(end)
    
    // Adicionar um dia ao final para incluir o último dia (criar nova instância)
    const endDateInclusive = new Date(endDateObj)
    endDateInclusive.setDate(endDateInclusive.getDate() + 1)

    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDateObj && transactionDate < endDateInclusive
    })

    // Filtro por tipo de transação
    switch (transactionTypeFilter) {
      case 'receitas':
        filtered = filtered.filter(t => t.type === 'receita')
        break
      case 'despesas':
        filtered = filtered.filter(t => t.type === 'despesa')
        break
      case 'contas-parceladas':
        filtered = filtered.filter(t => t.installments && t.installments > 1)
        break
      case 'receitas-parceladas':
        filtered = filtered.filter(t => t.type === 'receita' && t.installments && t.installments > 1)
        break
    }

    return filtered
  }, [transactions, periodFilter, startDate, endDate, transactionTypeFilter])

  // Processar dados das receitas por categoria para o gráfico de barras
  const revenueData = useMemo(() => {
    
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return []
    }

    // Filtrar apenas receitas
    const revenues = filteredTransactions.filter(t => t.type === 'receita')
    
    // Agrupar por categoria
    const categoryTotals = revenues.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += transaction.amount
      return acc
    }, {} as Record<string, number>)
    

    // Função para buscar categoria por nome e obter cor
    const getCategoryColor = (categoryName: string, index: number) => {
      const category = categories.find(cat => cat.name === categoryName)
      if (category && category.color) {
        // Usar a cor hex diretamente como background-color
        return category.color
      }
      // Cores padrão se não encontrar a categoria
      const defaultColors = [
        "#8b5cf6", // fuchsia-500
        "#3b82f6", // blue-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#ef4444", // red-500
        "#06b6d4", // cyan-500
        "#84cc16", // lime-500
        "#f97316", // orange-500
      ]
      return defaultColors[index % defaultColors.length]
    }

    // Converter para array e adicionar cores reais das categorias
    const result = Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        key: category,
        value: amount,
        color: getCategoryColor(category, index)
      }))
      .sort((a, b) => (b.value as number) - (a.value as number)) // Ordenar por valor decrescente
    
    return result
  }, [transactions, categories])

  // Processar dados das transações para o fluxo de caixa
  const { cashFlowData, chartData } = useMemo(() => {
    
    if (!transactions || transactions.length === 0) {
      return {
        cashFlowData: [],
        chartData: []
      }
    }

    // Se há apenas uma transação, criar dados mínimos para o gráfico
    if (transactions.length === 1) {
      const transaction = transactions[0]
      
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        return {
          cashFlowData: [],
          chartData: []
        }
      }
      
      const singleData = {
        date: transaction.date,
        name: transaction.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receitas: transaction.type === 'receita' ? transaction.amount : 0,
        despesas: transaction.type === 'despesa' ? transaction.amount : 0,
        saldo: transaction.type === 'receita' ? transaction.amount : -transaction.amount
      }
      
      return {
        cashFlowData: [{
          date: transaction.date.toLocaleDateString('pt-BR'),
          description: transaction.description,
          category: transaction.category,
          account: 'Única',
          income: singleData.receitas,
          expense: singleData.despesas,
          balance: singleData.saldo
        }],
        chartData: [singleData]
      }
    }

    // Agrupar transações por data (excluindo parcelas pagas)
    const transactionsByDate = transactions.reduce((acc, transaction) => {
      // Verificar se a transação tem uma data válida
      if (!transaction || !transaction.date) {
        console.warn('⚠️ [Budgets] Transação sem data válida no fluxo de caixa:', transaction)
        return acc;
      }
      
      // Filtrar parcelas pagas - se for uma parcela e estiver marcada como paga, não incluir no gráfico
      const isPaidInstallment = transaction.installmentNumber && transaction.isPaid === true;
      if (isPaidInstallment) {
        return acc;
      }
      
      // Usar a data local para evitar problemas de fuso horário
      const transactionDate = new Date(transaction.date)
      const year = transactionDate.getFullYear()
      const month = String(transactionDate.getMonth() + 1).padStart(2, '0')
      const day = String(transactionDate.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      
      if (!acc[dateKey]) {
        acc[dateKey] = { receitas: 0, despesas: 0, transactions: [] }
      }
      
      if (transaction.type === 'receita') {
        acc[dateKey].receitas += transaction.amount
      } else {
        acc[dateKey].despesas += transaction.amount
      }
      
      acc[dateKey].transactions.push(transaction)
      return acc
    }, {} as Record<string, { receitas: number; despesas: number; transactions: any[] }>)

    // Converter para arrays ordenados
    const sortedDates = Object.keys(transactionsByDate).sort()
    
    let balance = 0
    const processedCashFlowData = sortedDates.map(date => {
      const dayData = transactionsByDate[date]
      balance += dayData.receitas - dayData.despesas
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR'),
        description: `${dayData.transactions.length} transação(ões)`,
        category: 'Múltiplas',
        account: 'Múltiplas',
        income: dayData.receitas,
        expense: dayData.despesas,
        balance: balance
      }
    })

    const processedChartData = sortedDates.map(date => {
      const dayData = transactionsByDate[date]
      return {
        date: new Date(date),
        name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receitas: dayData.receitas,
        despesas: dayData.despesas,
        saldo: balance
      }
    })

    // Se há poucos dados, criar pontos adicionais para melhor visualização
    let finalChartData = processedChartData
    if (processedChartData.length < 3) {
      const firstDate = new Date(processedChartData[0].date)
      const lastDate = new Date(processedChartData[processedChartData.length - 1].date)
      
      // Adicionar pontos antes e depois para melhor visualização
      const extendedData = []
      
      // Ponto anterior (se necessário)
      if (processedChartData.length === 1) {
        const beforeDate = new Date(firstDate)
        beforeDate.setDate(beforeDate.getDate() - 1)
        extendedData.push({
          date: beforeDate,
          name: beforeDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          receitas: 0,
          despesas: 0,
          saldo: 0
        })
      }
      
      // Dados existentes
      extendedData.push(...processedChartData)
      
      // Ponto posterior (se necessário)
      if (processedChartData.length === 1) {
        const afterDate = new Date(lastDate)
        afterDate.setDate(afterDate.getDate() + 1)
        extendedData.push({
          date: afterDate,
          name: afterDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          receitas: 0,
          despesas: 0,
          saldo: processedChartData[0].saldo
        })
      }
      
      finalChartData = extendedData
    }


    return {
      cashFlowData: processedCashFlowData,
      chartData: finalChartData
    }
  }, [transactions])

  const reportTypes = [
    { id: 'cashflow', name: 'Fluxo de Caixa', icon: '📊', active: true },
    { id: 'equity', name: 'Evolução Patrimonial', icon: '📈', active: false },
    { id: 'expenses', name: 'Análise de Gastos', icon: '💰', active: false }
  ]

  // Função para renderizar o conteúdo do relatório baseado no tipo selecionado
  const renderReportContent = () => {
    switch (activeReport) {
      case 'cashflow':
        return renderCashFlowReport()
      case 'equity':
        return renderEquityReport()
      case 'expenses':
        return renderExpensesReport()
      default:
        return renderCashFlowReport()
    }
  }

  // Relatório de Fluxo de Caixa
  const renderCashFlowReport = () => (
    <div className="space-y-4 lg:space-y-6">
          {/* Título e Botões */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 lg:mb-4 gap-3 lg:gap-0">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
          Fluxo de Caixa - {getPeriodName()}
            </h2>
          <div className="flex space-x-1 lg:space-x-2">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gráfico
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tabela
            </button>
          </div>
        </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'chart' ? (
          <div className="h-96">
            {chartData.length > 0 ? (
              <AreaChartSemiFilled />
            ) : transactions.length > 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Dados insuficientes para o gráfico</p>
                  <p className="text-sm mt-1">Tente ajustar os filtros ou adicionar mais transações</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Nenhuma transação encontrada</p>
                  <p className="text-sm mt-1">Adicione transações para ver o fluxo de caixa</p>
                </div>
              </div>
            )}
          </div>
        ) : (
        renderTransactionsTable()
      )}
    </div>
  )

  // Função para obter o nome do período baseado no filtro
  const getPeriodName = () => {
    if (periodFilter === 'personalizado') {
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const startMonth = start.toLocaleDateString('pt-BR', { month: 'long' })
        const startYear = start.getFullYear()
        const endMonth = end.toLocaleDateString('pt-BR', { month: 'long' })
        const endYear = end.getFullYear()
        
        if (startMonth === endMonth && startYear === endYear) {
          return `${startMonth} de ${startYear}`
        } else {
          return `${startMonth} de ${startYear} a ${endMonth} de ${endYear}`
        }
      }
      return 'Período Personalizado'
    }
    
    const { start, end } = getDateRange(periodFilter)
    // Criar datas sem problemas de fuso horário
    const startDateObj = new Date(start + 'T00:00:00')
    const endDateObj = new Date(end + 'T23:59:59')
    
    switch (periodFilter) {
      case 'este-mes':
        return endDateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      case 'mes-passado':
        return startDateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      case 'ultimos-3-meses':
        const startMonth = startDateObj.toLocaleDateString('pt-BR', { month: 'long' })
        const startYear = startDateObj.getFullYear()
        const endMonth = endDateObj.toLocaleDateString('pt-BR', { month: 'long' })
        const endYear = endDateObj.getFullYear()
        return `${startMonth} de ${startYear} a ${endMonth} de ${endYear}`
      default:
        return 'Período Selecionado'
    }
  }

  // Relatório de Evolução Patrimonial
  const renderEquityReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Evolução Patrimonial - {getPeriodName()}
        </h2>
      </div>

      {/* Gráfico de Barras Horizontais - Receitas por Categoria */}
      <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <BarChartThinBreakdown data={revenueData} />
        </div>
      </div>

      {/* Top 5 Maiores Receitas */}
      <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Maiores Receitas</h3>
        <div className="space-y-3">
          {filteredTransactions
            .filter(t => t.type === 'receita')
            .sort((a: any, b: any) => b.amount - a.amount)
            .slice(0, 5)
            .map((revenue: any, index: number) => (
              <div key={revenue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <div className="font-medium text-gray-900">{revenue.description}</div>
                    <div className="text-sm text-gray-600">{revenue.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    R$ {revenue.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {revenue.date.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Cards de Resumo Patrimonial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6">
        <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-4">Patrimônio Atual</h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Saldo Total</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {revenueData.reduce((acc, item) => acc + item.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Baseado nas receitas do período
            </div>
          </div>
        </div>

        <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-4">Crescimento</h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Variação Mensal</span>
              <span className={`text-lg font-bold ${
                calculateMonthlyGrowth() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {calculateMonthlyGrowth() >= 0 ? '+' : ''}{calculateMonthlyGrowth().toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Comparado ao mês anterior
            </div>
          </div>
        </div>

        <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-4">Projeção</h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Próximos 6 meses</span>
              <span className="text-lg font-bold text-purple-600">
                R$ {calculateProjection().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Baseado na tendência atual
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Relatório de Análise de Gastos
  const renderExpensesReport = () => {
    // Filtrar apenas despesas
    const expenses = filteredTransactions.filter(t => t.type === 'despesa')
    
    // Agrupar despesas por categoria
    const expenseData = expenses.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += transaction.amount
      return acc
    }, {} as Record<string, number>)

    const expenseArray = Object.entries(expenseData)
      .map(([category, amount]) => ({
        key: category,
        value: amount,
        color: categories.find(cat => cat.name === category)?.color || '#ef4444'
      }))
      .sort((a, b) => (b.value as number) - (a.value as number))

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Análise de Gastos - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Resumo de Gastos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-2 lg:p-4 rounded-lg shadow border-0 lg:border">
            <div className="text-sm text-gray-600">Total Gasto</div>
            <div className="text-2xl font-bold text-red-600">
              R$ {expenses.reduce((acc, t) => acc + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-2 lg:p-4 rounded-lg shadow border-0 lg:border">
            <div className="text-sm text-gray-600">Categorias</div>
            <div className="text-2xl font-bold text-blue-600">{Object.keys(expenseData).length}</div>
          </div>
          <div className="bg-white p-2 lg:p-4 rounded-lg shadow border-0 lg:border">
            <div className="text-sm text-gray-600">Transações</div>
            <div className="text-2xl font-bold text-green-600">{expenses.length}</div>
          </div>
          <div className="bg-white p-2 lg:p-4 rounded-lg shadow border-0 lg:border">
            <div className="text-sm text-gray-600">Média por Transação</div>
            <div className="text-2xl font-bold text-purple-600">
              R$ {expenses.length > 0 ? (expenses.reduce((acc, t) => acc + t.amount, 0) / expenses.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </div>
          </div>
        </div>

        {/* Gráfico de Gastos por Categoria */}
        <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-4">Gastos por Categoria</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <BarChartThinBreakdown data={expenseArray} />
          </div>
        </div>

        {/* Top 5 Maiores Gastos */}
        <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-4">Top 5 Maiores Gastos</h3>
          <div className="space-y-2 lg:space-y-3">
            {expenses
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((expense, index) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-gray-900">{expense.description}</div>
                      <div className="text-sm text-gray-600">{expense.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {expense.date.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  // Tabela de transações (reutilizada)
  const renderTransactionsTable = () => (
            <div className="overflow-x-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Data</th>
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm hidden sm:table-cell">Descrição</th>
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Categoria</th>
                    <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm hidden md:table-cell">Parcelas</th>
                    <th className="text-right py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm">Valor</th>
                    <th className="text-right py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-700 text-xs lg:text-sm hidden lg:table-cell">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm text-gray-600">
                            {transaction.date ? transaction.date.toLocaleDateString('pt-BR') : 'Data inválida'}
                          </td>
                          <td className="py-2 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm text-gray-900 font-medium hidden sm:table-cell">
                            {transaction.description}
                          </td>
                          <td className="py-2 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm text-gray-700">
                            {transaction.category}
                          </td>
                          <td className="py-2 lg:py-4 px-2 lg:px-4 text-xs lg:text-sm text-gray-700 hidden md:table-cell">
                            {transaction.installments && transaction.installments > 1 ? (
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {transaction.installmentNumber || 1}/{transaction.installments}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {transaction.isPaid ? 'Pago' : 'Pendente'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500">À vista</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2 lg:py-4 px-2 lg:px-4 text-right text-xs lg:text-sm font-semibold">
                            <span className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'receita' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-2 lg:py-4 px-2 lg:px-4 text-right hidden lg:table-cell">
                            <span className={`inline-flex items-center px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'receita' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
  )

  return (
    <div className="space-y-3 lg:space-y-6 px-2 lg:px-0">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Relatórios</h1>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors">
          Salvar Relatório Personalizado
              </button>
      </div>

      {/* Mobile Cards - Carrossel */}
      <div className="lg:hidden space-y-3">
        {/* Primeira linha: Meta Mensal - largura total */}
        <div className="bg-white p-4 rounded-xl border-0 border-gray-200 mobile-carousel-item">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎯</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Meta Mensal</p>
                {!isEditingMeta && (
                  <button
                    onClick={handleEditMeta}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Editar
                  </button>
                )}
              </div>

              {isEditingMeta ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">R$</span>
                    <input
                      type="text"
                      value={novaMeta}
                      onChange={(e) => setNovaMeta(e.target.value)}
                      className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-24"
                      placeholder="25000"
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveMeta}
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    R$ {totalReceitas.toLocaleString('pt-BR')} / R$ {metaMensal.toLocaleString('pt-BR')}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (totalReceitas / metaMensal) * 100 < 33 
                          ? 'bg-yellow-500' 
                          : (totalReceitas / metaMensal) * 100 < 66 
                          ? 'bg-blue-600' 
                          : 'bg-green-500'
                      }`}
                      style={{width: `${Math.min((totalReceitas / metaMensal) * 100, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((totalReceitas / metaMensal) * 100)}% concluído
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Segunda linha: Dias Restantes, Média Diária e Tendência */}
        <div className="overflow-x-auto scrollbar-hide mobile-carousel mobile-carousel-container">
          <div className="flex space-x-3 pb-2" style={{width: 'max-content'}}>
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{minWidth: '180px'}}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-lg">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Dias Restantes</p>
                  <p className="text-lg font-semibold text-gray-900">13 dias</p>
                  <p className="text-xs text-gray-500">até o fim do mês</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{minWidth: '180px'}}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Média Diária</p>
                  <p className="text-lg font-semibold text-gray-900">R$ 1.842</p>
                  <p className="text-xs text-gray-500">necessária para meta</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-0 border-gray-200 flex-shrink-0 mobile-carousel-item" style={{minWidth: '180px'}}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tendência</p>
                  <p className="text-lg font-semibold text-green-600">↗️ Crescendo</p>
                  <p className="text-xs text-gray-500">+15% vs mês anterior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {(() => {
          // Calcular dados reais das transações
          const revenues = transactions.filter(t => t.type === 'receita')
          const expenses = transactions.filter(t => t.type === 'despesa')
          
          const totalRevenue = revenues.reduce((sum, t) => sum + t.amount, 0)
          const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
          
          // Maior receita
          const biggestRevenue = revenues.length > 0 ? revenues.reduce((max, t) => t.amount > max.amount ? t : max) : null
          const revenuePercentage = biggestRevenue && totalRevenue > 0 ? ((biggestRevenue.amount / totalRevenue) * 100).toFixed(0) : 0
          
          // Maior despesa
          const biggestExpense = expenses.length > 0 ? expenses.reduce((max, t) => t.amount > max.amount ? t : max) : null
          const expensePercentage = biggestExpense && totalExpense > 0 ? ((biggestExpense.amount / totalExpense) * 100).toFixed(0) : 0
          
          // Calcular economia potencial (reduzir 15% da maior categoria de despesa)
          const expenseByCategory = expenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
          }, {} as Record<string, number>)
          
          const biggestCategory = Object.entries(expenseByCategory).length > 0 
            ? Object.entries(expenseByCategory).reduce((max, [cat, amount]) => amount > max.amount ? { category: cat, amount } : max, { category: '', amount: 0 })
            : { category: 'alimentação', amount: 0 }
          
          const potentialSavings = biggestCategory.amount * 0.15
          const annualSavings = potentialSavings * 12
          
          return (
            <>
        {/* Maior Receita */}
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-xs lg:text-lg font-medium text-gray-600 mb-1 lg:mb-4">Maior Receita</h3>
          <div className="space-y-1 lg:space-y-3">
                  {biggestRevenue ? (
                    <>
            <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600 truncate">{biggestRevenue.description}</span>
                        <span className="text-sm lg:text-lg font-bold text-green-600">
                          R$ {biggestRevenue.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
            </div>
            <div className="text-xs lg:text-sm text-gray-500 hidden lg:block">
                        <span className="font-medium text-gray-900">{revenuePercentage}%</span> das receitas
            </div>
            <div className="text-xs lg:text-sm text-green-600 hidden lg:block">
                        {biggestRevenue.category}
            </div>
                    </>
                  ) : (
                    <div className="text-xs lg:text-sm text-gray-500">Nenhuma receita encontrada</div>
                  )}
          </div>
        </div>

        {/* Maior Despesa */}
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-xs lg:text-lg font-medium text-gray-600 mb-1 lg:mb-4">Maior Despesa</h3>
          <div className="space-y-1 lg:space-y-3">
                  {biggestExpense ? (
                    <>
            <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600 truncate">{biggestExpense.description}</span>
                        <span className="text-sm lg:text-lg font-bold text-red-600">
                          R$ {biggestExpense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
            </div>
            <div className="text-xs lg:text-sm text-gray-500 hidden lg:block">
                        <span className="font-medium text-gray-900">{expensePercentage}%</span> das despesas
            </div>
            <div className="text-xs lg:text-sm text-gray-500 hidden lg:block">
                        {biggestExpense.category}
            </div>
                    </>
                  ) : (
                    <div className="text-xs lg:text-sm text-gray-500">Nenhuma despesa encontrada</div>
                  )}
          </div>
        </div>

        {/* Economia Potencial */}
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow border-0 lg:border">
          <h3 className="text-xs lg:text-lg font-medium text-gray-600 mb-1 lg:mb-4">Economia Potencial</h3>
          <div className="space-y-1 lg:space-y-3">
                  {biggestCategory.amount > 0 ? (
                    <>
            <div className="text-xs lg:text-sm text-gray-500 hidden lg:block">
                        <span className="font-medium text-gray-900">{biggestCategory.category}</span> -15%
            </div>
            <div className="text-sm lg:text-lg font-bold text-green-600">
                        R$ {potentialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
            </div>
            <div className="text-xs lg:text-sm text-gray-500 hidden lg:block">
                        R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
            </div>
                    </>
                  ) : (
                    <div className="text-xs lg:text-sm text-gray-500">Nenhuma despesa para análise</div>
                  )}
          </div>
        </div>
            </>
          )
        })()}
      </div>

      {/* Controles e Navegação */}
      <div className="space-y-3 lg:space-y-4">
        {/* Navegação Principal - Carrossel Horizontal */}
        <div className="bg-white p-2 lg:p-4 rounded-lg shadow border-0 lg:border">
          <div className="flex justify-start">
            {/* Mobile: Carrossel horizontal com scroll */}
            <div className="lg:hidden w-full">
              <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2">
                <div className="flex space-x-2">
                  {reportTypes.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        activeReport === report.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm">{report.icon}</span>
                      <span>{report.name}</span>
                    </button>
                  ))}
                  
                  {/* Botão de Filtros */}
                  <button 
                    onClick={() => setIsFiltersModalOpen(true)}
                    className="flex items-center space-x-1 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap"
                  >
                    <img 
                      src="/configuration-settings-gear-options-preferences-setting-tools-svgrepo-com.svg" 
                      alt="Filtros" 
                      className="w-3 h-3"
                    />
                    <span>Filtros</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop: Layout original */}
            <div className="hidden lg:block">
              <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-lg border">
                {reportTypes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeReport === report.id
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{report.icon}</span>
                    <span>{report.name}</span>
                  </button>
                ))}
                
                {/* Botão de Filtros */}
                <button 
                  onClick={() => setIsFiltersModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <img 
                    src="/configuration-settings-gear-options-preferences-setting-tools-svgrepo-com.svg" 
                    alt="Filtros" 
                    className="w-4 h-4"
                  />
                  <span>Filtros</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Conteúdo do Relatório */}
      <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
        {/* Estados de Loading e Erro */}
        {transactionsLoading ? (
          <div className="h-64 lg:h-96 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm lg:text-base text-gray-600">Carregando dados...</span>
            </div>
          </div>
        ) : transactionsError ? (
          <div className="h-64 lg:h-96 flex items-center justify-center">
            <div className="text-center text-red-600">
              <p className="text-sm lg:text-base">Erro ao carregar dados</p>
              <p className="text-xs lg:text-sm mt-1">{transactionsError}</p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="h-64 lg:h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">📊</div>
              <p className="text-base lg:text-lg">Nenhuma transação encontrada</p>
              <p className="text-xs lg:text-sm mt-2">Adicione transações para ver os relatórios</p>
            </div>
          </div>
        ) : (
          renderReportContent()
        )}
      </div>

      {/* Modal de Filtros */}
      {isFiltersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-3 lg:mx-4">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={() => setIsFiltersModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-lg lg:text-xl">×</span>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
              {/* Período */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-0">
                <label className="text-xs lg:text-sm font-medium text-gray-700">Período</label>
                <select 
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="personalizado">Personalizado</option>
                  <option value="este-mes">Este mês</option>
                  <option value="mes-passado">Mês passado</option>
                  <option value="ultimos-3-meses">Últimos 3 meses</option>
                </select>
              </div>

              {/* Data Inicial */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-0">
                <label className="text-xs lg:text-sm font-medium text-gray-700">De</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={periodFilter !== 'personalizado'}
                    className={`border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:min-w-[140px] ${
                      periodFilter !== 'personalizado' 
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (periodFilter === 'personalizado') {
                        const input = document.querySelector('input[type="date"][value="' + startDate + '"]') as HTMLInputElement
                        input?.showPicker()
                      }
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
                      periodFilter === 'personalizado' ? 'cursor-pointer hover:text-gray-600' : 'cursor-not-allowed'
                    }`}
                    disabled={periodFilter !== 'personalizado'}
                  >
                    📅
                  </button>
                </div>
              </div>

              {/* Data Final */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-0">
                <label className="text-xs lg:text-sm font-medium text-gray-700">Até</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={periodFilter !== 'personalizado'}
                    className={`border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:min-w-[140px] ${
                      periodFilter !== 'personalizado' 
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (periodFilter === 'personalizado') {
                        const input = document.querySelector('input[type="date"][value="' + endDate + '"]') as HTMLInputElement
                        input?.showPicker()
                      }
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${
                      periodFilter === 'personalizado' ? 'cursor-pointer hover:text-gray-600' : 'cursor-not-allowed'
                    }`}
                    disabled={periodFilter !== 'personalizado'}
                  >
                    📅
                  </button>
                </div>
              </div>

              {/* Tipo de Transação */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-0">
                <label className="text-xs lg:text-sm font-medium text-gray-700">Tipo</label>
                <select 
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="todas">Todas</option>
                  <option value="receitas">Receitas</option>
                  <option value="despesas">Despesas</option>
                  <option value="contas-parceladas">Parceladas</option>
                  <option value="receitas-parceladas">Rec. Parceladas</option>
                </select>
              </div>
            </div>

            {/* Botões do Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-0 p-4 lg:p-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  setPeriodFilter('este-mes')
                  setTransactionTypeFilter('todas')
                  const { start, end } = getDateRange('este-mes')
                  setStartDate(start)
                  setEndDate(end)
                }}
                className="flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <span>♻️</span>
                <span>Limpar filtros</span>
              </button>
              
              <button 
                onClick={() => setIsFiltersModalOpen(false)}
                className="flex items-center space-x-1 lg:space-x-2 px-4 lg:px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors shadow-md"
              >
                <span>✅</span>
                <span>Aplicar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
  } catch (error) {
    console.error('❌ [Budgets] Erro no componente:', error)
    return (
      <div className="bg-white p-2 lg:p-6 rounded-lg shadow border-0 lg:border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios</h3>
        <div className="text-red-600">
          <p>Erro ao carregar relatórios: {String(error)}</p>
        </div>
      </div>
    )
  }
}

export default Budgets
















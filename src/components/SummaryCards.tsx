
import React, { useState, useEffect, useMemo } from 'react'
import { useTransactionsContext } from '../contexts/TransactionsContext'
import { useAuth } from '../contexts/AuthContext'
import { Transaction } from '../firebase/types'
import { categoryService } from '../firebase/services/categories'

interface SummaryData {
  currentBalance: number
  currentMonthRevenue: number
  currentMonthExpense: number
  previousMonthRevenue: number
  previousMonthExpense: number
  revenuePercentage: number
  expensePercentage: number
  balancePercentage: number
}

const SummaryCards = () => {
  const { user } = useAuth()
  const { transactions, loading, error, createTransaction } = useTransactionsContext()

  // Se estiver carregando, mostrar loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  // Se houver erro, mostrar mensagem de erro
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Função para calcular dados do resumo
  const calculateSummaryData = (transactions: Transaction[]): SummaryData => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Mês anterior
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filtrar transações do mês atual
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    // Filtrar transações do mês anterior
    const previousMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === previousMonth && 
             transactionDate.getFullYear() === previousYear
    })

    // Calcular receitas e despesas do mês atual (apenas não pagas)
    const currentMonthRevenue = currentMonthTransactions
      .filter(t => t.type === 'receita' && !t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0)

    const currentMonthExpense = currentMonthTransactions
      .filter(t => t.type === 'despesa' && !t.isPaid)
      .reduce((sum, t) => sum + t.amount, 0)

    // Calcular receitas e despesas do mês anterior
    const previousMonthRevenue = previousMonthTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0)

    const previousMonthExpense = previousMonthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0)

    // Calcular saldo atual (apenas transações não pagas)
    const unpaidTransactions = transactions.filter(t => !t.isPaid)
    
    const totalRevenue = unpaidTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = unpaidTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentBalance = totalRevenue - totalExpense

    // Calcular percentuais de variação
    const revenuePercentage = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0

    const expensePercentage = previousMonthExpense > 0
      ? ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100
      : 0

    // Calcular percentual do saldo (baseado na variação líquida)
    const currentNet = currentMonthRevenue - currentMonthExpense
    const previousNet = previousMonthRevenue - previousMonthExpense
    const balancePercentage = previousNet !== 0
      ? ((currentNet - previousNet) / Math.abs(previousNet)) * 100
      : 0

    return {
      currentBalance,
      currentMonthRevenue,
      currentMonthExpense,
      previousMonthRevenue,
      previousMonthExpense,
      revenuePercentage,
      expensePercentage,
      balancePercentage
    }
  }

  // Calcular dados do resumo usando useMemo para evitar recálculos desnecessários
  const summaryData = useMemo(() => {
    if (transactions.length === 0) {
      return {
        currentBalance: 0,
        currentMonthRevenue: 0,
        currentMonthExpense: 0,
        previousMonthRevenue: 0,
        previousMonthExpense: 0,
        revenuePercentage: 0,
        expensePercentage: 0,
        balancePercentage: 0
      }
    }
    
    return calculateSummaryData(transactions)
  }, [transactions])


  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para formatar percentuais
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="mb-1.5 lg:mb-6">
      {/* Mobile: Carrossel horizontal */}
      <div className="lg:hidden space-y-2">
        {/* Saldo Atual - Card principal no topo */}
        <div className="bg-white p-3 rounded-lg shadow border">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Saldo Atual</h3>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(summaryData.currentBalance)}
          </p>
        </div>

        {/* Receitas e Despesas - Cards lado a lado */}
        <div className="flex space-x-2">
          {/* Receitas */}
          <div className="bg-white p-3 rounded-lg shadow border flex-1">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Receitas</h3>
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(summaryData.currentMonthRevenue)}
            </p>
          </div>

          {/* Despesas */}
          <div className="bg-white p-3 rounded-lg shadow border flex-1">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Despesas</h3>
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(summaryData.currentMonthExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: Grid original */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {/* Saldo Atual */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">💰</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Saldo Atual</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(summaryData.currentBalance)}
          </p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              summaryData.balancePercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(summaryData.balancePercentage)}
            </span>
            <span className="text-sm text-gray-500">desde o mês passado</span>
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">📈</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Receitas</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(summaryData.currentMonthRevenue)}
          </p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              summaryData.revenuePercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(summaryData.revenuePercentage)}
            </span>
            <span className="text-sm text-gray-500">desde o mês passado</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">📉</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Despesas</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(summaryData.currentMonthExpense)}
          </p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              summaryData.expensePercentage <= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(summaryData.expensePercentage)}
            </span>
            <span className="text-sm text-gray-500">desde o mês passado</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryCards


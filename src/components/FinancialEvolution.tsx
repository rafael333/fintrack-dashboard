import React, { useState } from 'react';
import { scaleBand, scaleLinear, max, min, line as d3_line, curveMonotoneX } from 'd3';
import { useTransactionsContext } from '../contexts/TransactionsContext';

import { Transaction } from '../firebase/types';

interface ChartData {
  key: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

const BarChartLine = ({ 
  data, 
  hoveredLegend, 
  setHoveredLegend, 
  tooltipData,
  setTooltipData, 
  totalReceitas, 
  totalDespesas, 
  totalSaldo 
}: { 
  data: ChartData[];
  hoveredLegend: string | null;
  setHoveredLegend: (value: string | null) => void;
  tooltipData: any;
  setTooltipData: (value: any) => void;
  totalReceitas: number;
  totalDespesas: number;
  totalSaldo: number;
}) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);


  const xScale = scaleBand()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.3);

  const maxReceitas = max(data.map((d) => d.receitas)) ?? 0;
  const maxDespesas = max(data.map((d) => d.despesas)) ?? 0;
  const maxBarras = Math.max(maxReceitas, maxDespesas);
  
  const yScaleBarras = scaleLinear().domain([0, maxBarras]).range([100, 0]);

  // Calcular valores do saldo
  const saldos = data.map(d => d.saldo);
  const maxSaldo = max(saldos) ?? 0;
  const minSaldo = min(saldos) ?? 0;
  const hasSaldoData = maxSaldo > 0 || minSaldo < 0;
  
  let saldoDomain;
  if (hasSaldoData) {
    const saldoRange = Math.max(Math.abs(maxSaldo), Math.abs(minSaldo));
    // Adicionar 20% de margem para melhor visualização
    const paddedRange = saldoRange * 1.2;
    saldoDomain = [-paddedRange, paddedRange];
  } else {
    saldoDomain = [-1, 1];
  }
  
  const yScaleSaldo = scaleLinear().domain(saldoDomain).range([100, 0]);

  // Criar dados estendidos para a linha
  const extendedData = [];
  
  // Ponto antes da primeira vela
  if (data.length > 0) {
    const firstBarX = xScale(data[0].key) ?? 0;
    const firstBarBandwidth = xScale.bandwidth() ?? 0;
    const beforeX = Math.max(0, firstBarX - firstBarBandwidth * 0.3);
    
    extendedData.push({
      key: 'before',
      receitas: 0,
      despesas: 0,
      saldo: data[0].saldo,
      x: beforeX
    });
  }
  
  // Dados originais
  data.forEach(d => {
    const xPosition = xScale(d.key) ?? 0;
    const bandwidth = xScale.bandwidth() ?? 0;
    extendedData.push({
      ...d,
      x: xPosition + bandwidth / 2
    });
  });
  
  // Ponto depois da última vela
  if (data.length > 0) {
    const lastBarX = xScale(data[data.length - 1].key) ?? 0;
    const lastBarBandwidth = xScale.bandwidth() ?? 0;
    const afterX = Math.min(100, lastBarX + lastBarBandwidth * 1.3);
    
    extendedData.push({
      key: 'after',
      receitas: 0,
      despesas: 0,
      saldo: data[data.length - 1].saldo,
      x: afterX
    });
  }

  const line = d3_line<typeof extendedData[0]>()
    .x((d) => d.x)
    .y((d) => yScaleSaldo(d.saldo))
    .curve(curveMonotoneX)
    .defined((d) => d.key !== 'before' && d.key !== 'after');

  const linePath = line(extendedData);

  return (
    <div
      className="relative h-72 w-full grid"
      style={{
        "--marginTop": "0px",
        "--marginRight": "0px",
        "--marginBottom": "0px",
        "--marginLeft": "0px",
      } as React.CSSProperties}
    >


      {/* Chart Area */}
      <div
        className="absolute inset-0
          z-10
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {/* Bars */}
        <div className="relative w-full h-full">
          {data.map((d, index) => {
            const barWidth = xScale.bandwidth() * 0.4; // 40% da largura do mês para cada barra
            const receitasHeight = yScaleBarras(0) - yScaleBarras(d.receitas);
            const despesasHeight = yScaleBarras(0) - yScaleBarras(d.despesas);
            const xPosition = xScale(d.key) || 0;

            const hasTransactions = d.receitas > 0 || d.despesas > 0;


            return (
              <React.Fragment key={d.key}>

                {/* Receitas Bar */}
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: `${Math.max(receitasHeight, 20)}%`, // Mínimo de 20% para ser visível e clicável
                    borderRadius: "6px 6px 0 0",
                    marginLeft: `${xPosition + (xScale.bandwidth() * 0.05)}%`, // 5% offset
                    backgroundColor: d.receitas > 0 
                      ? (hoveredBar === `${index}-receitas` || (hoveredLegend === 'receitas' && d.receitas > 0) ? 'rgba(34, 197, 94, 1)' : 'rgba(34, 197, 94, 0.6)')
                      : 'rgba(34, 197, 94, 0.1)',
                    transform: (hoveredBar === `${index}-receitas` || (hoveredLegend === 'receitas' && d.receitas > 0)) ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    boxShadow: (hoveredBar === `${index}-receitas` || (hoveredLegend === 'receitas' && d.receitas > 0))
                      ? '0 4px 12px rgba(34, 197, 94, 0.4), 0 0 0 2px rgba(34, 197, 94, 0.3)' 
                      : 'none',
                    zIndex: (hoveredBar === `${index}-receitas` || (hoveredLegend === 'receitas' && d.receitas > 0)) ? 40 : 30,
                    filter: (hoveredBar === `${index}-receitas` || (hoveredLegend === 'receitas' && d.receitas > 0))
                      ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))' 
                      : 'none',
                  }}
                  className="absolute bottom-0 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredBar(`${index}-receitas`);
                    setTooltipData({
                      x: xPosition + xScale.bandwidth() / 2,
                      y: 50,
                      month: d.key,
                      receitas: d.receitas,
                      despesas: d.despesas,
                      saldo: d.saldo,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredBar(null);
                    setTooltipData(null);
                  }}
                />

                {/* Despesas Bar */}
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: `${Math.max(despesasHeight, 20)}%`, // Mínimo de 20% para ser visível e clicável
                    borderRadius: "6px 6px 0 0",
                    marginLeft: `${xPosition + (xScale.bandwidth() * 0.5)}%`, // 50% offset
                    backgroundColor: d.despesas > 0 
                      ? (hoveredBar === `${index}-despesas` || (hoveredLegend === 'despesas' && d.despesas > 0) ? 'rgba(239, 68, 68, 1)' : 'rgba(239, 68, 68, 0.6)')
                      : 'rgba(239, 68, 68, 0.1)',
                    transform: (hoveredBar === `${index}-despesas` || (hoveredLegend === 'despesas' && d.despesas > 0)) ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    boxShadow: (hoveredBar === `${index}-despesas` || (hoveredLegend === 'despesas' && d.despesas > 0))
                      ? '0 4px 12px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.3)' 
                      : 'none',
                    zIndex: (hoveredBar === `${index}-despesas` || (hoveredLegend === 'despesas' && d.despesas > 0)) ? 40 : 30,
                    filter: (hoveredBar === `${index}-despesas` || (hoveredLegend === 'despesas' && d.despesas > 0))
                      ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))' 
                      : 'none',
                  }}
                  className="absolute bottom-0 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredBar(`${index}-despesas`);
                    setTooltipData({
                      x: xPosition + xScale.bandwidth() / 2,
                      y: 50,
                      month: d.key,
                      receitas: d.receitas,
                      despesas: d.despesas,
                      saldo: d.saldo,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredBar(null);
                    setTooltipData(null);
                  }}
                />

                {/* X Axis Labels */}
                <div
                  className="absolute overflow-visible text-gray-400"
                  style={{
                    left: `${xPosition + xScale.bandwidth() / 2}%`,
                    top: "100%",
                    transform: "rotate(45deg) translateX(4px) translateY(8px)",
                  }}
                >
                  <div className="absolute text-xs -translate-y-1/2">
                    {d.key}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Line Chart */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full overflow-visible z-10"
          preserveAspectRatio="none"
        >
          <path
            d={linePath ?? ""}
            fill="none"
            className={`text-blue-500 cursor-pointer transition-all duration-300 ${
              hoveredBar?.includes('line') || (hoveredLegend === 'saldo' && totalSaldo !== 0) ? 'drop-shadow-lg' : ''
            }`}
            stroke="currentColor"
            strokeWidth={(hoveredBar?.includes('line') || (hoveredLegend === 'saldo' && totalSaldo !== 0)) ? "5" : "3"}
            vectorEffect="non-scaling-stroke"
            onMouseEnter={() => {
              setHoveredBar('line');
              // Mostrar tooltip com informações gerais do saldo
              setTooltipData({
                x: 50, // Centro do gráfico
                y: 30, // Parte superior
                month: 'Saldo Acumulado',
                receitas: 0,
                despesas: 0,
                saldo: data.reduce((sum, d) => sum + d.saldo, 0), // Soma de todos os saldos
              });
            }}
            onMouseLeave={() => {
              setHoveredBar(null);
              setTooltipData(null);
            }}
            style={{
              filter: (hoveredBar?.includes('line') || (hoveredLegend === 'saldo' && totalSaldo !== 0))
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' 
                : 'none',
              stroke: (hoveredBar?.includes('line') || (hoveredLegend === 'saldo' && totalSaldo !== 0))
                ? 'rgba(59, 130, 246, 1)' 
                : 'rgba(59, 130, 246, 0.8)',
            }}
          />
          
        </svg>

        {/* Ponto final da linha com efeito ping */}
        {extendedData.length > 0 && (() => {
          // Encontrar o último ponto real da linha (penúltimo item do extendedData)
          const lastRealPoint = extendedData[extendedData.length - 2]; // Penúltimo item (último ponto real)
          const centerX = lastRealPoint.x;
          const centerY = yScaleSaldo(lastRealPoint.saldo);
          
          return (
            <div
              className="absolute size-2 z-50"
              style={{
                left: `${centerX}%`,
                top: `${centerY}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div 
                className="w-full h-full rounded-full bg-blue-500 border-2 border-blue-400 cursor-pointer animate-ping"
                onMouseEnter={() => {
                  setHoveredBar('line');
                  setTooltipData({
                    x: centerX,
                    y: centerY,
                    month: 'Saldo Acumulado',
                    receitas: 0,
                    despesas: 0,
                    saldo: data.reduce((sum, d) => sum + d.saldo, 0),
                  });
                }}
                onMouseLeave={() => {
                  setHoveredBar(null);
                  setTooltipData(null);
                }}
              />
            </div>
          );
        })()}

        {/* Tooltip */}
        {tooltipData && (
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-none"
            style={{
              left: `${tooltipData.x}%`,
              top: `${tooltipData.y}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">
              {tooltipData.month}
            </div>
            
            {tooltipData.month === 'Saldo Acumulado' ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600 font-semibold">Saldo Total:</span>
                  <span className={`text-xs font-bold ${
                    tooltipData.saldo > 0 ? 'text-green-600' : 
                    tooltipData.saldo < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    R$ {(tooltipData.saldo * 1000).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Soma dos saldos de todos os meses
                </div>
              </div>
            ) : hoveredLegend === 'receitas' ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600 font-semibold">Total de Receitas:</span>
                  <span className="text-xs text-green-600 font-bold">
                    R$ {(totalReceitas * 1000).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Soma de todas as receitas dos 12 meses
                </div>
              </div>
            ) : hoveredLegend === 'despesas' ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-600 font-semibold">Total de Despesas:</span>
                  <span className="text-xs text-red-600 font-bold">
                    R$ {(totalDespesas * 1000).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Soma de todas as despesas dos 12 meses
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600 font-medium">Receitas:</span>
                  <span className="text-xs text-green-600 font-semibold">
                    R$ {(tooltipData.receitas * 1000).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-600 font-medium">Despesas:</span>
                  <span className="text-xs text-red-600 font-semibold">
                    R$ {(tooltipData.despesas * 1000).toFixed(2)}
                  </span>
                </div>
                
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600 font-semibold">Saldo do Mês:</span>
                    <span className={`text-xs font-bold ${
                      tooltipData.saldo > 0 ? 'text-green-600' : 
                      tooltipData.saldo < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      R$ {(tooltipData.saldo * 1000).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {tooltipData.receitas === 0 && tooltipData.despesas === 0 && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Nenhuma transação neste mês
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Função para processar dados das transações
const processTransactionsData = (transactions: Transaction[], selectedYear: number): ChartData[] => {
  // Gerar 12 meses: últimos 3 meses + mês atual + próximos 8 meses
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const months = [];
  // Últimos 3 meses (começando 3 meses atrás)
  for (let i = -3; i < 9; i++) {
    const monthDate = new Date(currentYear, currentMonth + i, 1);
    const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
    const year = monthDate.getFullYear();
    months.push({ name: monthName, year: year, monthIndex: monthDate.getMonth() });
  }


  return months.map((month, monthIndex) => {
    // Criar range do mês
    const monthStart = new Date(month.year, month.monthIndex, 1);
    const monthEnd = new Date(month.year, month.monthIndex + 1, 0, 23, 59, 59);

    // Verificar se as datas são válidas
    if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
      console.warn(`⚠️ [FinancialEvolution] Datas inválidas para mês ${month.name}:`, {
        monthName: month.name,
        year: month.year,
        monthIndex: month.monthIndex,
        monthStart,
        monthEnd
      });
      return {
        key: month.name,
        receitas: 0,
        despesas: 0,
        saldo: 0
      };
    }


    // Filtrar transações do mês
    const monthTransactions = transactions.filter(transaction => {
      try {
        const transactionDate = new Date(transaction.date);
        
        // Verificar se a data é válida
        if (isNaN(transactionDate.getTime())) {
          console.warn(`⚠️ [FinancialEvolution] Data inválida para transação ${transaction.description}:`, transaction.date);
          return false;
        }
        
        const isInMonth = transactionDate >= monthStart && transactionDate <= monthEnd;
        
        // Filtrar parcelas pagas - se for uma parcela e estiver marcada como paga, não incluir no gráfico
        // Isso faz com que parcelas pagas desapareçam do gráfico de evolução financeira
        const isPaidInstallment = transaction.installmentNumber && transaction.isPaid === true;
        
        if (isInMonth && !isPaidInstallment) {
          // Transação encontrada no mês e não é uma parcela paga
        }
        
        return isInMonth && !isPaidInstallment;
      } catch (error) {
        console.warn(`⚠️ [FinancialEvolution] Erro ao processar transação ${transaction.description}:`, error);
        return false;
      }
    });

    // Calcular totais do mês
    const receitas = monthTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const despesas = monthTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calcular saldo individual do mês
    const saldoMes = receitas - despesas;


    return {
      key: month.name,
      receitas: receitas / 1000, // Converter para milhares
      despesas: despesas / 1000,
      saldo: saldoMes / 1000 // Usar saldo individual do mês
    };
  });
};

interface FinancialEvolutionProps {
  selectedMonth: number;
  selectedYear: number;
}

const FinancialEvolution = ({ selectedMonth, selectedYear }: FinancialEvolutionProps) => {
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    month: string;
    receitas: number;
    despesas: number;
    saldo: number;
  } | null>(null);

  try {
    const { transactions, loading, error } = useTransactionsContext();
    
    
    // Loading state
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow border h-full p-6 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Carregando dados...</span>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="bg-white rounded-lg shadow border h-full p-6 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      );
    }

    // Processar dados reais das transações
    const chartData = processTransactionsData(transactions, selectedYear);
    
    // Calcular totais
    const totalReceitas = chartData.reduce((sum, d) => sum + d.receitas, 0);
    const totalDespesas = chartData.reduce((sum, d) => sum + d.despesas, 0);
    const totalSaldo = chartData.reduce((sum, d) => sum + d.saldo, 0);
    

    return (
      <div className="bg-white rounded-lg shadow border h-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução Financeira</h2>
        
        <div className="h-72 w-full">
          <BarChartLine 
            data={chartData} 
            hoveredLegend={hoveredLegend}
            setHoveredLegend={setHoveredLegend}
            tooltipData={tooltipData}
            setTooltipData={setTooltipData}
            totalReceitas={totalReceitas}
            totalDespesas={totalDespesas}
            totalSaldo={totalSaldo}
          />
        </div>
        
        {/* Legenda do Gráfico */}
        <div className="flex items-center justify-center gap-4 mt-16 text-xs">
          <div 
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            onMouseEnter={() => {
              setHoveredLegend('receitas');
              setTooltipData({
                x: 50,
                y: 30,
                month: 'Total de Receitas',
                receitas: totalReceitas,
                despesas: 0,
                saldo: 0,
              });
            }}
            onMouseLeave={() => {
              setHoveredLegend(null);
              setTooltipData(null);
            }}
          >
            <div className="w-3 h-2 rounded-sm bg-green-500"></div>
            <span className="text-gray-600">Receitas</span>
          </div>
          <div 
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            onMouseEnter={() => {
              setHoveredLegend('despesas');
              setTooltipData({
                x: 50,
                y: 30,
                month: 'Total de Despesas',
                receitas: 0,
                despesas: totalDespesas,
                saldo: 0,
              });
            }}
            onMouseLeave={() => {
              setHoveredLegend(null);
              setTooltipData(null);
            }}
          >
            <div className="w-3 h-2 rounded-sm bg-red-500"></div>
            <span className="text-gray-600">Despesas</span>
          </div>
          <div 
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            onMouseEnter={() => {
              setHoveredLegend('saldo');
              setTooltipData({
                x: 50,
                y: 30,
                month: 'Saldo Acumulado',
                receitas: 0,
                despesas: 0,
                saldo: totalSaldo,
              });
            }}
            onMouseLeave={() => {
              setHoveredLegend(null);
              setTooltipData(null);
            }}
          >
            <div className="w-5 h-0.5 bg-blue-500"></div>
            <span className="text-gray-600">Saldo</span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ [FinancialEvolution] Erro no componente:', error);
    return (
      <div className="bg-white rounded-lg shadow border h-full p-6 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Erro no componente</p>
          <p className="text-sm mt-1">{String(error)}</p>
        </div>
      </div>
    );
  }
};

export default FinancialEvolution;

# 📊 FinTrack Dashboard

Um dashboard financeiro moderno e responsivo construído com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- **Dashboard Principal**: Visão geral das finanças com cards de resumo
- **Transações**: Gerenciamento completo de transações financeiras
- **Orçamentos**: Planejamento e controle de gastos por categoria
- **Relatórios**: Gráficos e análises financeiras
- **Seletor de Emojis**: Interface moderna para seleção de emojis usando emoji-mart

## 🛠️ Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **Recharts** - Biblioteca de gráficos para React
- **Firebase** - Backend e banco de dados
- **emoji-mart** - Seletor de emojis moderno

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Budget.tsx       # Componente de orçamento
│   ├── Budgets.tsx      # Lista de orçamentos e relatórios
│   ├── ExpenseChart.tsx # Gráfico de gastos
│   ├── FinancialEvolution.tsx # Evolução financeira
│   ├── InstallmentAccounts.tsx # Contas parceladas
│   ├── NewTransactionModal.tsx # Modal de nova transação
│   ├── Sidebar.tsx      # Barra lateral de navegação
│   ├── SummaryCards.tsx # Cards de resumo
│   └── Transactions.tsx # Lista de transações
├── contexts/            # Contextos React
│   └── TransactionsContext.tsx # Contexto de transações
├── firebase/            # Configuração e serviços Firebase
│   ├── config.ts       # Configuração do Firebase
│   ├── index.ts        # Exportações principais
│   ├── types.ts        # Tipos TypeScript
│   └── services/       # Serviços do Firebase
│       ├── budgets.ts
│       ├── categories.ts
│       └── transactions.ts
├── hooks/              # Hooks customizados
│   ├── useBudget.ts
│   ├── useCategories.ts
│   └── useTransactions.ts
├── App.tsx             # Componente principal
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Abrir no navegador:**
   ```
   http://localhost:3000
   ```

## 📦 Dependências Principais

- `@emoji-mart/data` - Dados de emojis
- `@emoji-mart/react` - Componente React para emojis
- `recharts` - Gráficos e visualizações
- `firebase` - Backend e autenticação
- `react` - Biblioteca principal
- `typescript` - Tipagem estática

## 🎨 Funcionalidades do Seletor de Emojis

O projeto inclui um seletor de emojis moderno usando a biblioteca `emoji-mart`:

- **Interface intuitiva** com busca e categorias
- **Renderização via Portal** para evitar conflitos de z-index
- **Posicionamento dinâmico** baseado no botão clicado
- **Inicialização assíncrona** com tratamento de erros
- **Debug completo** com indicadores visuais

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Verificação de linting

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

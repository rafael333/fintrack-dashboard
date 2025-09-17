# Script PowerShell para configurar GitHub
# Execute como administrador se necessário

Write-Host "🐙 Configurando GitHub para FinTrack Dashboard" -ForegroundColor Green
Write-Host ""

# Verificar se Git está instalado
Write-Host "Verificando se Git está instalado..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Git primeiro:" -ForegroundColor Yellow
    Write-Host "1. Acesse https://git-scm.com/downloads" -ForegroundColor Cyan
    Write-Host "2. Baixe e instale o Git para Windows" -ForegroundColor Cyan
    Write-Host "3. Reinicie o PowerShell e execute este script novamente" -ForegroundColor Cyan
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Verificar se estamos na pasta correta
$currentPath = Get-Location
Write-Host "📁 Pasta atual: $currentPath" -ForegroundColor Yellow

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Arquivo package.json não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar na pasta do projeto" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "✅ Pasta do projeto encontrada" -ForegroundColor Green
Write-Host ""

# Inicializar Git se necessário
Write-Host "🔧 Inicializando repositório Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório Git já existe" -ForegroundColor Green
}

Write-Host ""

# Configurar Git (se necessário)
Write-Host "⚙️ Configurando Git..." -ForegroundColor Yellow
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "Configuração do Git necessária:" -ForegroundColor Yellow
    $name = Read-Host "Digite seu nome completo"
    $email = Read-Host "Digite seu email"
    
    git config --global user.name $name
    git config --global user.email $email
    Write-Host "✅ Git configurado" -ForegroundColor Green
} else {
    Write-Host "✅ Git já configurado: $userName <$userEmail>" -ForegroundColor Green
}

Write-Host ""

# Adicionar arquivos
Write-Host "📦 Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados" -ForegroundColor Green

Write-Host ""

# Criar commit
Write-Host "💾 Criando commit inicial..." -ForegroundColor Yellow
git commit -m "Initial commit - FinTrack Dashboard ready for Netlify"
Write-Host "✅ Commit criado" -ForegroundColor Green

Write-Host ""

# Instruções para GitHub
Write-Host "🎯 Próximos passos:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Acesse https://github.com" -ForegroundColor Cyan
Write-Host "2. Clique em + > New repository" -ForegroundColor Cyan
Write-Host "3. Nome: fintrack-dashboard" -ForegroundColor Cyan
Write-Host "4. Descrição: Dashboard Financeiro FinTrack" -ForegroundColor Cyan
Write-Host "5. Público" -ForegroundColor Cyan
Write-Host "6. NÃO marque nenhuma opção adicional" -ForegroundColor Cyan
Write-Host "7. Clique em Create repository" -ForegroundColor Cyan
Write-Host ""

# Solicitar URL do repositório
$repoUrl = Read-Host "Digite a URL do seu repositório (ex: https://github.com/usuario/fintrack-dashboard.git)"

if ($repoUrl) {
    Write-Host ""
    Write-Host "🔗 Conectando ao repositório GitHub..." -ForegroundColor Yellow
    
    # Adicionar remote
    git remote add origin $repoUrl
    
    # Renomear branch
    git branch -M main
    
    # Fazer push
    Write-Host "📤 Fazendo push para o GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host ""
    Write-Host "🎉 Sucesso! Projeto enviado para o GitHub!" -ForegroundColor Green
    Write-Host "Acesse: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "📝 Para conectar manualmente, execute:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/SEU_USUARIO/fintrack-dashboard.git" -ForegroundColor Cyan
    Write-Host "git branch -M main" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📚 Consulte o arquivo GITHUB-SETUP.md para mais detalhes" -ForegroundColor Yellow
Read-Host "Pressione Enter para sair"

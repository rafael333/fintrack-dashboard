# 🐙 Como Subir para o GitHub - Passo a Passo

## ⚡ Método Rápido (Recomendado)

### 1. Instalar Git
1. Acesse: https://git-scm.com/downloads
2. Baixe e instale o Git para Windows
3. Reinicie o PowerShell/Terminal

### 2. Configurar Git (primeira vez)
Abra o PowerShell e execute:
```powershell
git config --global user.name "Seu Nome Completo"
git config --global user.email "seu.email@gmail.com"
```

### 3. Subir o Projeto
Execute estes comandos na pasta do projeto:

```powershell
# 1. Inicializar Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Criar commit
git commit -m "FinTrack Dashboard - Ready for Netlify"

# 4. Renomear branch
git branch -M main
```

### 4. Criar Repositório no GitHub
1. Acesse: https://github.com
2. Clique no **"+"** → **"New repository"**
3. Nome: `fintrack-dashboard`
4. Descrição: `Dashboard Financeiro FinTrack`
5. Público ✅
6. **NÃO** marque nenhuma opção adicional
7. Clique **"Create repository"**

### 5. Conectar e Enviar
```powershell
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/fintrack-dashboard.git

# Enviar para o GitHub
git push -u origin main
```

## 🔐 Se Der Erro de Login

### Opção 1: Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token → repo (acesso completo)
3. Copie o token
4. Use o token como senha quando solicitado

### Opção 2: GitHub CLI
```powershell
# Instalar GitHub CLI
winget install GitHub.cli

# Fazer login
gh auth login

# Criar repositório automaticamente
gh repo create fintrack-dashboard --public --source=. --push
```

## ✅ Verificar se Funcionou

Após o push, acesse:
`https://github.com/SEU_USUARIO/fintrack-dashboard`

Você deve ver todos os arquivos do projeto!

## 🚀 Próximo Passo: Deploy no Netlify

1. Acesse: https://netlify.com
2. "New site from Git" → GitHub
3. Selecione `fintrack-dashboard`
4. Build command: `npm run build:netlify`
5. Publish directory: `dist`
6. Deploy! 🎉

---

**💡 Dica:** Se tiver dúvidas, consulte o arquivo `GITHUB-SETUP.md` para instruções detalhadas!

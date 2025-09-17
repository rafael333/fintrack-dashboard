# 🚀 Deploy no Netlify - FinTrack Dashboard

## 📋 Pré-requisitos

1. **Conta no Netlify** (gratuita)
2. **Projeto no GitHub** (recomendado)
3. **Configuração do Firebase** completa

## 🎯 Método 1: Deploy via GitHub (Recomendado)

### Passo 1: Preparar o Repositório
```bash
# Inicializar git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit - FinTrack Dashboard"

# Conectar ao GitHub
git remote add origin https://github.com/SEU_USUARIO/fintrack-dashboard.git
git push -u origin main
```

### Passo 2: Conectar no Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com sua conta
3. Clique em **"New site from Git"**
4. Escolha **GitHub** como provedor
5. Selecione seu repositório `fintrack-dashboard`
6. Configure as opções de build:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### Passo 3: Configurar Variáveis de Ambiente
No painel do Netlify, vá em **Site settings > Environment variables**:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
VITE_ENVIRONMENT=production
VITE_FIREBASE_TEST_MODE=false
```

### Passo 4: Deploy
1. Clique em **"Deploy site"**
2. Aguarde o build completar
3. Seu site estará disponível em `https://seu-site.netlify.app`

## 🎯 Método 2: Deploy Manual

### Passo 1: Build Local
```bash
# Instalar dependências
npm install

# Fazer build para produção
npm run build:netlify
```

### Passo 2: Upload no Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com sua conta
3. Arraste a pasta `dist` para a área de deploy
4. Configure as variáveis de ambiente no painel

## 🔧 Configurações Avançadas

### Domínio Personalizado
1. No painel do Netlify, vá em **Domain settings**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `fintrack.seudominio.com`)
4. Configure os DNS conforme instruções

### HTTPS Automático
- O Netlify fornece HTTPS automático
- Certificados SSL são gerenciados automaticamente
- Redirecionamento HTTP → HTTPS ativado por padrão

### Deploy Contínuo
- Toda vez que você fizer push no GitHub
- O Netlify fará deploy automático
- Builds são executados automaticamente

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build
```bash
# Verificar logs no painel do Netlify
# Ou testar build local:
npm run build:netlify
```

#### 2. Variáveis de Ambiente
- Verifique se todas as variáveis estão configuradas
- Nome das variáveis deve começar com `VITE_`
- Valores não devem ter espaços extras

#### 3. Rotas não Funcionam
- Verifique se o arquivo `_redirects` está na pasta `public`
- Confirme se o `netlify.toml` está na raiz do projeto

#### 4. Firebase não Conecta
- Verifique as credenciais no painel do Netlify
- Confirme se o domínio está autorizado no Firebase Console

### Comandos Úteis

```bash
# Testar build local
npm run build:netlify

# Verificar se build está funcionando
npm run preview

# Limpar cache
npm run clean
```

## 📊 Monitoramento

### Netlify Analytics
- Acesse **Analytics** no painel
- Monitore visitantes, páginas mais acessadas
- Configure goals e conversões

### Logs de Deploy
- Acesse **Deploys** no painel
- Veja logs detalhados de cada build
- Identifique erros rapidamente

### Performance
- O Netlify otimiza automaticamente
- CDN global para carregamento rápido
- Compressão gzip ativada

## 🎯 Otimizações Aplicadas

- ✅ **SPA Routing**: Redirecionamentos configurados
- ✅ **Cache Headers**: Assets com cache otimizado
- ✅ **Security Headers**: Headers de segurança
- ✅ **Build Otimizado**: Code splitting e minificação
- ✅ **HTTPS**: Certificados SSL automáticos
- ✅ **CDN**: Distribuição global de conteúdo

## 🚀 Próximos Passos

1. **Configurar Analytics**: Google Analytics ou Netlify Analytics
2. **Formulários**: Netlify Forms para contato
3. **Funções**: Netlify Functions para backend
4. **A/B Testing**: Testes de versões diferentes

## 📞 Suporte

- **Documentação Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Comunidade**: [community.netlify.com](https://community.netlify.com)
- **Status**: [status.netlify.com](https://status.netlify.com)

---

**🎉 Parabéns! Seu FinTrack Dashboard está no ar!**

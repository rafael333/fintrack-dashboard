# 🚀 Guia de Deploy - FinTrack Dashboard

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **npm** ou **yarn**
3. **Conta Firebase** configurada
4. **Servidor web** (Apache, Nginx, etc.)

## 🔧 Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Configure as credenciais do Firebase no arquivo `.env`:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
VITE_ENVIRONMENT=production
VITE_FIREBASE_TEST_MODE=false
```

### 3. Build para Produção
```bash
npm run build:prod
```

## 📁 Arquivos de Deploy

Após o build, os arquivos para deploy estarão na pasta `dist/`:
- `index.html` - Página principal
- `assets/` - Arquivos CSS e JS otimizados
- `confetti on transparent background.lottie` - Arquivo de animação

## 🌐 Deploy em Servidor Web

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache para assets estáticos
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 Configurações de Segurança

1. **HTTPS**: Configure SSL/TLS no servidor
2. **Headers de Segurança**: Adicione headers de segurança
3. **Firebase Rules**: Configure as regras de segurança do Firebase

## 📊 Monitoramento

- **Firebase Analytics**: Configurado automaticamente
- **Console do Firebase**: Monitore erros e performance
- **Logs do Servidor**: Monitore logs de acesso e erro

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro 404 em rotas**: Configure o servidor para servir `index.html` para todas as rotas
2. **Assets não carregam**: Verifique se o caminho base está correto
3. **Firebase não conecta**: Verifique as credenciais no `.env`

### Comandos Úteis

```bash
# Limpar cache e rebuild
npm run clean && npm run build:prod

# Verificar build localmente
npm run preview

# Verificar linting
npm run lint
```

## 📈 Otimizações Aplicadas

- ✅ **Code Splitting**: Chunks separados para vendor, firebase, charts e emoji
- ✅ **Minificação**: Terser para minificação otimizada
- ✅ **Tree Shaking**: Remoção de código não utilizado
- ✅ **Source Maps**: Desabilitados para produção
- ✅ **Dependências**: Removidas dependências não utilizadas
- ✅ **Assets**: Otimização de imagens e fontes

## 🎯 Performance

O build otimizado inclui:
- **Vendor Chunk**: React e React DOM
- **Firebase Chunk**: Todas as funcionalidades do Firebase
- **Charts Chunk**: Recharts para gráficos
- **Emoji Chunk**: Seletor de emojis

Isso garante carregamento mais rápido e melhor cache do navegador.

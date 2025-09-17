# 🔥 Firebase + Netlify Setup - FinTrack Dashboard

## 🚨 **Problema Identificado**
O Firebase não está funcionando no Netlify porque as credenciais estão hardcoded no código, mas o Netlify precisa das variáveis de ambiente configuradas.

## ✅ **Solução Implementada**

### 1. **Configuração do Firebase com Variáveis de Ambiente**
```typescript
// src/firebase/config.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "fallback_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fallback_domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fallback_project",
  // ... outras configurações
};
```

### 2. **Variáveis de Ambiente Necessárias no Netlify**

Acesse o painel do Netlify e configure as seguintes variáveis de ambiente:

#### **Site Settings > Environment Variables**

| Variável | Valor |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAKOQ_7Q6pR6UvinMwtzrNdLgpBxZ-QTxk` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `apprafael-c7411.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `apprafael-c7411` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `apprafael-c7411.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `389810659865` |
| `VITE_FIREBASE_APP_ID` | `1:389810659865:web:3392a3c2fe3aef4710c088` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-0P0HZ6ST2P` |
| `VITE_ENVIRONMENT` | `production` |
| `VITE_FIREBASE_TEST_MODE` | `false` |

## 🔧 **Como Configurar no Netlify**

### **Passo 1: Acessar o Painel**
1. Acesse [netlify.com](https://netlify.com)
2. Faça login na sua conta
3. Selecione o site do FinTrack Dashboard

### **Passo 2: Configurar Variáveis**
1. Vá em **Site Settings**
2. Clique em **Environment Variables**
3. Clique em **Add Variable**
4. Adicione cada variável da tabela acima

### **Passo 3: Fazer Novo Deploy**
1. Vá em **Deploys**
2. Clique em **Trigger Deploy**
3. Selecione **Deploy Site**

## 🚀 **Verificação**

### **1. Verificar se as Variáveis Estão Configuradas**
- No painel do Netlify, vá em **Site Settings > Environment Variables**
- Deve aparecer todas as 9 variáveis listadas acima

### **2. Verificar o Deploy**
- Vá em **Deploys**
- O último deploy deve ter sucesso
- Verifique os logs se houver erro

### **3. Testar a Aplicação**
- Acesse o site do Netlify
- Tente fazer login
- Verifique se as transações carregam

## 🔍 **Diagnóstico de Problemas**

### **Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"**
- **Causa:** Variáveis de ambiente não configuradas
- **Solução:** Configurar todas as variáveis no Netlify

### **Erro: "Firebase: Error (auth/invalid-api-key)"**
- **Causa:** API Key incorreta
- **Solução:** Verificar se `VITE_FIREBASE_API_KEY` está correta

### **Erro: "Firebase: Error (auth/network-request-failed)"**
- **Causa:** Problema de rede ou domínio
- **Solução:** Verificar se `VITE_FIREBASE_AUTH_DOMAIN` está correto

### **Erro: "Firebase: Error (firestore/permission-denied)"**
- **Causa:** Regras de segurança do Firestore
- **Solução:** Verificar regras no console do Firebase

## 📋 **Checklist de Configuração**

- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Deploy executado com sucesso
- [ ] Site acessível
- [ ] Login funcionando
- [ ] Transações carregando
- [ ] Dados sendo salvos

## 🎯 **Próximos Passos**

1. **Configurar variáveis** no Netlify
2. **Fazer novo deploy**
3. **Testar funcionalidades**
4. **Verificar logs** se houver erro

## 📞 **Suporte**

Se ainda houver problemas:
1. Verificar logs do Netlify
2. Verificar console do navegador
3. Verificar regras do Firestore
4. Contatar suporte se necessário

---

**💡 Dica:** As variáveis de ambiente são essenciais para o Firebase funcionar no Netlify. Sem elas, o Firebase não consegue se conectar! 🔥

# 🔄 Como Atualizar o GitHub - Guia Prático

## 📋 **Resumo Rápido**

**Alterações locais NÃO vão automaticamente para o GitHub!**
Você controla quando enviar as mudanças.

## 🚀 **Fluxo Completo de Atualização**

### **1. Fazer Alterações (Normal)**
```powershell
# Edite seus arquivos normalmente
# Exemplo: modificar src/App.tsx
# As mudanças ficam apenas no seu computador
```

### **2. Verificar o que Mudou**
```powershell
# Ver status das mudanças
& "C:\Program Files\Git\bin\git.exe" status

# Ver detalhes das mudanças
& "C:\Program Files\Git\bin\git.exe" diff
```

### **3. Adicionar Mudanças**
```powershell
# Adicionar arquivo específico
& "C:\Program Files\Git\bin\git.exe" add src/App.tsx

# OU adicionar todas as mudanças
& "C:\Program Files\Git\bin\git.exe" add .
```

### **4. Criar Commit (Salvar Versão)**
```powershell
# Criar uma versão das mudanças
& "C:\Program Files\Git\bin\git.exe" commit -m "Adicionei nova funcionalidade X"
```

### **5. Enviar para GitHub**
```powershell
# Enviar para o GitHub
& "C:\Program Files\Git\bin\git.exe" push
```

## 📝 **Exemplo Prático**

Vamos simular uma alteração:

### **Passo 1: Fazer uma Mudança**
```powershell
# Editar um arquivo (exemplo)
echo "// Nova funcionalidade" >> src/App.tsx
```

### **Passo 2: Verificar Mudanças**
```powershell
& "C:\Program Files\Git\bin\git.exe" status
# Vai mostrar: modified: src/App.tsx
```

### **Passo 3: Adicionar e Commitar**
```powershell
& "C:\Program Files\Git\bin\git.exe" add src/App.tsx
& "C:\Program Files\Git\bin\git.exe" commit -m "Adicionei comentário no App.tsx"
```

### **Passo 4: Enviar para GitHub**
```powershell
& "C:\Program Files\Git\bin\git.exe" push
```

## 🔍 **Comandos Úteis**

### **Ver Status**
```powershell
# Ver o que mudou
& "C:\Program Files\Git\bin\git.exe" status

# Ver detalhes das mudanças
& "C:\Program Files\Git\bin\git.exe" diff

# Ver histórico de commits
& "C:\Program Files\Git\bin\git.exe" log --oneline
```

### **Desfazer Mudanças**
```powershell
# Desfazer mudanças não commitadas
& "C:\Program Files\Git\bin\git.exe" checkout -- nome-do-arquivo

# Desfazer último commit (mantém mudanças)
& "C:\Program Files\Git\bin\git.exe" reset --soft HEAD~1
```

### **Sincronizar com GitHub**
```powershell
# Baixar mudanças do GitHub
& "C:\Program Files\Git\bin\git.exe" pull

# Enviar mudanças para GitHub
& "C:\Program Files\Git\bin\git.exe" push
```

## 🎯 **Dicas Importantes**

### **✅ Boas Práticas**
- **Commits frequentes:** Faça commits pequenos e frequentes
- **Mensagens claras:** Descreva o que mudou no commit
- **Teste antes:** Teste as mudanças antes de fazer push

### **❌ Evite**
- Commits muito grandes
- Mensagens vagas como "fix" ou "update"
- Fazer push sem testar

## 🚨 **Situações Especiais**

### **Conflitos de Merge**
```powershell
# Se der erro de conflito
& "C:\Program Files\Git\bin\git.exe" pull
# Resolver conflitos manualmente
& "C:\Program Files\Git\bin\git.exe" add .
& "C:\Program Files\Git\bin\git.exe" commit -m "Resolvido conflito"
& "C:\Program Files\Git\bin\git.exe" push
```

### **Desfazer Push**
```powershell
# Desfazer último push (cuidado!)
& "C:\Program Files\Git\bin\git.exe" reset --hard HEAD~1
& "C:\Program Files\Git\bin\git.exe" push --force
```

## 📊 **Resumo dos Estados**

| Estado | Local | GitHub | Ação Necessária |
|--------|-------|--------|-----------------|
| **Modificado** | ✅ | ❌ | `git add` + `git commit` |
| **Commitado** | ✅ | ❌ | `git push` |
| **Sincronizado** | ✅ | ✅ | Nenhuma |

---

**💡 Lembre-se:** Você tem controle total! As mudanças só vão para o GitHub quando você quiser! 🎯

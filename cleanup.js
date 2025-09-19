const fs = require('fs');
const path = require('path');

// Ler o arquivo Budgets.tsx
const filePath = path.join(__dirname, 'src', 'components', 'Budgets.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remover dados de exemplo desnecessários
const salesDataStart = content.indexOf('const sales = [');
const salesDataEnd = content.indexOf('];', salesDataStart) + 2;
if (salesDataStart !== -1 && salesDataEnd !== -1) {
  content = content.substring(0, salesDataStart) + content.substring(salesDataEnd);
}

// Remover imports desnecessários
content = content.replace(/import React, { CSSProperties } from "react";\n/, '');

// Escrever o arquivo limpo
fs.writeFileSync(filePath, content);
console.log('Arquivo Budgets.tsx limpo com sucesso!');

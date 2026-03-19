# Quick Reference - Sistema de Logs

## 🎯 Uso Rápido

### Começar a usar (já está automático!)
```typescript
// Você NÃO precisa fazer nada! Os logs são registrados automaticamente
// quando você:
// • Cria um serviço, cliente ou transação
// • Edita qualquer dado
// • Deleta um registro
// • Finaliza um atendimento
```

### Acessar Logs
1. Clique em **📝 Atividades** na barra de navegação
2. Ver todos os registros da sua aplicação

## 📊 Atalhos Comuns

### Ver últimos 50 logs
```
Aba "Atividades" → Carregado por padrão
```

### Filtrar por cliente
```
1. Abra "Atividades"
2. Clique em "Mostrar Filtros"
3. Selecione "Cliente" em Entidade
4. Digite o nome no campo Buscar
```

### Ver o que mudou em um dato
```
1. Filtre por Entidade (Cliente/Serviço/Transação)
2. Filtre por Operação (Atualizar)
3. Clique no log para ver "Estado Anterior" vs "Novo Estado"
```

### Recuperar dados deletados
```
1. Filtre por "Deletar"
2. Visualize os dados em "Estado Anterior"
```

### Encontrar erros
```
1. Clique "Mostrar Filtros"
2. Selecione Status = "Erro"
3. Clique para ver a mensagem de erro
```

## 💾 Backup

### Fazer backup
```
Atividades → Clique "JSON" (download automático)
```

### Restaurar
```typescript
// No console (F12 → Console)
import { logger } from './utils/logger';
const backup = /* cole seu JSON aqui */;
logger.restaurarDeJSON(JSON.stringify(backup));
```

## 🔢 Estatísticas

Todas disponíveis na dashboard de Atividades:

| Campo | Significado |
|-------|------------|
| Total de Logs | Quantos eventos registrados |
| Criações | Serviços/Clientes/Transações criadas |
| Atualizações | Quanto dados foram editados |
| Erros | Falhas no sistema |

Abaixo também tem:
- **Entidades Mais Modificadas** - qual tipo foi alterado mais

## 🎨 Cores e Ícones

| Operação | Ícone | Cor |
|----------|-------|-----|
| Criar | ➕ | Verde |
| Atualizar | ✏️ | Azul |
| Deletar | 🗑️ | Vermelho |
| Ação | ⚙️ | Roxo |

| Entidade | Cor |
|----------|-----|
| Cliente | 🔵 Azul |
| Serviço | 🟢 Verde |
| Transação | 🟡 Amarelo |
| Sistema | 🟣 Roxo |

## 💡 Dicas Úteis

### Achar mudança específica
1. Lembre-se quando foi (data/hora)
2. Abra Atividades
3. Procure por hora específica no horário
4. Ou use Buscar para nome/descrição

### Auditar operações de um período
1. Filtre por data (no banco de dados não, aqui é no localStorage)
2. Exporte em CSV para contadores/auditores

### Monitorar atividades
1. Deixe a aba Atividades aberta
2. Clique "Atualizar" periodicamente
3. Novos logs aparecem imediatamente

### Limpar espaço (se necessário)
```typescript
// No console (F12)
import { logger } from './utils/logger';

// Remover logs com mais de 3 meses
logger.limparAntigos(90);

// Ver quantos foram removidos
// Resposta no console
```

## ⚡ Performance

- Logs carregam **instantaneamente** (do navegador)
- Sem delay de servidor
- Busca em **tempo real**
- Filtros aplicados **imediatamente**

## Começar Agora! 🚀

1. Vá para aba **Atividades**
2. Crie um cliente/serviço
3. Veja aparecer nos logs em tempo real
4. Edite e veja os dados "antes" e "depois"
5. Delete e recupere os dados anteriores

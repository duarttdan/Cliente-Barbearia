# API Reference - Logger Service

## 📦 Imports

```typescript
// Para usar o logger em qualquer componente
import { logger } from '../utils/logger';
import { LogEntry, EntidadeLog, TipoOperacao } from '../types';
```

## 🔧 Métodos Disponíveis

### 1. `registrar()` - Registrar um novo log

```typescript
logger.registrar(
  operacao: TipoOperacao,      // 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTION'
  entidade: EntidadeLog,        // 'servico' | 'cliente' | 'transacao' | 'sistema'
  descricao: string,            // Descrição legível
  options?: {
    nomeDados?: string;         // Nome do cliente/serviço
    dadosAntes?: any;           // Estado anterior (para UPDATE/DELETE)
    dadosDepois?: any;          // Novo estado (para CREATE/UPDATE)
    usuario?: string;           // Usuário responsável (padrão: 'Sistema')
    ip?: string;                // IP da requisição (opcional)
    status?: 'sucesso' | 'erro'; // Status da operação
    mensagemErro?: string;      // Descrição do erro
  }
): LogEntry
```

**Exemplo:**
```typescript
logger.registrar(
  'CREATE',
  'cliente',
  'Cliente João registrado com sucesso',
  {
    nomeDados: 'João Silva',
    dadosDepois: {
      id: '123',
      nome: 'João Silva',
      valor: 100
    },
    status: 'sucesso'
  }
);
```

---

### 2. `obterTodos()` - Obter todos os logs

```typescript
const logs: LogEntry[] = logger.obterTodos();
```

**Retorna:** Array com todos os logs registrados

---

### 3. `obterRecentes()` - Obter logs recentes

```typescript
const logs: LogEntry[] = logger.obterRecentes(quantidade?: number = 50);
```

**Parametos:**
- `quantidade` (opcional): Quantos logs retornar (padrão: 50, máximo recomendado: 1000)

**Exemplo:**
```typescript
const ultimos20 = logger.obterRecentes(20);
const ultimos100 = logger.obterRecentes(100);
```

---

### 4. `obterFiltrados()` - Filtrar logs

```typescript
const logs: LogEntry[] = logger.obterFiltrados({
  entidade?: EntidadeLog;        // Filtrar por entidade
  operacao?: TipoOperacao;       // Filtrar por tipo de operação
  dataInicio?: Date;             // Data mínima
  dataFim?: Date;                // Data máxima
  status?: 'sucesso' | 'erro';   // Filtrar por status
});
```

**Exemplos:**
```typescript
// Obter todos os erros
const erros = logger.obterFiltrados({ status: 'erro' });

// Obter criações de clientes
const clientesCriados = logger.obterFiltrados({
  entidade: 'cliente',
  operacao: 'CREATE'
});

// Obter modificações em um período
const modificacoes = logger.obterFiltrados({
  dataInicio: new Date('2026-03-01'),
  dataFim: new Date('2026-03-31'),
  operacao: 'UPDATE'
});
```

---

### 5. `obterPorEntidade()` - Logs de uma entidade

```typescript
const logs: LogEntry[] = logger.obterPorEntidade(
  entidade: EntidadeLog,
  quantidade?: number
);
```

**Exemplo:**
```typescript
// Últimas 50 operações em clientes
const logsClientes = logger.obterPorEntidade('cliente', 50);

// Todos os logs de serviços
const logsServicos = logger.obterPorEntidade('servico');
```

---

### 6. `obterPorOperacao()` - Logs de uma operação

```typescript
const logs: LogEntry[] = logger.obterPorOperacao(operacao: TipoOperacao);
```

**Exemplo:**
```typescript
// Todos os registros deletados
const deletadas = logger.obterPorOperacao('DELETE');

// Todas as atualizações
const atualizacoes = logger.obterPorOperacao('UPDATE');
```

---

### 7. `obterEstatisticas()` - Estatísticas gerais

```typescript
const stats = logger.obterEstatisticas();
// Retorna:
// {
//   totalLogs: number;
//   operacoesPorTipo: { CREATE: N, UPDATE: N, DELETE: N, ACTION: N };
//   entidadesMaisModificadas: Array<{ entidade, quantidade }>;
//   errosRecentes: LogEntry[];
// }
```

**Exemplo:**
```typescript
const stats = logger.obterEstatisticas();
console.log(`Total: ${stats.totalLogs} logs`);
console.log(`Criações: ${stats.operacoesPorTipo.CREATE}`);
stats.entidadesMaisModificadas.forEach(item => {
  console.log(`${item.entidade}: ${item.quantidade} alterações`);
});
```

---

### 8. `gerarRelatorio()` - Relatório customizado

```typescript
const relatorio = logger.gerarRelatorio(
  dataInicio: Date,
  dataFim: Date
): RelatórioLogs;

// Retorna:
// {
//   totalLogs: number;
//   periodoInicio: string;
//   periodoFim: string;
//   operacoesPorTipo: Record<TipoOperacao, number>;
//   entidadesMaisModificadas: Array<{ entidade, quantidade }>;
//   logsRecentes: LogEntry[];
// }
```

**Exemplo:**
```typescript
const março = logger.gerarRelatorio(
  new Date('2026-03-01'),
  new Date('2026-03-31')
);

console.log(`Março teve ${março.totalLogs} eventos`);
console.log(março.operacoesPorTipo);
```

---

### 9. `obterEstatisticasPorDia()` - Estátisticas diárias

```typescript
const dailyStats = logger.obterEstatisticasPorDia(ultimosDias: number = 30);

// Retorna: Array<{
//   data: string;
//   totalLogs: number;
//   creates: number;
//   updates: number;
//   deletes: number;
//   erros: number;
// }>
```

**Exemplo:**
```typescript
// Últimos 7 dias
const semana = logger.obterEstatisticasPorDia(7);
semana.forEach(dia => {
  console.log(`${dia.data}: ${dia.totalLogs} eventos`);
});

// Para gráficos
const dataset = logger.obterEstatisticasPorDia(30);
// Usar com Chart.js, Recharts, etc.
```

---

### 10. `exportarJSON()` - Exportar em JSON

```typescript
const json: string = logger.exportarJSON();
// Retorna: JSON string com todos os logs
```

**Exemplo:**
```typescript
const backup = logger.exportarJSON();
localStorage.setItem('backup-logs', backup);

// Ou fazer download manualmente
const blob = new Blob([backup], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `logs-${new Date().toISOString()}.json`;
a.click();
```

---

### 11. `exportarCSV()` - Exportar em CSV

```typescript
const csv: string = logger.exportarCSV();
// Retorna: CSV string compatível com Excel/Sheets
```

**Exemplo:**
```typescript
const csv = logger.exportarCSV();
// Fazer download
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `logs-${new Date().toISOString()}.csv`;
a.click();
```

---

### 12. `restaurarDeJSON()` - Restaurar logs

```typescript
logger.restaurarDeJSON(jsonString: string): void;
// Pode lançar erro se formato for inválido
```

**Exemplo:**
```typescript
const backup = localStorage.getItem('backup-logs');
if (backup) {
  try {
    logger.restaurarDeJSON(backup);
    console.log('Logs restaurados com sucesso');
  } catch (erro) {
    console.error('Erro ao restaurar:', erro);
  }
}
```

---

### 13. `limparAntigos()` - Limpar logs antigos

```typescript
const removidos: number = logger.limparAntigos(diasRetencao: number = 90);
// Retorna: Quantidade de logs removidos
```

**Exemplo:**
```typescript
// Manter apenas últimos 6 meses
const removidos = logger.limparAntigos(180);
console.log(`${removidos} logs antigos removidos`);

// Manter apenas 1 mês
logger.limparAntigos(30);
```

---

### 14. `limparTodos()` - Limpar todos os logs

```typescript
logger.limparTodos(): void;
// ⚠️ Irá registrar um log de limpeza!
```

**Exemplo:**
```typescript
if (confirm('Tem certeza que deseja limpar TODOS os logs?')) {
  logger.limparTodos();
}
```

---

## 📝 Exemplos de Casos de Uso

### Exemplo 1: Monitorar falhas

```typescript
function monitorarErros() {
  const stats = logger.obterEstatisticas();
  
  if (stats.errosRecentes.length > 10) {
    console.warn('⚠️ Muitos erros detectados!');
    stats.errosRecentes.forEach(erro => {
      console.error(`${erro.dataFormatada}: ${erro.descricao}`);
    });
  }
}
```

### Exemplo 2: Auditoria semanal

```typescript
function gerarAuditoriaaSemanal() {
  const agora = new Date();
  const semanaPassada = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const relatorio = logger.gerarRelatorio(semanaPassada, agora);
  
  console.log(`Auditoria da Semana`);
  console.log(`Total de eventos: ${relatorio.totalLogs}`);
  console.log(`Criações: ${relatorio.operacoesPorTipo.CREATE}`);
  console.log(`Deletions: ${relatorio.operacoesPorTipo.DELETE}`);
  
  return relatorio;
}
```

### Exemplo 3: Recuperar dados deletados

```typescript
function recuperarCliente(nomeDoBuscado: string) {
  const deletadas = logger.obterPorOperacao('DELETE')
    .filter(log => log.entidade === 'cliente');
  
  const clienteExcluido = deletadas
    .find(log => log.nomeDados === nomeDoBuscado);
  
  if (clienteExcluido?.dadosAntes) {
    console.log('Cliente encontrado nos logs:');
    console.log(clienteExcluido.dadosAntes);
    return clienteExcluido.dadosAntes;
  }
  
  return null;
}
```

### Exemplo 4: Dashboard de atividades

```typescript
function atualizarDashboard() {
  const stats = logger.obterEstatisticas();
  const ultimosDias = logger.obterEstatisticasPorDia(7);
  
  // Renderizar em um gráfico
  return {
    totalEventos: stats.totalLogs,
    tagsdeEntidades: stats.entidadesMaisModificadas,
    operacoes: stats.operacoesPorTipo,
    tendencia7Dias: ultimosDias
  };
}
```

---

## 🎯 Padrões Recomendados

### ✅ Sempre incluir:
```typescript
logger.registrar(
  'CREATE',
  'cliente',
  'Descrição clara em português', // ← Usuario-friendly
  {
    nomeDados: clienteNome,         // ← Para identificar
    dadosDepois: clienteCompleto    // ← Para auditoria
  }
);
```

### ❌ Evitar:
```typescript
logger.registrar('CREATE', 'cliente', 'novo'); // Vago
logger.registrar('CREATE', 'cliente', undefined); // Sem descrição
```

---

## 🚀 Singleton Pattern

O logger é um Singleton - sempre a mesma instância:

```typescript
import { logger } from './utils/logger';

// Todas estas são a MESMA instância
const log1 = logger;
const log2 = logger;
const log3 = logger;

log1.registrar(...);
console.log(log2.obterTodos()); // Vê o que log1 registrou
```

---

## 💾 Limites

| Aspecto | Limite |
|---------|--------|
| Máximo strings por log | 5MB total |
| Máximo de logs | 5.000 |
| Retenção | Ilimitada |
| Velocidade de busca | ~1ms (localStorage) |

---

## 🐛 Tratamento de Erros

```typescript
try {
  logger.restaurarDeJSON(jsonInvalido);
} catch (erro) {
  if (erro instanceof Error) {
    console.error('Erro ao restaurar:', erro.message);
  }
}
```

---

**Última atualização:** 19/03/2026

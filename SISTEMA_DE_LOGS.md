# Sistema de Logs - Hair Style do Grau

## 📋 Visão Geral

O sistema de logs foi implementado para garantir que **nenhuma informação seja perdida** na aplicação. Todos os eventos (criação, atualização, exclusão de dados) são registrados automaticamente em localStorage sem necessidade de um banco de dados externo.

## 🚀 Recursos Principais

### 1. **Registro Automático de Operações**
Todo o sistema é auditado automaticamente:
- ✅ **CREATE**: När novo serviço, cliente ou transação é criado
- ✏️ **UPDATE**: Quando dados são modificados
- 🗑️ **DELETE**: Quando dados são deletados
- ⚙️ **ACTION**: Ações especiais do sistema

### 2. **Persistência em localStorage**
- Armazena até **5.000 logs** (limite automático)
- Máximo de **5MB** de dados
- Limpeza automática dos registros mais antigos quando limites são atingidos
- **Sem necessidade de servidor ou banco de dados!**

### 3. **Dados Capturados**
Cada log registra:
```json
{
  "id": "ID único do log",
  "timestamp": "1234567890",
  "dataFormatada": "19/03/2026 14:30:45",
  "operacao": "CREATE|UPDATE|DELETE|ACTION",
  "entidade": "cliente|servico|transacao|sistema",
  "nomeDados": "Nome do cliente/serviço",
  "descricao": "Descrição em português",
  "dadosAntes": "Estado anterior (para UPDATE/DELETE)",
  "dadosDepois": "Novo estado (para CREATE/UPDATE)",
  "usuario": "Sistema",
  "status": "sucesso|erro",
  "mensagemErro": "Descrição do erro (se houver)"
}
```

## 📊 Como Usar

### Acessar o Histórico de Atividades
1. Na barra de navegação superior, clique em **"📝 Atividades"**
2. Você visualizará todos os registros da aplicação

### Filtrar Logs
Use os filtros disponíveis para encontrar eventos específicos:

```typescript
// Filtrar por entidade
- Todas / Cliente / Serviço / Transação / Sistema

// Filtrar por tipo de operação
- Todas / Criar / Atualizar / Deletar / Ação

// Filtrar por status
- Todos / Sucesso / Erro

// Buscar por texto
- Descrição, usuário, nome de dados
```

### Visualizar Detalhes
Clique em um log para expandir e ver:
- Estado anterior completo (para atualizações)
- Novo estado
- Mensagens de erro (se houver)
- Dados em formato JSON

### Exportar Dados
Existem dois formatos de exportação:

#### **JSON** - Importação/Backup completo
```bash
# Ideal para:
- Backup dos logs
- Análise detalhada
- Restauração futura
```

#### **CSV** - Compatível com Excel/Sheets
```bash
# Ideal para:
- Compartilhamento com contadores
- Análises em planilhas
- Auditorias externas
```

### Estatísticas Rápidas
A dashboard mostra em tempo real:
- **Total de Logs**: Quantidade total registrada
- **Criações**: Quantos novos registros foram criados
- **Atualizações**: Quantas vezes dados foram modificados
- **Erros**: Eventos com falha

## 💾 API do Logger

### Uso em Componentes React

```typescript
// Importar o logger
import { logger } from '../utils/logger';

// Registrar um log manualmente
logger.registrar(
  'CREATE',
  'cliente',
  'Cliente João foi registrado',
  {
    nomeDados: 'João',
    dadosDepois: { id: '123', nome: 'João' }
  }
);

// Obter logs recentes
const logs = logger.obterRecentes(50);

// Obter todos os logs
const todoLogs = logger.obterTodos();

// Filtrar logs
const logsFiltrados = logger.obterFiltrados({
  entidade: 'cliente',
  operacao: 'CREATE',
  dataInicio: new Date('2026-03-01'),
  dataFim: new Date('2026-03-31')
});

// Obter estatísticas
const stats = logger.obterEstatisticas();
// Retorna: totalLogs, operacoesPorTipo, entidadesMaisModificadas, errosRecentes

// Gerar relatório
const relatorio = logger.gerarRelatorio(
  new Date('2026-03-01'),
  new Date('2026-03-31')
);

// Exportar em JSON
const json = logger.exportarJSON();

// Exportar em CSV
const csv = logger.exportarCSV();

// Restaurar logs de um JSON
logger.restaurarDeJSON(jsonString);

// Limpar logs antigos (ex: anteriores a 90 dias)
logger.limparAntigos(90);

// Limpar TODOS os logs
logger.limparTodos();
```

## 🔍 Exemplos de Registros

### Criar Serviço
```
✅ CREATE - SERVIÇO
Serviço "Corte Clássico" foi criado (R$ 35.00)
```

### Atualizar Cliente
```
✏️ UPDATE - CLIENTE
Cliente "João Silva" foi atualizado
```

### Finalizar Atendimento
```
⚙️ ACTION - CLIENTE
Atendimento do cliente "Maria" foi finalizado (R$ 120.00)
```

### Erro ao Processar
```
🚨 ACTION - CLIENTE - ERRO
Tentativa de finalizar atendimento de cliente não encontrado
Erro: Cliente não encontrado
```

## 📈 Estatísticas Automáticas

O sistema calcula automaticamente:

### Por Dia
```typescript
logger.obterEstatisticasPorDia(30); // Últimos 30 dias
// Retorna: data, totalLogs, creates, updates, deletes, erros
```

### Por Tipo de Operação
- Total de criações
- Total de atualizações
- Total de deletions
- Total de ações do sistema

### Entidades Mais Alteradas
- Qual entidade (cliente/serviço) foi modificada mais vezes

## 🛡️ Segurança e Privacidade

- ✅ Todos os dados armazenados **localmente** no navegador
- ✅ **Nenhum dado** é enviado para servidores externos
- ✅ Dados são persistidos no **localStorage** (seguro)
- ✅ Cada navegador tem seu próprio conjunto de logs isolado
- ✅ Dados permanecem após fechar/reabrir a aplicação
- ✅ Limpceza automática após limite de tamanho

## ⚙️ Limites e Gerenciamento

| Aspecto | Limite |
|---------|--------|
| **Máximo de Logs** | 5.000 registros |
| **Tamanho Máximo** | 5MB de storage |
| **Retenção Padrão** | Ilimitado* |
| **Limpeza Automática** | Ao atingir limites |

*Pode ser configurado com `limparAntigos(dias)`

## 🔧 Manutenção

### Limpeza Programada
```typescript
// Remover logs com mais de 6 meses
logger.limparAntigos(180); // 180 dias

// Isso retorna quantos foram removidos
const removidos = logger.limparAntigos(90);
console.log(`${removidos} logs antigos foram removidos`);
```

### Backup Recomendado
1. Acesse a aba **"Atividades"**
2. Clique em **"JSON"** para fazer backup completo
3. Salve o arquivo em local seguro

### Restauração
```typescript
// Se precisar restaurar
logger.restaurarDeJSON(jsonDosBackup);
```

## 📱 Suporte e Troubleshooting

### Os logs não estão sendo registrados?
1. Verifique o console (F12) para erros
2. Certifique-se de que localStorage não está cheio
3. Tente limpar logs antigos

### localStorage cheio?
```typescript
// Limpar 50% dos logs mais antigos automaticamente
logger.limparAntigos(1); // Vai remover logs muito antigos
```

### Recuperar dados deletados?
Consulte os logs de DELETE:
1. Abra a aba "Atividades"
2. Filtre por "Deletar"
3. Visualize os dados anteriores ao deletion

## 📞 Informações Técnicas

- **Implementação**: TypeScript + React
- **Storage**: localStorage (W3C Web Storage API)
- **Formato**: JSON
- **Padrão**: Singleton (única instância)
- **Thread-safe**: Não (single-threaded JS)

## Resumo

✨ **O sistema de logs garante:**
- Total rastreabilidade de todas as operações
- Histórico completo de mudanças
- Zero perda de informações
- Sem necessidade de servidor ou BD
- 100% portável e offline

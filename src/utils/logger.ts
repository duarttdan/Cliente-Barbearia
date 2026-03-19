import { LogEntry, TipoOperacao, EntidadeLog, RelatórioLogs } from '../types';

const STORAGE_KEY = 'hairstyle-logs';
const MAX_LOGS = 5000; // Limite máximo de logs
const MAX_STORAGE_MB = 5; // Máximo de 5MB de storage

/**
 * Classe para gerenciar logs da aplicação
 * Persiste em localStorage com limite de size
 */
export class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];

  private constructor() {
    this.carregarLogs();
  }

  /**
   * Obtém instância singleton do logger
   */
  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Carrega logs do localStorage
   */
  private carregarLogs(): void {
    try {
      const logsArmazenados = localStorage.getItem(STORAGE_KEY);
      this.logs = logsArmazenados ? JSON.parse(logsArmazenados) : [];
    } catch (erro) {
      console.error('Erro ao carregar logs:', erro);
      this.logs = [];
    }
  }

  /**
   * Salva logs no localStorage com verificação de tamanho
   */
  private salvarLogs(): void {
    try {
      // Se excedeu o máximo de logs, remove os mais antigos
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }

      const logsJSON = JSON.stringify(this.logs);
      
      // Verificar tamanho aproximado em MB
      const tamanhoMB = logsJSON.length / (1024 * 1024);
      
      if (tamanhoMB > MAX_STORAGE_MB) {
        // Se excedeu o tamanho, remove 10% dos logs mais antigos
        const quantidadeRemover = Math.ceil(this.logs.length * 0.1);
        this.logs = this.logs.slice(quantidadeRemover);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (erro) {
      console.error('Erro ao salvar logs:', erro);
      // Se ainda estiver cheio, limpa tudo e tenta novamente
      if (erro instanceof Error && erro.message.includes('QuotaExceededError')) {
        this.logs = this.logs.slice(-Math.ceil(this.logs.length * 0.5));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
        } catch (erroFinal) {
          console.error('Não foi possível salvar logs após limpeza:', erroFinal);
        }
      }
    }
  }

  /**
   * Registra um novo log
   */
  registrar(
    operacao: TipoOperacao,
    entidade: EntidadeLog,
    descricao: string,
    options?: {
      nomeDados?: string;
      dadosAntes?: any;
      dadosDepois?: any;
      usuario?: string;
      ip?: string;
      status?: 'sucesso' | 'erro';
      mensagemErro?: string;
    }
  ): LogEntry {
    const dataAgora = new Date();
    
    const novoLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: dataAgora.getTime(),
      dataFormatada: this.formatarData(dataAgora),
      operacao,
      entidade,
      nomeDados: options?.nomeDados,
      dadosAntes: options?.dadosAntes,
      dadosDepois: options?.dadosDepois,
      descricao,
      usuario: options?.usuario || 'Sistema',
      ip: options?.ip,
      status: options?.status || 'sucesso',
      mensagemErro: options?.mensagemErro
    };

    this.logs.push(novoLog);
    this.salvarLogs();

    console.log(`[LOG ${operacao}] ${entidade.toUpperCase()}: ${descricao}`);
    
    return novoLog;
  }

  /**
   * Obtém todos os logs
   */
  obterTodos(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Obtém logs recentes
   */
  obterRecentes(quantidade: number = 50): LogEntry[] {
    return this.logs.slice(-quantidade).reverse();
  }

  /**
   * Obtém logs filtrados
   */
  obterFiltrados(filtros: {
    entidade?: EntidadeLog;
    operacao?: TipoOperacao;
    dataInicio?: Date;
    dataFim?: Date;
    status?: 'sucesso' | 'erro';
  }): LogEntry[] {
    return this.logs.filter(log => {
      if (filtros.entidade && log.entidade !== filtros.entidade) return false;
      if (filtros.operacao && log.operacao !== filtros.operacao) return false;
      if (filtros.status && log.status !== filtros.status) return false;

      if (filtros.dataInicio) {
        const dataInicio = filtros.dataInicio.getTime();
        if (log.timestamp < dataInicio) return false;
      }

      if (filtros.dataFim) {
        const dataFim = filtros.dataFim.getTime();
        if (log.timestamp > dataFim) return false;
      }

      return true;
    });
  }

  /**
   * Obtém logs de uma entidade específica
   */
  obterPorEntidade(entidade: EntidadeLog, quantidade?: number): LogEntry[] {
    const filtrados = this.logs.filter(log => log.entidade === entidade);
    if (quantidade) {
      return filtrados.slice(-quantidade).reverse();
    }
    return filtrados.reverse();
  }

  /**
   * Obtém logs de uma operação específica
   */
  obterPorOperacao(operacao: TipoOperacao): LogEntry[] {
    return this.logs.filter(log => log.operacao === operacao).reverse();
  }

  /**
   * Obtém estatísticas de logs
   */
  obterEstatisticas(): {
    totalLogs: number;
    operacoesPorTipo: Record<TipoOperacao, number>;
    entidadesMaisModificadas: Array<{ entidade: EntidadeLog; quantidade: number }>;
    errosRecentes: LogEntry[];
  } {
    const operacoesPorTipo: Record<TipoOperacao, number> = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      ACTION: 0
    };

    const entidadesContagem: Record<EntidadeLog, number> = {
      servico: 0,
      cliente: 0,
      transacao: 0,
      sistema: 0
    };

    this.logs.forEach(log => {
      operacoesPorTipo[log.operacao]++;
      entidadesContagem[log.entidade]++;
    });

    const entidadesMaisModificadas = Object.entries(entidadesContagem)
      .map(([entidade, quantidade]) => ({
        entidade: entidade as EntidadeLog,
        quantidade
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const errosRecentes = this.logs
      .filter(log => log.status === 'erro')
      .slice(-10)
      .reverse();

    return {
      totalLogs: this.logs.length,
      operacoesPorTipo,
      entidadesMaisModificadas,
      errosRecentes
    };
  }

  /**
   * Gera relatório de logs para um período
   */
  gerarRelatorio(dataInicio: Date, dataFim: Date): RelatórioLogs {
    const logsPeriodo = this.obterFiltrados({
      dataInicio,
      dataFim
    });

    const operacoesPorTipo: Record<TipoOperacao, number> = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      ACTION: 0
    };

    const entidadesContagem: Record<EntidadeLog, number> = {
      servico: 0,
      cliente: 0,
      transacao: 0,
      sistema: 0
    };

    logsPeriodo.forEach(log => {
      operacoesPorTipo[log.operacao]++;
      entidadesContagem[log.entidade]++;
    });

    return {
      totalLogs: logsPeriodo.length,
      periodoInicio: this.formatarData(dataInicio),
      periodoFim: this.formatarData(dataFim),
      operacoesPorTipo,
      entidadesMaisModificadas: Object.entries(entidadesContagem)
        .map(([entidade, quantidade]) => ({
          entidade: entidade as EntidadeLog,
          quantidade
        }))
        .sort((a, b) => b.quantidade - a.quantidade),
      logsRecentes: logsPeriodo.slice(-50).reverse()
    };
  }

  /**
   * Limpa todos os logs
   */
  limparTodos(): void {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
    this.registrar('ACTION', 'sistema', 'Todos os logs foram limpos');
  }

  /**
   * Limpa logs antigos (anteriores a X dias)
   */
  limparAntigos(diasRetencao: number = 90): number {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasRetencao);
    const timestampLimite = dataLimite.getTime();

    const countInicial = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp > timestampLimite);
    this.salvarLogs();

    const logsRemovidos = countInicial - this.logs.length;
    if (logsRemovidos > 0) {
      this.registrar(
        'ACTION',
        'sistema',
        `${logsRemovidos} logs antigos removidos (retencao de ${diasRetencao} dias)`
      );
    }

    return logsRemovidos;
  }

  /**
   * Exporta logs em formato JSON
   */
  exportarJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Exporta logs em formato CSV
   */
  exportarCSV(): string {
    const headers = [
      'ID',
      'Data/Hora',
      'Operação',
      'Entidade',
      'Nome dos Dados',
      'Descrição',
      'Usuário',
      'Status',
      'Mensagem de Erro'
    ].join(',');

    const linhas = this.logs.map(log =>
      [
        log.id,
        `"${log.dataFormatada}"`,
        log.operacao,
        log.entidade,
        log.nomeDados || '',
        `"${log.descricao.replace(/"/g, '""')}"`,
        log.usuario || '',
        log.status,
        `"${(log.mensagemErro || '').replace(/"/g, '""')}"`
      ].join(',')
    );

    return `${headers}\n${linhas.join('\n')}`;
  }

  /**
   * Restaura logs de um arquivo JSON
   */
  restaurarDeJSON(jsonString: string): void {
    try {
      const logsTempo = JSON.parse(jsonString) as LogEntry[];
      
      // Validar formato básico
      if (!Array.isArray(logsTempo)) {
        throw new Error('Formato inválido: esperado um array de logs');
      }

      this.logs = logsTempo;
      this.salvarLogs();
      this.registrar('ACTION', 'sistema', `${logsTempo.length} logs foram restaurados`);
    } catch (erro) {
      console.error('Erro ao restaurar logs:', erro);
      this.registrar(
        'ACTION',
        'sistema',
        'Erro ao restaurar logs',
        {
          status: 'erro',
          mensagemErro: erro instanceof Error ? erro.message : 'Erro desconhecido'
        }
      );
      throw erro;
    }
  }

  /**
   * Obtém estatísticas por data
   */
  obterEstatisticasPorDia(ultimosDias: number = 30): Array<{
    data: string;
    totalLogs: number;
    creates: number;
    updates: number;
    deletes: number;
    erros: number;
  }> {
    const dataAtual = new Date();
    const estatisticas: Map<string, {
      totalLogs: number;
      creates: number;
      updates: number;
      deletes: number;
      erros: number;
    }> = new Map();

    // Inicializar últimos dias
    for (let i = ultimosDias - 1; i >= 0; i--) {
      const data = new Date(dataAtual);
      data.setDate(data.getDate() - i);
      const chaveData = this.formatarData(data).split(' ')[0];
      
      if (!estatisticas.has(chaveData)) {
        estatisticas.set(chaveData, {
          totalLogs: 0,
          creates: 0,
          updates: 0,
          deletes: 0,
          erros: 0
        });
      }
    }

    // Contar logs por dia
    this.logs.forEach(log => {
      const chaveData = log.dataFormatada.split(' ')[0];
      const stats = estatisticas.get(chaveData);
      
      if (stats) {
        stats.totalLogs++;
        if (log.operacao === 'CREATE') stats.creates++;
        if (log.operacao === 'UPDATE') stats.updates++;
        if (log.operacao === 'DELETE') stats.deletes++;
        if (log.status === 'erro') stats.erros++;
      }
    });

    return Array.from(estatisticas.entries())
      .map(([data, stats]) => ({ data, ...stats }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  /**
   * Formata data para formato legível
   */
  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
  }
}

// Exportar instância única
export const logger = LoggerService.getInstance();

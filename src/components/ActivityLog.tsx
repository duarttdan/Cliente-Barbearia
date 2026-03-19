import { useState, useEffect } from 'react';
import { Download, Trash2, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { LogEntry, EntidadeLog, TipoOperacao } from '../types';
import { logger } from '../utils/logger';

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filtros, setFiltros] = useState({
    entidade: '' as EntidadeLog | '',
    operacao: '' as TipoOperacao | '',
    status: '' as 'sucesso' | 'erro' | '',
    busca: ''
  });
  const [mostraDetalhes, setMostraDetalhes] = useState<string | null>(null);
  const [mostraFiltros, setMostraFiltros] = useState(false);
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 20;

  useEffect(() => {
    carregarLogs();
  }, [filtros]);

  const carregarLogs = () => {
    const todoLogs = logger.obterRecentes(1000);
    
    let logsFiltrados = todoLogs.filter(log => {
      if (filtros.entidade && log.entidade !== filtros.entidade) return false;
      if (filtros.operacao && log.operacao !== filtros.operacao) return false;
      if (filtros.status && log.status !== filtros.status) return false;
      if (filtros.busca) {
        const buscaLower = filtros.busca.toLowerCase();
        return (
          log.descricao.toLowerCase().includes(buscaLower) ||
          log.nomeDados?.toLowerCase().includes(buscaLower) ||
          log.usuario?.toLowerCase().includes(buscaLower)
        );
      }
      return true;
    });

    setLogs(logsFiltrados);
    setPagina(1);
  };

  const limparFiltros = () => {
    setFiltros({
      entidade: '',
      operacao: '',
      status: '',
      busca: ''
    });
  };

  const exportarJSON = () => {
    const json = logger.exportarJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportarCSV = () => {
    const csv = logger.exportarCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const abrirDetalhes = (log: LogEntry) => {
    setMostraDetalhes(mostraDetalhes === log.id ? null : log.id);
  };

  const stats = logger.obterEstatisticas();
  const totalPaginas = Math.ceil(logs.length / itensPorPagina);
  const logsAtual = logs.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const getCorOperacao = (operacao: TipoOperacao) => {
    switch (operacao) {
      case 'CREATE':
        return 'bg-green-900/30 border-green-700/50 text-green-300';
      case 'UPDATE':
        return 'bg-blue-900/30 border-blue-700/50 text-blue-300';
      case 'DELETE':
        return 'bg-red-900/30 border-red-700/50 text-red-300';
      case 'ACTION':
        return 'bg-purple-900/30 border-purple-700/50 text-purple-300';
      default:
        return 'bg-gray-900/30 border-gray-700/50 text-gray-300';
    }
  };

  const getIconeOperacao = (operacao: TipoOperacao) => {
    switch (operacao) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'ACTION':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getCorEntidade = (entidade: EntidadeLog) => {
    switch (entidade) {
      case 'cliente':
        return 'text-blue-400';
      case 'servico':
        return 'text-green-400';
      case 'transacao':
        return 'text-yellow-400';
      case 'sistema':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📋</span> Histórico de Atividades
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => carregarLogs()}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition flex items-center gap-2"
              title="Atualizar logs"
            >
              <RefreshCw size={18} />
              Atualizar
            </button>
            <button
              onClick={exportarJSON}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded transition flex items-center gap-2"
              title="Exportar em JSON"
            >
              <Download size={18} />
              JSON
            </button>
            <button
              onClick={exportarCSV}
              className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded transition flex items-center gap-2"
              title="Exportar em CSV"
            >
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Total de Logs</div>
            <div className="text-xl font-bold text-white">{stats.totalLogs}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Criações</div>
            <div className="text-xl font-bold text-green-400">
              {stats.operacoesPorTipo.CREATE}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Atualizações</div>
            <div className="text-xl font-bold text-blue-400">
              {stats.operacoesPorTipo.UPDATE}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Erros</div>
            <div className="text-xl font-bold text-red-400">
              {stats.errosRecentes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4">
        <button
          onClick={() => setMostraFiltros(!mostraFiltros)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
        >
          <Filter size={18} />
          {mostraFiltros ? 'Ocultar' : 'Mostrar'} Filtros
        </button>

        {mostraFiltros && (
          <div className="bg-gray-800 p-4 rounded mt-3 border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Entidade
                </label>
                <select
                  value={filtros.entidade}
                  onChange={(e) =>
                    setFiltros({ ...filtros, entidade: e.target.value as EntidadeLog | '' })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">Todas</option>
                  <option value="cliente">Cliente</option>
                  <option value="servico">Serviço</option>
                  <option value="transacao">Transação</option>
                  <option value="sistema">Sistema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Operação
                </label>
                <select
                  value={filtros.operacao}
                  onChange={(e) =>
                    setFiltros({ ...filtros, operacao: e.target.value as TipoOperacao | '' })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">Todas</option>
                  <option value="CREATE">Criar</option>
                  <option value="UPDATE">Atualizar</option>
                  <option value="DELETE">Deletar</option>
                  <option value="ACTION">Ação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) =>
                    setFiltros({ ...filtros, status: e.target.value as 'sucesso' | 'erro' | '' })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">Todos</option>
                  <option value="sucesso">Sucesso</option>
                  <option value="erro">Erro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Descrição, usuário..."
                  value={filtros.busca}
                  onChange={(e) =>
                    setFiltros({ ...filtros, busca: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={limparFiltros}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Logs */}
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        {logsAtual.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhum log encontrado com os filtros selecionados
          </div>
        ) : (
          logsAtual.map((log) => (
            <div
              key={log.id}
              className={`border border-gray-700 rounded p-3 cursor-pointer hover:bg-gray-800/50 transition ${getCorOperacao(
                log.operacao
              )}`}
              onClick={() => abrirDetalhes(log)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-lg">
                    {getIconeOperacao(log.operacao)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold ${getCorEntidade(log.entidade)}`}>
                        {log.entidade.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400">{log.operacao}</span>
                      {log.status === 'erro' && (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                          ERRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 truncate">{log.descricao}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{log.dataFormatada}</span>
                      {log.usuario && <span>Usuário: {log.usuario}</span>}
                      {log.nomeDados && (
                        <span className="text-gray-500">{log.nomeDados}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirDetalhes(log);
                  }}
                  className="ml-2 p-1 hover:bg-gray-700 rounded transition"
                >
                  {mostraDetalhes === log.id ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/* Detalhes do Log */}
              {mostraDetalhes === log.id && (
                <div className="mt-3 pt-3 border-t border-gray-600 bg-gray-900/50 p-2 rounded text-sm">
                  {log.nomeDados && (
                    <div className="mb-2">
                      <span className="font-semibold">Nome:</span> {log.nomeDados}
                    </div>
                  )}

                  {log.dadosAntes && (
                    <div className="mb-2">
                      <span className="font-semibold">Estado Anterior:</span>
                      <pre className="bg-gray-900 p-2 rounded mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(log.dadosAntes, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.dadosDepois && (
                    <div className="mb-2">
                      <span className="font-semibold">Novo Estado:</span>
                      <pre className="bg-gray-900 p-2 rounded mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(log.dadosDepois, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.mensagemErro && (
                    <div className="mb-2 text-red-300">
                      <span className="font-semibold">Erro:</span> {log.mensagemErro}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPagina(Math.max(1, pagina - 1))}
            disabled={pagina === 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded"
          >
            ← Anterior
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1
              )
              .map((p, idx, arr) => (
                <div key={p}>
                  {idx > 0 && arr[idx - 1] < p - 1 && (
                    <span className="px-2 py-1 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setPagina(p)}
                    className={`px-3 py-1 rounded ${
                      p === pagina
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                </div>
              ))}
          </div>

          <button
            onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
            disabled={pagina === totalPaginas}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Resumo Entidades */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="font-semibold mb-3">Entidades Mais Modificadas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.entidadesMaisModificadas.map((item) => (
            <div key={item.entidade} className="bg-gray-800 p-3 rounded border border-gray-700">
              <div className={`text-sm font-medium ${getCorEntidade(item.entidade)}`}>
                {item.entidade.charAt(0).toUpperCase() + item.entidade.slice(1)}
              </div>
              <div className="text-lg font-bold text-white mt-1">{item.quantidade}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

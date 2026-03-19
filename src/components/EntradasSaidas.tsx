import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transacao, TipoTransacao, CategoriaDespesa } from '../types';

export default function EntradasSaidas() {
  const { transacoes, adicionarTransacao, excluirTransacao } = useApp();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | 'todos'>('todos');
  const [filtroMes, setFiltroMes] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'despesa' as TipoTransacao,
    valor: '',
    categoria: 'outros' as string,
    descricao: '',
    observacoes: ''
  });

  const categoriasDespesa: { valor: CategoriaDespesa; label: string; icone: string }[] = [
    { valor: 'aluguel', label: 'Aluguel', icone: '🏠' },
    { valor: 'produtos', label: 'Produtos', icone: '🧴' },
    { valor: 'energia', label: 'Energia', icone: '⚡' },
    { valor: 'marketing', label: 'Marketing', icone: '📢' },
    { valor: 'salarios', label: 'Salários', icone: '👥' },
    { valor: 'manutencao', label: 'Manutenção', icone: '🔧' },
    { valor: 'outros', label: 'Outros', icone: '📋' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transacaoData: Omit<Transacao, 'id'> = {
      data: formData.data,
      tipo: formData.tipo,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      descricao: formData.descricao,
      observacoes: formData.observacoes
    };
    adicionarTransacao(transacaoData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      tipo: 'despesa',
      valor: '',
      categoria: 'outros',
      descricao: '',
      observacoes: ''
    });
    setMostrarForm(false);
  };

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter(t => {
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const dataTransacao = new Date(t.data);
    const [ano, mes] = filtroMes.split('-').map(Number);
    const matchMes = dataTransacao.getFullYear() === ano && dataTransacao.getMonth() + 1 === mes;
    return matchTipo && matchMes;
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  // Calcular totais do mês
  const totalReceitas = transacoesFiltradas
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Agrupar despesas por categoria
  const despesasPorCategoria = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

  const getCategoriaInfo = (categoria: string) => {
    return categoriasDespesa.find(c => c.valor === categoria) || { label: categoria, icone: '📋' };
  };

  // Calcular saldo diário
  const transacoesPorDia = transacoesFiltradas.reduce((acc, t) => {
    if (!acc[t.data]) {
      acc[t.data] = { receitas: 0, despesas: 0 };
    }
    if (t.tipo === 'receita') {
      acc[t.data].receitas += t.valor;
    } else {
      acc[t.data].despesas += t.valor;
    }
    return acc;
  }, {} as Record<string, { receitas: number; despesas: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Financeiro - Entradas e Saídas</h2>
          <p className="text-gray-400">Controle financeiro da barbearia</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Transação
        </button>
      </div>

      {/* Formulário Modal */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Nova Transação</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'receita', categoria: 'servico' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.tipo === 'receita'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    📈 Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'despesa', categoria: 'outros' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.tipo === 'despesa'
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    📉 Despesa
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Categoria</label>
                {formData.tipo === 'despesa' ? (
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaDespesa })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categoriasDespesa.map(cat => (
                      <option key={cat.valor} value={cat.valor}>{cat.icone} {cat.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Serviço, Venda, etc."
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Descrição da transação..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 font-semibold py-2 rounded-lg transition-colors ${
                    formData.tipo === 'receita'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Mês</label>
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoTransacao | 'todos')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos</option>
              <option value="receita">📈 Receitas</option>
              <option value="despesa">📉 Despesas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <p className="text-green-400 text-sm">Receitas</p>
              <p className="text-xl font-bold text-white">R$ {totalReceitas.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📉</span>
            </div>
            <div>
              <p className="text-red-400 text-sm">Despesas</p>
              <p className="text-xl font-bold text-white">R$ {totalDespesas.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className={`bg-gradient-to-br ${saldoLiquido >= 0 ? 'from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'from-orange-500/20 to-orange-600/10 border-orange-500/30'} rounded-xl p-4 border`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${saldoLiquido >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-lg flex items-center justify-center`}>
              <span className="text-xl">{saldoLiquido >= 0 ? '💰' : '⚠️'}</span>
            </div>
            <div>
              <p className={`${saldoLiquido >= 0 ? 'text-blue-400' : 'text-orange-400'} text-sm`}>Saldo Líquido</p>
              <p className="text-xl font-bold text-white">R$ {saldoLiquido.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Transações</p>
              <p className="text-xl font-bold text-white">{transacoesFiltradas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Despesas por Categoria */}
      {Object.keys(despesasPorCategoria).length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Despesas por Categoria</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(despesasPorCategoria)
              .sort((a, b) => b[1] - a[1])
              .map(([categoria, valor]) => {
                const info = getCategoriaInfo(categoria);
                return (
                  <div key={categoria} className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">{info.icone} {info.label}</p>
                    <p className="text-red-400 font-semibold">R$ {valor.toFixed(2)}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Saldo Diário */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Saldo Diário</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-300">Data</th>
                <th className="text-right px-4 py-2 text-gray-300">Receitas</th>
                <th className="text-right px-4 py-2 text-gray-300">Despesas</th>
                <th className="text-right px-4 py-2 text-gray-300">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(transacoesPorDia)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([data, valores]) => {
                  const saldo = valores.receitas - valores.despesas;
                  return (
                    <tr key={data} className="border-t border-gray-700">
                      <td className="px-4 py-2 text-white">
                        {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-right text-green-400">
                        R$ {valores.receitas.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right text-red-400">
                        R$ {valores.despesas.toFixed(2)}
                      </td>
                      <td className={`px-4 py-2 text-right font-semibold ${saldo >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        R$ {saldo.toFixed(2)}
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Data</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Tipo</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Categoria</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Descrição</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Valor</th>
                <th className="text-center px-4 py-3 text-gray-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map((transacao) => {
                const info = getCategoriaInfo(transacao.categoria);
                return (
                  <tr key={transacao.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(transacao.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${
                        transacao.tipo === 'receita'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      } text-xs px-2 py-1 rounded-full`}>
                        {transacao.tipo === 'receita' ? '📈 Receita' : '📉 Despesa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {info.icone} {info.label}
                    </td>
                    <td className="px-4 py-3 text-white max-w-xs truncate">
                      {transacao.descricao}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir esta transação?')) {
                            excluirTransacao(transacao.id);
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

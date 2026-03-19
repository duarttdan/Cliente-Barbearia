import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cliente, ServicoRealizado, FormaPagamento, StatusAtendimento } from '../types';

export default function Clientes() {
  const { clientes, servicos, adicionarCliente, atualizarCliente, excluirCliente, finalizarAtendimento } = useApp();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusAtendimento | 'todos'>('todos');
  const [filtroPagamento, setFiltroPagamento] = useState<FormaPagamento | 'todos'>('todos');
  const [busca, setBusca] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    dataVisita: new Date().toISOString().split('T')[0],
    servicosSelecionados: [] as { servicoId: string; quantidade: number }[],
    formaPagamento: 'pix' as FormaPagamento,
    status: 'em_andamento' as StatusAtendimento,
    observacoes: ''
  });

  const servicosAtivos = servicos.filter(s => s.ativo);

  const formasPagamento = [
    { valor: 'dinheiro', label: 'Dinheiro', icone: '💵' },
    { valor: 'cartao_credito', label: 'Cartão de Crédito', icone: '💳' },
    { valor: 'cartao_debito', label: 'Cartão de Débito', icone: '💳' },
    { valor: 'pix', label: 'PIX', icone: '📱' }
  ];

  const adicionarServicoSelecionado = (servicoId: string) => {
    const existente = formData.servicosSelecionados.find(s => s.servicoId === servicoId);
    if (existente) {
      setFormData({
        ...formData,
        servicosSelecionados: formData.servicosSelecionados.map(s =>
          s.servicoId === servicoId ? { ...s, quantidade: s.quantidade + 1 } : s
        )
      });
    } else {
      setFormData({
        ...formData,
        servicosSelecionados: [...formData.servicosSelecionados, { servicoId, quantidade: 1 }]
      });
    }
  };

  const removerServicoSelecionado = (servicoId: string) => {
    setFormData({
      ...formData,
      servicosSelecionados: formData.servicosSelecionados.filter(s => s.servicoId !== servicoId)
    });
  };

  const calcularTotal = () => {
    return formData.servicosSelecionados.reduce((total, item) => {
      const servico = servicosAtivos.find(s => s.id === item.servicoId);
      return total + (servico ? servico.preco * item.quantidade : 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.servicosSelecionados.length === 0) {
      alert('Selecione pelo menos um serviço!');
      return;
    }

    const servicosRealizados: ServicoRealizado[] = formData.servicosSelecionados.map(item => {
      const servico = servicosAtivos.find(s => s.id === item.servicoId)!;
      return {
        servicoId: item.servicoId,
        nome: servico.nome,
        preco: servico.preco,
        quantidade: item.quantidade
      };
    });

    const clienteData: Omit<Cliente, 'id'> = {
      nome: formData.nome,
      dataVisita: formData.dataVisita,
      servicos: servicosRealizados,
      valorTotal: calcularTotal(),
      formaPagamento: formData.formaPagamento,
      status: formData.status,
      observacoes: formData.observacoes
    };

    if (editando) {
      atualizarCliente(editando.id, clienteData);
    } else {
      adicionarCliente(clienteData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      dataVisita: new Date().toISOString().split('T')[0],
      servicosSelecionados: [],
      formaPagamento: 'pix',
      status: 'em_andamento',
      observacoes: ''
    });
    setMostrarForm(false);
    setEditando(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditando(cliente);
    setFormData({
      nome: cliente.nome,
      dataVisita: cliente.dataVisita,
      servicosSelecionados: cliente.servicos.map(s => ({ servicoId: s.servicoId, quantidade: s.quantidade })),
      formaPagamento: cliente.formaPagamento,
      status: cliente.status,
      observacoes: cliente.observacoes || ''
    });
    setMostrarForm(true);
  };

  const handleFinalizar = (clienteId: string) => {
    if (confirm('Finalizar atendimento? Isso registrará a receita automaticamente.')) {
      finalizarAtendimento(clienteId);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    const matchPagamento = filtroPagamento === 'todos' || c.formaPagamento === filtroPagamento;
    return matchBusca && matchStatus && matchPagamento;
  }).sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime());

  const getPagamentoLabel = (pagamento: FormaPagamento) => {
    return formasPagamento.find(f => f.valor === pagamento)?.label || pagamento;
  };

  const getPagamentoIcone = (pagamento: FormaPagamento) => {
    return formasPagamento.find(f => f.valor === pagamento)?.icone || '💰';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Registro de Clientes</h2>
          <p className="text-gray-400">Gerencie os atendimentos da barbearia</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Atendimento
        </button>
      </div>

      {/* Formulário Modal */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {editando ? 'Editar Atendimento' : 'Novo Atendimento'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="João Silva"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data da Visita</label>
                  <input
                    type="date"
                    value={formData.dataVisita}
                    onChange={(e) => setFormData({ ...formData, dataVisita: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Seleção de Serviços */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Serviços</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {servicosAtivos.map(servico => (
                    <button
                      key={servico.id}
                      type="button"
                      onClick={() => adicionarServicoSelecionado(servico.id)}
                      className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-3 text-left transition-colors"
                    >
                      <p className="text-white text-sm font-medium">{servico.nome}</p>
                      <p className="text-amber-400 text-sm">R$ {servico.preco.toFixed(2)}</p>
                    </button>
                  ))}
                </div>

                {/* Serviços Selecionados */}
                {formData.servicosSelecionados.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                    <p className="text-gray-400 text-sm">Serviços selecionados:</p>
                    {formData.servicosSelecionados.map(item => {
                      const servico = servicosAtivos.find(s => s.id === item.servicoId)!;
                      return (
                        <div key={item.servicoId} className="flex justify-between items-center">
                          <span className="text-white">
                            {item.quantidade}x {servico.nome}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400">
                              R$ {(servico.preco * item.quantidade).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removerServicoSelecionado(item.servicoId)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-600 pt-2 flex justify-between">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-amber-400 font-bold">R$ {calcularTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Forma de Pagamento</label>
                  <select
                    value={formData.formaPagamento}
                    onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value as FormaPagamento })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {formasPagamento.map(fp => (
                      <option key={fp.valor} value={fp.valor}>{fp.icone} {fp.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusAtendimento })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="em_andamento">🟡 Em Andamento</option>
                    <option value="finalizado">🟢 Finalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="Observações sobre o atendimento..."
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
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 rounded-lg transition-colors"
                >
                  {editando ? 'Salvar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusAtendimento | 'todos')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos Status</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="finalizado">Finalizado</option>
            </select>
            <select
              value={filtroPagamento}
              onChange={(e) => setFiltroPagamento(e.target.value as FormaPagamento | 'todos')}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos Pagamentos</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão Crédito</option>
              <option value="cartao_debito">Cartão Débito</option>
              <option value="pix">PIX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total de Clientes</p>
          <p className="text-2xl font-bold text-white">{clientes.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Em Andamento</p>
          <p className="text-2xl font-bold text-yellow-400">{clientes.filter(c => c.status === 'em_andamento').length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Finalizados</p>
          <p className="text-2xl font-bold text-green-400">{clientes.filter(c => c.status === 'finalizado').length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Faturamento</p>
          <p className="text-2xl font-bold text-amber-400">
            R$ {clientes.filter(c => c.status === 'finalizado').reduce((acc, c) => acc + c.valorTotal, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Cliente</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold hidden md:table-cell">Data</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Serviços</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Valor</th>
                <th className="text-center px-4 py-3 text-gray-300 font-semibold hidden sm:table-cell">Pagamento</th>
                <th className="text-center px-4 py-3 text-gray-300 font-semibold">Status</th>
                <th className="text-center px-4 py-3 text-gray-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{cliente.nome}</p>
                    <p className="text-gray-400 text-sm md:hidden">{new Date(cliente.dataVisita).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                    {new Date(cliente.dataVisita).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {cliente.servicos.map((s, i) => (
                        <span key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                          {s.quantidade}x {s.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-amber-400 font-semibold">
                    R$ {cliente.valorTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-2xl" title={getPagamentoLabel(cliente.formaPagamento)}>
                      {getPagamentoIcone(cliente.formaPagamento)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`${
                      cliente.status === 'finalizado'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    } text-xs px-2 py-1 rounded-full`}>
                      {cliente.status === 'finalizado' ? '✓ Finalizado' : '⏳ Em Andamento'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      {cliente.status === 'em_andamento' && (
                        <button
                          onClick={() => handleFinalizar(cliente.id)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Finalizar Atendimento"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => excluirCliente(cliente.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

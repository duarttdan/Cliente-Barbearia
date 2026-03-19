import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Servico } from '../types';

export default function Servicos() {
  const { servicos, adicionarServico, atualizarServico, excluirServico } = useApp();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    preco: '',
    tempoMedio: '',
    categoria: 'cabelo' as 'cabelo' | 'barba' | 'combo' | 'outros',
    ativo: true
  });

  const categorias = [
    { valor: 'cabelo', label: 'Cabelo', cor: 'bg-blue-500' },
    { valor: 'barba', label: 'Barba', cor: 'bg-green-500' },
    { valor: 'combo', label: 'Combo', cor: 'bg-purple-500' },
    { valor: 'outros', label: 'Outros', cor: 'bg-orange-500' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const servicoData = {
      codigo: formData.codigo,
      nome: formData.nome,
      preco: parseFloat(formData.preco),
      tempoMedio: parseInt(formData.tempoMedio),
      categoria: formData.categoria,
      ativo: formData.ativo
    };

    if (editando) {
      atualizarServico(editando.id, servicoData);
    } else {
      adicionarServico(servicoData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ codigo: '', nome: '', preco: '', tempoMedio: '', categoria: 'cabelo', ativo: true });
    setMostrarForm(false);
    setEditando(null);
  };

  const handleEdit = (servico: Servico) => {
    setEditando(servico);
    setFormData({
      codigo: servico.codigo,
      nome: servico.nome,
      preco: servico.preco.toString(),
      tempoMedio: servico.tempoMedio.toString(),
      categoria: servico.categoria,
      ativo: servico.ativo
    });
    setMostrarForm(true);
  };

  const getCategoriaCor = (categoria: string) => {
    return categorias.find(c => c.valor === categoria)?.cor || 'bg-gray-500';
  };

  const getCategoriaLabel = (categoria: string) => {
    return categorias.find(c => c.valor === categoria)?.label || categoria;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Cadastro de Serviços</h2>
          <p className="text-gray-400">Gerencie os serviços oferecidos pela barbearia</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Serviço
        </button>
      </div>

      {/* Formulário Modal */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {editando ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="SRV001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categorias.map(cat => (
                      <option key={cat.valor} value={cat.valor}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Corte Masculino"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="35.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tempo (min)</label>
                  <input
                    type="number"
                    value={formData.tempoMedio}
                    onChange={(e) => setFormData({ ...formData, tempoMedio: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <label htmlFor="ativo" className="text-gray-300">Serviço ativo</label>
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
                  {editando ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total de Serviços</p>
          <p className="text-2xl font-bold text-white">{servicos.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Serviços Ativos</p>
          <p className="text-2xl font-bold text-green-400">{servicos.filter(s => s.ativo).length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Preço Médio</p>
          <p className="text-2xl font-bold text-amber-400">
            R$ {servicos.length > 0 ? (servicos.reduce((acc, s) => acc + s.preco, 0) / servicos.length).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Tempo Médio</p>
          <p className="text-2xl font-bold text-blue-400">
            {servicos.length > 0 ? Math.round(servicos.reduce((acc, s) => acc + s.tempoMedio, 0) / servicos.length) : 0} min
          </p>
        </div>
      </div>

      {/* Tabela de Serviços */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Código</th>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Serviço</th>
                <th className="text-left px-6 py-4 text-gray-300 font-semibold">Categoria</th>
                <th className="text-right px-6 py-4 text-gray-300 font-semibold">Preço</th>
                <th className="text-center px-6 py-4 text-gray-300 font-semibold">Tempo</th>
                <th className="text-center px-6 py-4 text-gray-300 font-semibold">Status</th>
                <th className="text-center px-6 py-4 text-gray-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono">{servico.codigo}</td>
                  <td className="px-6 py-4 text-white font-medium">{servico.nome}</td>
                  <td className="px-6 py-4">
                    <span className={`${getCategoriaCor(servico.categoria)} text-white text-xs px-2 py-1 rounded-full`}>
                      {getCategoriaLabel(servico.categoria)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-amber-400 font-semibold">
                    R$ {servico.preco.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">{servico.tempoMedio} min</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`${servico.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs px-2 py-1 rounded-full`}>
                      {servico.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(servico)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => excluirServico(servico.id)}
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

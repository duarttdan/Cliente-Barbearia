import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function PlanilhaMensal() {
  const { clientes, transacoes } = useApp();
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calcular dados do mês selecionado
  const dadosMensais = useMemo(() => {
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0);

    // Clientes do mês
    const clientesDoMes = clientes.filter(c => {
      const dataVisita = new Date(c.dataVisita);
      return dataVisita >= dataInicio && dataVisita <= dataFim;
    });

    const clientesFinalizados = clientesDoMes.filter(c => c.status === 'finalizado');

    // Transações do mês
    const transacoesDoMes = transacoes.filter(t => {
      const data = new Date(t.data);
      return data >= dataInicio && data <= dataFim;
    });

    const receitas = transacoesDoMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoesDoMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const lucroLiquido = receitas - despesas;
    const ticketMedio = clientesFinalizados.length > 0
      ? clientesFinalizados.reduce((acc, c) => acc + c.valorTotal, 0) / clientesFinalizados.length
      : 0;

    // Serviços mais vendidos
    const servicosContagem: { [key: string]: { quantidade: number; receita: number } } = {};
    clientesDoMes.forEach(c => {
      c.servicos.forEach(s => {
        if (!servicosContagem[s.nome]) {
          servicosContagem[s.nome] = { quantidade: 0, receita: 0 };
        }
        servicosContagem[s.nome].quantidade += s.quantidade;
        servicosContagem[s.nome].receita += s.preco * s.quantidade;
      });
    });

    const servicosMaisVendidos = Object.entries(servicosContagem)
      .sort((a, b) => b[1].quantidade - a[1].quantidade);

    // Despesas por categoria
    const despesasPorCategoria: { [key: string]: number } = {};
    transacoesDoMes.filter(t => t.tipo === 'despesa').forEach(t => {
      despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor;
    });

    // Dados do mês anterior para comparação
    const dataInicioAnterior = new Date(ano, mes - 2, 1);
    const dataFimAnterior = new Date(ano, mes - 1, 0);

    const clientesAnterior = clientes.filter(c => {
      const dataVisita = new Date(c.dataVisita);
      return dataVisita >= dataInicioAnterior && dataVisita <= dataFimAnterior && c.status === 'finalizado';
    });

    const transacoesAnterior = transacoes.filter(t => {
      const data = new Date(t.data);
      return data >= dataInicioAnterior && data <= dataFimAnterior;
    });

    const receitasAnterior = transacoesAnterior.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesasAnterior = transacoesAnterior.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const lucroAnterior = receitasAnterior - despesasAnterior;
    const ticketAnterior = clientesAnterior.length > 0
      ? clientesAnterior.reduce((acc, c) => acc + c.valorTotal, 0) / clientesAnterior.length
      : 0;

    const calcularVariacao = (atual: number, anterior: number) => {
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return ((atual - anterior) / anterior) * 100;
    };

    return {
      totalClientes: clientesFinalizados.length,
      clientesEmAndamento: clientesDoMes.filter(c => c.status === 'em_andamento').length,
      receitaBruta: receitas,
      despesasTotais: despesas,
      lucroLiquido,
      ticketMedio,
      servicosMaisVendidos,
      despesasPorCategoria,
      clientesDoMes,
      transacoesDoMes,
      comparativo: {
        variacaoClientes: calcularVariacao(clientesFinalizados.length, clientesAnterior.length),
        variacaoReceita: calcularVariacao(receitas, receitasAnterior),
        variacaoLucro: calcularVariacao(lucroLiquido, lucroAnterior),
        variacaoTicket: calcularVariacao(ticketMedio, ticketAnterior)
      }
    };
  }, [clientes, transacoes, mesSelecionado]);

  const formatarMes = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const data = new Date(parseInt(ano), parseInt(mesNum) - 1);
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const exportarCSV = () => {
    const linhas = [
      ['Relatório Mensal - Hair Style do Grau'],
      [`Mês: ${formatarMes(mesSelecionado)}`],
      [''],
      ['RESUMO FINANCEIRO'],
      ['Indicador', 'Valor'],
      ['Total de Clientes', dadosMensais.totalClientes.toString()],
      ['Receita Bruta', `R$ ${dadosMensais.receitaBruta.toFixed(2)}`],
      ['Despesas Totais', `R$ ${dadosMensais.despesasTotais.toFixed(2)}`],
      ['Lucro Líquido', `R$ ${dadosMensais.lucroLiquido.toFixed(2)}`],
      ['Ticket Médio', `R$ ${dadosMensais.ticketMedio.toFixed(2)}`],
      [''],
      ['SERVIÇOS MAIS VENDIDOS'],
      ['Serviço', 'Quantidade', 'Receita'],
      ...dadosMensais.servicosMaisVendidos.map(([nome, data]) => [nome, data.quantidade.toString(), `R$ ${data.receita.toFixed(2)}`]),
      [''],
      ['DESPESAS POR CATEGORIA'],
      ['Categoria', 'Valor'],
      ...Object.entries(dadosMensais.despesasPorCategoria).map(([cat, valor]) => [cat, `R$ ${valor.toFixed(2)}`])
    ];

    const csvContent = linhas.map(l => l.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${mesSelecionado}.csv`;
    link.click();
  };

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return '↑';
    if (variacao < 0) return '↓';
    return '→';
  };

  const getVariacaoColor = (variacao: number, positivoBom: boolean = true) => {
    if (variacao === 0) return 'text-gray-400';
    if (positivoBom) {
      return variacao > 0 ? 'text-green-400' : 'text-red-400';
    }
    return variacao > 0 ? 'text-red-400' : 'text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Planilha Mensal</h2>
          <p className="text-gray-400">Relatório detalhado do mês</p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={exportarCSV}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Título do Mês */}
      <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-xl p-6 border border-amber-500/30">
        <h3 className="text-xl font-bold text-amber-400 capitalize">{formatarMes(mesSelecionado)}</h3>
        <p className="text-gray-400">Hair Style do Grau - Relatório Mensal</p>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Clientes Atendidos</p>
              <p className="text-3xl font-bold text-white">{dadosMensais.totalClientes}</p>
              {dadosMensais.clientesEmAndamento > 0 && (
                <p className="text-yellow-400 text-xs">+{dadosMensais.clientesEmAndamento} pendentes</p>
              )}
            </div>
            <div className={`text-sm ${getVariacaoColor(dadosMensais.comparativo.variacaoClientes)}`}>
              {getVariacaoIcon(dadosMensais.comparativo.variacaoClientes)} {Math.abs(dadosMensais.comparativo.variacaoClientes).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Receita Bruta</p>
              <p className="text-3xl font-bold text-green-400">R$ {dadosMensais.receitaBruta.toFixed(2)}</p>
            </div>
            <div className={`text-sm ${getVariacaoColor(dadosMensais.comparativo.variacaoReceita)}`}>
              {getVariacaoIcon(dadosMensais.comparativo.variacaoReceita)} {Math.abs(dadosMensais.comparativo.variacaoReceita).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Despesas Totais</p>
              <p className="text-3xl font-bold text-red-400">R$ {dadosMensais.despesasTotais.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Lucro Líquido</p>
              <p className={`text-3xl font-bold ${dadosMensais.lucroLiquido >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                R$ {dadosMensais.lucroLiquido.toFixed(2)}
              </p>
            </div>
            <div className={`text-sm ${getVariacaoColor(dadosMensais.comparativo.variacaoLucro)}`}>
              {getVariacaoIcon(dadosMensais.comparativo.variacaoLucro)} {Math.abs(dadosMensais.comparativo.variacaoLucro).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Ticket Médio</p>
              <p className="text-3xl font-bold text-amber-400">R$ {dadosMensais.ticketMedio.toFixed(2)}</p>
            </div>
            <div className={`text-sm ${getVariacaoColor(dadosMensais.comparativo.variacaoTicket)}`}>
              {getVariacaoIcon(dadosMensais.comparativo.variacaoTicket)} {Math.abs(dadosMensais.comparativo.variacaoTicket).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serviços Mais Vendidos */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Serviços Mais Vendidos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-300">Serviço</th>
                  <th className="text-center px-6 py-3 text-gray-300">Qtd</th>
                  <th className="text-right px-6 py-3 text-gray-300">Receita</th>
                </tr>
              </thead>
              <tbody>
                {dadosMensais.servicosMaisVendidos.length > 0 ? (
                  dadosMensais.servicosMaisVendidos.map(([nome, data], index) => (
                    <tr key={nome} className="border-t border-gray-700">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-yellow-400">🥇</span>}
                          {index === 1 && <span className="text-gray-400">🥈</span>}
                          {index === 2 && <span className="text-orange-400">🥉</span>}
                          <span className="text-white">{nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-blue-400 font-semibold">{data.quantidade}</td>
                      <td className="px-6 py-3 text-right text-green-400 font-semibold">R$ {data.receita.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      Nenhum serviço registrado neste mês
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Despesas por Categoria</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-300">Categoria</th>
                  <th className="text-right px-6 py-3 text-gray-300">Valor</th>
                  <th className="text-right px-6 py-3 text-gray-300">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dadosMensais.despesasPorCategoria).length > 0 ? (
                  Object.entries(dadosMensais.despesasPorCategoria)
                    .sort((a, b) => b[1] - a[1])
                    .map(([categoria, valor]) => {
                      const porcentagem = dadosMensais.despesasTotais > 0
                        ? (valor / dadosMensais.despesasTotais) * 100
                        : 0;
                      const nomesCategoria: { [key: string]: string } = {
                        aluguel: '🏠 Aluguel',
                        produtos: '🧴 Produtos',
                        energia: '⚡ Energia',
                        marketing: '📢 Marketing',
                        salarios: '👥 Salários',
                        manutencao: '🔧 Manutenção',
                        outros: '📋 Outros'
                      };
                      return (
                        <tr key={categoria} className="border-t border-gray-700">
                          <td className="px-6 py-3 text-white">{nomesCategoria[categoria] || categoria}</td>
                          <td className="px-6 py-3 text-right text-red-400 font-semibold">R$ {valor.toFixed(2)}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ width: `${porcentagem}%` }}
                                />
                              </div>
                              <span className="text-gray-400 text-sm w-10 text-right">{porcentagem.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      Nenhuma despesa registrada neste mês
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lista de Atendimentos do Mês */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-700/50 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Atendimentos do Mês</h3>
          <span className="text-gray-400 text-sm">{dadosMensais.clientesDoMes.length} atendimentos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300">Data</th>
                <th className="text-left px-4 py-3 text-gray-300">Cliente</th>
                <th className="text-left px-4 py-3 text-gray-300">Serviços</th>
                <th className="text-right px-4 py-3 text-gray-300">Valor</th>
                <th className="text-center px-4 py-3 text-gray-300">Pagamento</th>
                <th className="text-center px-4 py-3 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {dadosMensais.clientesDoMes.length > 0 ? (
                dadosMensais.clientesDoMes
                  .sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime())
                  .map(cliente => (
                    <tr key={cliente.id} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(cliente.dataVisita).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-white">{cliente.nome}</td>
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
                      <td className="px-4 py-3 text-center">
                        {cliente.formaPagamento === 'dinheiro' && '💵'}
                        {cliente.formaPagamento === 'pix' && '📱'}
                        {(cliente.formaPagamento === 'cartao_credito' || cliente.formaPagamento === 'cartao_debito') && '💳'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cliente.status === 'finalizado'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {cliente.status === 'finalizado' ? '✓' : '⏳'}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Nenhum atendimento registrado neste mês
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Resumo Executivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Desempenho de Clientes</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white">{dadosMensais.totalClientes}</div>
              <div className={`text-sm ${getVariacaoColor(dadosMensais.comparativo.variacaoClientes)}`}>
                {getVariacaoIcon(dadosMensais.comparativo.variacaoClientes)} {Math.abs(dadosMensais.comparativo.variacaoClientes).toFixed(1)}% vs mês anterior
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Margem de Lucro</p>
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${dadosMensais.receitaBruta > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
                {dadosMensais.receitaBruta > 0
                  ? `${((dadosMensais.lucroLiquido / dadosMensais.receitaBruta) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <div className="text-gray-400 text-sm">
                Receita - Despesas
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Serviço Destaque</p>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-amber-400">
                {dadosMensais.servicosMaisVendidos[0]?.[0] || 'N/A'}
              </div>
              {dadosMensais.servicosMaisVendidos[0] && (
                <div className="text-gray-400 text-sm">
                  {dadosMensais.servicosMaisVendidos[0][1].quantidade} vendas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

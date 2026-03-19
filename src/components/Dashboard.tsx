import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type FiltroPeriodo = 'semana' | 'mes' | 'ano';

export default function Dashboard() {
  const { clientes, transacoes } = useApp();
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('mes');

  // Filtrar dados por período
  const dadosFiltrados = useMemo(() => {
    const agora = new Date();
    let dataInicio: Date;

    switch (filtroPeriodo) {
      case 'semana':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        break;
      case 'ano':
        dataInicio = new Date(agora.getFullYear(), 0, 1);
        break;
    }

    const clientesFiltrados = clientes.filter(c => new Date(c.dataVisita) >= dataInicio);
    const transacoesFiltradas = transacoes.filter(t => new Date(t.data) >= dataInicio);

    return { clientesFiltrados, transacoesFiltradas, dataInicio };
  }, [clientes, transacoes, filtroPeriodo]);

  // Dados para gráfico de clientes por mês (últimos 6 meses)
  const clientesPorMes = useMemo(() => {
    const meses: { [key: string]: number } = {};
    const agora = new Date();

    for (let i = 5; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses[chave] = 0;
    }

    clientes.forEach(c => {
      const dataVisita = new Date(c.dataVisita);
      const chave = `${dataVisita.getFullYear()}-${String(dataVisita.getMonth() + 1).padStart(2, '0')}`;
      if (meses.hasOwnProperty(chave)) {
        meses[chave]++;
      }
    });

    const labels = Object.keys(meses).map(m => {
      const [ano, mes] = m.split('-');
      return new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    });

    return {
      labels,
      data: Object.values(meses)
    };
  }, [clientes]);

  // Dados para gráfico de receita vs despesa
  const receitaVsDespesa = useMemo(() => {
    const meses: { [key: string]: { receita: number; despesa: number } } = {};
    const agora = new Date();

    for (let i = 5; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses[chave] = { receita: 0, despesa: 0 };
    }

    transacoes.forEach(t => {
      const data = new Date(t.data);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (meses.hasOwnProperty(chave)) {
        if (t.tipo === 'receita') {
          meses[chave].receita += t.valor;
        } else {
          meses[chave].despesa += t.valor;
        }
      }
    });

    const labels = Object.keys(meses).map(m => {
      const [ano, mes] = m.split('-');
      return new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'short' });
    });

    return {
      labels,
      receitas: Object.values(meses).map(m => m.receita),
      despesas: Object.values(meses).map(m => m.despesa)
    };
  }, [transacoes]);

  // Dados para gráfico de pizza de serviços mais vendidos
  const servicosMaisVendidos = useMemo(() => {
    const contagem: { [key: string]: { quantidade: number; receita: number } } = {};

    clientes.forEach(c => {
      c.servicos.forEach(s => {
        if (!contagem[s.nome]) {
          contagem[s.nome] = { quantidade: 0, receita: 0 };
        }
        contagem[s.nome].quantidade += s.quantidade;
        contagem[s.nome].receita += s.preco * s.quantidade;
      });
    });

    const sorted = Object.entries(contagem)
      .sort((a, b) => b[1].quantidade - a[1].quantidade)
      .slice(0, 5);

    return {
      labels: sorted.map(([nome]) => nome),
      quantidade: sorted.map(([, data]) => data.quantidade),
      receita: sorted.map(([, data]) => data.receita)
    };
  }, [clientes]);

  // Dados para evolução do ticket médio
  const evolucaoTicketMedio = useMemo(() => {
    const meses: { [key: string]: { total: number; quantidade: number } } = {};
    const agora = new Date();

    for (let i = 5; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses[chave] = { total: 0, quantidade: 0 };
    }

    clientes.filter(c => c.status === 'finalizado').forEach(c => {
      const dataVisita = new Date(c.dataVisita);
      const chave = `${dataVisita.getFullYear()}-${String(dataVisita.getMonth() + 1).padStart(2, '0')}`;
      if (meses.hasOwnProperty(chave)) {
        meses[chave].total += c.valorTotal;
        meses[chave].quantidade++;
      }
    });

    const labels = Object.keys(meses).map(m => {
      const [ano, mes] = m.split('-');
      return new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'short' });
    });

    const tickets = Object.values(meses).map(m => m.quantidade > 0 ? m.total / m.quantidade : 0);

    return { labels, tickets };
  }, [clientes]);

  // Calcular métricas do período
  const metricas = useMemo(() => {
    const { clientesFiltrados, transacoesFiltradas } = dadosFiltrados;

    const clientesFinalizados = clientesFiltrados.filter(c => c.status === 'finalizado');
    const totalReceita = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const totalDespesa = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    const ticketMedio = clientesFinalizados.length > 0
      ? clientesFinalizados.reduce((acc, c) => acc + c.valorTotal, 0) / clientesFinalizados.length
      : 0;

    // Serviço mais vendido
    const servicoContagem: { [key: string]: number } = {};
    clientesFiltrados.forEach(c => {
      c.servicos.forEach(s => {
        servicoContagem[s.nome] = (servicoContagem[s.nome] || 0) + s.quantidade;
      });
    });
    const servicoMaisVendido = Object.entries(servicoContagem).sort((a, b) => b[1] - a[1])[0];

    return {
      totalClientes: clientesFinalizados.length,
      totalReceita,
      totalDespesa,
      lucroLiquido: totalReceita - totalDespesa,
      ticketMedio,
      servicoMaisVendido: servicoMaisVendido ? servicoMaisVendido[0] : 'N/A',
      clientesEmAndamento: clientesFiltrados.filter(c => c.status === 'em_andamento').length
    };
  }, [dadosFiltrados]);

  // Configurações dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9CA3AF',
          padding: 15
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400">Visão geral do desempenho da barbearia</p>
        </div>
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
          {[
            { valor: 'semana', label: 'Semana' },
            { valor: 'mes', label: 'Mês' },
            { valor: 'ano', label: 'Ano' }
          ].map(opcao => (
            <button
              key={opcao.valor}
              onClick={() => setFiltroPeriodo(opcao.valor as FiltroPeriodo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroPeriodo === opcao.valor
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">Clientes Atendidos</p>
              <p className="text-3xl font-bold text-white">{metricas.totalClientes}</p>
              {metricas.clientesEmAndamento > 0 && (
                <p className="text-yellow-400 text-xs mt-1">{metricas.clientesEmAndamento} em andamento</p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Receita Total</p>
              <p className="text-3xl font-bold text-white">R$ {metricas.totalReceita.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Ticket Médio</p>
              <p className="text-3xl font-bold text-white">R$ {metricas.ticketMedio.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${metricas.lucroLiquido >= 0 ? 'from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'from-red-500/20 to-red-600/10 border-red-500/30'} rounded-xl p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={metricas.lucroLiquido >= 0 ? 'text-purple-400' : 'text-red-400'}>Lucro Líquido</p>
              <p className="text-3xl font-bold text-white">R$ {metricas.lucroLiquido.toFixed(2)}</p>
            </div>
            <div className={`w-12 h-12 ${metricas.lucroLiquido >= 0 ? 'bg-purple-500/20' : 'bg-red-500/20'} rounded-xl flex items-center justify-center`}>
              <span className="text-2xl">{metricas.lucroLiquido >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Clientes por Mês */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Clientes Atendidos por Mês</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: clientesPorMes.labels,
                datasets: [{
                  label: 'Clientes',
                  data: clientesPorMes.data,
                  backgroundColor: 'rgba(251, 191, 36, 0.6)',
                  borderColor: 'rgb(251, 191, 36)',
                  borderWidth: 1,
                  borderRadius: 8
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Gráfico de Receita vs Despesa */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Receita vs Despesa</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: receitaVsDespesa.labels,
                datasets: [
                  {
                    label: 'Receita',
                    data: receitaVsDespesa.receitas,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1,
                    borderRadius: 8
                  },
                  {
                    label: 'Despesa',
                    data: receitaVsDespesa.despesas,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderRadius: 8
                  }
                ]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'top' as const
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Gráfico de Pizza - Serviços Mais Vendidos */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Serviços Mais Vendidos</h3>
          <div className="h-64">
            {servicosMaisVendidos.labels.length > 0 ? (
              <Doughnut
                data={{
                  labels: servicosMaisVendidos.labels,
                  datasets: [{
                    data: servicosMaisVendidos.quantidade,
                    backgroundColor: [
                      'rgba(251, 191, 36, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(168, 85, 247, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                      'rgb(251, 191, 36)',
                      'rgb(59, 130, 246)',
                      'rgb(34, 197, 94)',
                      'rgb(168, 85, 247)',
                      'rgb(239, 68, 68)'
                    ],
                    borderWidth: 2
                  }]
                }}
                options={doughnutOptions}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Nenhum serviço registrado
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Evolução do Ticket Médio */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Evolução do Ticket Médio</h3>
          <div className="h-64">
            <Line
              data={{
                labels: evolucaoTicketMedio.labels,
                datasets: [{
                  label: 'Ticket Médio',
                  data: evolucaoTicketMedio.tickets,
                  borderColor: 'rgb(168, 85, 247)',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: 'rgb(168, 85, 247)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 5
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    ticks: {
                      ...chartOptions.scales.y.ticks,
                      callback: function(value) {
                        return 'R$ ' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Ranking de Serviços */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Ranking dos Serviços Mais Lucrativos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300">Posição</th>
                <th className="text-left px-4 py-3 text-gray-300">Serviço</th>
                <th className="text-center px-4 py-3 text-gray-300">Vendas</th>
                <th className="text-right px-4 py-3 text-gray-300">Receita Gerada</th>
                <th className="text-right px-4 py-3 text-gray-300">% da Receita</th>
              </tr>
            </thead>
            <tbody>
              {servicosMaisVendidos.labels.map((nome, index) => {
                const totalReceita = servicosMaisVendidos.receita.reduce((a, b) => a + b, 0);
                const porcentagem = totalReceita > 0 ? (servicosMaisVendidos.receita[index] / totalReceita) * 100 : 0;
                return (
                  <tr key={nome} className="border-t border-gray-700">
                    <td className="px-4 py-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{nome}</td>
                    <td className="px-4 py-3 text-center text-blue-400 font-semibold">
                      {servicosMaisVendidos.quantidade[index]}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">
                      R$ {servicosMaisVendidos.receita[index].toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">
                          {porcentagem.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl p-6 border border-amber-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Resumo do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">Serviço Mais Popular</p>
            <p className="text-white font-semibold">{metricas.servicoMaisVendido}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Média de Receita por Cliente</p>
            <p className="text-green-400 font-semibold">R$ {metricas.ticketMedio.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total de Despesas</p>
            <p className="text-red-400 font-semibold">R$ {metricas.totalDespesa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Margem de Lucro</p>
            <p className={`font-semibold ${metricas.totalReceita > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
              {metricas.totalReceita > 0
                ? `${((metricas.lucroLiquido / metricas.totalReceita) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

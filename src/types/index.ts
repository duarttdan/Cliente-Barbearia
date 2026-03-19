export interface Servico {
  id: string;
  codigo: string;
  nome: string;
  preco: number;
  tempoMedio: number; // em minutos
  categoria: 'cabelo' | 'barba' | 'combo' | 'outros';
  ativo: boolean;
}

export interface ServicoRealizado {
  servicoId: string;
  nome: string;
  preco: number;
  quantidade: number;
}

export type FormaPagamento = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';
export type StatusAtendimento = 'em_andamento' | 'finalizado';

export interface Cliente {
  id: string;
  nome: string;
  dataVisita: string;
  servicos: ServicoRealizado[];
  valorTotal: number;
  formaPagamento: FormaPagamento;
  status: StatusAtendimento;
  observacoes?: string;
}

export type TipoTransacao = 'receita' | 'despesa';
export type CategoriaDespesa = 'aluguel' | 'produtos' | 'energia' | 'marketing' | 'salarios' | 'manutencao' | 'outros';

export interface Transacao {
  id: string;
  data: string;
  tipo: TipoTransacao;
  valor: number;
  categoria: string;
  descricao: string;
  observacoes?: string;
  clienteId?: string;
}

export interface ResumoMensal {
  mes: string;
  totalClientes: number;
  receitaBruta: number;
  despesasTotais: number;
  lucroLiquido: number;
  ticketMedio: number;
  servicosMaisVendidos: { nome: string; quantidade: number; receita: number }[];
  comparativoMesAnterior?: {
    variacaoClientes: number;
    variacaoReceita: number;
    variacaoLucro: number;
  };
}

export type FiltroPeriodo = 'semana' | 'mes' | 'ano' | 'personalizado';

export interface Filtros {
  periodo: FiltroPeriodo;
  dataInicio?: string;
  dataFim?: string;
  servico?: string;
  formaPagamento?: FormaPagamento;
  status?: StatusAtendimento;
}

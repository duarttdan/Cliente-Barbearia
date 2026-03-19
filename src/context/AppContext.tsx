import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Servico, Cliente, Transacao, TipoTransacao, Filtros } from '../types';

interface AppContextType {
  servicos: Servico[];
  clientes: Cliente[];
  transacoes: Transacao[];
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
  adicionarServico: (servico: Omit<Servico, 'id'>) => void;
  atualizarServico: (id: string, servico: Partial<Servico>) => void;
  excluirServico: (id: string) => void;
  adicionarCliente: (cliente: Omit<Cliente, 'id'>) => void;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;
  finalizarAtendimento: (clienteId: string) => void;
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => void;
  excluirTransacao: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dados iniciais de exemplo
const servicosIniciais: Servico[] = [
  { id: '1', codigo: 'SRV001', nome: 'Corte Masculino', preco: 35, tempoMedio: 30, categoria: 'cabelo', ativo: true },
  { id: '2', codigo: 'SRV002', nome: 'Barba', preco: 25, tempoMedio: 20, categoria: 'barba', ativo: true },
  { id: '3', codigo: 'SRV003', nome: 'Combo Corte + Barba', preco: 55, tempoMedio: 45, categoria: 'combo', ativo: true },
  { id: '4', codigo: 'SRV004', nome: 'Pigmentação', preco: 40, tempoMedio: 35, categoria: 'cabelo', ativo: true },
  { id: '5', codigo: 'SRV005', nome: 'Sobrancelha', preco: 15, tempoMedio: 10, categoria: 'outros', ativo: true },
  { id: '6', codigo: 'SRV006', nome: 'Hidratação', preco: 30, tempoMedio: 25, categoria: 'cabelo', ativo: true },
];

const clientesIniciais: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    dataVisita: '2026-03-19',
    servicos: [{ servicoId: '3', nome: 'Combo Corte + Barba', preco: 55, quantidade: 1 }],
    valorTotal: 55,
    formaPagamento: 'pix',
    status: 'finalizado'
  },
  {
    id: '2',
    nome: 'Pedro Santos',
    dataVisita: '2026-03-19',
    servicos: [{ servicoId: '1', nome: 'Corte Masculino', preco: 35, quantidade: 1 }],
    valorTotal: 35,
    formaPagamento: 'dinheiro',
    status: 'finalizado'
  },
  {
    id: '3',
    nome: 'Lucas Oliveira',
    dataVisita: '2026-03-18',
    servicos: [{ servicoId: '2', nome: 'Barba', preco: 25, quantidade: 1 }, { servicoId: '5', nome: 'Sobrancelha', preco: 15, quantidade: 1 }],
    valorTotal: 40,
    formaPagamento: 'cartao_debito',
    status: 'finalizado'
  },
  {
    id: '4',
    nome: 'Carlos Mendes',
    dataVisita: '2026-03-18',
    servicos: [{ servicoId: '1', nome: 'Corte Masculino', preco: 35, quantidade: 1 }, { servicoId: '4', nome: 'Pigmentação', preco: 40, quantidade: 1 }],
    valorTotal: 75,
    formaPagamento: 'cartao_credito',
    status: 'finalizado'
  },
  {
    id: '5',
    nome: 'Marcos Lima',
    dataVisita: '2026-03-17',
    servicos: [{ servicoId: '3', nome: 'Combo Corte + Barba', preco: 55, quantidade: 1 }],
    valorTotal: 55,
    formaPagamento: 'pix',
    status: 'em_andamento'
  },
  // Dados de meses anteriores
  {
    id: '6',
    nome: 'Fernando Costa',
    dataVisita: '2026-02-15',
    servicos: [{ servicoId: '3', nome: 'Combo Corte + Barba', preco: 55, quantidade: 1 }],
    valorTotal: 55,
    formaPagamento: 'dinheiro',
    status: 'finalizado'
  },
  {
    id: '7',
    nome: 'Roberto Alves',
    dataVisita: '2026-02-10',
    servicos: [{ servicoId: '1', nome: 'Corte Masculino', preco: 35, quantidade: 1 }],
    valorTotal: 35,
    formaPagamento: 'pix',
    status: 'finalizado'
  },
  {
    id: '8',
    nome: 'Diego Pereira',
    dataVisita: '2026-02-08',
    servicos: [{ servicoId: '6', nome: 'Hidratação', preco: 30, quantidade: 1 }, { servicoId: '2', nome: 'Barba', preco: 25, quantidade: 1 }],
    valorTotal: 55,
    formaPagamento: 'cartao_debito',
    status: 'finalizado'
  },
  {
    id: '9',
    nome: 'André Santos',
    dataVisita: '2026-01-20',
    servicos: [{ servicoId: '1', nome: 'Corte Masculino', preco: 35, quantidade: 1 }],
    valorTotal: 35,
    formaPagamento: 'dinheiro',
    status: 'finalizado'
  },
  {
    id: '10',
    nome: 'Rafael Souza',
    dataVisita: '2026-01-15',
    servicos: [{ servicoId: '3', nome: 'Combo Corte + Barba', preco: 55, quantidade: 1 }, { servicoId: '5', nome: 'Sobrancelha', preco: 15, quantidade: 1 }],
    valorTotal: 70,
    formaPagamento: 'cartao_credito',
    status: 'finalizado'
  },
];

const transacoesIniciais: Transacao[] = [
  { id: '1', data: '2026-03-19', tipo: 'receita', valor: 55, categoria: 'servico', descricao: 'Combo Corte + Barba - João Silva', clienteId: '1' },
  { id: '2', data: '2026-03-19', tipo: 'receita', valor: 35, categoria: 'servico', descricao: 'Corte Masculino - Pedro Santos', clienteId: '2' },
  { id: '3', data: '2026-03-19', tipo: 'despesa', valor: 150, categoria: 'produtos', descricao: 'Compra de produtos para cabelo' },
  { id: '4', data: '2026-03-18', tipo: 'receita', valor: 40, categoria: 'servico', descricao: 'Barba + Sobrancelha - Lucas Oliveira', clienteId: '3' },
  { id: '5', data: '2026-03-18', tipo: 'receita', valor: 75, categoria: 'servico', descricao: 'Corte + Pigmentação - Carlos Mendes', clienteId: '4' },
  { id: '6', data: '2026-03-15', tipo: 'despesa', valor: 800, categoria: 'aluguel', descricao: 'Aluguel do estabelecimento - Março' },
  { id: '7', data: '2026-03-10', tipo: 'despesa', valor: 180, categoria: 'energia', descricao: 'Conta de energia elétrica' },
  { id: '8', data: '2026-03-05', tipo: 'despesa', valor: 100, categoria: 'marketing', descricao: 'Publicidade Instagram' },
  // Transações de fevereiro
  { id: '9', data: '2026-02-15', tipo: 'receita', valor: 55, categoria: 'servico', descricao: 'Combo Corte + Barba - Fernando Costa' },
  { id: '10', data: '2026-02-10', tipo: 'receita', valor: 35, categoria: 'servico', descricao: 'Corte Masculino - Roberto Alves' },
  { id: '11', data: '2026-02-08', tipo: 'receita', valor: 55, categoria: 'servico', descricao: 'Hidratação + Barba - Diego Pereira' },
  { id: '12', data: '2026-02-05', tipo: 'despesa', valor: 800, categoria: 'aluguel', descricao: 'Aluguel do estabelecimento - Fevereiro' },
  { id: '13', data: '2026-02-01', tipo: 'despesa', valor: 120, categoria: 'produtos', descricao: 'Produtos diversos' },
  // Transações de janeiro
  { id: '14', data: '2026-01-20', tipo: 'receita', valor: 35, categoria: 'servico', descricao: 'Corte Masculino - André Santos' },
  { id: '15', data: '2026-01-15', tipo: 'receita', valor: 70, categoria: 'servico', descricao: 'Combo + Sobrancelha - Rafael Souza' },
  { id: '16', data: '2026-01-05', tipo: 'despesa', valor: 800, categoria: 'aluguel', descricao: 'Aluguel do estabelecimento - Janeiro' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [servicos, setServicos] = useState<Servico[]>(() => {
    const saved = localStorage.getItem('hairstyle-servicos');
    return saved ? JSON.parse(saved) : servicosIniciais;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('hairstyle-clientes');
    return saved ? JSON.parse(saved) : clientesIniciais;
  });

  const [transacoes, setTransacoes] = useState<Transacao[]>(() => {
    const saved = localStorage.getItem('hairstyle-transacoes');
    return saved ? JSON.parse(saved) : transacoesIniciais;
  });

  const [filtros, setFiltros] = useState<Filtros>({ periodo: 'mes' });

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem('hairstyle-servicos', JSON.stringify(servicos));
  }, [servicos]);

  useEffect(() => {
    localStorage.setItem('hairstyle-clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('hairstyle-transacoes', JSON.stringify(transacoes));
  }, [transacoes]);

  const adicionarServico = (servico: Omit<Servico, 'id'>) => {
    const novoServico = { ...servico, id: Date.now().toString() };
    setServicos(prev => [...prev, novoServico]);
  };

  const atualizarServico = (id: string, servico: Partial<Servico>) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...servico } : s));
  };

  const excluirServico = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
  };

  const adicionarCliente = (cliente: Omit<Cliente, 'id'>) => {
    const novoCliente = { ...cliente, id: Date.now().toString() };
    setClientes(prev => [...prev, novoCliente]);
  };

  const atualizarCliente = (id: string, cliente: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...cliente } : c));
  };

  const excluirCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  const finalizarAtendimento = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente || cliente.status === 'finalizado') return;

    // Atualizar status do cliente
    atualizarCliente(clienteId, { status: 'finalizado' });

    // Registrar transação de receita automaticamente
    const novaTransacao: Omit<Transacao, 'id'> = {
      data: cliente.dataVisita,
      tipo: 'receita' as TipoTransacao,
      valor: cliente.valorTotal,
      categoria: 'servico',
      descricao: `${cliente.servicos.map(s => s.nome).join(', ')} - ${cliente.nome}`,
      clienteId: clienteId
    };
    adicionarTransacao(novaTransacao);
  };

  const adicionarTransacao = (transacao: Omit<Transacao, 'id'>) => {
    const novaTransacao = { ...transacao, id: Date.now().toString() };
    setTransacoes(prev => [...prev, novaTransacao]);
  };

  const excluirTransacao = (id: string) => {
    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      servicos,
      clientes,
      transacoes,
      filtros,
      setFiltros,
      adicionarServico,
      atualizarServico,
      excluirServico,
      adicionarCliente,
      atualizarCliente,
      excluirCliente,
      finalizarAtendimento,
      adicionarTransacao,
      excluirTransacao
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

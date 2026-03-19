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

// Dados iniciais vazios - começa do zero
const servicosIniciais: Servico[] = [];
const clientesIniciais: Cliente[] = [];
const transacoesIniciais: Transacao[] = [];

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

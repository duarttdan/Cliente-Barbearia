import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Servico, Cliente, Transacao, TipoTransacao, Filtros } from '../types';
import { logger } from '../utils/logger';

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
    
    logger.registrar(
      'CREATE',
      'servico',
      `Serviço "${servico.nome}" foi criado (R$ ${servico.preco.toFixed(2)})`,
      {
        nomeDados: servico.nome,
        dadosDepois: novoServico
      }
    );
  };

  const atualizarServico = (id: string, servico: Partial<Servico>) => {
    const servicoAntigo = servicos.find(s => s.id === id);
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...servico } : s));
    
    if (servicoAntigo) {
      logger.registrar(
        'UPDATE',
        'servico',
        `Serviço "${servicoAntigo.nome}" foi atualizado`,
        {
          nomeDados: servicoAntigo.nome,
          dadosAntes: servicoAntigo,
          dadosDepois: { ...servicoAntigo, ...servico }
        }
      );
    }
  };

  const excluirServico = (id: string) => {
    const servicoExcluido = servicos.find(s => s.id === id);
    setServicos(prev => prev.filter(s => s.id !== id));
    
    if (servicoExcluido) {
      logger.registrar(
        'DELETE',
        'servico',
        `Serviço "${servicoExcluido.nome}" foi deletado`,
        {
          nomeDados: servicoExcluido.nome,
          dadosAntes: servicoExcluido
        }
      );
    }
  };

  const adicionarCliente = (cliente: Omit<Cliente, 'id'>) => {
    const novoCliente = { ...cliente, id: Date.now().toString() };
    setClientes(prev => [...prev, novoCliente]);
    
    logger.registrar(
      'CREATE',
      'cliente',
      `Cliente "${cliente.nome}" foi registrado (${cliente.servicos.length} serviço(s) - R$ ${cliente.valorTotal.toFixed(2)})`,
      {
        nomeDados: cliente.nome,
        dadosDepois: novoCliente
      }
    );
  };

  const atualizarCliente = (id: string, cliente: Partial<Cliente>) => {
    const clienteAntigo = clientes.find(c => c.id === id);
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...cliente } : c));
    
    if (clienteAntigo) {
      const statusMudou = cliente.status && cliente.status !== clienteAntigo.status;
      const mensagem = statusMudou 
        ? `Cliente "${clienteAntigo.nome}" foi marcado como ${cliente.status}`
        : `Cliente "${clienteAntigo.nome}" foi atualizado`;
      
      logger.registrar(
        'UPDATE',
        'cliente',
        mensagem,
        {
          nomeDados: clienteAntigo.nome,
          dadosAntes: clienteAntigo,
          dadosDepois: { ...clienteAntigo, ...cliente }
        }
      );
    }
  };

  const excluirCliente = (id: string) => {
    const clienteExcluido = clientes.find(c => c.id === id);
    setClientes(prev => prev.filter(c => c.id !== id));
    
    if (clienteExcluido) {
      logger.registrar(
        'DELETE',
        'cliente',
        `Cliente "${clienteExcluido.nome}" foi deletado (R$ ${clienteExcluido.valorTotal.toFixed(2)})`,
        {
          nomeDados: clienteExcluido.nome,
          dadosAntes: clienteExcluido
        }
      );
    }
  };

  const finalizarAtendimento = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente || cliente.status === 'finalizado') {
      if (!cliente) {
        logger.registrar(
          'ACTION',
          'cliente',
          `Tentativa de finalizar atendimento de cliente não encontrado`,
          { status: 'erro', mensagemErro: 'Cliente não encontrado' }
        );
      }
      return;
    }

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

    logger.registrar(
      'ACTION',
      'cliente',
      `Atendimento do cliente "${cliente.nome}" foi finalizado (R$ ${cliente.valorTotal.toFixed(2)})`,
      {
        nomeDados: cliente.nome,
        dadosDepois: { clienteId, valorTotal: cliente.valorTotal }
      }
    );
  };

  const adicionarTransacao = (transacao: Omit<Transacao, 'id'>) => {
    const novaTransacao = { ...transacao, id: Date.now().toString() };
    setTransacoes(prev => [...prev, novaTransacao]);
    
    const tipoLabel = transacao.tipo === 'receita' ? 'Receita' : 'Despesa';
    logger.registrar(
      'CREATE',
      'transacao',
      `${tipoLabel} registrada - ${transacao.descricao} (R$ ${transacao.valor.toFixed(2)})`,
      {
        nomeDados: transacao.descricao,
        dadosDepois: novaTransacao
      }
    );
  };

  const excluirTransacao = (id: string) => {
    const transacaoExcluida = transacoes.find(t => t.id === id);
    setTransacoes(prev => prev.filter(t => t.id !== id));
    
    if (transacaoExcluida) {
      const tipoLabel = transacaoExcluida.tipo === 'receita' ? 'Receita' : 'Despesa';
      logger.registrar(
        'DELETE',
        'transacao',
        `${tipoLabel} foi deletada - ${transacaoExcluida.descricao} (R$ ${transacaoExcluida.valor.toFixed(2)})`,
        {
          nomeDados: transacaoExcluida.descricao,
          dadosAntes: transacaoExcluida
        }
      );
    }
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

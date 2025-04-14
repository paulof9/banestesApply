import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClientes } from '../services/api';
import { Cliente } from '../types';
import { MoonLoader } from 'react-spinners';

// Função utilitária para ordenação alfabética (case-insensitive)
const compararClientes = (a: Cliente, b: Cliente): number => {
  const nomeA = (a.nome || '').toLowerCase();
  const nomeB = (b.nome || '').toLowerCase();
  if (nomeA < nomeB) return -1;
  if (nomeA > nomeB) return 1;
  return 0;
};

const Home: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, estaCarregando] = useState<boolean>(false); // Novo estado para controlar o loading
  // Inicializa busca e página atual a partir do sessionStorage para persistência
  const [busca, setBusca] = useState<string>(() => sessionStorage.getItem('clientesBusca') || '');
  const [paginaAtual, setPaginaAtual] = useState<number>(() => {
    const storedPage = sessionStorage.getItem('clientesPagina');
    return storedPage ? parseInt(storedPage, 10) : 1;
  });

  const itensPorPagina: number = 10;
  const navigate = useNavigate();

  // Carrega e ordena os clientes na montagem inicial do componente
  useEffect(() => {
    const carregarClientes = async () => {
      estaCarregando(true); // Inicia o loading antes de buscar os dados
      try {
        const dados = await fetchClientes();
        const clientesOrdenados = [...dados].sort(compararClientes);
        setClientes(clientesOrdenados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        // Considerar adicionar um estado de erro para feedback ao usuário
      } finally {
        estaCarregando(false); // Finaliza o loading, independentemente do resultado
      }
    };
    carregarClientes();
  }, []); // Array vazio indica que executa apenas na montagem

  // Persiste busca e página atual no sessionStorage sempre que mudarem
  useEffect(() => {
    sessionStorage.setItem('clientesBusca', busca);
  }, [busca]);

  useEffect(() => {
    sessionStorage.setItem('clientesPagina', String(paginaAtual));
  }, [paginaAtual]);

  // Filtra os clientes com base no termo de busca (nome ou CPF/CNPJ)
  const clientesFiltrados = clientes.filter(cliente =>
    (cliente.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (cliente.cpfCnpj || '').includes(busca) // CPF/CNPJ geralmente não precisa de toLowerCase
  );

  // Calcula o número total de páginas com base nos resultados filtrados
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);

  // Efeito para ajustar a página atual caso ela se torne inválida após um filtro
  useEffect(() => {
    const maxPagina = Math.max(1, totalPaginas); // Garante que maxPagina seja pelo menos 1
    if (paginaAtual > maxPagina) {
      setPaginaAtual(maxPagina);
    }
  }, [totalPaginas, paginaAtual]);

  // Calcula os índices
  const indiceInicial = Math.max(0, (paginaAtual - 1)) * itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  // Navega para a página de detalhes do cliente
  const handleClienteClick = (id: string) => {
    navigate(`/cliente/${id}`);
  };

  // Altera a página atual, garantindo que o valor esteja dentro dos limites válidos
  const handlePaginaChange = (novaPagina: number) => {
    const paginaValida = Math.max(1, Math.min(novaPagina, totalPaginas || 1));
    setPaginaAtual(paginaValida);
  };

  // Atualiza o termo de busca e reseta para a primeira página
  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Clientes</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={handleBuscaChange}
        className="border px-4 py-2 rounded w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" // Exemplo: troquei ring-banestes por blue
      />

      {/* Mensagens de estado: Carregando ou Nenhum resultado */}
      {carregando ? (
        <div className="flex justify-center items-center ">
          <MoonLoader color="#007bff" size={50} />
        </div>
      ) : (
        <>
          {clientes.length === 0 && !busca && (
            <p className="text-center text-gray-500 my-4">Nenhum cliente cadastrado ainda.</p>
          )}
          {clientes.length > 0 && clientesFiltrados.length === 0 && busca && (
            <p className="text-center text-gray-500 my-4">Nenhum cliente encontrado para "{busca}".</p>
          )}

          {/* Lista de Clientes Paginados */}
          {clientesPaginados.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesPaginados.map(cliente => (
                <li key={cliente.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div
                    onClick={() => handleClienteClick(cliente.id)}
                    className="block hover:bg-gray-50 p-2 rounded cursor-pointer"
                  >
                    <p className="font-semibold text-lg">{cliente.nome || 'Nome não informado'}</p>
                    <p className="text-sm text-gray-600">{cliente.cpfCnpj || 'CPF/CNPJ não informado'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Controles de Paginação */}
          {totalPaginas > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {Array.from({ length: totalPaginas }, (_, i) => {
                const numeroPagina = i + 1;
                const isCurrent = numeroPagina === paginaAtual;
                return (
                  <button
                    key={numeroPagina}
                    onClick={() => handlePaginaChange(numeroPagina)}
                    disabled={isCurrent}
                    className={`px-4 py-1 rounded border transition ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-medium cursor-default' // Exemplo: troquei cor banestes por blue
                        : 'bg-white hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
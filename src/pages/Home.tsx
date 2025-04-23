import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { fetchClientes } from '../services/api';
import { Cliente } from '../types';
import { MoonLoader } from 'react-spinners';

// Função de comparação para ordenar os clientes pelo nome de forma alfabética
const compararClientes = (a: Cliente, b: Cliente): number => {
  const nomeA = (a.nome || '').toLowerCase();
  const nomeB = (b.nome || '').toLowerCase();
  if (nomeA < nomeB) return -1;
  if (nomeA > nomeB) return 1;
  return 0;
};

const Home: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, estaCarregando] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>(() => sessionStorage.getItem('clientesBusca') || '');
  const [paginaAtual, setPaginaAtual] = useState<number>(() => {
    const storedPage = sessionStorage.getItem('clientesPagina');
    return storedPage ? parseInt(storedPage, 10) : 1;
  });

  const itensPorPagina: number = 10;
  const navigate = useNavigate();

  // Carregar clientes ao montar o componente
  useEffect(() => {
    const carregarClientes = async () => {
      estaCarregando(true);
      try {
        const dados = await fetchClientes();
        const clientesOrdenados = [...dados].sort(compararClientes); // Ordenar os clientes por nome
        setClientes(clientesOrdenados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        estaCarregando(false);
      }
    };
    carregarClientes();
  }, []);

  // Atualizar busca no sessionStorage sempre que o valor de busca mudar
  useEffect(() => {
    sessionStorage.setItem('clientesBusca', busca);
  }, [busca]);

  // Atualizar página atual no sessionStorage sempre que a página mudar
  useEffect(() => {
    sessionStorage.setItem('clientesPagina', String(paginaAtual));
  }, [paginaAtual]);

  // Filtrar clientes baseado na busca (nome ou CPF/CNPJ)
  const clientesFiltrados = clientes.filter(cliente =>
    (cliente.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (cliente.cpfCnpj || '').includes(busca)
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);

  // Ajustar a página atual caso o número de páginas tenha mudado
  useEffect(() => {
    if (clientes.length === 0) return;

    const maxPagina = Math.max(1, totalPaginas);
    if (paginaAtual > maxPagina) {
      setPaginaAtual(maxPagina);
    }
  }, [totalPaginas, paginaAtual, clientes]);

  // Calcular o índice inicial para a páginação
  const indiceInicial = Math.max(0, (paginaAtual - 1)) * itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  // Navegar para a página de detalhes do cliente
  const handleClienteClick = (id: string) => {
    navigate(`/cliente/${id}`);
  };

  // Mudar para uma nova página
  const handlePaginaChange = (novaPagina: number) => {
    const paginaValida = Math.max(1, Math.min(novaPagina, totalPaginas || 1));
    setPaginaAtual(paginaValida);
  };

  // Atualizar o valor da busca e resetar a página para a 1
  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Helmet>
        <title>Lista de Clientes - Banestes</title>
        <meta
          name="description"
          content="Visualize e gerencie a lista de clientes cadastrados no sistema de processo seletivo do Banestes. Filtre, pagine e acesse os detalhes de cada cliente."
        />
      </Helmet>

      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Clientes</h1>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={handleBuscaChange}
        className="border px-4 py-2 rounded w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {carregando ? (
        <div className="flex justify-center items-center ">
          <MoonLoader color="#007bff" size={50} />
        </div>
      ) : (
        <>
          {/* Mensagens de estado quando não há clientes ou não encontrados */}
          {clientes.length === 0 && !busca && (
            <p className="text-center text-gray-500 my-4">Nenhum cliente cadastrado ainda.</p>
          )}
          {clientes.length > 0 && clientesFiltrados.length === 0 && busca && (
            <p className="text-center text-gray-500 my-4">Nenhum cliente encontrado para "{busca}".</p>
          )}

          {/* Exibição dos clientes paginados */}
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

          {/* Navegação entre páginas */}
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
                        ? 'bg-banestes-500 text-white font-medium cursor-default'
                        : 'bg-white hover:bg-banestes-300 disabled:opacity-50 disabled:cursor-not-allowed'
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

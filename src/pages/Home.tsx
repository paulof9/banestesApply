import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClientes } from '../services/api';
import { Cliente } from '../types';

// Compara clientes alfabeticamente por nome (case-insensitive).
const compararClientes = (a: Cliente, b: Cliente) => {
  const nomeA = (a.nome || '').toLowerCase();
  const nomeB = (b.nome || '').toLowerCase();
  if (nomeA < nomeB) return -1;
  if (nomeA > nomeB) return 1;
  return 0;
};

// Exibe a lista de clientes paginada e permite busca.
const Home = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  // Mantém a página atual da lista, persistindo no sessionStorage.
  const [paginaAtual, setPaginaAtual] = useState(() => {
    const storedPage = sessionStorage.getItem('clientesPagina');
    return storedPage ? parseInt(storedPage, 10) : 1;
  });
  const itensPorPagina = 10;
  const navigate = useNavigate();

  // Carrega e ordena os clientes na montagem inicial.
  useEffect(() => {
    const carregarClientes = async () => {
      const dados = await fetchClientes();
      const clientesOrdenados = [...dados].sort(compararClientes);
      setClientes(clientesOrdenados);
    };
    carregarClientes();
  }, []);

  // Salva a página atual no sessionStorage sempre que ela muda.
  useEffect(() => {
    sessionStorage.setItem('clientesPagina', String(paginaAtual));
  }, [paginaAtual]);

  // Filtra clientes por nome ou CPF/CNPJ (case-insensitive).
  const clientesFiltrados = clientes.filter(cliente =>
    (cliente.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (cliente.cpfCnpj || '').includes(busca)
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
  // Obtém os clientes para a página atual.
  const clientesPaginados = clientesFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Salva a página atual e navega para os detalhes do cliente.
  const handleClienteClick = (id: string) => {
    sessionStorage.setItem('clientesPagina', String(paginaAtual));
    navigate(`/cliente/${id}`);
  };

  // Atualiza a página atual.
  const handlePaginaChange = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Clientes</h1>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={e => {
          setBusca(e.target.value);
          setPaginaAtual(1); // Reseta a página ao iniciar nova busca.
        }}
        className="border px-4 py-2 rounded w-full mb-6 focus:outline-none focus:ring-2 focus:ring-banestes-300"
      />

      {/* Lista de clientes */}
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

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePaginaChange(i + 1)}
              className={`px-4 py-1 rounded border transition ${
                i + 1 === paginaAtual
                  ? 'bg-banestes-500 text-white font-medium'
                  : 'bg-white hover:bg-banestes-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
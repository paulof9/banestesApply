import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchClientes } from '../services/api';
import { Cliente } from '../types';

const Home = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    const carregarClientes = async () => {
      const dados = await fetchClientes();
      setClientes(dados);
    };
    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpfCnpj.includes(busca)
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
  const clientesPaginados = clientesFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Clientes</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={e => {
          setBusca(e.target.value);
          setPaginaAtual(1);
        }}
        className="border px-4 py-2 rounded w-full mb-6 focus:outline-none focus:ring-2 focus:ring-banestes-300"
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesPaginados.map(cliente => (
          <li key={cliente.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
            <Link
              to={`/cliente/${cliente.id}`}
              className="block hover:bg-gray-50 p-2 rounded"
            >
              <p className="font-semibold text-lg">{cliente.nome || 'Nome não informado'}</p>
              <p className="text-sm text-gray-600">{cliente.cpfCnpj || 'CPF/CNPJ não informado'}</p>
            </Link>
          </li>
        ))}
      </ul>

      {totalPaginas > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaAtual(i + 1)}
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

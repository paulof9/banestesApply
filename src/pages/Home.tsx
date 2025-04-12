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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Lista de Clientes</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="border px-2 py-1 rounded mb-4 w-full"
      />

<ul>
  {clientesPaginados.map(cliente => (
    <li key={cliente.id} className="border-b py-2">
      <Link
        to={`/cliente/${cliente.cpfCnpj}`}
        className="block hover:bg-gray-50 p-2 rounded"
      >
        <p className="font-semibold">{cliente.nome}</p>
        <p className="text-sm text-gray-600">{cliente.cpfCnpj}</p>
      </Link>
    </li>
  ))}
</ul>

      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            onClick={() => setPaginaAtual(i + 1)}
            className={`px-3 py-1 border rounded ${
              i + 1 === paginaAtual ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;

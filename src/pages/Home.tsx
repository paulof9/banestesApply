import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClientes } from '../services/api'; // Importa a função para buscar os dados dos clientes da API.
import { Cliente } from '../types'; // Importa a interface Cliente para tipagem.

// Compara clientes com base em seus nomes para ordenar
const compararClientes = (a: Cliente, b: Cliente) => {
  const nomeA = (a.nome || '').toLowerCase();
  const nomeB = (b.nome || '').toLowerCase();

  if (nomeA < nomeB) {
    return -1;
  }
  if (nomeA > nomeB) {
    return 1;
  }
  return 0;
};

// Componente que exibe a lista de clientes na página inicial.
const Home = () => {
  // Define um estado para armazenar a lista de clientes, inicialmente um array vazio.
  const [clientes, setClientes] = useState<Cliente[]>([]);
  // Define um estado para controlar o termo de busca inserido pelo usuário.
  const [busca, setBusca] = useState('');
  // Define um estado para controlar a página atual da lista paginada, iniciando na página 1.
  const [paginaAtual, setPaginaAtual] = useState(() => {
    const storedPage = sessionStorage.getItem('clientesPagina');
    return storedPage ? parseInt(storedPage, 10) : 1;
  });
  // Define o número de itens (clientes) a serem exibidos por página.
  const itensPorPagina = 10;
  const navigate = useNavigate(); // Inicialize useNavigate

  useEffect(() => {
    // Função assíncrona para carregar os dados dos clientes e ordená-los alfabeticamente por nome.
    const carregarClientes = async () => {
      const dados = await fetchClientes(); // Chama a função para buscar os dados dos clientes da API.

      /* Cria uma cópia do array 'dados' usando o spread operator (...) e então ordena essa cópia usando a função 'compararClientes'.
       * Importante para não modificar o estado 'clientes' diretamente.*/
      const clientesOrdenados = [...dados].sort(compararClientes);

      // Atualiza o estado 'clientes' com o array ordenado.
      setClientes(clientesOrdenados);
    };

    // Chama a função 'carregarClientes' para iniciar o processo de busca e ordenação dos dados.
    carregarClientes();
  }, []); // Será executado apenas uma vez.

  // Filtra a lista de clientes com base no termo de busca. A busca é case-insensitive e procura por nome ou CPF/CNPJ.
  const clientesFiltrados = clientes.filter(cliente =>
    (cliente.nome || '').toLowerCase().includes(busca.toLowerCase()) || // Verifica se o nome do cliente (tratando undefined como '') inclui o termo de busca (em minúsculas).
    (cliente.cpfCnpj || '').includes(busca) // Verifica se o CPF/CNPJ do cliente (tratando undefined como '') inclui o termo de busca.
  );

  // Calcula o número total de páginas com base no número de clientes filtrados e itens por página.
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
  // Obtém a porção de clientes filtrados para a página atual.
  const clientesPaginados = clientesFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina, // Calcula o índice inicial.
    paginaAtual * itensPorPagina // Calcula o índice final.
  );

  // Função para lidar com o clique no cliente e salvar a página atual antes de navegar.
  const handleClienteClick = (id: string) => {
    sessionStorage.setItem('clientesPagina', String(paginaAtual)); // Salva a página atual
    navigate(`/cliente/${id}`); // Navega para a página de detalhes do cliente.
  };

  // Função para atualizar o estado da página atual.
  const handlePaginaChange = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Clientes</h1>

      {/* Input de busca para filtrar os clientes */}
      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={e => {
          setBusca(e.target.value); // Atualiza o estado 'busca' com o valor do input.
          setPaginaAtual(1); // Reseta a página atual para 1 sempre que o termo de busca muda.
        }}
        className="border px-4 py-2 rounded w-full mb-6 focus:outline-none focus:ring-2 focus:ring-banestes-300"
      />

      {/* Lista de clientes paginada */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesPaginados.map(cliente => (
          // Item da lista para cada cliente
          <li key={cliente.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
            <div
              onClick={() => handleClienteClick(cliente.id)}
              className="block hover:bg-gray-50 p-2 rounded cursor-pointer"
            >
              {/* Exibe o nome do cliente ou uma mensagem se o nome não estiver disponível */}
              <p className="font-semibold text-lg">{cliente.nome || 'Nome não informado'}</p>
              {/* Exibe o CPF/CNPJ do cliente ou uma mensagem se não estiver disponível */}
              <p className="text-sm text-gray-600">{cliente.cpfCnpj || 'CPF/CNPJ não informado'}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Seção de paginação (apenas se houver mais de uma página) */}
      {totalPaginas > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {/* Cria botões para cada página */}
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePaginaChange(i + 1)} // Define a página atual ao clicar no botão.
              className={`px-4 py-1 rounded border transition ${
                i + 1 === paginaAtual
                  ? 'bg-banestes-500 text-white font-medium' // Estilo para o botão da página atual.
                  : 'bg-white hover:bg-banestes-300' // Estilo para os outros botões de página.
              }`}
            >
              {i + 1} {/* Exibe o número da página no botão */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
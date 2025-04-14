import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchClientes, fetchContas, fetchAgencias } from '../services/api';
import { Cliente, Conta, Agencia } from '../types';
import { MoonLoader } from 'react-spinners';

// Função para formatar valores monetários
function formatarMoeda(valor: string | number | null | undefined): string {
  console.log('Valor recebido:', valor);

  // Verifica se o valor é nulo, indefinido, string vazia ou não é um número válido após a tentativa de conversão.
  if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) {
    console.log('Valor inválido ou vazio');
    return 'informação indisponível';
  }

  try {
    let numero: number;

    // Verifica o tipo do valor recebido
    if (typeof valor === 'string') {
      // Remove o símbolo "R$", pontos e substitui a vírgula por ponto.
      const valorLimpo = valor
        .replace('R$', '')         // Remove R$.
        .replace(/\./g, '')        // Remove todos os pontos.
        .replace(',', '.')         // Substitui a vírgula pelo ponto para garantir que parseFloat funcione corretamente.
        .trim();                   // Remove espaços em branco no início e no final da string.

      console.log('Valor limpo:', valorLimpo);

      // Tenta converter a string limpa para número.
      numero = parseFloat(valorLimpo);

      // Verifica se o resultado da conversão não é um número válido (NaN).
      if (isNaN(numero)) {
        console.log('Valor limpo não é um número válido, tratando como 0');
        numero = 0;
      }
    } else if (typeof valor === 'number') {
      numero = valor; // Se o valor já for um número, utiliza-o.
    } else {
      console.log('Tipo de valor inesperado');
      return 'informação indisponível';
    }

    console.log('Valor numérico após conversão:', numero);
    // Formata o número para BRL.
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (err) {
    console.error('Erro ao formatar valor:', err);
    return 'informação indisponível';
  }
}

// Componente para exibir os detalhes de um cliente específico.
const ClienteDetalhes = () => {
  // Obtém o parâmetro 'id' da URL usando o useParams do react-router-dom.
  const { id } = useParams<{ id: string }>();
  // Define estados para armazenar os dados do cliente, suas contas bancárias, a agência bancária e o status de carregamento.
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Hook useEffect para buscar os dados do cliente, suas contas e a agência quando o componente é montado ou quando o 'id' da URL muda.
  useEffect(() => {
    // Função assíncrona para carregar os dados necessários.
    const carregarDados = async () => {
      // Utiliza Promise.all para buscar os dados de clientes, contas e agências em paralelo.
      const [clientes, contas, agencias] = await Promise.all([
        fetchClientes(),
        fetchContas(),
        fetchAgencias(),
      ]);

      // Encontra o cliente selecionado com base no 'id' da URL.
      const clienteSelecionado = clientes.find(c => String(c.id) === id);
      setCliente(clienteSelecionado || null); // Atualiza o estado do cliente com o cliente encontrado ou null se não encontrado.

      // Se um cliente foi selecionado, filtra as contas e encontra a agência correspondente.
      if (clienteSelecionado) {
        setContas(contas.filter(c => c.cpfCnpjCliente === clienteSelecionado.cpfCnpj)); // Filtra as contas do cliente selecionado pelo CPF/CNPJ.
        setAgencia(agencias.find(a => a.codigo === clienteSelecionado.codigoAgencia) || null); // Encontra a agência pelo código da agência do cliente.
      }

      setCarregando(false); // Define o estado de carregamento para falso após a conclusão da busca de dados.
    };

    carregarDados(); // Chama a função para carregar os dados.
  }, [id]); // O useEffect será executado novamente se o valor de 'id' mudar.

  // Loading enquanto os dados estão sendo buscados ou mensagem se o cliente nao for encontrado.
  if (carregando) return (
    <div className="flex justify-center items-center h-screen pb-16">
    <MoonLoader color="#007bff" loading={carregando} size={50} />
  </div>
  );
  if (!cliente) return <div className="p-4 text-red-500">Cliente não encontrado.</div>;

  // Renderiza os detalhes do cliente e suas informações relacionadas.
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Link do botão para voltar à página inicial */}
      <Link
        to="/"
        className="mx-auto lg:mx-0 hover:underline bg-banestes-400 text-white font-bold rounded-full my-2 py-2 px-4 shadow-md focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out mb-4 inline-block"
      >
        ← Voltar
      </Link>

      {/* Nome do cliente como título */}
      <h1 className="text-2xl font-bold">{cliente.nome || 'Nome não informado'}</h1>
      {/* Email do cliente */}
      <p className="text-gray-700">{cliente.email || 'Email não informado'}</p>
      {/* CPF/CNPJ do cliente */}
      <p className="text-gray-700">CPF/CNPJ: {cliente.cpfCnpj || 'Não informado'}</p>
      {/* Data de nascimento do cliente, formatada para dd/mm/aaaa */}
      <p className="text-gray-700">
        Data de nascimento:{' '}
        {cliente.dataNascimento
          ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : 'Não informada'}
      </p>
      {/* Renda anual do cliente, formatada como moeda */}
      <p className="text-gray-700">Renda anual: {formatarMoeda(cliente.rendaAnual)}</p>
      {/* Patrimônio do cliente, formatado como moeda */}
      <p className="text-gray-700">Patrimônio: {formatarMoeda(cliente.patrimonio)}</p>
      {/* Estado civil do cliente */}
      <p className="text-gray-700">Estado civil: {cliente.estadoCivil || 'Não informado'}</p>

      {/* Seção para exibir as contas bancárias do cliente */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Contas bancárias</h2>
      {/* Verifica se o cliente possui contas cadastradas */}
      {contas.length > 0 ? (
        <ul className="space-y-2">
          {/* Mapeia as contas do cliente para exibir cada uma em um item da lista */}
          {contas.map(conta => (
            <li key={conta.id} className="border rounded p-2">
              {/* Tipo daPacmanLoader conta */}
              <p><strong>Tipo:</strong> {conta.tipo || 'Tipo não informado'}</p>
              {/* Saldo da conta, formatado como moeda */}
              <p><strong>Saldo:</strong> {formatarMoeda(conta.saldo)}</p>
              {/* Limite de crédito da conta, formatado como moeda */}
              <p><strong>Limite de crédito:</strong> {formatarMoeda(conta.limiteCredito)}</p>
              {/* Crédito disponível da conta, formatado como moeda */}
              <p><strong>Crédito disponível:</strong> {formatarMoeda(conta.creditoDisponivel)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Este cliente não possui contas cadastradas.</p>
      )}

      {/* Seção para exibir informações da agência bancária do cliente */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Agência</h2>
      {/* Verifica se a agência foi encontrada */}
      {agencia ? (
        <>
          {/* Nome da agência */}
          <p><strong>Nome:</strong> {agencia.nome || 'Não informado'}</p>
          {/* Endereço da agência */}
          <p><strong>Endereço:</strong> {agencia.endereco || 'Não informado'}</p>
        </>
      ) : (
        <p className="text-gray-500">Agência não identificada ou não vinculada.</p>
      )}
    </div>
  );
};

export default ClienteDetalhes;
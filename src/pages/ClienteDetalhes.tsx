import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchClientes, fetchContas, fetchAgencias } from '../services/api';
import { Cliente, Conta, Agencia } from '../types';
import { MoonLoader } from 'react-spinners';
import { Helmet } from 'react-helmet-async';
// Remova a importação do hook useGoogleMaps
// import useGoogleMaps from '../hooks/useGoogleMaps';

function formatarMoeda(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) return 'informação indisponível';
  try {
    let numero: number;
    if (typeof valor === 'string') {
      const valorLimpo = valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
      numero = parseFloat(valorLimpo);
      if (isNaN(numero)) numero = 0;
    } else if (typeof valor === 'number') numero = valor;
    else return 'informação indisponível';
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (err) {
    console.error('Erro ao formatar valor:', err);
    return 'informação indisponível';
  }
}

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [exibirMapa, setExibirMapa] = useState(false);
  // Remova as referências ao mapa da API JavaScript
  // const [carregandoMapa, setCarregandoMapa] = useState(false);
  // const [map, setMap] = useState<google.maps.Map | null>(null);
  // const mapRef = useRef<HTMLDivElement>(null);
  // const { isLoaded: isGoogleMapsLoaded, googleMaps, loadError: googleMapsLoadError } = useGoogleMaps("AIzaSyDeEicRyYhAnJ1qSU6gvYGAep1oyFupABo", ['places']);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [clientes, contas, agencias] = await Promise.all([fetchClientes(), fetchContas(), fetchAgencias()]);
        const clienteSelecionado = clientes.find(c => c.id === id);
        setCliente(clienteSelecionado || null);
        if (clienteSelecionado) {
          setContas(contas.filter(c => c.cpfCnpjCliente === clienteSelecionado.cpfCnpj));
          setAgencia(agencias.find(a => a.codigo === clienteSelecionado.codigoAgencia) || null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregandoDados(false);
      }
    };
    carregarDados();
  }, [id]);

  const iniciarCarregamentoMapa = () => {
    console.log("Botão 'Mostrar Localização da Agência' clicado!");
    setExibirMapa(true);
  };

  // Remova o useEffect relacionado à inicialização do mapa da API JavaScript
  // useEffect(() => { ... }, [exibirMapa, agencia, isGoogleMapsLoaded, googleMaps, geocodeAndAddMarker, map]);

  if (carregandoDados) return <div className="flex justify-center items-center h-32"><MoonLoader color="#007bff" loading={carregandoDados} size={50} /></div>;
  if (!cliente) return <div className="p-4 text-red-500">Cliente não encontrado.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Helmet>
        <title>Detalhes do Cliente - [Nome da Sua Instituição/Empresa]</title>
        <meta
          name="description"
          content={`Visualize informações detalhadas sobre o cliente ${cliente?.nome || 'Não Informado'} no sistema de processo seletivo de [Nome da Sua Instituição/Empresa]. Inclui dados pessoais, contas bancárias e, opcionalmente, a localização da agência.`}
        />
      </Helmet>
      <Link to="/" className="mx-auto lg:mx-0 hover:underline bg-banestes-400 text-white font-bold rounded-full my-2 py-2 px-4 shadow-md focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out mb-4 inline-block">← Voltar</Link>
      <h1 className="text-2xl font-bold">{cliente?.nomeSocial ? cliente.nomeSocial : cliente?.nome || 'Nome não informado'}</h1>
      <p className="text-gray-700">{cliente?.email || 'Email não informado'}</p>
      <p className="text-gray-700">{cliente?.cpfCnpj ? `CPF/CNPJ: ${cliente.cpfCnpj}` : cliente?.rg ? `RG: ${cliente.rg}` : 'CPF/CNPJ ou RG Não informado'}</p>
      <p className="text-gray-700">Data de nascimento: {cliente?.dataNascimento ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Não informada'}</p>
      <p className="text-gray-700">Renda anual: {formatarMoeda(cliente?.rendaAnual)}</p>
      <p className="text-gray-700">Patrimônio: {formatarMoeda(cliente?.patrimonio)}</p>
      <p className="text-gray-700">Estado civil: {cliente?.estadoCivil || 'Não informado'}</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contas bancárias</h2>
      {contas.length > 0 ? (
        <ul className="space-y-2">
          {contas.map(conta => (
            <li key={conta.id} className="border rounded p-2">
              <p><strong>Tipo:</strong> {conta?.tipo || 'Tipo não informado'}</p>
              <p><strong>Saldo:</strong> {formatarMoeda(conta?.saldo)}</p>
              <p><strong>Limite de crédito:</strong> {formatarMoeda(conta?.limiteCredito)}</p>
              <p><strong>Crédito disponível:</strong> {formatarMoeda(conta?.creditoDisponivel)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Este cliente não possui contas cadastradas.</p>
      )}
      <h2 className="text-xl font-semibold mt-6 mb-2">Agência</h2>
      {agencia ? (
        <>
          <p><strong>Nome:</strong> {agencia?.nome || 'Não informado'}</p>
          <p><strong>Endereço:</strong> {agencia?.endereco || 'Não informado'}</p>
          {!exibirMapa && (
            <button onClick={iniciarCarregamentoMapa} className="bg-banestes-400 hover:bg-banestes-500 text-white font-bold py-2 px-4 rounded mt-2 shadow-md focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out mb-4 inline-block" disabled={!agencia}>
              Mostrar Localização da Agência
            </button>
          )}
          {exibirMapa && (
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${"AIzaSyDeEicRyYhAnJ1qSU6gvYGAep1oyFupABo"}&q=${encodeURIComponent(`Banestes ${agencia.nome}, ${agencia.endereco}`)}`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              title={`Mapa da agência ${agencia.nome}`}
            ></iframe>
          )}
        </>
      ) : (
        <p className="text-gray-500">Agência não encontrada.</p>
      )}
    </div>
  );
};

export default ClienteDetalhes;
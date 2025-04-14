import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchClientes, fetchContas, fetchAgencias } from '../services/api';
import { Cliente, Conta, Agencia } from '../types';
import { MoonLoader } from 'react-spinners';

// Formata um valor para a representação monetária em Real Brasileiro (BRL).
// Retorna 'informação indisponível' se o valor for inválido.
function formatarMoeda(valor: string | number | null | undefined): string {
  console.log('Valor recebido:', valor);

  if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) {
    console.log('Valor inválido ou vazio');
    return 'informação indisponível';
  }

  try {
    let numero: number;

    if (typeof valor === 'string') {
      // Limpa a string removendo "R$", pontos e substituindo vírgula por ponto para análise.
      const valorLimpo = valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
      console.log('Valor limpo:', valorLimpo);
      numero = parseFloat(valorLimpo);
      if (isNaN(numero)) {
        console.log('Valor limpo não é um número válido, tratando como 0');
        numero = 0;
      }
    } else if (typeof valor === 'number') {
      numero = valor;
    } else {
      console.log('Tipo de valor inesperado');
      return 'informação indisponível';
    }

    console.log('Valor numérico após conversão:', numero);
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch (err) {
    console.error('Erro ao formatar valor:', err);
    return 'informação indisponível';
  }
}

// Componente para exibir os detalhes de um cliente específico.
const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null); // Estado para o objeto do mapa
  const mapRef = useRef<HTMLDivElement>(null); // Referência para o elemento div do mapa

  // Busca os dados do cliente, suas contas e a agência ao montar o componente ou quando o 'id' da URL muda.
  useEffect(() => {
    const carregarDados = async () => {
      const [clientes, contas, agencias] = await Promise.all([
        fetchClientes(),
        fetchContas(),
        fetchAgencias(),
      ]);

      console.log('Dados brutos dos clientes:', clientes); // LOG: Verificando os dados brutos

      const clienteSelecionado = clientes.find(c => c.id === id);
      setCliente(clienteSelecionado || null);

      console.log('clienteSelecionado:', clienteSelecionado); // LOG: Verificando o cliente selecionado

      if (clienteSelecionado) {
        setContas(contas.filter(c => c.cpfCnpjCliente === clienteSelecionado.cpfCnpj));
        setAgencia(agencias.find(a => a.codigo === clienteSelecionado.codigoAgencia) || null);
      }

      setCarregando(false);
    };

    carregarDados();
  }, [id]);

  // Inicializa o mapa quando a agência é carregada e a API do Google Maps estiver disponível.
  useEffect(() => {
    if (agencia && mapRef.current && !map && window.google) {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: -20.8358, lng: -40.7161 }, // Centro inicial (Piúma, ES - você pode ajustar)
        zoom: 15, // Nível de zoom inicial
      };
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // Adiciona "Banestes" ao endereço para a pesquisa de geocoding, buscando uma localização mais precisa.
      const enderecoCompleto = `Banestes ${agencia.nome}, ${agencia.endereco}`;
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode(
        { address: enderecoCompleto },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results && results.length > 0) {
            new window.google.maps.Marker({
              map: newMap,
              position: results[0].geometry.location,
              title: agencia.nome || 'Agência',
            });
            newMap.setCenter(results[0].geometry.location); // Centraliza o mapa na localização da agência encontrada.
          } else {
            console.error('Geocoding falhou:', status);
            geocoder.geocode(
              { address: agencia.endereco },
              (fallbackResults: google.maps.GeocoderResult[] | null, fallbackStatus: google.maps.GeocoderStatus) => {
                if (fallbackStatus === 'OK' && fallbackResults && fallbackResults.length > 0) {
                  new window.google.maps.Marker({
                    map: newMap,
                    position: fallbackResults[0].geometry.location,
                    title: agencia.nome || 'Agência (Localização aproximada)',
                  });
                  newMap.setCenter(fallbackResults[0].geometry.location); // Centraliza o mapa na localização aproximada.
                } else {
                  console.error('Geocoding falhou novamente com o endereço simples:', fallbackStatus);
                }
              }
            );
          }
        }
      );
    }
  }, [agencia, map, mapRef]); // Depende de 'agencia' para buscar o endereço e 'mapRef' para o container do mapa.

  // Exibe um loader enquanto os dados são carregados.
  if (carregando) return (
    <div className="flex justify-center items-center h-96">
      <MoonLoader color="#007bff" loading={carregando} size={50} />
    </div>
  );

  // Exibe uma mensagem se o cliente não for encontrado.
  if (!cliente) return <div className="p-4 text-red-500">Cliente não encontrado.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Botão para voltar à lista de clientes */}
      <Link
        to="/"
        className="mx-auto lg:mx-0 hover:underline bg-banestes-400 text-white font-bold rounded-full my-2 py-2 px-4 shadow-md focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out mb-4 inline-block"
      >
        ← Voltar
      </Link>

      {/* Informações do cliente */}
      <h1 className="text-2xl font-bold">
        {cliente?.nomeSocial ? cliente.nomeSocial : cliente?.nome || 'Nome não informado'}
      </h1>
      <p className="text-gray-700">{cliente?.email || 'Email não informado'}</p>
      <p className="text-gray-700">
        {cliente?.cpfCnpj ? (
          `CPF/CNPJ: ${cliente.cpfCnpj}`
        ) : cliente?.rg ? (
          `RG: ${cliente.rg}`
        ) : (
          'CPF/CNPJ ou RG Não informado'
        )}
      </p>
      <p className="text-gray-700">
        Data de nascimento:{' '}
        {cliente?.dataNascimento
          ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : 'Não informada'}
      </p>
      <p className="text-gray-700">Renda anual: {formatarMoeda(cliente?.rendaAnual)}</p>
      <p className="text-gray-700">Patrimônio: {formatarMoeda(cliente?.patrimonio)}</p>
      <p className="text-gray-700">Estado civil: {cliente?.estadoCivil || 'Não informado'}</p>

      {/* Contas bancárias do cliente */}
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

      {/* Informações da agência bancária */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Agência</h2>
      {agencia ? (
        <>
          <p><strong>Nome:</strong> {agencia?.nome || 'Não informado'}</p>
          <p><strong>Endereço:</strong> {agencia?.endereco || 'Não informado'}</p>
          {/* Container para o mapa da agência */}
          <div ref={mapRef} style={{ height: '200px', width: '100%', marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}></div>
        </>
      ) : (
        <p className="text-gray-500">Agência não identificada ou não vinculada.</p>
      )}
    </div>
  );
};

export default ClienteDetalhes;
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchClientes, fetchContas, fetchAgencias } from '../services/api';
import { Cliente, Conta, Agencia } from '../types';

const ClienteDetalhes = () => {
  const { cpfCnpj } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      const [clientes, contas, agencias] = await Promise.all([
        fetchClientes(),
        fetchContas(),
        fetchAgencias(),
      ]);

      const clienteSelecionado = clientes.find(c => c.cpfCnpj === cpfCnpj);
      setCliente(clienteSelecionado || null);

      if (clienteSelecionado) {
        setContas(contas.filter(c => c.cpfCnpjCliente === clienteSelecionado.cpfCnpj));
        setAgencia(agencias.find(a => a.codigo === clienteSelecionado.codigoAgencia) || null);
      }

      setCarregando(false);
    };

    carregarDados();
  }, [cpfCnpj]);

  if (carregando) return <div className="p-4">Carregando cliente...</div>;
  if (!cliente) return <div className="p-4 text-red-500">Cliente não encontrado.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Link to="/" className="text-blue-500 underline mb-4 inline-block">← Voltar</Link>

      <h1 className="text-2xl font-bold">{cliente.nome}</h1>
      <p className="text-gray-700">{cliente.email || 'Email não informado'}</p>
      <p className="text-gray-700">CPF/CNPJ: {cliente.cpfCnpj}</p>
      <p className="text-gray-700">
        Data de nascimento: {cliente.dataNascimento ? cliente.dataNascimento.toLocaleDateString() : 'Não informado'}
      </p>
      <p className="text-gray-700">Renda anual: R$ {cliente.rendaAnual?.toLocaleString() || '0,00'}</p>
      <p className="text-gray-700">Patrimônio: R$ {cliente.patrimonio?.toLocaleString() || '0,00'}</p>
      <p className="text-gray-700">Estado civil: {cliente.estadoCivil || 'Não informado'}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contas bancárias</h2>
      {contas.length > 0 ? (
        <ul className="space-y-2">
          {contas.map(conta => (
            <li key={conta.id} className="border rounded p-2">
              <p><strong>Tipo:</strong> {conta.tipo}</p>
              <p><strong>Saldo:</strong> R$ {conta.saldo.toLocaleString()}</p>
              <p><strong>Limite de crédito:</strong> R$ {conta.limiteCredito.toLocaleString()}</p>
              <p><strong>Crédito disponível:</strong> R$ {conta.creditoDisponivel.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Este cliente não possui contas cadastradas.</p>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Agência</h2>
      {agencia ? (
        <>
          <p><strong>Nome:</strong> {agencia.nome}</p>
          <p><strong>Endereço:</strong> {agencia.endereco}</p>
        </>
      ) : (
        <p className="text-gray-500">Agência não identificada ou não vinculada.</p>
      )}
    </div>
  );
};

export default ClienteDetalhes;

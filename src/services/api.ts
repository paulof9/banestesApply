import Papa from 'papaparse';
import { Cliente, Conta, Agencia } from '../types';

const clientesURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes';
const contasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas';
const agenciasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias';

const parseCSV = async <T>(url: string): Promise<T[]> => {
  const response = await fetch(url);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (error: unknown) => {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Erro desconhecido ao processar CSV'));
        }
      },
    });
  });
};

const parseNumber = (value: string | number | undefined): number | undefined => {
  if (typeof value === 'string') {
    const cleanedValue = value
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? undefined : num;
  }
  return typeof value === 'number' ? value : undefined;
};

export const fetchClientes = async (): Promise<Cliente[]> => {
  const data = await parseCSV<any>(clientesURL);
  return data.map((cliente): Cliente => ({
    id: cliente.id,
    nome: cliente.nome,
    cpfCnpj: cliente.cpfCnpj,
    dataNascimento: new Date(cliente.dataNascimento || '1900-01-01'),
    estadoCivil: cliente.estadoCivil,
    rendaAnual: parseNumber(cliente.rendaAnual) ?? 0,
    patrimonio: parseNumber(cliente.patrimonio) ?? 0,
    codigoAgencia: parseNumber(cliente.codigoAgencia) ?? 0,
    email: cliente.email ?? 'informação indisponível',
    endereco: cliente.endereco ?? 'informação indisponível',
  }));
};

export const fetchContas = async (): Promise<Conta[]> => {
  const data = await parseCSV<any>(contasURL);
  return data.map((conta): Conta => ({
    id: conta.id,
    cpfCnpjCliente: conta.cpfCnpjCliente,
    tipo: conta.tipo,
    saldo: parseNumber(conta.saldo) ?? 0,
    limiteCredito: parseNumber(conta.limiteCredito) ?? 0,
    creditoDisponivel: parseNumber(conta.creditoDisponivel) ?? 0,
  }));
};

export const fetchAgencias = async (): Promise<Agencia[]> => {
  const data = await parseCSV<any>(agenciasURL);
  return data.map((agencia): Agencia => ({
    id: agencia.id,
    codigo: parseNumber(agencia.codigo) ?? 0,
    nome: agencia.nome,
    endereco: agencia.endereco,
  }));
};

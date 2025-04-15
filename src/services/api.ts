import Papa, { ParseResult, ParseError } from 'papaparse';
import { Cliente, Conta, Agencia } from '../types';

// URLs das planilhas do Google Sheets (convertidas para CSV)
const clientesURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes';
const contasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas';
const agenciasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias';

// Interface genérica de configuração para o PapaParse
interface PapaParseConfig<T> {
  header?: boolean;
  skipEmptyLines?: boolean;
  complete?: (result: ParseResult<T>) => void;
  error?: (error: ParseError) => void;
  fields?: string[];
}

// Função genérica para ler e transformar CSV em objetos do tipo T
const parseCSV = async <T>(url: string, fields?: string[]): Promise<T[]> => {
  const response = await fetch(url);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    const config: PapaParseConfig<T> = {
      header: true,
      skipEmptyLines: true,
      complete: (result: ParseResult<T>) => resolve(result.data),
      error: (error: ParseError) => reject(error),
      fields: fields,
    };
    Papa.parse<T>(text, config);
  });
};

// Função auxiliar para converter strings com R$ ou separadores em números
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

// Função para buscar e tratar os dados dos clientes
export const fetchClientes = async (): Promise<Cliente[]> => {
  const fields = ['id', 'nome', 'cpfCnpj', 'dataNascimento', 'estadoCivil', 'rendaAnual', 'patrimonio', 'codigoAgencia', 'email', 'endereco'];
  const data = await parseCSV<any>(clientesURL, fields);

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

// Função para buscar e tratar os dados das contas
export const fetchContas = async (): Promise<Conta[]> => {
  const fields = ['id', 'cpfCnpjCliente', 'tipo', 'saldo', 'limiteCredito', 'creditoDisponivel'];
  const data = await parseCSV<any>(contasURL, fields);

  return data.map((conta): Conta => ({
    id: conta.id,
    cpfCnpjCliente: conta.cpfCnpjCliente,
    tipo: conta.tipo,
    saldo: parseNumber(conta.saldo) ?? 0,
    limiteCredito: parseNumber(conta.limiteCredito) ?? 0,
    creditoDisponivel: parseNumber(conta.creditoDisponivel) ?? 0,
  }));
};

// Função para buscar e tratar os dados das agências
export const fetchAgencias = async (): Promise<Agencia[]> => {
  const fields = ['id', 'codigo', 'nome', 'endereco'];
  const data = await parseCSV<any>(agenciasURL, fields);

  return data.map((agencia): Agencia => ({
    id: agencia.id,
    codigo: parseNumber(agencia.codigo) ?? 0,
    nome: agencia.nome,
    endereco: agencia.endereco,
  }));
};

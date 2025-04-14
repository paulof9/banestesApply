import Papa from 'papaparse'; // Biblioteca para trabalhar com arquivos CSV.
import { Cliente, Conta, Agencia } from '../types';

const clientesURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes';
const contasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas';
const agenciasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias';

// Busca e analisa um arquivo CSV de uma URL, retornando um array de objetos tipados.
const parseCSV = async <T>(url: string): Promise<T[]> => {
  const response = await fetch(url);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true, // A primeira linha do CSV contém os cabeçalhos das colunas.
      skipEmptyLines: true, // Ignora linhas vazias.
      complete: (result) => resolve(result.data), // Resolve a Promise com os dados analisados.
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

// Converte um valor (string ou número) para um número, removendo formatação monetária.
// Retorna undefined se a conversão falhar.
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

// Busca e processa os dados dos clientes do CSV, convertendo tipos conforme a interface Cliente.
export const fetchClientes = async (): Promise<Cliente[]> => {
  const data = await parseCSV<Cliente>(clientesURL);
  return data.map(cliente => ({
    ...cliente,
    dataNascimento: new Date(cliente.dataNascimento),
    rendaAnual: parseNumber(cliente.rendaAnual) ?? 0,
    patrimonio: parseNumber(cliente.patrimonio) ?? 0,
    codigoAgencia: parseNumber(cliente.codigoAgencia) ?? 0,
  }));
};

// Busca e processa os dados das contas do CSV, convertendo os valores monetários para números.
export const fetchContas = async (): Promise<Conta[]> => {
  const data = await parseCSV<Conta>(contasURL);
  return data.map(conta => ({
    ...conta,
    saldo: parseNumber(conta.saldo) ?? 0,
    limiteCredito: parseNumber(conta.limiteCredito) ?? 0,
    creditoDisponivel: parseNumber(conta.creditoDisponivel) ?? 0,
  }));
};

// Busca e processa os dados das agências do CSV, convertendo o código para número.
export const fetchAgencias = async (): Promise<Agencia[]> => {
  const data = await parseCSV<Agencia>(agenciasURL);
  return data.map(agencia => ({
    ...agencia,
    codigo: parseNumber(agencia.codigo) ?? 0,
  }));
};
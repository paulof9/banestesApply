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

export const fetchClientes = async (): Promise<Cliente[]> => {
  const data = await parseCSV<Cliente>(clientesURL);
  return data.map(cliente => ({
    ...cliente,
    dataNascimento: new Date(cliente.dataNascimento),
    rendaAnual: Number(cliente.rendaAnual),
    patrimonio: Number(cliente.patrimonio),
    codigoAgencia: Number(cliente.codigoAgencia),
  }));
};

export const fetchContas = async (): Promise<Conta[]> => {
  const data = await parseCSV<Conta>(contasURL);
  return data.map(conta => ({
    ...conta,
    saldo: Number(conta.saldo),
    limiteCredito: Number(conta.limiteCredito),
    creditoDisponivel: Number(conta.creditoDisponivel),
  }));
};

export const fetchAgencias = async (): Promise<Agencia[]> => {
  const data = await parseCSV<Agencia>(agenciasURL);
  return data.map(agencia => ({
    ...agencia,
    codigo: Number(agencia.codigo),
  }));
};

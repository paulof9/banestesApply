import Papa from 'papaparse'; // Biblioteca PapaParse para trabalhar com arquivos CSV.
import { Cliente, Conta, Agencia } from '../types';

const clientesURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes';
const contasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas';
const agenciasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias';

// Função genérica assíncrona para buscar e analisar um arquivo CSV de uma URL.
const parseCSV = async <T>(url: string): Promise<T[]> => {
  const response = await fetch(url); // Faz uma requisição HTTP GET para a URL fornecida.
  const text = await response.text(); // Extrai o texto da resposta HTTP.

  // Retorna uma nova Promise para lidar com o parsing assíncrono do CSV.
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true, // Indica que a primeira linha do CSV contém os cabeçalhos das colunas.
      skipEmptyLines: true, // Ignora linhas vazias no arquivo CSV.
      complete: (result) => resolve(result.data), // Função chamada quando o parsing é concluído com sucesso, resolvendo a Promise com os dados analisados.
      error: (error: unknown) => { // Função chamada em caso de erro no parsing.
        if (error instanceof Error) {
          reject(error); // Rejeita a Promise com o erro ocorrido.
        } else {
          reject(new Error('Erro desconhecido ao processar CSV')); // Rejeita com um erro genérico se o erro não for do tipo Error.
        }
      },
    });
  });
};

// Função para converter um valor (string ou número) para um número.
const parseNumber = (value: string | number | undefined): number | undefined => {
  if (typeof value === 'string') {
    const cleanedValue = value
      .replace('R$', '') // Remove R$.
      .replace(',', '.') // Substitui a vírgula pelo ponto.
      .trim(); // Remove espaços em branco no início e no final da string.
    const num = parseFloat(cleanedValue); // Tenta converter a string limpa para um número de ponto flutuante.
    return isNaN(num) ? undefined : num; // Retorna o número se a conversão for bem-sucedida, caso contrário, retorna undefined.
  }
  return typeof value === 'number' ? value : undefined; // Se o valor já for um número, retorna-o diretamente.
};

// Função assíncrona para buscar os dados dos clientes.
export const fetchClientes = async (): Promise<Cliente[]> => {
  const data = await parseCSV<Cliente>(clientesURL); // Busca e analisa os dados dos clientes do CSV.
  // Mapeia os dados brutos para o formato da interface Cliente, realizando conversões de tipo necessárias.
  return data.map(cliente => ({
    ...cliente, // Mantém as outras propriedades do cliente.
    dataNascimento: new Date(cliente.dataNascimento), // Converte a string de data de nascimento para um objeto Date.
    rendaAnual: parseNumber(cliente.rendaAnual) ?? 0, // Tenta converter a renda anual para um número (usando 0 como fallback se a conversão falhar)
    patrimonio: parseNumber(cliente.patrimonio) ?? 0, // ""
    codigoAgencia: parseNumber(cliente.codigoAgencia) ?? 0, // ""
  }));
};

// Função assíncrona para buscar os dados das contas.
export const fetchContas = async (): Promise<Conta[]> => {
  const data = await parseCSV<Conta>(contasURL); // Busca e analisa os dados das contas do CSV.
  // Mapeia os dados brutos para o formato da interface Conta, realizando conversões de tipo necessárias.
  return data.map(conta => ({
    ...conta, // Mantém as outras propriedades da conta.
    saldo: parseNumber(conta.saldo) ?? 0, // Tenta converter o saldo para um número, (usando 0 como fallback se a conversão falhar)
    limiteCredito: parseNumber(conta.limiteCredito) ?? 0, // ""
    creditoDisponivel: parseNumber(conta.creditoDisponivel) ?? 0, // ""
  }));
};

// Função assíncrona para buscar os dados das agências.
export const fetchAgencias = async (): Promise<Agencia[]> => {
  const data = await parseCSV<Agencia>(agenciasURL); // Busca e analisa os dados das agências do CSV.
  // Mapeia os dados brutos para o formato da interface Agencia, realizando conversões de tipo necessárias.
  return data.map(agencia => ({
    ...agencia, // Mantém as outras propriedades da agência.
    codigo: parseNumber(agencia.codigo) ?? 0, // Tenta converter o código da agência para um número (usando 0 como fallback se a conversão falhar)
  }));
};
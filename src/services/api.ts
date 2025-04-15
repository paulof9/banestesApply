import Papa from 'papaparse'; // Biblioteca para trabalhar com arquivos CSV.
import { Cliente, Conta, Agencia } from '../types';

const clientesURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes';
const contasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas';
const agenciasURL =
  'https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias';

// Converte um valor (string ou número) para um número, removendo formatação monetária.
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

// Função para tratar o CSV
const parseCSV = async <T>(url: string, expectedHeaders?: string[], columnLimit?: number): Promise<T[]> => {
  const response = await fetch(url);
  let text = await response.text();

  if (columnLimit !== undefined && columnLimit > 0) {
    const lines = text.split(/\r\n|\r|\n/);
    const processedLines = lines.map(line => {
      const fields = line.split(','); // Assumindo que a vírgula é o delimitador
      return fields.slice(0, columnLimit).join(',');
    });
    text = processedLines.join('\n');
  }

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true, // A primeira linha do CSV contém os cabeçalhos das colunas.
      skipEmptyLines: true, // Ignora linhas vazias.
      complete: (result) => {
        const headers = result.meta?.fields; // Verificação para garantir que headers existam
        if (!headers) {
          reject(new Error('Cabeçalhos não encontrados no CSV'));
          return;
        }

        const seenHeaders = new Set();
        const uniqueHeaders = headers.map((header) => {
          if (seenHeaders.has(header)) {
            let i = 1;
            let newHeader = `${header}_${i}`;
            while (seenHeaders.has(newHeader)) {
              i++;
              newHeader = `${header}_${i}`;
            }
            seenHeaders.add(newHeader);
            return newHeader;
          } else {
            seenHeaders.add(header);
            return header;
          }
        });

        // Reestruturando os dados com os cabeçalhos únicos
        let uniqueData = result.data.map((row: any) => {
          const cleanRow: any = {};
          uniqueHeaders.forEach((header, index) => {
            cleanRow[header] = row[headers[index]];
          });
          return cleanRow;
        });

        // Filtrar os dados para manter apenas os cabeçalhos esperados, se fornecidos
        if (expectedHeaders && expectedHeaders.length > 0) {
          uniqueData = uniqueData.map((row) => {
            const filteredRow: any = {};
            expectedHeaders.forEach((header) => {
              if (row.hasOwnProperty(header)) {
                filteredRow[header] = row[header];
              }
            });
            return filteredRow;
          });
        }

        resolve(uniqueData as T[]);
      },
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

// Busca e processa os dados dos clientes do CSV, convertendo tipos conforme a interface Cliente.
export const fetchClientes = async (): Promise<Cliente[]> => {
  const expectedClienteHeaders = ['id', 'cpfCnpj', 'rg', 'dataNascimento', 'nome', 'nomeSocial', 'email', 'endereco', 'rendaAnual', 'patrimonio', 'estadoCivil', 'codigoAgencia'];
  const data = await parseCSV<any>(clientesURL, expectedClienteHeaders, 12); // Limitar a 12 colunas
  return data.map((cliente): Cliente => {
    return {
      ...cliente,
      dataNascimento: cliente.dataNascimento ? new Date(cliente.dataNascimento) : undefined, // Adicione verificação para undefined
      rendaAnual: parseNumber(cliente.rendaAnual),
      patrimonio: parseNumber(cliente.patrimonio),
      codigoAgencia: parseNumber(cliente.codigoAgencia) !== undefined ? Number(cliente.codigoAgencia) : undefined, // Garante que seja Number
    };
  });
};

// Busca e processa os dados das contas do CSV, convertendo os valores monetários para números.
export const fetchContas = async (): Promise<Conta[]> => {
  const expectedContaHeaders = ['id', 'cpfCnpjCliente', 'tipo', 'saldo', 'limiteCredito', 'creditoDisponivel', 'codigoAgencia'];
  const data = await parseCSV<any>(contasURL, expectedContaHeaders, 6); // Limitar a 7 colunas
  return data.map((conta): Conta => {
    return {
      ...conta,
      saldo: parseNumber(conta.saldo),
      limiteCredito: parseNumber(conta.limiteCredito),
      creditoDisponivel: parseNumber(conta.creditoDisponivel),
      codigoAgencia: parseNumber(conta.codigoAgencia) !== undefined ? Number(conta.codigoAgencia) : undefined, // Garante que seja Number
    };
  });
};

// Busca e processa os dados das agências do CSV, convertendo o código para número.
export const fetchAgencias = async (): Promise<Agencia[]> => {
  const expectedAgenciaHeaders = ['id', 'codigo', 'nome', 'endereco'];
  const data = await parseCSV<any>(agenciasURL, expectedAgenciaHeaders, 4); // Limitar a 4 colunas
  return data.map((agencia): Agencia => {
    return {
      id: agencia.id, // Assumindo que a coluna 'id' existe no seu CSV de agências
      codigo: parseNumber(agencia.codigo) !== undefined ? Number(parseNumber(agencia.codigo)) : 0,
      nome: agencia.nome,
      endereco: agencia.endereco,
    };
  });
};

// Usar a função parseNumber consistente
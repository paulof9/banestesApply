// Exemplo de leitura:
import Papa from "papaparse";
import { Cliente } from "../types";

export async function fetchClientes(): Promise<Cliente[]> {
  const response = await fetch("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes");
  const csv = await response.text();

  return new Promise((resolve) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const clientes: Cliente[] = data.map((item) => ({
          ...item,
          dataNascimento: new Date(item.dataNascimento),
          rendaAnual: parseFloat(item.rendaAnual),
          patrimonio: parseFloat(item.patrimonio),
          codigoAgencia: Number(item.codigoAgencia),
        }));
        resolve(clientes);
      },
    });
  });
}

import { useState, useEffect } from 'react';
import { fetchClientes, fetchContas } from '../services/api';

interface DashboardData {
  totalClientes: number;
  contasCorrente: number;
  contasPoupanca: number;
}

const DashboardSimplificado = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClientes: 0,
    contasCorrente: 0,
    contasPoupanca: 0,
  });

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const clientes = await fetchClientes();
        const contas = await fetchContas();

        const totalClientes = clientes.length;
        const contasCorrente = contas.filter(conta => conta.tipo === 'corrente').length;
        const contasPoupanca = contas.filter(conta => conta.tipo === 'poupanca').length;

        setDashboardData({
          totalClientes,
          contasCorrente,
          contasPoupanca,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error);
        // Lide com o erro de forma apropriada (ex: exibir uma mensagem ao usuário)
      }
    };

    carregarEstatisticas();
  }, []);

  return (
    <div className="overflow-hidden bg-gray-100 text-gray-700 py-2 whitespace-nowrap">
      <div className="inline-block animate-ticker">
        <span className="mr-8 font-semibold text-md">Total de Clientes: {dashboardData.totalClientes}</span>
        <span className="mr-8 font-semibold text-md">Contas Corrente: {dashboardData.contasCorrente}</span>
        <span className="mr-8 font-semibold text-md">Contas Poupança: {dashboardData.contasPoupanca}</span>
      </div>
    </div>
  );
};

export default DashboardSimplificado;
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ClienteDetalhes from './pages/ClienteDetalhes';
import DashboardSimplificado from './components/DashboardSimplificado';
import './assets/styles/index.css'; // Certifique-se de que o caminho está correto

function App() {
  return (
    <Router>
      {/* Flex para garantir que o footer fique no fim da página */}
      <div className="flex flex-col min-h-screen">
        <Header />
        <DashboardWrapper /> {/* Renderiza o DashboardWrapper diretamente */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cliente/:id" element={<ClienteDetalhes />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

// Componente auxiliar para renderizar o Dashboard apenas na rota "/"
function DashboardWrapper() {
  const location = useLocation();
  return location.pathname === '/' ? <DashboardSimplificado /> : null;
}

export default App;
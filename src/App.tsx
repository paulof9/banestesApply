import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ClienteDetalhes from './pages/ClienteDetalhes';
import DashboardSimplificado from './components/DashboardSimplificado';
import './assets/styles/index.css';
import ErrorBoundary from '../ErrorBoundary';

function App() {
  return (
    <Router basename="/banestesApply/"> {/* Definindo basename para o Router */}
      <div className="flex flex-col min-h-screen">
        <Header />
        <MainContent /> {/* Componente que gerencia a renderização do conteúdo principal */}
        <Footer />
      </div>
    </Router>
  );
}

// Componente para gerenciar o conteúdo principal
function MainContent() {
  const location = useLocation();

  return (
    <div className="flex-1">
      {location.pathname === '/' && <DashboardSimplificado />} {/* Renderiza o Dashboard apenas na rota '/' */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/cliente/:id"
          element={
            <ErrorBoundary>
              <ClienteDetalhes />
            </ErrorBoundary>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

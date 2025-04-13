import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ClienteDetalhes from './pages/ClienteDetalhes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cliente/:id" element={<ClienteDetalhes />} />
      </Routes>
    </Router>
  );
}

export default App;

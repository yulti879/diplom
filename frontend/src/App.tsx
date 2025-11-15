import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CinemaProvider } from './context/CinemaContext';
import { MainPage } from './pages/client/MainPage';
import { HallPage } from './pages/client/HallPage';
import { TicketPage } from './pages/client/TicketPage';
import { PaymentPage } from './pages/client/PaymentPage';
import { AdminPage } from './pages/admin/AdminPage';
import { NotFoundPage } from './pages/client/NotFoundPage';
import './App.css';

const App: React.FC = () => {
  return (
    <CinemaProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/hall" element={<HallPage />} />
            <Route path="/payment" element={<PaymentPage />} />      
            <Route path="/ticket" element={<TicketPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </CinemaProvider>
  );
};

export default App;
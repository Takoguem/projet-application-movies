import { Routes, Route } from 'react-router-dom';
import Navadar from './components/Navadar.jsx';
import AdminFormsPage from './pages/AdminFormsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MovieDetailPage from './pages/MovieDetailPage.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navadar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminFormsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}
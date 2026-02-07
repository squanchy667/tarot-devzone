import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/layout/Dashboard';
import CardEditor from './components/cards/CardEditor';
import SynergyEditor from './components/synergies/SynergyEditor';
import BalanceTuner from './components/balance/BalanceTuner';
import ThemeEditor from './components/theme/ThemeEditor';
import VersionManager from './components/versions/VersionManager';
import DeployPanel from './components/deploy/DeployPanel';

export default function App() {
  const { token } = useAuth();

  if (!token) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cards" element={<CardEditor />} />
        <Route path="/synergies" element={<SynergyEditor />} />
        <Route path="/balance" element={<BalanceTuner />} />
        <Route path="/theme" element={<ThemeEditor />} />
        <Route path="/versions" element={<VersionManager />} />
        <Route path="/deploy" element={<DeployPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

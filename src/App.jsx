import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Avaliacao from './pages/Avaliacao';

export default function App() {
  const [auth, setAuth] = useState(() => {
    const salvo = localStorage.getItem('pi_avaliador_auth');
    return salvo ? JSON.parse(salvo) : null;
  });

  // Guarda o ID do grupo vindo do QR Code (?grupo=grp-1)
  const [grupoQrId, setGrupoQrId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('grupo');
    if (idUrl) {
      sessionStorage.setItem('pi_grupo_qr', idUrl);
      return idUrl;
    }
    return sessionStorage.getItem('pi_grupo_qr') || '';
  });

  const handleLoginSuccess = (dadosAuth) => {
    localStorage.setItem('pi_avaliador_auth', JSON.stringify(dadosAuth));
    setAuth(dadosAuth);
  };

  const handleLogout = () => {
    localStorage.removeItem('pi_avaliador_auth');
    sessionStorage.removeItem('pi_grupo_qr');
    setAuth(null);
  };

  const limparGrupoQr = () => {
    sessionStorage.removeItem('pi_grupo_qr');
    setGrupoQrId('');
    // Limpa o ?grupo=... da barra de endereço sem recarregar a página
    window.history.replaceState({}, '', window.location.pathname);
  };

  if (!auth) {
    return <Login onLoginSuccess={handleLoginSuccess} grupoPendente={grupoQrId} />;
  }

  return (
    <Avaliacao
      auth={auth}
      onLogout={handleLogout}
      grupoInicialId={grupoQrId}
      onConsumirGrupoInicial={limparGrupoQr}
    />
  );
}
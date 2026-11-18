import { useState, useEffect } from 'react';
import { Lock, UserCheck, ClipboardCheck, Loader2 } from 'lucide-react';
import { carregarOrientadores, loginAvaliador } from '../services/api';

export default function Login({ onLoginSuccess, grupoPendente }) {
  const [orientadores, setOrientadores] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  const [orientadorId, setOrientadorId] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarOrientadores()
      .then((lista) => setOrientadores(lista))
      .catch(() => setErro('Não foi possível carregar a lista de orientadores.'))
      .finally(() => setCarregandoLista(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const data = await loginAvaliador(orientadorId, senha);
      onLoginSuccess(data);
    } catch (err) {
      setErro(err.message || 'Falha ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {grupoPendente && (
          <div className="qr-banner">
            QR Code identificado! Selecione seu nome e digite a senha para abrir a ficha do grupo.
          </div>
        )}

        <div className="login-header">
          <div className="login-icon-box">
            <ClipboardCheck size={30} />
          </div>
          <h1 className="login-title">Avaliação de Projetos Integradores</h1>
          <p className="login-subtitle">Selecione seu nome para acessar a ficha</p>
        </div>

        {erro && <div className="alert-error">{erro}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label className="form-label">Orientador / Avaliador</label>
            <div className="input-wrapper">
              <UserCheck className="input-icon" size={20} />
              <select
                required
                disabled={carregandoLista}
                value={orientadorId}
                onChange={(e) => setOrientadorId(e.target.value)}
                className="form-control"
              >
                <option value="">
                  {carregandoLista ? 'Carregando nomes...' : '-- Selecione seu nome --'}
                </option>
                {orientadores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Senha</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="form-control"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || carregandoLista || !orientadorId}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={20} />
                Entrando...
              </>
            ) : (
              'Entrar para Avaliar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
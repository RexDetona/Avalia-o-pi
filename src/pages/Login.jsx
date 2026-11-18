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
    <div className="min-h-screen flex flex-col justify-center px-5 py-8 bg-slate-100">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 border border-slate-200">
        {grupoPendente && (
          <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs text-center font-medium">
            QR Code identificado! Selecione seu nome e digite a senha para abrir a ficha do grupo.
          </div>
        )}

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
            <ClipboardCheck size={30} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            Avaliação de Projetos Integradores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selecione seu nome para acessar a ficha
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Orientador / Avaliador
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" size={20} />
              <select
                required
                disabled={carregandoLista}
                value={orientadorId}
                onChange={(e) => setOrientadorId(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-base bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || carregandoLista || !orientadorId}
            className="w-full mt-2 bg-blue-600 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 text-base transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
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
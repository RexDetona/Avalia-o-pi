import { useEffect, useState } from 'react';
import { LogOut, CheckCircle2, Users, Send, Loader2, AlertCircle } from 'lucide-react';
import { CURSOS, PERIODOS, SECOES_AVALIACAO } from '../data/criterios';
import { carregarGruposPI, enviarAvaliacao } from '../services/api';

const OPCOES_NOTA = [
  { valor: 'SIM', label: 'Sim', corAtiva: 'bg-emerald-600 text-white border-emerald-600' },
  { valor: 'PARCIALMENTE', label: 'Parcialmente', corAtiva: 'bg-amber-500 text-white border-amber-500' },
  { valor: 'NAO', label: 'Não', corAtiva: 'bg-rose-600 text-white border-rose-600' },
];

export default function Avaliacao({ auth, onLogout, grupoInicialId, onConsumirGrupoInicial }) {
  const [grupos, setGrupos] = useState([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);

  // Dados do cabeçalho da ficha
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');

  // Respostas e Presença
  const [respostas, setRespostas] = useState({});
  const [presenca, setPresenca] = useState({});
  const [observacoes, setObservacoes] = useState('');

  // Estados de envio
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const totalPerguntas = SECOES_AVALIACAO.reduce((acc, sec) => acc + sec.perguntas.length, 0);
  const totalRespondidas = Object.keys(respostas).length;

useEffect(() => {
    carregarGruposPI(auth.token)
      .then((lista) => {
        setGrupos(lista);

        // Se veio um ID pelo QR Code, seleciona automaticamente
        if (grupoInicialId) {
          const grupoEncontrado = lista.find((g) => g.id === grupoInicialId);
          if (grupoEncontrado) {
            setGrupoSelecionadoId(grupoEncontrado.id);
            setCurso(grupoEncontrado.curso || '');
            setPeriodo(grupoEncontrado.periodo || '');

            const presencaInicial = {};
            grupoEncontrado.alunos.forEach((aluno) => {
              presencaInicial[aluno.id] = null;
            });
            setPresenca(presencaInicial);
          }
          // Limpa o estado para não travar caso o avaliador queira trocar de grupo depois
          onConsumirGrupoInicial();
        }
      })
      .finally(() => setCarregandoGrupos(false));
  }, [auth.token]);

  const handleSelecionarGrupo = (id) => {
    setGrupoSelecionadoId(id);
    setSucesso(false);
    setRespostas({});

    const grupo = grupos.find((g) => g.id === id);
    if (grupo) {
      setCurso(grupo.curso || '');
      setPeriodo(grupo.periodo || '');
      // Inicializa presença dos alunos do grupo
      const presencaInicial = {};
      grupo.alunos.forEach((aluno) => {
        presencaInicial[aluno.id] = null; // null = não marcado, true = presente, false = ausente
      });
      setPresenca(presencaInicial);
    } else {
      setCurso('');
      setPeriodo('');
      setPresenca({});
    }
  };

  const handleMarcarResposta = (perguntaId, valor) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  };

  const handleMarcarPresenca = (alunoId, presente) => {
    setPresenca((prev) => ({ ...prev, [alunoId]: presente }));
  };

  const grupoAtual = grupos.find((g) => g.id === grupoSelecionadoId);

  const formularioValido =
    grupoSelecionadoId &&
    curso &&
    periodo &&
    totalRespondidas === totalPerguntas &&
    grupoAtual?.alunos.every((a) => presenca[a.id] !== null && presenca[a.id] !== undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formularioValido) return;

    setEnviando(true);
    const payload = {
      avaliadorId: auth.avaliador.id,
      avaliadorNome: auth.avaliador.nome,
      grupoId: grupoSelecionadoId,
      tituloProjeto: grupoAtual.titulo,
      curso,
      periodo,
      criterios: respostas,
      presencaAlunos: Object.entries(presenca).map(([alunoId, presente]) => ({
        alunoId,
        presente,
      })),
      observacoes,
      dataAvaliacao: new Date().toISOString(),
    };

    try {
      await enviarAvaliacao(payload, auth.token);
      setSucesso(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      {/* Cabeçalho Fixo Mobile */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Ficha de Avaliação PI
            </span>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[230px]">
              Avaliador: {auth.avaliador.nome}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-red-600 rounded-lg active:bg-slate-100"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Barra de Progresso */}
        {grupoSelecionadoId && (
          <div className="max-w-lg mx-auto mt-2.5">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progresso dos critérios</span>
              <span className="font-semibold text-slate-700">
                {totalRespondidas} de {totalPerguntas}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(totalRespondidas / totalPerguntas) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Banner de Sucesso */}
        {sucesso && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={22} />
            <div>
              <h3 className="font-bold text-emerald-900 text-sm">
                Avaliação enviada com sucesso!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Selecione outro grupo abaixo para iniciar uma nova avaliação.
              </p>
            </div>
          </div>
        )}

        {/* Card 1: Identificação do Projeto */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b pb-2">
            Identificação do Projeto
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Título do Projeto / Sistema
            </label>
            {carregandoGrupos ? (
              <div className="py-3 text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} /> Carregando grupos...
              </div>
            ) : (
              <select
                value={grupoSelecionadoId}
                onChange={(e) => handleSelecionarGrupo(e.target.value)}
                className="w-full p-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Selecione o grupo --</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Seleção de Curso */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Curso
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CURSOS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCurso(item)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-medium text-left transition ${
                    curso === item
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Período */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Período
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PERIODOS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setPeriodo(item)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                    periodo === item
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Seções de Critérios (1 a 4) */}
        {grupoSelecionadoId && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {SECOES_AVALIACAO.map((secao) => (
              <section
                key={secao.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-slate-800 text-sm leading-snug">
                    {secao.titulo}
                  </h2>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">
                    {secao.subtitulo}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-2 rounded-lg">
                    <strong>Foco:</strong> {secao.foco}
                  </p>
                </div>

                <div className="space-y-5">
                  {secao.perguntas.map((pergunta, idx) => (
                    <div key={pergunta.id} className="space-y-2.5">
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        <span className="text-slate-400 mr-1">{idx + 1}.</span>
                        {pergunta.texto}
                      </p>

                      {/* Botões de Toque (Sim / Parcialmente / Não) */}
                      <div className="grid grid-cols-3 gap-2">
                        {OPCOES_NOTA.map((opcao) => {
                          const selecionada = respostas[pergunta.id] === opcao.valor;
                          return (
                            <button
                              type="button"
                              key={opcao.valor}
                              onClick={() => handleMarcarResposta(pergunta.id, opcao.valor)}
                              className={`py-2.5 px-1 rounded-xl border text-xs sm:text-sm font-semibold transition active:scale-95 ${
                                selecionada
                                  ? opcao.corAtiva
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {opcao.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Seção 5: Alunos Presentes */}
            {grupoAtual && (
              <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Users size={18} className="text-blue-600" />
                  <h2 className="font-bold text-slate-800 text-sm">
                    5. ALUNOS PRESENTES NA APRESENTAÇÃO
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {grupoAtual.alunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {aluno.nome}
                      </span>

                      <div className="grid grid-cols-2 gap-2 w-full sm:w-48">
                        <button
                          type="button"
                          onClick={() => handleMarcarPresenca(aluno.id, true)}
                          className={`py-2 rounded-lg border text-xs font-semibold transition ${
                            presenca[aluno.id] === true
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          Presente (Sim)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarcarPresenca(aluno.id, false)}
                          className={`py-2 rounded-lg border text-xs font-semibold transition ${
                            presenca[aluno.id] === false
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          Ausente (Não)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Observações opcionais */}
            <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                Observações da Banca (Opcional)
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Sugestões de melhoria ou comentários para o grupo..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </section>

            {/* Barra Inferior Fixa com Botão de Envio */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20 shadow-lg">
              <div className="max-w-lg mx-auto">
                {!formularioValido && (
                  <p className="text-xs text-amber-600 flex items-center justify-center gap-1 mb-2">
                    <AlertCircle size={14} />
                    Responda todos os critérios e a presença para finalizar
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!formularioValido || enviando}
                  className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-base transition"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Enviando Avaliação...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Finalizar e Enviar Nota
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { LogOut, CheckCircle2, Users, Send, Loader2, AlertCircle } from 'lucide-react';
import { CURSOS, PERIODOS, SECOES_AVALIACAO } from '../data/criterios';
import { carregarGruposPI, enviarAvaliacao } from '../services/api';

const OPCOES_NOTA = [
  { valor: 'SIM', label: 'Sim' },
  { valor: 'PARCIALMENTE', label: 'Parcialmente' },
  { valor: 'NAO', label: 'Não' },
];

export default function Avaliacao({
  auth,
  onLogout,
  grupoInicialId,
  onConsumirGrupoInicial,
}) {
  const [grupos, setGrupos] = useState([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);

  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');

  const [respostas, setRespostas] = useState({});
  const [presenca, setPresenca] = useState({});
  const [observacoes, setObservacoes] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const totalPerguntas = SECOES_AVALIACAO.reduce((acc, sec) => acc + sec.perguntas.length, 0);
  const totalRespondidas = Object.keys(respostas).length;

  useEffect(() => {
    carregarGruposPI(auth.token)
      .then((lista) => {
        setGrupos(lista);

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
          if (onConsumirGrupoInicial) onConsumirGrupoInicial();
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
      const presencaInicial = {};
      grupo.alunos.forEach((aluno) => {
        presencaInicial[aluno.id] = null;
      });
      setPresenca(presencaInicial);
    } else {
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

  const gruposFiltrados = grupos.filter((g) => {
    const bateCurso = curso ? g.curso === curso : true;
    const batePeriodo = periodo ? g.periodo === periodo : true;
    return bateCurso && batePeriodo;
  });

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
      alert(error.message || 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="eval-page">
      {/* Cabeçalho Fixo Mobile */}
      <header className="eval-header">
        <div className="container-mobile">
          <div className="header-top">
            <div>
              <span className="header-badge">Ficha de Avaliação PI</span>
              <p className="header-evaluator">Avaliador: {auth.avaliador.nome}</p>
            </div>
            <button onClick={onLogout} className="btn-logout" title="Sair">
              <LogOut size={20} />
            </button>
          </div>

          {grupoSelecionadoId && (
            <div className="progress-wrapper">
              <div className="progress-labels">
                <span>Progresso dos critérios</span>
                <span className="progress-count">
                  {totalRespondidas} de {totalPerguntas}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${(totalRespondidas / totalPerguntas) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container-mobile eval-main">
        {sucesso && (
          <div className="alert-success">
            <CheckCircle2 className="alert-success-icon" size={22} />
            <div>
              <h3 className="alert-success-title">Avaliação enviada com sucesso!</h3>
              <p className="alert-success-text">
                Selecione outro grupo abaixo para iniciar uma nova avaliação.
              </p>
            </div>
          </div>
        )}

        {/* Card 1: Identificação do Projeto */}
        <section className="card">
          <h2 className="card-title">Identificação do Projeto</h2>

          <div>
            <label className="field-label-upper">1. Selecione o Curso</label>
            <div className="grid-1">
              {CURSOS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setCurso(item);
                    setGrupoSelecionadoId('');
                  }}
                  className={`filter-btn left ${curso === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label-upper">2. Selecione o Período</label>
            <div className="grid-3">
              {PERIODOS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setPeriodo(item);
                    setGrupoSelecionadoId('');
                  }}
                  className={`filter-btn center ${periodo === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label-upper">3. Título do Projeto / Sistema</label>
            {carregandoGrupos ? (
              <div className="loading-inline">
                <Loader2 className="spin" size={16} /> Carregando grupos...
              </div>
            ) : (
              <select
                value={grupoSelecionadoId}
                disabled={!curso || !periodo}
                onChange={(e) => handleSelecionarGrupo(e.target.value)}
                className="select-box"
              >
                <option value="">
                  {!curso || !periodo
                    ? 'Escolha o curso e o período acima...'
                    : gruposFiltrados.length === 0
                    ? 'Nenhum grupo encontrado para essa turma'
                    : '-- Selecione o grupo --'}
                </option>
                {gruposFiltrados.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* Seções de Critérios (1 a 4) */}
        {grupoSelecionadoId && (
          <form onSubmit={handleSubmit} className="eval-main" style={{ padding: 0 }}>
            {SECOES_AVALIACAO.map((secao) => (
              <section key={secao.id} className="card">
                <div className="section-header">
                  <h2 className="section-title">{secao.titulo}</h2>
                  <p className="section-subtitle">{secao.subtitulo}</p>
                  <p className="section-focus">
                    <strong>Foco:</strong> {secao.foco}
                  </p>
                </div>

                <div className="questions-list">
                  {secao.perguntas.map((pergunta, idx) => (
                    <div key={pergunta.id} className="question-item">
                      <p className="question-text">
                        <span className="question-num">{idx + 1}.</span>
                        {pergunta.texto}
                      </p>

                      <div className="grid-3">
                        {OPCOES_NOTA.map((opcao) => {
                          const selecionada = respostas[pergunta.id] === opcao.valor;
                          return (
                            <button
                              type="button"
                              key={opcao.valor}
                              onClick={() => handleMarcarResposta(pergunta.id, opcao.valor)}
                              className={`score-btn ${
                                selecionada ? `active-${opcao.valor}` : ''
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
              <section className="card">
                <div className="attendance-header">
                  <Users size={18} color="var(--primary)" />
                  <h2 className="section-title">5. ALUNOS PRESENTES NA APRESENTAÇÃO</h2>
                </div>

                <div>
                  {grupoAtual.alunos.map((aluno) => (
                    <div key={aluno.id} className="attendance-row">
                      <span className="student-name">{aluno.nome}</span>

                      <div className="grid-2">
                        <button
                          type="button"
                          onClick={() => handleMarcarPresenca(aluno.id, true)}
                          className={`attendance-btn ${
                            presenca[aluno.id] === true ? 'present' : ''
                          }`}
                        >
                          Presente (Sim)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarcarPresenca(aluno.id, false)}
                          className={`attendance-btn ${
                            presenca[aluno.id] === false ? 'absent' : ''
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
            <section className="card">
              <div>
                <label className="field-label-upper">
                  Observações da Banca (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Sugestões de melhoria ou comentários para o grupo..."
                  className="textarea-box"
                />
              </div>
            </section>

            {/* Barra Inferior Fixa */}
            <div className="bottom-bar">
              <div className="container-mobile">
                {!formularioValido && (
                  <p className="validation-hint">
                    <AlertCircle size={14} />
                    Responda todos os critérios e a presença para finalizar
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!formularioValido || enviando}
                  className="btn-submit"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="spin" size={20} />
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
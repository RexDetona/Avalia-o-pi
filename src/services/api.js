const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Dados simulados enquanto o back-end não está conectado
const MOCK_GRUPOS = [
  {
    id: 'grp-1',
    titulo: 'EcoTrack - Gestão Inteligente de Resíduos',
    curso: 'ADS',
    periodo: 'Noite',
    alunos: [
      { id: 'a1', nome: 'Ana Clara Silva' },
      { id: 'a2', nome: 'Bruno Oliveira' },
      { id: 'a3', nome: 'Carlos Eduardo Santos' },
      { id: 'a4', nome: 'Daniela Costa' },
    ],
  },
  {
    id: 'grp-2',
    titulo: 'AgroSense - Monitoramento de Safra com IA',
    curso: 'ADS-AMS',
    periodo: 'Manhã',
    alunos: [
      { id: 'a5', nome: 'Eduardo Lima' },
      { id: 'a6', nome: 'Fernanda Rocha' },
      { id: 'a7', nome: 'Gabriel Mendes' },
    ],
  },
  {
    id: 'grp-3',
    titulo: 'AcessaWeb - Leitor de Tela Simplificado',
    curso: 'Sistemas para Internet',
    periodo: 'Tarde',
    alunos: [
      { id: 'a8', nome: 'Helena Souza' },
      { id: 'a9', nome: 'Igor Pereira' },
      { id: 'a10', nome: 'Juliana Martins' },
      { id: 'a11', nome: 'Lucas Ferreira' },
      { id: 'a12', nome: 'Mariana Alves' },
    ],
  },
];

// Lista simulada de orientadores/avaliadores (depois virá da API)
const MOCK_ORIENTADORES = [
  { id: 'av-01', nome: 'Prof. Carlos Mendes' },
  { id: 'av-02', nome: 'Profa. Fernanda Lima' },
  { id: 'av-03', nome: 'Prof. Ricardo Souza' },
  { id: 'av-04', nome: 'Profa. Juliana Almeida' },
];

export async function carregarOrientadores() {
  // Descomente quando a API estiver pronta:
  /*
  const response = await fetch(`${BASE_URL}/orientadores`);
  if (!response.ok) throw new Error('Erro ao carregar orientadores');
  return response.json(); // Espera [{ id, nome }, ...]
  */

  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_ORIENTADORES), 300);
  });
}

export async function loginAvaliador(orientadorId, senha) {
  // Descomente quando a API estiver pronta:
  /*
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orientadorId, senha }),
  });
  if (!response.ok) throw new Error('Senha incorreta');
  return response.json(); // Espera { token, avaliador: { id, nome } }
  */

  // Simulação de resposta:
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orientador = MOCK_ORIENTADORES.find((o) => o.id === orientadorId);
      if (!orientador) {
        reject(new Error('Selecione um orientador válido.'));
        return;
      }
      resolve({
        token: 'token-jwt-exemplo',
        avaliador: orientador,
      });
    }, 500);
  });
}

export async function carregarGruposPI(token) {
  // Descomente abaixo quando a API estiver pronta:
  /*
  const response = await fetch(`${BASE_URL}/grupos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao carregar grupos');
  return response.json();
  */

  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_GRUPOS), 500);
  });
}

export async function enviarAvaliacao(payload, token) {
  // Descomente abaixo quando a API estiver pronta:
  /*
  const response = await fetch(`${BASE_URL}/avaliacoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Erro ao enviar avaliação');
  return response.json();
  */

  console.log('Payload pronto para o back-end:', payload);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ sucesso: true, mensagem: 'Avaliação registrada!' }), 800);
  });
}
export const CURSOS = ['ADS', 'ADS-AMS', 'Sistemas para Internet'];
export const PERIODOS = ['Manhã', 'Tarde', 'Noite'];

export const SECOES_AVALIACAO = [
  {
    id: 1,
    titulo: '1. NEGÓCIO, PROPOSTA E APLICABILIDADE',
    subtitulo: 'Avaliação de Negócios e Visão Geral',
    foco: 'O problema é real e a solução faz sentido para o mercado/comunidade?',
    perguntas: [
      { id: '1_1', texto: 'O problema que o projeto busca resolver e o público-alvo estão claros?' },
      { id: '1_2', texto: 'A proposta traz valor prático, inovação ou utilidade real para os usuários?' },
      { id: '1_3', texto: 'A equipe demonstrou entender onde/como essa solução seria aplicada na prática?' },
    ],
  },
  {
    id: 2,
    titulo: '2. DEMONSTRAÇÃO DO SISTEMA E UX',
    subtitulo: 'Avaliação de Uso de Sistemas e Experiência',
    foco: 'Qualquer usuário consegue entender e ver o sistema funcionando sem barreiras técnicas excessivas?',
    perguntas: [
      { id: '2_1', texto: 'O protótipo/sistema foi demonstrado em funcionamento de forma fluida?' },
      { id: '2_2', texto: 'As telas/interfaces são organizadas, intuitivas e fáceis de navegar?' },
      { id: '2_3', texto: 'A solução atende ao objetivo proposto na demonstração prática?' },
      { id: '2_4', texto: 'O protótipo demonstra preocupação com Acessibilidade e acesso Universal?' },
    ],
  },
  {
    id: 3,
    titulo: '3. COMUNICAÇÃO, LAYOUT E APRESENTAÇÃO',
    subtitulo: 'Avaliação de Línguas, Linguagem e Síntese',
    foco: 'A equipe se expressa bem, de forma clara, coesa e com bom material visual?',
    perguntas: [
      { id: '3_1', texto: 'A explicação oral foi clara, objetiva e bem articulada?' },
      { id: '3_2', texto: 'As telas do protótipo são legíveis, organizadas e possuem coesão com a explicação recebida?' },
      { id: '3_3', texto: 'A equipe respondeu com segurança e clareza às perguntas do avaliador?' },
      { id: '3_4', texto: 'O protótipo está capacitado para a globalização, possui opção para no mínimo 2 idiomas?' },
    ],
  },
  {
    id: 4,
    titulo: '4. LÓGICA, DADOS E INTELIGÊNCIA ARTIFICIAL',
    subtitulo: 'Foco: Matemática, Estatística e IA',
    foco: 'A solução emprega critérios lógicos, tratamento adequado de dados ou recursos inteligentes consistentes?',
    perguntas: [
      { id: '4_1', texto: 'O projeto utiliza dados, cálculos ou estatísticas de forma correta e justificada?' },
      { id: '4_2', texto: 'Se houver recursos de IA ou automação, eles agregam valor real à solução (em vez de uso decorativo)?' },
      { id: '4_3', texto: 'A lógica por trás das regras de negócio ou dos algoritmos foi explicada com clareza?' },
    ],
  },
];
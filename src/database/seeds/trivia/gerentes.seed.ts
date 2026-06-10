import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const GERENTES = [
  {
    question: '¿Quién es el Gerente General?',
    category: TriviaCategory.GERENTES,
    points: 15,
    options: [
      { text: 'Carlos Pierrini', isCorrect: false, order: 0 },
      { text: 'Sebastián Pierrini', isCorrect: true, order: 1 },
      { text: 'Pablo Tablón', isCorrect: false, order: 2 },
      { text: 'Francisco Ranieri', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es el Gerente de RRHH?',
    category: TriviaCategory.GERENTES,
    points: 15,
    options: [
      { text: 'Mariana Ristagno', isCorrect: false, order: 0 },
      { text: 'Pablo Tablón', isCorrect: true, order: 1 },
      { text: 'Martín Allamand', isCorrect: false, order: 2 },
      { text: 'Jorge Marchini', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién lidera el área Comercial?',
    category: TriviaCategory.GERENTES,
    points: 15,
    options: [
      { text: 'Lucas Ferrante', isCorrect: false, order: 0 },
      { text: 'Francisco Ranieri', isCorrect: true, order: 1 },
      { text: 'Gonzalo Ferreyra', isCorrect: false, order: 2 },
      { text: 'Elio Adrover', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es la Gerente de Siniestros?',
    category: TriviaCategory.GERENTES,
    points: 15,
    options: [
      { text: 'Soledad Nieto', isCorrect: true, order: 0 },
      { text: 'Inés Veloce', isCorrect: false, order: 1 },
      { text: 'Dolores Pierrini', isCorrect: false, order: 2 },
      { text: 'Mariana Marcucci', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién ocupa la Subgerencia General de Operaciones & IT?',
    category: TriviaCategory.GERENTES,
    points: 15,
    options: [
      { text: 'Elio Adrover', isCorrect: false, order: 0 },
      { text: 'Mónica Magni', isCorrect: true, order: 1 },
      { text: 'Jorge Marchini', isCorrect: false, order: 2 },
      { text: 'Martín Allamand', isCorrect: false, order: 3 },
    ],
  },
];

import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const FIFA = [
  {
    question: '¿Qué significan las siglas FIFA?',
    category: TriviaCategory.FIFA,
    points: 35,
    options: [
      {
        text: 'Federación Internacional de Fútbol Asociación',
        isCorrect: true,
        order: 0,
      },
      {
        text: 'Federación Internacional de Futbolistas Asociados',
        isCorrect: false,
        order: 1,
      },
      {
        text: 'Federación Internacional de Federaciones de Fútbol',
        isCorrect: false,
        order: 2,
      },
      {
        text: 'Federación Intercontinental de Fútbol Amateur',
        isCorrect: false,
        order: 3,
      },
    ],
  },
  {
    question: '¿En qué año fue fundada la FIFA?',
    category: TriviaCategory.FIFA,
    points: 35,
    options: [
      { text: '1904', isCorrect: true, order: 0 },
      { text: '1910', isCorrect: false, order: 1 },
      { text: '1898', isCorrect: false, order: 2 },
      { text: '1920', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Dónde se encuentra la sede central de FIFA?',
    category: TriviaCategory.FIFA,
    points: 35,
    options: [
      { text: 'París', isCorrect: false, order: 0 },
      { text: 'Londres', isCorrect: false, order: 1 },
      { text: 'Zúrich', isCorrect: true, order: 2 },
      { text: 'Madrid', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuántas federaciones nacionales integran actualmente la FIFA?',
    category: TriviaCategory.FIFA,
    points: 35,
    options: [
      { text: '180', isCorrect: false, order: 0 },
      { text: '195', isCorrect: false, order: 1 },
      { text: '211', isCorrect: true, order: 2 },
      { text: '225', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué torneo organiza la FIFA cada cuatro años?',
    category: TriviaCategory.FIFA,
    points: 35,
    options: [
      { text: 'Copa Libertadores', isCorrect: false, order: 0 },
      { text: 'Champions League', isCorrect: false, order: 1 },
      { text: 'Copa Mundial de la FIFA', isCorrect: true, order: 2 },
      { text: 'Copa América', isCorrect: false, order: 3 },
    ],
  },
];

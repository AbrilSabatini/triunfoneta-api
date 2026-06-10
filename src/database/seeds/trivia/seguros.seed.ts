import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const SEGUROS = [
  {
    question: '¿Qué organismo regula la actividad aseguradora en Argentina?',
    category: TriviaCategory.SEGUROS,
    points: 25,
    options: [
      { text: 'AFIP', isCorrect: false, order: 0 },
      { text: 'Banco Central', isCorrect: false, order: 1 },
      { text: 'SSN', isCorrect: true, order: 2 },
      { text: 'CNV', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué significa PAS?',
    category: TriviaCategory.SEGUROS,
    points: 25,
    options: [
      { text: 'Productor Asesor de Seguros', isCorrect: true, order: 0 },
      { text: 'Plan Anual de Seguros', isCorrect: false, order: 1 },
      { text: 'Prestador Asegurador Solidario', isCorrect: false, order: 2 },
      {
        text: 'Programa de Atención de Siniestros',
        isCorrect: false,
        order: 3,
      },
    ],
  },
  {
    question: '¿Cuál de estas compañías es competencia de Triunfo?',
    category: TriviaCategory.SEGUROS,
    points: 25,
    options: [
      { text: 'Federación Patronal', isCorrect: true, order: 0 },
      { text: 'Mercado Libre', isCorrect: false, order: 1 },
      { text: 'Aerolíneas Argentinas', isCorrect: false, order: 2 },
      { text: 'YPF', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estas es una aseguradora?',
    category: TriviaCategory.SEGUROS,
    points: 25,
    options: [
      { text: 'Sancor Seguros', isCorrect: true, order: 0 },
      { text: 'Arcor', isCorrect: false, order: 1 },
      { text: 'Havanna', isCorrect: false, order: 2 },
      { text: 'Andreani', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué significa que una compañía tenga "solvencia"?',
    category: TriviaCategory.SEGUROS,
    points: 25,
    options: [
      {
        text: 'Que puede pagar sus compromisos y siniestros',
        isCorrect: true,
        order: 0,
      },
      { text: 'Que vende más pólizas', isCorrect: false, order: 1 },
      { text: 'Que tiene más empleados', isCorrect: false, order: 2 },
      { text: 'Que posee más sucursales', isCorrect: false, order: 3 },
    ],
  },
];

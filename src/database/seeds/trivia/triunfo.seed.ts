import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

const TRIUNFO = [
  {
    question: '¿En qué año nació Triunfo Seguros?',
    category: TriviaCategory.TRIUNFO,
    points: 15,
    options: [
      { text: '1965', isCorrect: false, order: 0 },
      { text: '1967', isCorrect: true, order: 1 },
      { text: '1970', isCorrect: false, order: 2 },
      { text: '1972', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién fue el fundador de Triunfo Seguros?',
    category: TriviaCategory.TRIUNFO,
    points: 15,
    options: [
      { text: 'Sebastián Pierrini', isCorrect: false, order: 0 },
      { text: 'Carlos Pierrini', isCorrect: false, order: 1 },
      { text: 'Roberto Pierrini', isCorrect: true, order: 2 },
      { text: 'Pablo Tablón', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál es la sede legal de Triunfo Seguros?',
    category: TriviaCategory.TRIUNFO,
    points: 15,
    options: [
      { text: 'Mendoza', isCorrect: true, order: 0 },
      { text: 'Córdoba', isCorrect: false, order: 1 },
      { text: 'Buenos Aires', isCorrect: false, order: 2 },
      { text: 'San Juan', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuántos clientes posee aproximadamente la compañía?',
    category: TriviaCategory.TRIUNFO,
    points: 15,
    options: [
      { text: '250.000', isCorrect: false, order: 0 },
      { text: '400.000', isCorrect: false, order: 1 },
      { text: 'Más de 711.000', isCorrect: true, order: 2 },
      { text: 'Más de 1 millón', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estos es un valor corporativo?',
    category: TriviaCategory.TRIUNFO,
    points: 15,
    options: [
      { text: 'Competencia', isCorrect: false, order: 0 },
      { text: 'Honestidad', isCorrect: true, order: 1 },
      { text: 'Rentabilidad', isCorrect: false, order: 2 },
      { text: 'Liderazgo', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál es la misión principal de la empresa?',
    category: TriviaCategory.TRIUNFO,
    points: 15,
    options: [
      { text: 'Ser líder internacional', isCorrect: false, order: 0 },
      {
        text: 'Proteger el patrimonio de los clientes y brindar un servicio de calidad',
        isCorrect: true,
        order: 1,
      },
      { text: 'Expandirse a Latinoamérica', isCorrect: false, order: 2 },
      { text: 'Duplicar la producción', isCorrect: false, order: 3 },
    ],
  },
];

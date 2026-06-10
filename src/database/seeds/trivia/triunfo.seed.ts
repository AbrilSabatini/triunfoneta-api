import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const TRIUNFO = [
  {
    question: '¿En qué año nació Triunfo Seguros?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
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
    points: 35,
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
    points: 35,
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
    points: 35,
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
    points: 35,
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
    points: 35,
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

export const TRIUNFO_FILIALES = [
  {
    question: '¿Quién es la Subgerente General de Operaciones & IT?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Mariana Ristagno', isCorrect: false, order: 0 },
      { text: 'Mónica Magni', isCorrect: true, order: 1 },
      { text: 'Dolores Pierrini', isCorrect: false, order: 2 },
      { text: 'Inés Veloce', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién lidera Proyectos e Innovación?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'María Bensadon', isCorrect: false, order: 0 },
      { text: 'Inés Veloce', isCorrect: true, order: 1 },
      { text: 'Gabriela González', isCorrect: false, order: 2 },
      { text: 'Soledad Nieto', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es el Gerente de Negocios Corporativos?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Lucas Ferrante', isCorrect: true, order: 0 },
      { text: 'Gonzalo Ferreyra', isCorrect: false, order: 1 },
      { text: 'Dino Chiappetta', isCorrect: false, order: 2 },
      { text: 'Rodolfo Arnal', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién lidera la Gerencia Técnica y Reaseguros?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Martín Allamand', isCorrect: false, order: 0 },
      { text: 'Gonzalo Ferreyra', isCorrect: true, order: 1 },
      { text: 'Jorge Sansone', isCorrect: false, order: 2 },
      { text: 'Carlos Aranda', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es la Gerente de Comunicación, Estrategia & Marketing?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'María Day', isCorrect: false, order: 0 },
      { text: 'María Bensadon', isCorrect: true, order: 1 },
      { text: 'Julieta Orrego', isCorrect: false, order: 2 },
      { text: 'Érica Cruces', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estas ciudades tiene una filial de Triunfo?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Ushuaia', isCorrect: false, order: 0 },
      { text: 'Neuquén', isCorrect: true, order: 1 },
      { text: 'Trelew', isCorrect: false, order: 2 },
      { text: 'Formosa', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿En qué Filial está Gabriel del Giovanino?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Mar del Plata', isCorrect: true, order: 0 },
      { text: 'Bahía Blanca', isCorrect: false, order: 1 },
      { text: 'Tandil', isCorrect: false, order: 2 },
      { text: 'Santa Rosa', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿En qué provincia se encuentra la filial de Río Cuarto?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Mendoza', isCorrect: false, order: 0 },
      { text: 'Córdoba', isCorrect: true, order: 1 },
      { text: 'San Luis', isCorrect: false, order: 2 },
      { text: 'Santa Fe', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estas filiales se encuentra en la Patagonia?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Tucumán', isCorrect: false, order: 0 },
      { text: 'Jujuy', isCorrect: false, order: 1 },
      { text: 'Río Gallegos', isCorrect: true, order: 2 },
      { text: 'Rosario', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuál de estas ciudades NO tiene filial de Triunfo?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Posadas', isCorrect: false, order: 0 },
      { text: 'Tandil', isCorrect: false, order: 1 },
      { text: 'Neuquén', isCorrect: false, order: 2 },
      { text: 'Bariloche', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿De qué Filial es Mauricio Fernandez?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Posadas', isCorrect: false, order: 0 },
      { text: 'San Juan', isCorrect: false, order: 1 },
      { text: 'Santa Fe', isCorrect: false, order: 2 },
      { text: 'Rosario', isCorrect: true, order: 3 },
    ],
  },
  {
    question:
      '¿Quién de las siguientes personas NO es un supervisor de Filial?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Alejandro Jaure', isCorrect: false, order: 0 },
      { text: 'Javier Distante', isCorrect: false, order: 1 },
      { text: 'Nerina Herrera', isCorrect: false, order: 2 },
      { text: 'Gustavo De La Rosa', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿Quién es el responsable del sector de Emisión Autos?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Raúl Magni', isCorrect: false, order: 0 },
      { text: 'Pablo Luquez', isCorrect: false, order: 1 },
      { text: 'Miriam Bastías', isCorrect: false, order: 2 },
      { text: 'Cristina Quiroga', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿Dónde se encuentra ubicada el área de Contabilidad?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      {
        text: 'Costanera (Pedro B. Palacios 2650)',
        isCorrect: false,
        order: 0,
      },
      { text: 'Capital Federal (Cerrito 836)', isCorrect: false, order: 1 },
      { text: 'Córdoba (Humberto Primo 630)', isCorrect: false, order: 2 },
      { text: 'Casa Central (Av. San Martín 1092)', isCorrect: true, order: 3 },
    ],
  },
  {
    question: '¿A qué área pertenece Mariel Geli?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Comercial', isCorrect: false, order: 0 },
      { text: 'RRHH', isCorrect: true, order: 1 },
      { text: 'Marketing', isCorrect: false, order: 2 },
      { text: 'IT', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿En qué gerencia trabaja Jorge Sansone?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Siniestros', isCorrect: false, order: 0 },
      { text: 'Gestión y Auditoría de Costos', isCorrect: true, order: 1 },
      { text: 'Finanzas', isCorrect: false, order: 2 },
      { text: 'Comercial', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es el Gerente de Legales?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Martín Allamand', isCorrect: false, order: 0 },
      { text: 'Carlos Aranda', isCorrect: true, order: 1 },
      { text: 'Guillermo Azcárate', isCorrect: false, order: 2 },
      { text: 'Hugo Morales', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién lidera Contabilidad?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Mariana Marcucci', isCorrect: true, order: 0 },
      { text: 'Mariana Ristagno', isCorrect: false, order: 1 },
      { text: 'Natalia Cabrera', isCorrect: false, order: 2 },
      { text: 'Jorge Marchini', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué filial se encuentra más al sur?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Neuquén', isCorrect: false, order: 0 },
      { text: 'Río Gallegos', isCorrect: true, order: 1 },
      { text: 'Comodoro Rivadavia', isCorrect: false, order: 2 },
      { text: 'General Roca', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es el Subgerente de Filiales?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Alejandro Jaure', isCorrect: false, order: 0 },
      { text: 'Marcos Asalí', isCorrect: true, order: 1 },
      { text: 'Javier Distante', isCorrect: false, order: 2 },
      { text: 'Gustavo de la Rosa', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué filial se encuentra en Misiones?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Posadas', isCorrect: true, order: 0 },
      { text: 'Chaco', isCorrect: false, order: 1 },
      { text: 'Tucumán', isCorrect: false, order: 2 },
      { text: 'Salta', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuántas Subgerencias Generales tiene la compañía?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: '2', isCorrect: true, order: 0 },
      { text: '3', isCorrect: false, order: 1 },
      { text: 'Ninguna', isCorrect: false, order: 2 },
      { text: '4', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Antonio Cerdera y Sebastián Marro de qué Filial son?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Córdoba', isCorrect: true, order: 0 },
      { text: 'Río IV', isCorrect: false, order: 1 },
      { text: 'San Juan', isCorrect: false, order: 2 },
      { text: 'San Luis', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Quiénes de las siguientes personas trabajan en Atención al Cliente?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      {
        text: 'Agostina Astray, Daniel García y Marcela Zuin',
        isCorrect: false,
        order: 0,
      },
      {
        text: 'Liz Narvaez, Beatriz Cicchitti y Leticia Gandolfo',
        isCorrect: true,
        order: 1,
      },
      {
        text: 'Ariadna Tolli, Paola Scoponi y Luis Moschetti',
        isCorrect: false,
        order: 2,
      },
      {
        text: 'Pablo Lúquez, Gabriela Denaro y Mariela Santareli',
        isCorrect: false,
        order: 3,
      },
    ],
  },
  {
    question: '¿Cómo se llama la asistente virtual de Triunfo?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'Mery', isCorrect: false, order: 0 },
      { text: 'Bety', isCorrect: true, order: 1 },
      { text: 'Lily', isCorrect: false, order: 2 },
      { text: 'Any', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Quiénes de las siguientes personas son suscriptores de Casa Central?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      { text: 'María Day y Viviana Vazquez', isCorrect: false, order: 0 },
      { text: 'Leonardo Blanco y Gabriel Ferreyra', isCorrect: true, order: 1 },
      { text: 'Andrea Villegas y Leonardo Duclos', isCorrect: false, order: 2 },
      { text: 'Ramón Sanchez y Tatiana Salas', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quiénes de las siguientes personas son Gerentes?',
    category: TriviaCategory.TRIUNFO,
    points: 35,
    options: [
      {
        text: 'Néstor Renn, Graciela Blanco y José Luis Risso',
        isCorrect: false,
        order: 0,
      },
      {
        text: 'Lucas Ferrante, Inés Veloce y Martín Allamand',
        isCorrect: true,
        order: 1,
      },
      {
        text: 'Diego Montaño, Graciela Blanco y Bianca Bianca Bonifati',
        isCorrect: false,
        order: 2,
      },
      {
        text: 'María Bensadon, Tomás Baeck y Bárbara Villegas',
        isCorrect: false,
        order: 3,
      },
    ],
  },
];

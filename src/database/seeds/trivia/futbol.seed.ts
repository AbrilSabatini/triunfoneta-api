import { TriviaCategory } from '../../../trivia/entities/trivia-question.entity';

export const FUTBOL = [
  {
    question: '¿Quién es conocido como "O Rei"?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Maradona', isCorrect: false, order: 0 },
      { text: 'Messi', isCorrect: false, order: 1 },
      { text: 'Pelé', isCorrect: true, order: 2 },
      { text: 'Ronaldo', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué jugador argentino es conocido como "El Diez"?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Messi', isCorrect: false, order: 0 },
      { text: 'Kempes', isCorrect: false, order: 1 },
      { text: 'Maradona', isCorrect: true, order: 2 },
      { text: 'Riquelme', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué jugador ganó el Mundial de 1986 con Argentina?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Batistuta', isCorrect: false, order: 0 },
      { text: 'Maradona', isCorrect: true, order: 1 },
      { text: 'Messi', isCorrect: false, order: 2 },
      { text: 'Kempes', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué futbolista es considerado el máximo goleador de la historia de los Mundiales?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Ronaldo', isCorrect: false, order: 0 },
      { text: 'Pelé', isCorrect: false, order: 1 },
      { text: 'Miroslav Klose', isCorrect: true, order: 2 },
      { text: 'Messi', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué jugador levantó la Copa del Mundo con Argentina en Qatar 2022?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Di María', isCorrect: false, order: 0 },
      { text: 'Otamendi', isCorrect: false, order: 1 },
      { text: 'Messi', isCorrect: true, order: 2 },
      { text: 'De Paul', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Quién convirtió los dos goles de Argentina en la final de México 1986?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Jorge Valdano', isCorrect: false, order: 0 },
      { text: 'Diego Maradona', isCorrect: false, order: 1 },
      { text: 'Jorge Burruchaga', isCorrect: false, order: 2 },
      {
        text: 'Ninguno de ellos, anotaron Brown, Valdano y Burruchaga',
        isCorrect: true,
        order: 3,
      },
    ],
  },
  {
    question: '¿Qué leyenda francesa marcó dos goles en la final de 1998?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Thierry Henry', isCorrect: false, order: 0 },
      { text: 'Michel Platini', isCorrect: false, order: 1 },
      { text: 'Zinedine Zidane', isCorrect: true, order: 2 },
      { text: 'Mbappé', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién anotó un triplete en la final de Qatar 2022?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Messi', isCorrect: false, order: 0 },
      { text: 'Julián Álvarez', isCorrect: false, order: 1 },
      { text: 'Mbappé', isCorrect: true, order: 2 },
      { text: 'Griezmann', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Qué jugador brasileño ganó tres Mundiales?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Romario', isCorrect: false, order: 0 },
      { text: 'Ronaldo', isCorrect: false, order: 1 },
      { text: 'Pelé', isCorrect: true, order: 2 },
      { text: 'Garrincha', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Quién es el máximo goleador histórico de Argentina en Mundiales?',
    category: TriviaCategory.FUTBOL,
    points: 25,
    options: [
      { text: 'Batistuta', isCorrect: true, order: 0 },
      { text: 'Messi', isCorrect: false, order: 1 },
      { text: 'Kempes', isCorrect: false, order: 2 },
      { text: 'Maradona', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué documental narra la vida y carrera de Diego Maradona bajo la dirección de Asif Kapadia?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'Maradona by Kusturica', isCorrect: false, order: 0 },
      { text: 'Diego Maradona', isCorrect: true, order: 1 },
      { text: 'El Diego', isCorrect: false, order: 2 },
      { text: 'Maradona: La Mano de Dios', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué serie documental de Netflix sigue el camino de distintas selecciones durante el Mundial de Qatar 2022?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'All or Nothing', isCorrect: false, order: 0 },
      { text: 'Captains of the World', isCorrect: true, order: 1 },
      { text: 'The Playbook', isCorrect: false, order: 2 },
      { text: 'Matchday', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Sobre qué leyenda del fútbol brasileño trata la película "Pelé: Birth of a Legend"?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'Zico', isCorrect: false, order: 0 },
      { text: 'Romário', isCorrect: false, order: 1 },
      { text: 'Pelé', isCorrect: true, order: 2 },
      { text: 'Sócrates', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué documental muestra el recorrido de la selección argentina campeona del mundo en Qatar 2022?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      {
        text: 'Sean Eternos: Campeones de América',
        isCorrect: false,
        order: 0,
      },
      { text: 'Elijo Creer', isCorrect: true, order: 1 },
      { text: 'Héroes de México 86', isCorrect: false, order: 2 },
      { text: 'Argentina Campeón', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué documental relata la obtención de la Copa América 2021 por parte de Argentina?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'Sean Eternos: Campeones de América', isCorrect: true, order: 0 },
      { text: 'Elijo Creer', isCorrect: false, order: 1 },
      { text: 'Captains of the World', isCorrect: false, order: 2 },
      { text: "Messi's World Cup", isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué documental se centra en la vida de Lionel Messi y fue dirigido por Álex de la Iglesia?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'Messi', isCorrect: true, order: 0 },
      { text: 'Lionel Messi: Destiny', isCorrect: false, order: 1 },
      { text: 'The Messi Story', isCorrect: false, order: 2 },
      { text: 'Number 10', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Cuál de estas producciones está basada en el Mundial de 1986 ganado por Argentina?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'Captains of the World', isCorrect: false, order: 0 },
      { text: 'Héroes', isCorrect: true, order: 1 },
      { text: 'Elijo Creer', isCorrect: false, order: 2 },
      { text: 'Goal!', isCorrect: false, order: 3 },
    ],
  },
  {
    question:
      '¿Qué plataforma estrenó la serie documental "Captains of the World"?',
    category: TriviaCategory.FUTBOL,
    points: 15,
    options: [
      { text: 'Disney+', isCorrect: false, order: 0 },
      { text: 'Prime Video', isCorrect: false, order: 1 },
      { text: 'Netflix', isCorrect: true, order: 2 },
      { text: 'HBO Max', isCorrect: false, order: 3 },
    ],
  },
];

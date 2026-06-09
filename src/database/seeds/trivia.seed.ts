import { DataSource, Repository } from 'typeorm';
import { TriviaOption } from '../../trivia/entities/trivia-option.entity';
import {
  TriviaCategory,
  TriviaQuestion,
} from '../../trivia/entities/trivia-question.entity';

const QUESTIONS = [
  // ─── Mundial ──────────────────────────────────────────────────────────────
  {
    question: '¿En qué año Argentina ganó su primer Mundial?',
    category: TriviaCategory.FUTBOL,
    points: 5,
    options: [
      { text: '1930', isCorrect: false, order: 0 },
      { text: '1978', isCorrect: true, order: 1 },
      { text: '1986', isCorrect: false, order: 2 },
      { text: '1966', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién fue el máximo goleador del Mundial 2022?',
    category: TriviaCategory.FUTBOL,
    points: 10,
    options: [
      { text: 'Lionel Messi', isCorrect: false, order: 0 },
      { text: 'Kylian Mbappé', isCorrect: true, order: 1 },
      { text: 'Olivier Giroud', isCorrect: false, order: 2 },
      { text: 'Julian Álvarez', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuántos goles necesitó Argentina para ganar el Mundial 2022?',
    category: TriviaCategory.FUTBOL,
    points: 20,
    options: [
      { text: '15', isCorrect: false, order: 0 },
      { text: '12', isCorrect: false, order: 1 },
      { text: '18', isCorrect: true, order: 2 },
      { text: '10', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿En qué ciudad se jugó la final del Mundial 2022?',
    category: TriviaCategory.FUTBOL,
    points: 5,
    options: [
      { text: 'Dubái', isCorrect: false, order: 0 },
      { text: 'Lusail', isCorrect: true, order: 1 },
      { text: 'Doha', isCorrect: false, order: 2 },
      { text: 'Al Rayyan', isCorrect: false, order: 3 },
    ],
  },
  // ─── FUTBOL del fútbol ──────────────────────────────────────────────────
  {
    question: '¿Qué país ganó el primer Mundial de la FUTBOL?',
    category: TriviaCategory.FUTBOL,
    points: 10,
    options: [
      { text: 'Brasil', isCorrect: false, order: 0 },
      { text: 'Argentina', isCorrect: false, order: 1 },
      { text: 'Uruguay', isCorrect: true, order: 2 },
      { text: 'Italia', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuántos Mundiales ganó Brasil en total?',
    category: TriviaCategory.FUTBOL,
    points: 5,
    options: [
      { text: '4', isCorrect: false, order: 0 },
      { text: '5', isCorrect: true, order: 1 },
      { text: '6', isCorrect: false, order: 2 },
      { text: '3', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Quién es el máximo goleador en la FUTBOL de los Mundiales?',
    category: TriviaCategory.FUTBOL,
    points: 20,
    options: [
      { text: 'Pelé', isCorrect: false, order: 0 },
      { text: 'Ronaldo Nazário', isCorrect: true, order: 1 },
      { text: 'Miroslav Klose', isCorrect: false, order: 2 },
      { text: 'Gerd Müller', isCorrect: false, order: 3 },
    ],
  },
  // ─── Triunfo Seguros ──────────────────────────────────────────────────────
  {
    question: '¿En qué año fue fundado Triunfo Seguros?',
    category: TriviaCategory.TRIUNFO,
    points: 10,
    options: [
      { text: '1990', isCorrect: false, order: 0 },
      { text: '1985', isCorrect: false, order: 1 },
      { text: '1993', isCorrect: true, order: 2 },
      { text: '2000', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuántos empleados aproximadamente tiene Triunfo Seguros?',
    category: TriviaCategory.TRIUNFO,
    points: 5,
    options: [
      { text: '200', isCorrect: false, order: 0 },
      { text: '600', isCorrect: true, order: 1 },
      { text: '1000', isCorrect: false, order: 2 },
      { text: '400', isCorrect: false, order: 3 },
    ],
  },
  // ─── Cultura general ──────────────────────────────────────────────────────
  {
    question: '¿Cuántos jugadores tiene un equipo de fútbol en cancha?',
    category: TriviaCategory.CULTURA_GENERAL,
    points: 5,
    options: [
      { text: '10', isCorrect: false, order: 0 },
      { text: '11', isCorrect: true, order: 1 },
      { text: '12', isCorrect: false, order: 2 },
      { text: '9', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿Cuánto dura un partido de fútbol reglamentario?',
    category: TriviaCategory.CULTURA_GENERAL,
    points: 5,
    options: [
      { text: '80 minutos', isCorrect: false, order: 0 },
      { text: '90 minutos', isCorrect: true, order: 1 },
      { text: '100 minutos', isCorrect: false, order: 2 },
      { text: '95 minutos', isCorrect: false, order: 3 },
    ],
  },
  {
    question: '¿En qué país se celebrará el Mundial 2026?',
    category: TriviaCategory.MUNDIAL,
    points: 5,
    options: [
      { text: 'Solo en Estados Unidos', isCorrect: false, order: 0 },
      { text: 'Estados Unidos, Canadá y México', isCorrect: true, order: 1 },
      { text: 'Estados Unidos y Canadá', isCorrect: false, order: 2 },
      { text: 'México y Estados Unidos', isCorrect: false, order: 3 },
    ],
  },
];

export async function seedTrivia(
  questionRepo: Repository<TriviaQuestion>,
  optionRepo: Repository<TriviaOption>,
  dataSource: DataSource,
): Promise<void> {
  const existing = await questionRepo.count();
  if (existing > 0) {
    console.log(`  ⏭️  Trivia ya tiene ${existing} preguntas, saltando seed.`);
    return;
  }

  await dataSource.transaction(async (manager) => {
    for (const q of QUESTIONS) {
      const question = await manager.save(
        TriviaQuestion,
        manager.create(TriviaQuestion, {
          question: q.question,
          category: q.category,
          points: q.points,
        }),
      );
      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        await manager.save(
          TriviaOption,
          manager.create(TriviaOption, {
            questionId: question.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order,
          }),
        );
      }
      console.log(`  ➕ Pregunta: "${q.question.substring(0, 50)}..."`);
    }
  });
}

import { DataSource, Repository } from 'typeorm';
import { TriviaOption } from '../../trivia/entities/trivia-option.entity';
import { TriviaQuestion } from '../../trivia/entities/trivia-question.entity';
import { CAMISETAS } from './trivia/camisetas.seed';
import { CULTURA_GENERAL } from './trivia/cultura-general.seed';
import { ESUELDOS } from './trivia/esueldos.seed';
import { FIFA } from './trivia/fifa.seed';
import { FUTBOL } from './trivia/futbol.seed';
import { GERENTES } from './trivia/gerentes.seed';
import { MUNDIAL } from './trivia/mundial.seed';
import { PRODUCTOS } from './trivia/productos.seed';
import { SEGUROS } from './trivia/seguros.seed';
import { TRIUNFO, TRIUNFO_FILIALES } from './trivia/triunfo.seed';

export const QUESTIONS = [
  ...MUNDIAL,
  ...FUTBOL,
  ...TRIUNFO,
  ...TRIUNFO_FILIALES,
  ...GERENTES,
  ...SEGUROS,
  ...ESUELDOS,
  ...CAMISETAS,
  ...PRODUCTOS,
  ...FIFA,
  ...CULTURA_GENERAL,
];

export async function seedTrivia(
  questionRepo: Repository<TriviaQuestion>,
  optionRepo: Repository<TriviaOption>,
  dataSource: DataSource,
): Promise<void> {
  const existing = await questionRepo.count();

  if (existing > 0) {
    console.log(`  ⏭️ Trivia ya tiene ${existing} preguntas, saltando seed.`);
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

      for (const option of q.options) {
        await manager.save(
          TriviaOption,
          manager.create(TriviaOption, {
            questionId: question.id,
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order,
          }),
        );
      }
    }

    console.log(`\n  ✅ ${QUESTIONS.length} preguntas cargadas correctamente.`);
  });
}

import { Repository } from 'typeorm';
import { Sticker } from '../../users/entities/sticker.entity';
import { User } from '../../users/entities/user.entity';

const FUN_FACTS = [
  'Siempre llega primero a las reuniones.',
  'Campeón/a del metegol de la oficina.',
  'Conoce de memoria el reglamento de fútbol.',
  'Nunca se pierde un Mundial.',
  'Dice que "esto en cinco minutos lo resuelvo".',
  'Tiene un grupo de WhatsApp para cada cosa.',
  'El/la que siempre trae facturas al equipo.',
  'Fan incondicional de la selección.',
  'Predijo correctamente 3 resultados de Rusia 2018.',
  "Colecciona álbumes desde el '98.",
  'Trabaja mejor con música a todo volumen.',
  'El/la de los memes del equipo.',
  'Nunca falla una fecha de entrega.',
  'La persona a quien todos le preguntan las contraseñas.',
  'Tiene un sticker de cada Mundial desde Francia 98.',
];

export async function seedStickers(
  stickerRepo: Repository<Sticker>,
  users: User[],
): Promise<void> {
  let stickerNumber = 1;

  // Obtener el último número para continuar desde ahí
  const last = await stickerRepo.findOne({
    where: {},
    order: { stickerNumber: 'DESC' },
  });
  if (last?.stickerNumber) stickerNumber = last.stickerNumber + 1;

  for (const user of users) {
    const existing = await stickerRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (existing) {
      console.log(`    Figurita ya existe para: ${user.fullName}`);
      continue;
    }

    const funFact = FUN_FACTS[stickerNumber % FUN_FACTS.length];

    await stickerRepo.save(
      stickerRepo.create({
        user,
        nickname: user.fullName.split(' ')[0],
        useAvatar: true,
        funFact,
        yearsInCompany: Math.floor(Math.random() * 10) + 1,
        position: 'Empleado Triunfo',
        area: user.area?.name ?? 'General',
        stickerNumber: stickerNumber++,
      }),
    );

    // Marcar al user como que ya tiene figurita
    await stickerRepo.manager.update(User, user.id, { stickerCreated: true });
    console.log(`   Figurita #${stickerNumber - 1} → ${user.fullName}`);
  }
}

import { randomBytes } from 'crypto';

/**
 * Genera una contraseña temporal legible y segura.
 * Formato: 3 segmentos de 4 chars alfanuméricos separados por guión.
 * Ej: "k7Xp-mN3q-Tz8w"
 * Evita caracteres ambiguos (0/O, 1/l/I) para facilitar la lectura.
 */
export function generateTemporaryPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const segment = (len: number) =>
    Array.from(
      { length: len },
      () => chars[randomBytes(1)[0] % chars.length],
    ).join('');

  return `${segment(4)}-${segment(4)}-${segment(4)}`;
}

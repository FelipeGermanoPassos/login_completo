export function parseDuration(value: string): number {
  // Suporta formatos como 15m, 1h, 7d
  const m = value.match(/^(\d+)([smhd])$/);
  if (!m) {
    throw new Error(`Duração inválida: ${value}`);
  }
  const amount = parseInt(m[1], 10);
  const unit = m[2];
  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unidade inválida: ${unit}`);
  }
}

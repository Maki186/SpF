export function parsePositiveAmount(value: string): number | null {
  const num = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  if (isNaN(num) || num <= 0) return null
  return num
}

export function isStrongEnoughPassword(password: string): boolean {
  return password.length >= 8
}

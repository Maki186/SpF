const MONTHS_CS = [
  'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
  'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec',
]

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatShortDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${d.getDate()}. ${d.getMonth() + 1}.`
}

export function formatPeriodLabel(
  period: 'day' | 'week' | 'month' | 'year' | 'custom',
  dateFrom: string,
  dateTo: string
): string {
  const from = parseLocalDate(dateFrom)
  const to = parseLocalDate(dateTo)

  switch (period) {
    case 'day':
      return `${from.getDate()}. ${from.getMonth() + 1}.`
    case 'week':
      return `${from.getDate()}. ${from.getMonth() + 1}. – ${to.getDate()}. ${to.getMonth() + 1}.`
    case 'month':
      return `${MONTHS_CS[from.getMonth()]} ${from.getFullYear()}`
    case 'year':
      return String(from.getFullYear())
    case 'custom':
      return `${from.getDate()}. ${from.getMonth() + 1}. – ${to.getDate()}. ${to.getMonth() + 1}.`
  }
}

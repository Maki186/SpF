export const MONTHS_CS = [
  'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
  'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec',
]

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Formát YYYY-MM-DD v lokálním čase (bez posunu UTC) */
export function formatDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getMonday(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  const diff = r.getDate() - day + (day === 0 ? -6 : 1)
  r.setDate(diff)
  r.setHours(0, 0, 0, 0)
  return r
}

export function formatDayLabel(d: Date): string {
  return `${d.getDate()}. ${d.getMonth() + 1}.`
}

export function getWeekStartsInMonth(baseDate: Date): string[] {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  const labels: string[] = []
  let weekStart = getMonday(monthStart)

  while (true) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    if (weekEnd >= monthStart && weekStart <= monthEnd) {
      labels.push(formatDayLabel(weekStart))
    }
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    if (next > monthEnd && next.getMonth() !== month) break
    weekStart = next
  }

  return labels
}

export function getDaysInWeek(weekStart: Date): string[] {
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    labels.push(formatDayLabel(d))
  }
  return labels
}

export function getWeekLabelForDate(d: Date): string {
  return formatDayLabel(getMonday(d))
}

const YEARS_IN_CHART = 5

export function getYearLabels(centerYear: number, count = YEARS_IN_CHART): string[] {
  const start = centerYear - Math.floor(count / 2)
  return Array.from({ length: count }, (_, i) => String(start + i))
}

export function getYearRangeDates(centerYear: number, count = YEARS_IN_CHART) {
  const start = centerYear - Math.floor(count / 2)
  const end = start + count - 1
  return {
    from: formatDateISO(new Date(start, 0, 1)),
    to: formatDateISO(new Date(end, 11, 31)),
  }
}

export function getFullYearDates(year: number) {
  return {
    from: formatDateISO(new Date(year, 0, 1)),
    to: formatDateISO(new Date(year, 11, 31)),
  }
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

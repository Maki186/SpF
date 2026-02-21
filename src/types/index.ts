export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  planned_amount: number
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string | null
  category_id: string | null
  amount: number
  type: 'income' | 'expense'
  date: string
  comment: string | null
  tags: string[]
  created_at: string
  updated_at: string
  category?: Category
}

export type Period = 'day' | 'week' | 'month' | 'year' | 'custom'

export const CATEGORY_ICONS = [
  'receipt', 'plane', 'tag', 'paw', 'monitor', 'utensils', 'paint-brush',
  'home', 'tent', 'gamepad', 'car', 'heart', 'book', 'tshirt', 'footprints'
] as const

export const CATEGORY_COLORS = [
  '#6B7280', '#EF4444', '#14B8A6', '#EC4899', '#3B82F6', '#22C55E', '#DC2626'
]

export const CATEGORY_ICON_EMOJI: Record<string, string> = {
  receipt: '🧾', plane: '✈️', tag: '🏷️', paw: '🐾', monitor: '💻', utensils: '🍽️',
  'paint-brush': '🖌️', home: '🏠', tent: '⛺', gamepad: '🎮', car: '🚗', heart: '❤️',
  book: '📖', tshirt: '👕', footprints: '👟', train: '🚂', film: '🎬', briefcase: '💼',
  'plus-circle': '➕',
}

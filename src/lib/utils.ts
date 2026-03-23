import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return `+${digits}`
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    restaurant: '🍽️',
    food: '🍽️',
    retail: '🛍️',
    salon: '💇',
    beauty: '💅',
    gym: '💪',
    fitness: '💪',
    health: '🏥',
    entertainment: '🎭',
    services: '🔧',
    real_estate: '🏠',
    other: '⭐',
  }
  return map[category.toLowerCase()] ?? '⭐'
}

export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant / Food' },
  { value: 'retail', label: 'Retail / Shopping' },
  { value: 'salon', label: 'Salon / Spa' },
  { value: 'gym', label: 'Gym / Fitness' },
  { value: 'health', label: 'Health / Medical' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'services', label: 'Services' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
]

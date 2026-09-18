const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export function formatCounter(value: number) { return value < 10_000 ? String(value) : compact.format(value) }

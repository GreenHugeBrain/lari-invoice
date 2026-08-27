// Invoice shape, money maths and the bilingual labels used on the printed sheet.

/** Georgia's standard VAT rate. Businesses under the turnover threshold are not
 *  registered for it at all, which is why it is a toggle rather than an assumption. */
export const VAT_RATE = 0.18

export const CURRENCIES = [
  { code: 'GEL', symbol: '₾', name: 'Georgian lari' },
  { code: 'USD', symbol: '$', name: 'US dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
]

export const LABELS = {
  en: {
    invoice: 'Invoice', from: 'From', to: 'Bill to', number: 'Invoice no.',
    issued: 'Issued', due: 'Due', description: 'Description', qty: 'Qty',
    rate: 'Unit price', amount: 'Amount', subtotal: 'Subtotal',
    vat: 'VAT', total: 'Total', notes: 'Notes', bank: 'Bank details',
    taxId: 'Tax ID', noVat: 'Not registered for VAT',
  },
  ka: {
    invoice: 'ინვოისი', from: 'გამგზავნი', to: 'მიმღები', number: 'ინვოისის №',
    issued: 'გამოწერის თარიღი', due: 'გადახდის ვადა', description: 'დასახელება',
    qty: 'რაოდ.', rate: 'ერთ. ფასი', amount: 'თანხა', subtotal: 'ჯამი',
    vat: 'დღგ', total: 'სულ', notes: 'შენიშვნა', bank: 'საბანკო რეკვიზიტები',
    taxId: 'ს/კ', noVat: 'დღგ-ის გადამხდელად რეგისტრირებული არ არის',
  },
}

export function emptyLine() {
  return { id: crypto.randomUUID(), description: '', qty: 1, rate: 0 }
}

export function emptyInvoice(settings) {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date()
  due.setDate(due.getDate() + 14)
  return {
    id: crypto.randomUUID(),
    number: nextNumber(),
    issued: today,
    due: due.toISOString().slice(0, 10),
    currency: settings?.currency ?? 'GEL',
    vatRegistered: settings?.vatRegistered ?? false,
    language: settings?.language ?? 'en',
    client: { name: '', taxId: '', address: '' },
    lines: [emptyLine()],
    notes: '',
  }
}

/** A readable default: 2026-014 style, sequential within the month. */
function nextNumber() {
  const now = new Date()
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const seq = String(now.getDate()).padStart(3, '0')
  return `${stamp}-${seq}`
}

export function lineTotal(line) {
  const qty = Number(line.qty) || 0
  const rate = Number(line.rate) || 0
  return Math.round(qty * rate * 100) / 100
}

export function totals(invoice) {
  const subtotal = invoice.lines.reduce((sum, l) => sum + lineTotal(l), 0)
  const vat = invoice.vatRegistered ? Math.round(subtotal * VAT_RATE * 100) / 100 : 0
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat,
    total: Math.round((subtotal + vat) * 100) / 100,
  }
}

export function symbolFor(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code
}

/** Two decimals with thin thousands separators, symbol after the number. */
export function formatMoney(value, code) {
  const n = Number.isFinite(value) ? value : 0
  const body = n.toLocaleString('en-GB', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
  return `${body} ${symbolFor(code)}`
}

export function formatDate(iso, language) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** What still has to be filled in before the sheet is worth printing. */
export function missingFields(invoice, settings) {
  const gaps = []
  if (!settings?.name?.trim()) gaps.push('your name, on the Settings page')
  if (!invoice.client.name.trim()) gaps.push('who the invoice is for')
  if (!invoice.number.trim()) gaps.push('an invoice number')
  if (!invoice.lines.some((l) => l.description.trim() && lineTotal(l) > 0)) {
    gaps.push('at least one line with a description and an amount')
  }
  return gaps
}

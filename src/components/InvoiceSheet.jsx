import {
  LABELS, VAT_RATE, formatDate, formatMoney, lineTotal, totals,
} from '../lib/invoice.js'

/**
 * The sheet itself. On screen it is a preview; when the page is printed this is
 * the only thing left standing, at A4 with the rest of the interface hidden.
 */
export default function InvoiceSheet({ invoice, settings }) {
  const t = LABELS[invoice.language] ?? LABELS.en
  const sums = totals(invoice)
  const lines = invoice.lines.filter((l) => l.description.trim() || lineTotal(l) > 0)

  return (
    <article className="sheet" lang={invoice.language}>
      <header className="sheet-top">
        <div>
          <p className="sheet-kind">{t.invoice}</p>
          <p className="sheet-number">{invoice.number || '—'}</p>
        </div>
        <dl className="sheet-dates">
          <div><dt>{t.issued}</dt><dd>{formatDate(invoice.issued, invoice.language)}</dd></div>
          <div><dt>{t.due}</dt><dd>{formatDate(invoice.due, invoice.language)}</dd></div>
        </dl>
      </header>

      <div className="sheet-parties">
        <section>
          <h2>{t.from}</h2>
          <p className="party-name">{settings?.name || 'Your name'}</p>
          {settings?.taxId && <p>{t.taxId} {settings.taxId}</p>}
          {settings?.address && <p className="party-lines">{settings.address}</p>}
        </section>

        <section>
          <h2>{t.to}</h2>
          <p className="party-name">{invoice.client.name || '—'}</p>
          {invoice.client.taxId && <p>{t.taxId} {invoice.client.taxId}</p>}
          {invoice.client.address && <p className="party-lines">{invoice.client.address}</p>}
        </section>
      </div>

      <table className="sheet-lines">
        <thead>
          <tr>
            <th scope="col">{t.description}</th>
            <th scope="col" className="num">{t.qty}</th>
            <th scope="col" className="num">{t.rate}</th>
            <th scope="col" className="num">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr><td colSpan={4} className="sheet-empty">—</td></tr>
          ) : lines.map((l) => (
            <tr key={l.id}>
              <td>{l.description || '—'}</td>
              <td className="num">{Number(l.qty) || 0}</td>
              <td className="num">{formatMoney(Number(l.rate) || 0, invoice.currency)}</td>
              <td className="num">{formatMoney(lineTotal(l), invoice.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sheet-sums">
        <dl>
          <div>
            <dt>{t.subtotal}</dt>
            <dd>{formatMoney(sums.subtotal, invoice.currency)}</dd>
          </div>
          {invoice.vatRegistered ? (
            <div>
              <dt>{t.vat} {Math.round(VAT_RATE * 100)}%</dt>
              <dd>{formatMoney(sums.vat, invoice.currency)}</dd>
            </div>
          ) : (
            <div className="sheet-novat">
              <dt>{t.vat}</dt>
              <dd>{t.noVat}</dd>
            </div>
          )}
          <div className="sheet-total">
            <dt>{t.total}</dt>
            <dd>{formatMoney(sums.total, invoice.currency)}</dd>
          </div>
        </dl>
      </div>

      {(invoice.notes || settings?.bank) && (
        <footer className="sheet-foot">
          {settings?.bank && (
            <section>
              <h2>{t.bank}</h2>
              <p className="party-lines">{settings.bank}</p>
            </section>
          )}
          {invoice.notes && (
            <section>
              <h2>{t.notes}</h2>
              <p className="party-lines">{invoice.notes}</p>
            </section>
          )}
        </footer>
      )}
    </article>
  )
}

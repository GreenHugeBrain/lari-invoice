import { useEffect, useRef, useState } from 'react'

import { Page, PageHead } from '../components/Chrome.jsx'
import InvoiceSheet from '../components/InvoiceSheet.jsx'
import {
  CURRENCIES, emptyInvoice, emptyLine, formatMoney, lineTotal, missingFields,
  totals, VAT_RATE,
} from '../lib/invoice.js'
import { getInvoice, getSettings, saveInvoice } from '../lib/db.js'
import { href } from '../lib/paths.js'

export default function Editor() {
  const [settings, setSettings] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [status, setStatus] = useState('')
  const [storageError, setStorageError] = useState(false)
  const firstLoad = useRef(true)

  // The saved list links here as ?id=…; anything else starts a fresh sheet.
  useEffect(() => {
    let alive = true
    async function boot() {
      let loadedSettings = null
      try {
        loadedSettings = await getSettings()
      } catch {
        if (alive) setStorageError(true)
      }
      const wanted = new URLSearchParams(window.location.search).get('id')
      let loaded = null
      if (wanted) {
        try {
          loaded = await getInvoice(wanted)
        } catch { /* fall through to a new invoice */ }
      }
      if (!alive) return
      setSettings(loadedSettings ?? null)
      setInvoice(loaded ?? emptyInvoice(loadedSettings))
    }
    boot()
    return () => { alive = false }
  }, [])

  // Autosave, but not the moment the page loads.
  useEffect(() => {
    if (!invoice) return undefined
    if (firstLoad.current) {
      firstLoad.current = false
      return undefined
    }
    const timer = setTimeout(async () => {
      try {
        await saveInvoice(invoice)
        setStatus('Saved')
        setTimeout(() => setStatus(''), 1600)
      } catch {
        setStorageError(true)
      }
    }, 700)
    return () => clearTimeout(timer)
  }, [invoice])

  if (!invoice) {
    return <Page wide><p className="loading">Opening…</p></Page>
  }

  const set = (patch) => setInvoice((inv) => ({ ...inv, ...patch }))
  const setClient = (patch) => setInvoice((inv) => ({
    ...inv, client: { ...inv.client, ...patch },
  }))
  const setLine = (id, patch) => setInvoice((inv) => ({
    ...inv,
    lines: inv.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  }))
  const addLine = () => setInvoice((inv) => ({ ...inv, lines: [...inv.lines, emptyLine()] }))
  const dropLine = (id) => setInvoice((inv) => ({
    ...inv,
    lines: inv.lines.length > 1 ? inv.lines.filter((l) => l.id !== id) : inv.lines,
  }))

  const sums = totals(invoice)
  const gaps = missingFields(invoice, settings)

  return (
    <Page wide>
      <PageHead
        title="Write an invoice"
        note="It saves itself as you type. Print when it is ready — the sheet on the right is what comes out."
        actions={(
          <>
            <span className="save-state" role="status">{status}</span>
            <button className="btn btn-ghost" type="button" onClick={() => setInvoice(emptyInvoice(settings))}>
              New
            </button>
            <button
              className="btn btn-solid"
              type="button"
              onClick={() => window.print()}
              disabled={gaps.length > 0}
            >
              Print / PDF
            </button>
          </>
        )}
      />

      {storageError && (
        <p className="warn">
          This browser will not let the page store anything — a private window, or
          site data is blocked. You can still write and print an invoice, but it
          will not be here when you come back.
        </p>
      )}

      {!settings?.name && (
        <p className="warn">
          Your own details are empty. <a href={href('settings')}>Fill them in once</a>{' '}
          and every invoice will carry them.
        </p>
      )}

      <div className="editor">
        <form className="editor-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>The invoice</legend>
            <div className="row">
              <Field label="Number" value={invoice.number} onChange={(v) => set({ number: v })} />
              <Field label="Issued" type="date" value={invoice.issued} onChange={(v) => set({ issued: v })} />
              <Field label="Due" type="date" value={invoice.due} onChange={(v) => set({ due: v })} />
            </div>
            <div className="row">
              <label className="field">
                <span className="field-label">Currency</span>
                <select value={invoice.currency} onChange={(e) => set({ currency: e.target.value })}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Sheet language</span>
                <select value={invoice.language} onChange={(e) => set({ language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="ka">ქართული</option>
                </select>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={invoice.vatRegistered}
                  onChange={(e) => set({ vatRegistered: e.target.checked })}
                />
                <span>Add VAT at {Math.round(VAT_RATE * 100)}%</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Bill to</legend>
            <Field label="Name" value={invoice.client.name} onChange={(v) => setClient({ name: v })} />
            <div className="row">
              <Field label="Tax ID" value={invoice.client.taxId} onChange={(v) => setClient({ taxId: v })} />
            </div>
            <Field
              label="Address"
              multiline
              value={invoice.client.address}
              onChange={(v) => setClient({ address: v })}
            />
          </fieldset>

          <fieldset>
            <legend>Lines</legend>
            <div className="lines">
              {invoice.lines.map((l, i) => (
                <div className="line" key={l.id}>
                  <label className="field field-grow">
                    <span className="field-label">{i === 0 ? 'Description' : ''}</span>
                    <input
                      value={l.description}
                      onChange={(e) => setLine(l.id, { description: e.target.value })}
                      placeholder="Website design, October"
                    />
                  </label>
                  <label className="field field-qty">
                    <span className="field-label">{i === 0 ? 'Qty' : ''}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={l.qty}
                      onChange={(e) => setLine(l.id, { qty: e.target.value })}
                    />
                  </label>
                  <label className="field field-rate">
                    <span className="field-label">{i === 0 ? 'Unit price' : ''}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.rate}
                      onChange={(e) => setLine(l.id, { rate: e.target.value })}
                    />
                  </label>
                  <span className="line-total">{formatMoney(lineTotal(l), invoice.currency)}</span>
                  <button
                    className="line-drop"
                    type="button"
                    onClick={() => dropLine(l.id)}
                    disabled={invoice.lines.length === 1}
                    aria-label={`Remove line ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" type="button" onClick={addLine}>Add a line</button>
          </fieldset>

          <fieldset>
            <legend>Notes</legend>
            <Field
              label="Shown at the bottom of the sheet"
              multiline
              value={invoice.notes}
              onChange={(v) => set({ notes: v })}
              placeholder="Payment within 14 days. Late payment is charged at…"
            />
          </fieldset>

          <dl className="running-total">
            <div><dt>Subtotal</dt><dd>{formatMoney(sums.subtotal, invoice.currency)}</dd></div>
            <div><dt>VAT</dt><dd>{formatMoney(sums.vat, invoice.currency)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{formatMoney(sums.total, invoice.currency)}</dd></div>
          </dl>

          {gaps.length > 0 && (
            <div className="gaps">
              <p>Before printing, this still needs:</p>
              <ul>{gaps.map((g) => <li key={g}>{g}</li>)}</ul>
            </div>
          )}
        </form>

        <div className="preview">
          <InvoiceSheet invoice={invoice} settings={settings} />
        </div>
      </div>
    </Page>
  )
}

function Field({ label, value, onChange, multiline = false, type = 'text', ...rest }) {
  return (
    <label className="field field-grow">
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      )}
    </label>
  )
}

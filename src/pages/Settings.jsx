import { useEffect, useState } from 'react'

import { Page, PageHead } from '../components/Chrome.jsx'
import { CURRENCIES, VAT_RATE } from '../lib/invoice.js'
import { clearEverything, getSettings, saveSettings } from '../lib/db.js'
import { href } from '../lib/paths.js'

const BLANK = {
  name: '', taxId: '', address: '', bank: '',
  currency: 'GEL', vatRegistered: false, language: 'en',
}

export default function Settings() {
  const [form, setForm] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    getSettings()
      .then((s) => { if (alive) setForm({ ...BLANK, ...(s ?? {}) }) })
      .catch(() => { if (alive) { setError(true); setForm(BLANK) } })
    return () => { alive = false }
  }, [])

  if (!form) return <Page><p className="loading">Reading…</p></Page>

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  async function submit(e) {
    e.preventDefault()
    try {
      await saveSettings(form)
      setStatus('Saved. New invoices will use these.')
    } catch {
      setError(true)
    }
    setTimeout(() => setStatus(''), 2600)
  }

  async function wipe() {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete every invoice and these settings from this browser?')) return
    await clearEverything()
    setForm(BLANK)
    setStatus('Everything deleted.')
  }

  return (
    <Page>
      <PageHead
        title="Your details"
        note="Filled in once and carried onto every invoice. Stored in this browser, nowhere else."
      />

      {error && (
        <p className="warn">
          This browser will not let the page store anything, so these will not
          survive a reload.
        </p>
      )}

      <form className="settings-form" onSubmit={submit}>
        <fieldset>
          <legend>Who is invoicing</legend>
          <label className="field field-grow">
            <span className="field-label">Name or company</span>
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" />
          </label>
          <label className="field field-grow">
            <span className="field-label">Tax ID</span>
            <input value={form.taxId} onChange={(e) => set({ taxId: e.target.value })} placeholder="000000000" />
          </label>
          <label className="field field-grow">
            <span className="field-label">Address</span>
            <textarea rows={3} value={form.address} onChange={(e) => set({ address: e.target.value })} />
          </label>
          <label className="field field-grow">
            <span className="field-label">Bank details</span>
            <textarea
              rows={3}
              value={form.bank}
              onChange={(e) => set({ bank: e.target.value })}
              placeholder="Bank name&#10;IBAN GE00XX0000000000000000"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Defaults for new invoices</legend>
          <div className="row">
            <label className="field">
              <span className="field-label">Currency</span>
              <select value={form.currency} onChange={(e) => set({ currency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Sheet language</span>
              <select value={form.language} onChange={(e) => set({ language: e.target.value })}>
                <option value="en">English</option>
                <option value="ka">ქართული</option>
              </select>
            </label>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={form.vatRegistered}
              onChange={(e) => set({ vatRegistered: e.target.checked })}
            />
            <span>I am registered for VAT ({Math.round(VAT_RATE * 100)}%)</span>
          </label>
          <p className="hint">
            Georgian businesses under the turnover threshold are not registered for
            VAT and should leave this off. It can be changed per invoice.
          </p>
        </fieldset>

        <div className="form-actions">
          <button className="btn btn-solid" type="submit">Save</button>
          <a className="btn btn-ghost" href={href('')}>Back to the editor</a>
          <span className="save-state" role="status">{status}</span>
        </div>
      </form>

      <section className="danger-zone">
        <h2>Delete everything</h2>
        <p>
          Removes every saved invoice and these settings from this browser. There is
          no copy anywhere else, so this cannot be undone.
        </p>
        <button className="btn btn-danger" type="button" onClick={wipe}>
          Delete all local data
        </button>
      </section>
    </Page>
  )
}

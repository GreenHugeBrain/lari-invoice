import { useEffect, useState } from 'react'

import { Page, PageHead } from '../components/Chrome.jsx'
import { deleteInvoice, listInvoices, saveInvoice } from '../lib/db.js'
import { formatDate, formatMoney, totals } from '../lib/invoice.js'
import { href } from '../lib/paths.js'

export default function Saved() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)

  const [reloads, setReloads] = useState(0)
  const refresh = () => setReloads((n) => n + 1)

  // Reading IndexedDB is the external system this effect synchronises with;
  // `reloads` is bumped by the actions that change what is stored.
  useEffect(() => {
    let alive = true
    listInvoices()
      .then((found) => { if (alive) setRows(found) })
      .catch(() => {
        if (!alive) return
        setError(true)
        setRows([])
      })
    return () => { alive = false }
  }, [reloads])

  async function duplicate(row) {
    const copy = {
      ...row,
      id: crypto.randomUUID(),
      number: `${row.number}-copy`,
      lines: row.lines.map((l) => ({ ...l, id: crypto.randomUUID() })),
    }
    await saveInvoice(copy)
    refresh()
  }

  async function remove(row) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete invoice ${row.number}? This cannot be undone.`)) return
    await deleteInvoice(row.id)
    refresh()
  }

  return (
    <Page>
      <PageHead
        title="Saved invoices"
        note="Kept in this browser only. Clearing site data clears these too."
        actions={<a className="btn btn-solid" href={href('')}>New invoice</a>}
      />

      {error && (
        <p className="warn">
          This browser will not let the page read stored data, so nothing can be
          listed here.
        </p>
      )}

      {rows === null && <p className="loading">Reading…</p>}

      {rows !== null && rows.length === 0 && !error && (
        <p className="empty">
          Nothing saved yet. <a href={href('')}>Write one</a> and it will appear here
          on its own.
        </p>
      )}

      {rows !== null && rows.length > 0 && (
        <table className="saved-table">
          <thead>
            <tr>
              <th scope="col">Number</th>
              <th scope="col">Client</th>
              <th scope="col">Issued</th>
              <th scope="col" className="num">Total</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><a href={`${href('')}?id=${row.id}`}>{row.number || '—'}</a></td>
                <td>{row.client?.name || '—'}</td>
                <td>{formatDate(row.issued, 'en')}</td>
                <td className="num">{formatMoney(totals(row).total, row.currency)}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => duplicate(row)}>Duplicate</button>
                  <button type="button" className="danger" onClick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Page>
  )
}

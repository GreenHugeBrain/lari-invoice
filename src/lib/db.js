// A very small promise wrapper over IndexedDB.
//
// Everything this app knows lives here, in the visitor's own browser. There is no
// server, so nothing is uploaded, and clearing site data clears the invoices too —
// which the About page says out loud.

const DB_NAME = 'lari-invoice'
const DB_VERSION = 1
const INVOICES = 'invoices'
const SETTINGS = 'settings'

let dbPromise = null

function open() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(INVOICES)) {
        const store = db.createObjectStore(INVOICES, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
      if (!db.objectStoreNames.contains(SETTINGS)) {
        db.createObjectStore(SETTINGS)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function run(storeName, mode, work) {
  return open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    let result
    try {
      result = work(store)
    } catch (err) {
      reject(err)
      return
    }
    tx.oncomplete = () => resolve(result?.result ?? result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  }))
}

/** True when this browser can store anything at all (private windows may not). */
export async function available() {
  try {
    await open()
    return true
  } catch {
    return false
  }
}

export function saveInvoice(invoice) {
  const record = { ...invoice, updatedAt: new Date().toISOString() }
  return run(INVOICES, 'readwrite', (store) => {
    store.put(record)
    return record
  })
}

export function deleteInvoice(id) {
  return run(INVOICES, 'readwrite', (store) => store.delete(id))
}

export function getInvoice(id) {
  return run(INVOICES, 'readonly', (store) => store.get(id))
}

/** Newest first, so the saved list needs no sorting of its own. */
export async function listInvoices() {
  const rows = await run(INVOICES, 'readonly', (store) => store.getAll())
  return [...rows].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function saveSettings(settings) {
  return run(SETTINGS, 'readwrite', (store) => {
    store.put(settings, 'me')
    return settings
  })
}

export function getSettings() {
  return run(SETTINGS, 'readonly', (store) => store.get('me'))
}

export async function clearEverything() {
  await run(INVOICES, 'readwrite', (store) => store.clear())
  await run(SETTINGS, 'readwrite', (store) => store.clear())
}

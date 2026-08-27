# Lari — invoices for Georgian freelancers

Write an invoice in lari, add 18% VAT or leave it off, and print it to PDF.
Everything stays in the browser: no server, no account, nothing uploaded.

**Live:** https://greenhugebrain.github.io/lari-invoice/

React and Vite. No dependencies beyond React — in particular, no PDF library.

## What it does

- **Line items with live totals.** Quantity × unit price, subtotal, VAT, total,
  recalculated as you type and mirrored into the sheet beside the form.
- **VAT as a toggle, not an assumption.** Georgian businesses under the turnover
  threshold are not registered for VAT and must not add it, so the tool asks
  rather than guessing. The rate is the standard 18%.
- **A bilingual sheet.** The printed invoice can carry English or Georgian labels
  while you keep working in either. It swaps labels, never your content.
- **Autosave.** Edits are debounced and written to IndexedDB, so a reload or a
  closed tab does not lose the sheet.
- **Your details once.** Name, tax ID, address and bank sit in Settings and are
  carried onto every invoice.

## How it is put together

- `src/lib/db.js` — a small promise wrapper over IndexedDB with two stores,
  `invoices` and `settings`. Every read and write is guarded: a private window may
  refuse storage entirely, and the pages say so plainly rather than pretending to
  have saved.
- `src/lib/invoice.js` — the shape of an invoice, the money maths (rounded at each
  step, not at the end), and both label sets.
- `src/components/InvoiceSheet.jsx` — the sheet itself, used as the on-screen
  preview and as the printed page.
- **Printing has no library.** A print stylesheet hides the interface, sets
  `@page { size: A4 }` and leaves the sheet standing; the browser's own dialogue
  makes the PDF. The text stays selectable and the file stays small.

State survives navigation because it lives in IndexedDB rather than in React, which
is what makes a multi-page build workable here at all.

## Pages

| Path | What is on it |
|---|---|
| `/` | The editor, with the sheet previewed beside it |
| `/saved/` | Every invoice in this browser — open, duplicate, delete |
| `/settings/` | Your own details and the defaults for new invoices |
| `/about/` | Where the data lives, and what this is not |

## Not tax advice

It is a document generator. The rate, your registration status and what an invoice
legally has to carry are between you and the Revenue Service.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` outputs to `dist/`, which the GitHub Actions workflow publishes
to Pages on every push to `master`.

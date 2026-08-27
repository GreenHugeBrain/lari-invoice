import { Page, PageHead } from '../components/Chrome.jsx'
import { VAT_RATE } from '../lib/invoice.js'
import { href } from '../lib/paths.js'

export default function About() {
  return (
    <Page>
      <PageHead
        title="About this tool"
        note="What it does, where your data lives, and what it deliberately does not do."
      />

      <div className="prose">
        <h2>Where the data lives</h2>
        <p>
          In your browser, in IndexedDB, and nowhere else. There is no server, no
          account and no upload — the whole thing is a folder of static files. That
          also means there is no backup: clearing site data, or opening the tool in
          a different browser, gives you an empty list.
        </p>
        <p>
          A private window may refuse storage altogether. The editor says so rather
          than pretending to save.
        </p>

        <h2>VAT</h2>
        <p>
          The rate is {Math.round(VAT_RATE * 100)}%, Georgia&rsquo;s standard rate.
          It is a toggle because businesses under the turnover threshold are not
          registered for VAT and must not add it. Which side of that line you are on
          is between you and the Revenue Service — this tool does not know and does
          not guess.
        </p>
        <p>
          <strong>This is not tax advice.</strong> It is a document generator. Check
          the rate, your registration status and what your invoices legally have to
          carry before you send one.
        </p>

        <h2>Printing</h2>
        <p>
          There is no PDF library here. The sheet is laid out for A4 in a print
          stylesheet, and the browser&rsquo;s own print dialogue produces the PDF —
          which keeps the text selectable and the file small.
        </p>

        <h2>The Georgian sheet</h2>
        <p>
          The invoice can print with Georgian labels while you keep working in
          English, or the other way round. It swaps the labels, not your content —
          descriptions and names print exactly as you typed them.
        </p>

        <h2>What it is</h2>
        <p>
          A demonstration build, written to show how a small offline-first tool holds
          together: IndexedDB for persistence, a print stylesheet instead of a PDF
          dependency, and a form that keeps its own state honestly. It is usable, but
          it is not a product.
        </p>

        <p className="prose-actions">
          <a className="btn btn-solid" href={href('')}>Write an invoice</a>
          <a className="btn btn-ghost" href={href('settings')}>Fill in your details</a>
        </p>
      </div>
    </Page>
  )
}

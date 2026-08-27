import { NAV } from './Nav.js'
import { href, isCurrent } from '../lib/paths.js'

/** Wraps every page. The header is static — this is a tool, not a brochure. */
export function Page({ children, wide = false }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <header className="app-header">
        <div className={wide ? 'shell shell-wide header-inner' : 'shell header-inner'}>
          <a className="wordmark" href={href('')}>
            Lari<span>₾</span>
          </a>
          <nav aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.path}
                href={href(item.path)}
                aria-current={isCurrent(item.path) ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className={wide ? 'shell shell-wide' : 'shell'}>
        {children}
      </main>

      <footer className="app-footer">
        <div className={wide ? 'shell shell-wide' : 'shell'}>
          <p>
            Everything you type stays in this browser. Nothing is uploaded, and
            there is no account.
          </p>
          <p className="fine">
            A demonstration build. Not tax advice — check the rate and your
            registration status with the Revenue Service.
          </p>
        </div>
      </footer>
    </>
  )
}

export function PageHead({ title, note, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {note && <p className="page-note">{note}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

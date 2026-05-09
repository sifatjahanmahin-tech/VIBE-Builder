import { NavbarProps } from '@/types/vibebuilder';

export function Navbar({ siteName, logoText, links, bgColor, textColor }: NavbarProps) {
  return (
    <header style={{ backgroundColor: bgColor, color: textColor, borderBottom: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }} className="w-full sticky top-0 z-50">
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ backgroundColor: textColor, color: bgColor }}
            aria-hidden
          >
            {logoText || (siteName?.[0] ?? 'S')}
          </div>
          <span className="font-bold text-sm">{siteName}</span>
        </div>

        {links.length > 0 && (
          <ul className="flex items-center gap-1" role="list">
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: textColor }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}

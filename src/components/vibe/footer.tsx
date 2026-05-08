import { FooterProps } from '@/types/vibebuilder';

export function Footer({ companyName, copyright, links, bgColor, textColor }: FooterProps) {
  return (
    <footer style={{ backgroundColor: bgColor, color: textColor }} className="w-full">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-bold text-sm">{companyName}</p>

          {links.length > 0 && (
            <nav aria-label="Footer navigation">
              <ul className="flex items-center gap-4" role="list">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: textColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {copyright && (
          <p className="text-xs mt-6 opacity-50 text-center sm:text-left">{copyright}</p>
        )}
      </div>
    </footer>
  );
}

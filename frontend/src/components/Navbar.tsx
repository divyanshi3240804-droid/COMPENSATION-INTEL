"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/salaries", label: "Salaries" },
    { href: "/compare", label: "Compare" },
    { href: "/submit", label: "Submit" },
  ];

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-ink/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="mono text-accent font-semibold text-lg tracking-tight">
          level<span className="text-accent2">comp</span>
          <span className="text-muted text-xs ml-2">beta</span>
        </Link>
        <div className="flex gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${
                path === l.href ? "text-accent" : "text-muted hover:text-gray-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

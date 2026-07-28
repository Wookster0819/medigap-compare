import { Link } from 'wouter';
import { ShieldCheck } from 'lucide-react';
import { config } from '@/lib/config';

export function Header() {
  return (
    <header className="w-full border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <ShieldCheck className="h-6 w-6" />
          <span className="font-serif font-semibold text-xl tracking-tight">{config.appName}</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          <span className="cursor-default">Simple.</span>
          <span className="cursor-default">Unbiased.</span>
          <span className="cursor-default">Clear.</span>
        </nav>
      </div>
    </header>
  );
}

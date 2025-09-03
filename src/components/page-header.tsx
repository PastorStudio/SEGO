import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Link href="/dashboard" className="hover:text-primary">
            <Home className="h-4 w-4" />
          </Link>
          <span>/</span>
          <span>{title}</span>
        </div>
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}

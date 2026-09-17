import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badges,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white border-b-[1.5px] border-slate-900 px-6 py-4 shadow-sm ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-2 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-black uppercase tracking-wider transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-black font-bold uppercase tracking-wider' : 'uppercase tracking-wider'}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <span className="text-slate-400 font-bold">&gt;</span>}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Row: Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950 font-sans">
              {title}
            </h1>
            {badges && <div className="flex items-center gap-1.5">{badges}</div>}
          </div>
          {description && (
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

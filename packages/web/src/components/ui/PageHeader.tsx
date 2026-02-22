import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft } from './Icons';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  backTo?: string;
}

export function PageHeader({ title, subtitle, action, backTo }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div className="flex items-start gap-3">
        {backTo && (
          <Link
            to={backTo}
            className="mt-1 p-1 rounded-lg text-rumi-text/40 hover:text-rumi-text hover:bg-rumi-text/5 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-rumi-text">{title}</h1>
          {subtitle && (
            <p className="text-sm text-rumi-text/50 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex gap-3">{action}</div>}
    </div>
  );
}

export default PageHeader;

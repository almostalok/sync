import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'SERVICE_ERROR',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-none border-[1.5px] border-red-700 bg-red-50/70 p-6 text-center flex flex-col items-center justify-center space-y-3 font-mono shadow-[2px_2px_0px_#b91c1c] ${className}`}
    >
      <div className="p-2 border border-red-700 bg-red-100 text-red-900">
        <AlertOctagon className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-xs font-bold uppercase tracking-wider text-red-950">[{title}]</h4>
        <p className="text-xs text-red-900 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-red-800 bg-white hover:bg-red-100 text-red-950 text-xs font-bold uppercase tracking-wider transition shadow-[2px_2px_0px_#991b1b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>[RETRY_TRANSACTION]</span>
        </button>
      )}
    </div>
  );
};

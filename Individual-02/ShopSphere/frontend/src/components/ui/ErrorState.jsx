import React from 'react';
import Button from './Button.jsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an issue loading this information. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 bg-rose-50/50 rounded-2xl border border-rose-100 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700 mt-1 max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
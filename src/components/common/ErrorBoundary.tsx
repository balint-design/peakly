import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Ein unbekannter Fehler ist aufgetreten';
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Etwas ist schiefgelaufen</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900"
            >
              Seite neu laden
            </button>
            <Link
              to="/"
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Zur Startseite
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <pre className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-w-full text-sm">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
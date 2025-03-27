import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Peakly. All rights reserved.
          </div>
          <a 
            href="https://balint-design.webflow.io/imprint"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Impressum
          </a>
        </div>
      </div>
    </footer>
  );
}
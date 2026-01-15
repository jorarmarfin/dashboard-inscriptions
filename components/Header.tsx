
import React from 'react';
import { DashboardView } from '../types';

interface HeaderProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">I</div>
            <span className="text-xl font-bold text-gray-800">Inscripciones</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => onViewChange(DashboardView.ADMISION)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === DashboardView.ADMISION
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Admisión
            </button>
            <button
              onClick={() => onViewChange(DashboardView.SIMULACRO)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === DashboardView.SIMULACRO
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Simulacro
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">Administrador</div>
          <div className="w-8 h-8 bg-gray-200 rounded-full border border-gray-300"></div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

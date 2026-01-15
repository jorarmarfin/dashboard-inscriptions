
import React from 'react';
import { DailyData } from '../types';
import { Table, Layout } from 'lucide-react';

interface DataTableProps {
  data: DailyData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Table size={18} className="text-gray-400" />
          <h3 className="font-semibold text-gray-700">Tabla de Datos</h3>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{data.length} Días</span>
      </div>
      <div className="overflow-x-auto flex-grow overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-200">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
            <tr>
              <th className="py-2 px-1">Fecha</th>
              <th className="py-2 px-1 text-blue-500">Pre.</th>
              <th className="py-2 px-1 text-orange-500">De.</th>
              <th className="py-2 px-1 text-green-500">Pagos</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-1 text-gray-600 font-medium">{row.fecha}</td>
                <td className="py-3 px-1 font-bold text-gray-800">{row.preinscritos}</td>
                <td className="py-3 px-1 text-gray-400">{row.derechoExamen}</td>
                <td className="py-3 px-1 font-bold text-gray-800">{row.pagos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

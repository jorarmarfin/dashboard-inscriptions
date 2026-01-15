
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  iconBgClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, colorClass, iconBgClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
          {title}
        </span>
        <div className={`p-2 rounded-lg ${iconBgClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </div>
  );
};

export default SummaryCard;

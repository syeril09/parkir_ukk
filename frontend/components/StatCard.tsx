'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const colorClasses = {
  blue: 'border-blue-500 bg-blue-50 text-blue-900',
  green: 'border-green-500 bg-green-50 text-green-900',
  purple: 'border-purple-500 bg-purple-50 text-purple-900',
  orange: 'border-orange-500 bg-orange-50 text-orange-900',
  red: 'border-red-500 bg-red-50 text-red-900',
  emerald: 'border-emerald-500 bg-emerald-50 text-emerald-900'
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-semibold ${trend.direction === 'up' ? 'text-blue-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '📈' : '📉'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}

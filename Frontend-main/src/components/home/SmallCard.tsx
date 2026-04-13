// src/components/home/SmallCard.tsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, BarChart, Bar } from 'recharts';

interface SmallCardProps {
  label: string;
  value: string;
  sublabel: string;
  data: any[];
  chartType: 'line' | 'scatter' | 'area' | 'bar';
}

export default function SmallCard({ label, value, sublabel, data, chartType }: SmallCardProps) {
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis hide />
            <Line type="monotone" dataKey="value" stroke="#e8472a" strokeWidth={2} dot={false} />
          </LineChart>
        );
      case 'scatter':
        return (
          <ScatterChart data={data}>
            <XAxis dataKey="x" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis hide />
            <Scatter dataKey="y" fill="#e8472a" />
          </ScatterChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis hide />
            <Area type="monotone" dataKey="value" stroke="#e8472a" fill="#e8472a" fillOpacity={0.3} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis hide />
            <Bar dataKey="value" fill="#e8472a" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-200/80 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.06)] min-h-[220px]">
      <div className="mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
        <p className="text-xs text-slate-600 mt-1">{sublabel}</p>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
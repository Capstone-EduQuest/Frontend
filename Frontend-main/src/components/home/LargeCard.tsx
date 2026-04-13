// src/components/home/LargeCard.tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface LargeCardProps {
  label: string;
  value: string;
  sublabel: string;
  data: any[];
}

export default function LargeCard({ label, value, sublabel, data }: LargeCardProps) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.08)] row-span-2 min-h-[420px]">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-4xl font-black text-slate-800 mt-1">{value}</p>
        <p className="text-sm text-slate-600 mt-1">{sublabel}</p>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis hide />
            <Bar dataKey="value" fill="#e8472a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
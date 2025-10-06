'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryChartProps {
  data: Record<string, number>;
  onCategoryClick?: (category: string) => void;
}

export function CategoryChart({ data, onCategoryClick }: CategoryChartProps) {
  const chartData = Object.entries(data).map(([category, count]) => ({
    category: category.replace(/_/g, ' '),
    rawCategory: category,
    count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No category data available
      </div>
    );
  }

  const handleBarClick = (data: any) => {
    if (onCategoryClick && data?.rawCategory) {
      onCategoryClick(data.rawCategory);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="category"
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          name="Tweet Count"
          cursor="pointer"
          onClick={handleBarClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

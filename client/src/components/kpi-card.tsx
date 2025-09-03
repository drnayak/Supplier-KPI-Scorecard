interface KpiCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'green' | 'yellow' | 'blue' | 'purple' | 'gray';
}

export default function KpiCard({ title, value, subtitle, icon, color }: KpiCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-600',
          progress: 'bg-green-600'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-600',
          progress: 'bg-yellow-600'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          progress: 'bg-blue-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          progress: 'bg-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          progress: 'bg-gray-600'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-card rounded-lg border border-border p-6" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-title`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${colorClasses.text}`} data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
            {value.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-subtitle`}>
            {subtitle}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`${colorClasses.progress} h-2 rounded-full`} 
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

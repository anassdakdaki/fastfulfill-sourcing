import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn("card", padding && "p-6", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  positive,
  icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {icon && (
          <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">{icon}</div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {change && (
        <p className={cn("text-xs font-medium mt-1", positive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
          {positive ? "+" : "-"} {change}
        </p>
      )}
    </div>
  );
}

import StatCard from "./StatCard";

export default function DashboardStatGrid({ stats = [], className = "" }) {
  if (!stats.length) return null;

  return (
    <div className = {[
      "grid gap-3",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      className,
    ].join(" ")}
    >
      {stats.map((stat) => (
        <StatCard 
          key={stat.label}
          label={stat.label}
          value={stat.value}
          sub={stat.sub}
          trend={stat.trend}
          icon={stat.icon}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}

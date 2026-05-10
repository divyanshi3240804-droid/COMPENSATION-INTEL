"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchCompany, formatINR } from "../../../lib/api";

interface Salary {
  id: string;
  role: string;
  level: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
}

interface CompanyData {
  company: string;
  salaries: Salary[];
  stats: {
    count: number;
    median_compensation: number;
    avg_compensation: number;
    level_distribution: Record<string, number>;
  };
}

export default function CompanyPage() {
  const params = useParams();
  const company = decodeURIComponent(params.company as string);
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompany(company)
      .then(setData)
      .catch(() => setError("Company not found"))
      .finally(() => setLoading(false));
  }, [company]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center mono text-muted">loading...</div>
  );
  if (error || !data) return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center text-red-400">{error}</div>
  );

  const maxLevel = Math.max(...Object.values(data.stats.level_distribution));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/salaries" className="text-muted text-sm hover:text-accent transition-colors mb-6 block">
        ← Back to salaries
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="mono text-accent text-xs tracking-widest uppercase mb-2">company</div>
        <h1 className="text-4xl font-bold capitalize mb-6">{data.company}</h1>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Data Points", value: data.stats.count, isNum: true },
            { label: "Median TC", value: formatINR(data.stats.median_compensation), isNum: false },
            { label: "Avg TC", value: formatINR(data.stats.avg_compensation), isNum: false },
            { label: "Roles tracked", value: [...new Set(data.salaries.map((s) => s.role))].length, isNum: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="text-muted text-xs mb-1">{stat.label}</div>
              <div className="mono text-accent text-2xl font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Level Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4 text-sm text-muted uppercase tracking-wide">Level Distribution</h2>
          <div className="space-y-3">
            {Object.entries(data.stats.level_distribution)
              .sort((a, b) => b[1] - a[1])
              .map(([level, count]) => (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="mono text-accent">{level}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent2 rounded-full"
                      style={{ width: `${(count / maxLevel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Role Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 col-span-2">
          <h2 className="font-semibold mb-4 text-sm text-muted uppercase tracking-wide">Role Breakdown</h2>
          <div className="space-y-2">
            {[...new Map(data.salaries.map((s) => [s.role + s.level, s])).values()]
              .sort((a, b) => b.total_compensation - a.total_compensation)
              .slice(0, 8)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                  <div>
                    <span className="text-gray-300">{s.role}</span>
                    <span className="mono text-accent text-xs ml-2 bg-surface px-1.5 py-0.5 rounded">{s.level}</span>
                  </div>
                  <div className="mono text-accent font-medium">{formatINR(s.total_compensation)}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Full table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">All Salary Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs mono border-b border-border">
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Level</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Exp</th>
                <th className="px-5 py-3 text-right">Base</th>
                <th className="px-5 py-3 text-right">Bonus</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3 text-right text-accent">Total TC</th>
              </tr>
            </thead>
            <tbody>
              {data.salaries.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                  <td className="px-5 py-3 text-gray-300">{s.role}</td>
                  <td className="px-5 py-3">
                    <span className="mono bg-surface border border-border px-2 py-0.5 rounded text-xs text-accent">{s.level}</span>
                  </td>
                  <td className="px-5 py-3 text-muted">{s.location}</td>
                  <td className="px-5 py-3 text-muted mono">{s.experience_years}y</td>
                  <td className="px-5 py-3 text-right mono text-gray-300">{formatINR(s.base_salary)}</td>
                  <td className="px-5 py-3 text-right mono text-gray-400">{formatINR(s.bonus)}</td>
                  <td className="px-5 py-3 text-right mono text-gray-400">{formatINR(s.stock)}</td>
                  <td className="px-5 py-3 text-right mono font-semibold text-accent">{formatINR(s.total_compensation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

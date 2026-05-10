"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchCompare, formatINR } from "../../lib/api";

interface SalaryEntry {
  id: string;
  company: string;
  role: string;
  level: string;
  location: string;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  experience_years: number;
}

interface Diff {
  vs_id: string;
  base_diff: number;
  bonus_diff: number;
  stock_diff: number;
  total_diff: number;
}

interface CompareData {
  comparison: SalaryEntry[];
  diffs: Diff[];
}

function DiffBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted mono text-xs">—</span>;
  const color = value > 0 ? "text-accent" : "text-red-400";
  return (
    <span className={`mono text-xs ${color}`}>
      {value > 0 ? "+" : ""}{formatINR(value)}
    </span>
  );
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idsParam) return;
    setLoading(true);
    const ids = idsParam.split(",").filter(Boolean);
    fetchCompare(ids)
      .then(setData)
      .catch(() => setError("Failed to load comparison. Check your IDs."))
      .finally(() => setLoading(false));
  }, [idsParam]);

  const rows = [
    { label: "Company", key: "company", format: (v: unknown) => <span className="capitalize">{v as string}</span> },
    { label: "Role", key: "role", format: (v: unknown) => v as string },
    { label: "Level", key: "level", format: (v: unknown) => <span className="mono bg-surface border border-border px-2 py-0.5 rounded text-xs text-accent">{v as string}</span> },
    { label: "Location", key: "location", format: (v: unknown) => v as string },
    { label: "Experience", key: "experience_years", format: (v: unknown) => `${v}y` },
    { label: "Base Salary", key: "base_salary", format: (v: unknown) => <span className="mono">{formatINR(v as number)}</span> },
    { label: "Bonus", key: "bonus", format: (v: unknown) => <span className="mono">{formatINR(v as number)}</span> },
    { label: "Stock", key: "stock", format: (v: unknown) => <span className="mono">{formatINR(v as number)}</span> },
    { label: "Total TC", key: "total_compensation", format: (v: unknown) => <span className="mono font-bold text-accent text-lg">{formatINR(v as number)}</span>, highlight: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/salaries" className="text-muted text-sm hover:text-accent transition-colors mb-6 block">
        ← Back to salaries
      </Link>

      <h1 className="text-3xl font-bold mb-2">Compare Offers</h1>
      <p className="text-muted text-sm mb-10">
        Select entries from the salary table to compare. Diffs are relative to the first selection.
      </p>

      {!idsParam && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <h2 className="text-xl font-semibold mb-3">Nothing to compare yet</h2>
          <p className="text-muted mb-6">Go to the salary table, check 2–3 rows, then click "Compare"</p>
          <Link href="/salaries" className="bg-accent text-ink font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors">
            Browse Salaries →
          </Link>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 mono text-muted">comparing...</div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      {data && (
        <>
          {/* Winner banner */}
          {(() => {
            const winner = [...data.comparison].sort((a, b) => b.total_compensation - a.total_compensation)[0];
            return (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 mb-8 flex items-center gap-4">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-semibold capitalize">{winner.company} · {winner.role} · <span className="mono text-accent">{winner.level}</span></div>
                  <div className="text-muted text-sm">Highest total compensation: <span className="mono text-accent font-semibold">{formatINR(winner.total_compensation)}</span></div>
                </div>
              </div>
            );
          })()}

          {/* Comparison table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-left text-muted text-xs mono w-32">Field</th>
                    {data.comparison.map((s, i) => (
                      <th key={s.id} className="px-5 py-4 text-left">
                        <div className="text-xs mono text-muted mb-0.5">Option {i + 1}</div>
                        <div className="font-semibold capitalize">{s.company}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.key}
                      className={`border-b border-border/50 ${row.highlight ? "bg-accent/5" : "hover:bg-surface"}`}
                    >
                      <td className="px-5 py-3 text-muted text-xs mono">{row.label}</td>
                      {data.comparison.map((s, i) => {
                        const val = s[row.key as keyof SalaryEntry];
                        const diff = i > 0 ? data.diffs[i - 1] : null;
                        const diffKey = `${row.key}_diff` as keyof Diff;
                        return (
                          <td key={s.id} className="px-5 py-3">
                            <div>{row.format(val)}</div>
                            {diff && diff[diffKey] !== undefined && typeof diff[diffKey] === "number" && (
                              <DiffBadge value={diff[diffKey] as number} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick insight */}
          <div className="mt-6 bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3 text-sm text-muted uppercase tracking-wide">Quick Insight</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.comparison.map((s) => (
                <div key={s.id} className="text-center">
                  <div className="mono text-accent text-xl font-bold">{formatINR(s.total_compensation)}</div>
                  <div className="text-muted text-xs capitalize mt-1">{s.company} · {s.level}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {Math.round((s.base_salary / s.total_compensation) * 100)}% base
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

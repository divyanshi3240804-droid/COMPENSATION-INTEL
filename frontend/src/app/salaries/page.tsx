"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchSalaries, fetchLevels, formatINR } from "@/lib/api";

interface Salary {
  id: string;
  company: string;
  role: string;
  level: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
}

interface Meta {
  total: number;
  page: number;
  pages: number;
}

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 1 });
  const [levels, setLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    company: "",
    role: "",
    level: "",
    location: "",
    sort: "desc",
    page: "1",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const data = await fetchSalaries(params);
      setSalaries(data.data);
      setMeta(data.meta);
    } catch {
      setError("Failed to load salaries. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchLevels().then(setLevels).catch(() => {});
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const setFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value, page: "1" }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Salary Table</h1>
          <p className="text-muted text-sm mt-1">Level-standardized compensation data · India Tech</p>
        </div>
        {selected.length >= 2 && (
          <Link
            href={`/compare?ids=${selected.join(",")}`}
            className="bg-accent2 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-accent2/90 transition-colors"
          >
            Compare {selected.length} →
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: "company", placeholder: "Company" },
          { key: "role", placeholder: "Role" },
          { key: "location", placeholder: "Location" },
        ].map(({ key, placeholder }) => (
          <input
            key={key}
            type="text"
            placeholder={placeholder}
            value={filters[key as keyof typeof filters]}
            onChange={(e) => setFilter(key, e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-gray-200 placeholder-muted"
          />
        ))}
        <select
          value={filters.level}
          onChange={(e) => setFilter("level", e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-gray-200"
        >
          <option value="">All Levels</option>
          {levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-gray-200"
        >
          <option value="desc">Highest TC first</option>
          <option value="asc">Lowest TC first</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-accent2/10 border border-accent2/30 rounded-lg px-4 py-2.5">
          <span className="text-accent2 text-sm font-medium">{selected.length}/3 selected for compare</span>
          <button onClick={() => setSelected([])} className="text-muted text-xs hover:text-gray-300">Clear</button>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs mono">
                <th className="px-4 py-3 text-left w-8">
                  <span className="text-accent2">✓</span>
                </th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Exp</th>
                <th className="px-4 py-3 text-right">Base</th>
                <th className="px-4 py-3 text-right">Bonus</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right font-semibold text-accent">Total TC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-muted">
                    <span className="mono">loading...</span>
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-muted">
                    No results. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-border/50 hover:bg-surface transition-colors ${
                      selected.includes(s.id) ? "bg-accent2/5 border-accent2/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="accent-accent2 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/company/${s.company}`}
                        className="text-accent2 hover:underline capitalize font-medium"
                      >
                        {s.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{s.role}</td>
                    <td className="px-4 py-3">
                      <span className="mono bg-surface border border-border px-2 py-0.5 rounded text-xs text-accent">
                        {s.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{s.location}</td>
                    <td className="px-4 py-3 text-muted mono">{s.experience_years}y</td>
                    <td className="px-4 py-3 text-right mono text-gray-300">{formatINR(s.base_salary)}</td>
                    <td className="px-4 py-3 text-right mono text-gray-400">{formatINR(s.bonus)}</td>
                    <td className="px-4 py-3 text-right mono text-gray-400">{formatINR(s.stock)}</td>
                    <td className="px-4 py-3 text-right mono font-semibold text-accent">
                      {formatINR(s.total_compensation)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && meta.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-muted text-sm">{meta.total} results</span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setFilter("page", String(meta.page - 1))}
              className="px-4 py-1.5 border border-border rounded text-sm disabled:opacity-30 hover:border-accent transition-colors"
            >
              ← Prev
            </button>
            <span className="mono text-muted text-sm px-3 py-1.5">
              {meta.page} / {meta.pages}
            </span>
            <button
              disabled={meta.page >= meta.pages}
              onClick={() => setFilter("page", String(meta.page + 1))}
              className="px-4 py-1.5 border border-border rounded text-sm disabled:opacity-30 hover:border-accent transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

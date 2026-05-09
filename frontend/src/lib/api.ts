const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchSalaries(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/salaries${q ? `?${q}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch salaries");
  return res.json();
}

export async function fetchCompany(company: string) {
  const res = await fetch(`${BASE}/company/${encodeURIComponent(company)}`);
  if (!res.ok) throw new Error("Company not found");
  return res.json();
}

export async function fetchCompare(ids: string[]) {
  const res = await fetch(`${BASE}/compare?ids=${ids.join(",")}`);
  if (!res.ok) throw new Error("Failed to compare");
  return res.json();
}

export async function fetchCompanies() {
  const res = await fetch(`${BASE}/companies`);
  return res.json();
}

export async function fetchLevels() {
  const res = await fetch(`${BASE}/levels`);
  return res.json();
}

export async function ingestSalary(data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/ingest-salary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export function formatINR(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

"use client";
import { useState } from "react";
import { ingestSalary } from "@/lib/api";

const LEVELS = ["L3", "L4", "L5", "L6", "L7", "L8", "SDE1", "SDE2", "SDE3", "Senior", "Staff", "Principal", "E3", "E4", "E5", "IC3", "IC4", "IC5"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Gurugram", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Noida", "Remote - India", "Remote - Global"];

export default function SubmitPage() {
  const [form, setForm] = useState({
    company: "",
    role: "",
    level: "",
    location: "",
    experience_years: "",
    base_salary: "",
    bonus: "",
    stock: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.company || !form.role || !form.level || !form.location || !form.experience_years || !form.base_salary) {
      setStatus("error");
      setMessage("Please fill all required fields.");
      return;
    }
    setStatus("loading");
    try {
      await ingestSalary({
        company: form.company,
        role: form.role,
        level: form.level,
        location: form.location,
        experience_years: parseInt(form.experience_years),
        base_salary: parseFloat(form.base_salary),
        bonus: parseFloat(form.bonus || "0"),
        stock: parseFloat(form.stock || "0"),
      });
      setStatus("success");
      setMessage("Thanks! Your comp data has been submitted.");
      setForm({ company: "", role: "", level: "", location: "", experience_years: "", base_salary: "", bonus: "", stock: "" });
    } catch (err: unknown) {
      setStatus("error");
      const e = err as { error?: string; details?: Record<string, string[]> };
      if (e?.error === "Duplicate entry detected") {
        setMessage("This entry already exists in our database.");
      } else if (e?.details) {
        setMessage("Validation failed: " + Object.values(e.details).flat().join(", "));
      } else {
        setMessage("Submission failed. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mono text-accent text-xs tracking-widest uppercase mb-3">Submit Compensation</div>
      <h1 className="text-3xl font-bold mb-2">Share Your Comp</h1>
      <p className="text-muted text-sm mb-10">
        All submissions are anonymous. Data is validated and deduplicated before storage.
        Bonus and stock default to 0 if not provided.
      </p>

      {status === "success" && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 text-accent text-sm">
          ✓ {message}
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
          {message}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Company + Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mono mb-1.5 block">Company *</label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder-muted"
            />
          </div>
          <div>
            <label className="text-xs text-muted mono mb-1.5 block">Role *</label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder-muted"
            />
          </div>
        </div>

        {/* Level + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mono mb-1.5 block">Level *</label>
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent text-gray-200"
            >
              <option value="">Select level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mono mb-1.5 block">Location *</label>
            <select
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent text-gray-200"
            >
              <option value="">Select location</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="text-xs text-muted mono mb-1.5 block">Years of Experience *</label>
          <input
            type="number"
            min="0"
            max="50"
            placeholder="e.g. 3"
            value={form.experience_years}
            onChange={(e) => set("experience_years", e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder-muted"
          />
        </div>

        {/* Salary breakdown */}
        <div className="border-t border-border pt-5">
          <div className="text-xs text-muted mono mb-3">Compensation (₹ per year)</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "base_salary", label: "Base *", placeholder: "e.g. 3500000" },
              { key: "bonus", label: "Bonus", placeholder: "e.g. 500000" },
              { key: "stock", label: "Stock (annual)", placeholder: "e.g. 2000000" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-muted mono mb-1.5 block">{label}</label>
                <input
                  type="number"
                  min="0"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent placeholder-muted"
                />
              </div>
            ))}
          </div>

          {(form.base_salary || form.bonus || form.stock) && (
            <div className="mt-3 text-right">
              <span className="text-muted text-xs">Estimated Total TC: </span>
              <span className="mono text-accent text-sm font-semibold">
                ₹{(
                  (parseFloat(form.base_salary || "0") + parseFloat(form.bonus || "0") + parseFloat(form.stock || "0"))
                ).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full bg-accent text-ink font-semibold py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 mt-2"
        >
          {status === "loading" ? "Submitting..." : "Submit Compensation"}
        </button>
      </div>

      <p className="text-muted text-xs text-center mt-4">
        Your data is validated, normalized, and deduplicated. No personal info is stored.
      </p>
    </div>
  );
}

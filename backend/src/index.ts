import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalize company names: lowercase + trim + collapse spaces */
function normalizeCompany(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Valid levels we accept */
const VALID_LEVELS = ["L3", "L4", "L5", "L6", "L7", "L8", "IC3", "IC4", "IC5", "IC6", "SDE1", "SDE2", "SDE3", "Senior", "Staff", "Principal"];

// ─── Validation Schemas ──────────────────────────────────────────────────────

const SalarySchema = z.object({
  company: z.string().min(1, "Company required").max(100),
  role: z.string().min(1, "Role required").max(100),
  level: z.string().min(1, "Level required"),
  location: z.string().min(1, "Location required").max(100),
  experience_years: z.number().int().min(0).max(50),
  base_salary: z.number().positive("Base salary must be positive"),
  bonus: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  confidence_score: z.number().min(0).max(1).default(1.0),
});

// ─── POST /ingest-salary ─────────────────────────────────────────────────────

app.post("/ingest-salary", async (req: Request, res: Response) => {
  try {
    const parsed = SalarySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const company = normalizeCompany(data.company);
    const total_compensation = data.base_salary + data.bonus + data.stock;

    // Duplicate check: same company+role+level+location+base within 5% tolerance
    const existing = await prisma.salary.findFirst({
      where: {
        company,
        role: data.role.trim(),
        level: data.level.trim(),
        location: data.location.trim(),
        base_salary: {
          gte: data.base_salary * 0.95,
          lte: data.base_salary * 1.05,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Duplicate entry detected",
        existing_id: existing.id,
      });
    }

    const salary = await prisma.salary.create({
      data: {
        company,
        role: data.role.trim(),
        level: data.level.trim(),
        location: data.location.trim(),
        experience_years: data.experience_years,
        base_salary: data.base_salary,
        bonus: data.bonus,
        stock: data.stock,
        total_compensation,
        confidence_score: data.confidence_score,
      },
    });

    return res.status(201).json({ success: true, salary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /salaries ────────────────────────────────────────────────────────────

app.get("/salaries", async (req: Request, res: Response) => {
  try {
    const { company, role, level, location, sort = "desc", page = "1", limit = "20" } = req.query;

    const where: Record<string, unknown> = {};
    if (company) where.company = { contains: normalizeCompany(company as string) };
    if (role) where.role = { contains: (role as string).trim(), mode: "insensitive" };
    if (level) where.level = (level as string).trim();
    if (location) where.location = { contains: (location as string).trim(), mode: "insensitive" };

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        orderBy: { total_compensation: sort === "asc" ? "asc" : "desc" },
        skip,
        take: limitNum,
      }),
      prisma.salary.count({ where }),
    ]);

    return res.json({
      data: salaries,
      meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /company/:company ────────────────────────────────────────────────────

app.get("/company/:company", async (req: Request, res: Response) => {
  try {
    const company = normalizeCompany(req.params.company);

    const salaries = await prisma.salary.findMany({
      where: { company: { contains: company } },
      orderBy: { total_compensation: "desc" },
    });

    if (salaries.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Compute median
    const sorted = [...salaries].sort((a, b) => a.total_compensation - b.total_compensation);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1].total_compensation + sorted[mid].total_compensation) / 2
        : sorted[mid].total_compensation;

    // Level distribution
    const levelDist: Record<string, number> = {};
    for (const s of salaries) {
      levelDist[s.level] = (levelDist[s.level] || 0) + 1;
    }

    return res.json({
      company,
      salaries,
      stats: {
        count: salaries.length,
        median_compensation: Math.round(median),
        avg_compensation: Math.round(salaries.reduce((a, s) => a + s.total_compensation, 0) / salaries.length),
        level_distribution: levelDist,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /compare ─────────────────────────────────────────────────────────────

app.get("/compare", async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: "ids query param required (comma-separated)" });

    const idList = (ids as string).split(",").map((id) => id.trim()).filter(Boolean);
    if (idList.length < 2 || idList.length > 3) {
      return res.status(400).json({ error: "Provide 2 or 3 salary IDs" });
    }

    const salaries = await prisma.salary.findMany({ where: { id: { in: idList } } });
    if (salaries.length !== idList.length) {
      return res.status(404).json({ error: "One or more salary IDs not found" });
    }

    const comparison = salaries.map((s) => ({
      id: s.id,
      company: s.company,
      role: s.role,
      level: s.level,
      location: s.location,
      base_salary: s.base_salary,
      bonus: s.bonus,
      stock: s.stock,
      total_compensation: s.total_compensation,
      experience_years: s.experience_years,
    }));

    // Diffs relative to first entry
    const base = comparison[0];
    const diffs = comparison.slice(1).map((s) => ({
      vs_id: s.id,
      base_diff: s.base_salary - base.base_salary,
      bonus_diff: s.bonus - base.bonus,
      stock_diff: s.stock - base.stock,
      total_diff: s.total_compensation - base.total_compensation,
    }));

    return res.json({ comparison, diffs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /levels ──────────────────────────────────────────────────────────────

app.get("/levels", async (_req: Request, res: Response) => {
  const levels = await prisma.salary.findMany({
    select: { level: true },
    distinct: ["level"],
    orderBy: { level: "asc" },
  });
  return res.json(levels.map((l) => l.level));
});

// ─── GET /companies ───────────────────────────────────────────────────────────

app.get("/companies", async (_req: Request, res: Response) => {
  const companies = await prisma.salary.findMany({
    select: { company: true },
    distinct: ["company"],
    orderBy: { company: "asc" },
  });
  return res.json(companies.map((c) => c.company));
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;

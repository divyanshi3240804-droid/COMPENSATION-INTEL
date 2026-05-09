import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalize(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const seedData = [
  // Google
  { company: "Google", role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 1, base_salary: 2200000, bonus: 300000, stock: 800000 },
  { company: "Google", role: "Software Engineer", level: "L4", location: "Bangalore", experience_years: 3, base_salary: 3500000, bonus: 600000, stock: 2000000 },
  { company: "Google", role: "Software Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 5000000, bonus: 1000000, stock: 4000000 },
  { company: "Google", role: "Software Engineer", level: "L6", location: "Hyderabad", experience_years: 10, base_salary: 7000000, bonus: 1500000, stock: 7000000 },
  { company: "Google", role: "Data Scientist", level: "L4", location: "Bangalore", experience_years: 4, base_salary: 3800000, bonus: 700000, stock: 2500000 },
  { company: "Google", role: "Product Manager", level: "L5", location: "Bangalore", experience_years: 7, base_salary: 5500000, bonus: 1200000, stock: 5000000 },

  // Microsoft
  { company: "Microsoft", role: "Software Engineer", level: "SDE1", location: "Hyderabad", experience_years: 1, base_salary: 1800000, bonus: 250000, stock: 600000 },
  { company: "Microsoft", role: "Software Engineer", level: "SDE2", location: "Hyderabad", experience_years: 4, base_salary: 3000000, bonus: 500000, stock: 1800000 },
  { company: "Microsoft", role: "Software Engineer", level: "SDE3", location: "Hyderabad", experience_years: 8, base_salary: 4500000, bonus: 900000, stock: 3500000 },
  { company: "Microsoft", role: "Senior SDE", level: "Senior", location: "Bangalore", experience_years: 10, base_salary: 5500000, bonus: 1100000, stock: 5000000 },
  { company: "Microsoft", role: "Data Scientist", level: "SDE2", location: "Hyderabad", experience_years: 3, base_salary: 2800000, bonus: 450000, stock: 1500000 },

  // Amazon
  { company: "Amazon", role: "Software Development Engineer", level: "SDE1", location: "Hyderabad", experience_years: 1, base_salary: 1700000, bonus: 200000, stock: 1200000 },
  { company: "Amazon", role: "Software Development Engineer", level: "SDE2", location: "Bangalore", experience_years: 3, base_salary: 2800000, bonus: 400000, stock: 2500000 },
  { company: "Amazon", role: "Software Development Engineer", level: "SDE3", location: "Hyderabad", experience_years: 7, base_salary: 4000000, bonus: 700000, stock: 4000000 },
  { company: "Amazon", role: "Senior SDE", level: "Senior", location: "Bangalore", experience_years: 10, base_salary: 5200000, bonus: 900000, stock: 6000000 },
  { company: "Amazon", role: "Product Manager", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 4800000, bonus: 1000000, stock: 4500000 },

  // Meta
  { company: "Meta", role: "Software Engineer", level: "E3", location: "Bangalore", experience_years: 1, base_salary: 2500000, bonus: 400000, stock: 1500000 },
  { company: "Meta", role: "Software Engineer", level: "E4", location: "Bangalore", experience_years: 4, base_salary: 4000000, bonus: 800000, stock: 3500000 },
  { company: "Meta", role: "Software Engineer", level: "E5", location: "Bangalore", experience_years: 8, base_salary: 6000000, bonus: 1300000, stock: 7000000 },

  // Flipkart
  { company: "Flipkart", role: "Software Engineer", level: "SDE1", location: "Bangalore", experience_years: 1, base_salary: 1400000, bonus: 150000, stock: 400000 },
  { company: "Flipkart", role: "Software Engineer", level: "SDE2", location: "Bangalore", experience_years: 3, base_salary: 2200000, bonus: 300000, stock: 1000000 },
  { company: "Flipkart", role: "Senior Engineer", level: "SDE3", location: "Bangalore", experience_years: 6, base_salary: 3500000, bonus: 600000, stock: 2000000 },
  { company: "Flipkart", role: "Staff Engineer", level: "Staff", location: "Bangalore", experience_years: 10, base_salary: 5000000, bonus: 900000, stock: 3500000 },

  // Razorpay
  { company: "Razorpay", role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 1, base_salary: 1600000, bonus: 200000, stock: 600000 },
  { company: "Razorpay", role: "Senior Engineer", level: "L4", location: "Bangalore", experience_years: 4, base_salary: 2800000, bonus: 500000, stock: 1500000 },
  { company: "Razorpay", role: "Staff Engineer", level: "L5", location: "Bangalore", experience_years: 7, base_salary: 4200000, bonus: 800000, stock: 3000000 },

  // Swiggy
  { company: "Swiggy", role: "Software Engineer", level: "SDE1", location: "Bangalore", experience_years: 1, base_salary: 1300000, bonus: 150000, stock: 500000 },
  { company: "Swiggy", role: "Software Engineer", level: "SDE2", location: "Bangalore", experience_years: 3, base_salary: 2100000, bonus: 300000, stock: 900000 },
  { company: "Swiggy", role: "Senior Engineer", level: "Senior", location: "Bangalore", experience_years: 6, base_salary: 3400000, bonus: 500000, stock: 1800000 },

  // Zomato
  { company: "Zomato", role: "Software Engineer", level: "SDE1", location: "Gurugram", experience_years: 1, base_salary: 1200000, bonus: 100000, stock: 400000 },
  { company: "Zomato", role: "Software Engineer", level: "SDE2", location: "Gurugram", experience_years: 3, base_salary: 2000000, bonus: 250000, stock: 800000 },
  { company: "Zomato", role: "Senior Engineer", level: "Senior", location: "Gurugram", experience_years: 6, base_salary: 3200000, bonus: 450000, stock: 1500000 },

  // CRED
  { company: "CRED", role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 2, base_salary: 2000000, bonus: 300000, stock: 1000000 },
  { company: "CRED", role: "Senior Engineer", level: "L4", location: "Bangalore", experience_years: 5, base_salary: 3500000, bonus: 600000, stock: 2500000 },

  // Atlassian
  { company: "Atlassian", role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 2, base_salary: 2500000, bonus: 400000, stock: 1500000 },
  { company: "Atlassian", role: "Senior Engineer", level: "L4", location: "Bangalore", experience_years: 5, base_salary: 4000000, bonus: 800000, stock: 3000000 },
  { company: "Atlassian", role: "Staff Engineer", level: "Staff", location: "Bangalore", experience_years: 9, base_salary: 5500000, bonus: 1100000, stock: 5000000 },

  // Uber
  { company: "Uber", role: "Software Engineer", level: "L3", location: "Bangalore", experience_years: 2, base_salary: 2200000, bonus: 350000, stock: 1200000 },
  { company: "Uber", role: "Senior Engineer", level: "L5", location: "Bangalore", experience_years: 6, base_salary: 4500000, bonus: 900000, stock: 4000000 },

  // Infosys
  { company: "Infosys", role: "Software Engineer", level: "SDE1", location: "Pune", experience_years: 1, base_salary: 600000, bonus: 50000, stock: 0 },
  { company: "Infosys", role: "Senior Software Engineer", level: "SDE2", location: "Bangalore", experience_years: 4, base_salary: 1000000, bonus: 100000, stock: 0 },
  { company: "Infosys", role: "Tech Lead", level: "Senior", location: "Hyderabad", experience_years: 7, base_salary: 1600000, bonus: 200000, stock: 0 },

  // TCS
  { company: "TCS", role: "Software Engineer", level: "SDE1", location: "Mumbai", experience_years: 1, base_salary: 550000, bonus: 40000, stock: 0 },
  { company: "TCS", role: "Senior Engineer", level: "SDE2", location: "Chennai", experience_years: 4, base_salary: 900000, bonus: 80000, stock: 0 },
];

async function main() {
  console.log("🌱 Seeding database...");
  await prisma.salary.deleteMany();

  for (const entry of seedData) {
    const total_compensation = entry.base_salary + entry.bonus + entry.stock;
    await prisma.salary.create({
      data: {
        company: normalize(entry.company),
        role: entry.role,
        level: entry.level,
        location: entry.location,
        experience_years: entry.experience_years,
        base_salary: entry.base_salary,
        bonus: entry.bonus,
        stock: entry.stock,
        total_compensation,
        confidence_score: 0.9,
      },
    });
  }

  console.log(`✅ Seeded ${seedData.length} salary records`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

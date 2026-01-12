export default {
  schema: "./shared/schema.ts",
  out: "./drizle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,    // Ye line add karein
  verbose: true,   // Ye line add karein
};
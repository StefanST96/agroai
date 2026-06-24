const fs = require("fs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env" });

async function loadSQL() {
  try {
    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    const urlParts = dbUrl.match(/mysql:\/\/(.+):(.+)@(.+):(\d+)\/(.+)/);

    if (!urlParts) {
      throw new Error("Invalid DATABASE_URL format");
    }

    const [, user, password, host, port, database] = urlParts;

    const sqlPath = "C:\\Users\\stefa\\Downloads\\agroai.sql";
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      multipleStatements: true,
    });

    console.log("Učitavam SQL podatke...");
    await connection.query(sqlContent);
    console.log("✓ SQL podaci uspešno učitani");

    await connection.end();
  } catch (error) {
    console.error("Greška:", error.message);
    process.exit(1);
  }
}

loadSQL();

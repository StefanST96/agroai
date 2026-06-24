require("dotenv").config({ path: ".env" });
const mysql = require("mysql2/promise");
const fs = require("fs");

(async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const [, u, p, h, po, d] = dbUrl.match(
      /mysql:\/\/(.+):(.+)@(.+):(\d+)\/(.+)/,
    );
    const conn = await mysql.createConnection({
      host: h,
      port: parseInt(po),
      user: u,
      password: p,
      database: d,
      multipleStatements: true,
    });

    console.log("Brišem sve tabele...");
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    // Get all tables
    const [tables] = await conn.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [d],
    );

    for (const { TABLE_NAME } of tables) {
      try {
        await conn.query(`DROP TABLE IF EXISTS \`${TABLE_NAME}\``);
        console.log(`  ✓ Obrisana tabela: ${TABLE_NAME}`);
      } catch (e) {
        console.log(`  ✗ Greška pri brisanju ${TABLE_NAME}: ${e.message}`);
      }
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("\nUčitavam SQL podatke...");
    const sqlContent = fs.readFileSync(
      "C:\\Users\\stefa\\Downloads\\agroai.sql",
      "utf8",
    );

    // Remove the create database and drop table statements that might cause issues
    let cleanedSQL = sqlContent
      .replace(/CREATE DATABASE.*?;/gi, "")
      .replace(/USE `.*?`;/gi, "");

    await conn.query(cleanedSQL);
    console.log("✓ SQL podaci uspešno učitani");

    // Show available users
    console.log("\n=== DOSTUPNI KORISNICI ===");
    const [users] = await conn.query(
      "SELECT id, email, role FROM User ORDER BY id",
    );
    users.forEach((user) => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Uloga: ${user.role}`);
      console.log("  ---");
    });

    await conn.end();
  } catch (err) {
    console.error("Greška:", err.message);
    process.exit(1);
  }
})();

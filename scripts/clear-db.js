require("dotenv").config({ path: ".env" });
const mysql = require("mysql2/promise");

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

    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "ContentReport",
      "DismissedNotification",
      "Like",
      "Comment",
      "Post",
      "PlantImageUpload",
      "DiseaseAnalysis",
      "AiMessage",
      "AiConversation",
      "Session",
      "UserProfile",
      "User",
      "MediaAsset",
      "WeekendActivity",
      "SidebarBanner",
      "MarketPrice",
      "Market",
      "Product",
      "Subsidy",
      "Partner",
    ];

    for (const t of tables) {
      try {
        await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
      } catch (e) {}
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✓ Sve tabele obrisane");
    await conn.end();
  } catch (err) {
    console.error("Greška:", err.message);
  }
})();

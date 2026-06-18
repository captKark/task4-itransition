const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = "postgresql://kark:JdNQgTKpdTSLE21VuSzHEGTC6wTRYXAD@dpg-d8pt0ij6sc1c73d45t5g-a.singapore-postgres.render.com/task4_user_db";

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../database.sql');
        const sqlBlueprint = fs.readFileSync(sqlPath, 'utf8');

        console.log("Connecting directly to Render Cloud Database...");
        
        await pool.query(sqlBlueprint);
        
        console.log("SUCCESS: Tables and indexes built perfectly on the cloud!");
    } catch (err) {
        console.error("MIGRATION FAILED:", err.message);
    } finally {
        await pool.end();
        process.exit();
    }
};

runMigration();
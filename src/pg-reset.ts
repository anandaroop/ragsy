import { Client } from "pg";

console.log("Connecting to postgres...");

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

try {
  await client.connect()
  const result = await client.query('DELETE FROM testlangchain')
  console.log(`Deleted ${result.rowCount}`)
  client.end();
} catch (error) {
  console.error("Connection error", error)
}

console.log("Done.");

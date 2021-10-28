const { Pool } = require("pg");
const { db } = require("config");

const pool = new Pool({
  host: "localhost",
  database: "timakan",
  user: db.user,
  password: db.password,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const query = async (query, params) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (e) {
    console.error(e);
  }
};

const end = () => {
  return pool.end();
};

module.exports = { query, end };

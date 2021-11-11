const { Pool } = require("pg");
const { db } = require("config");
const Harpy = require("./Harpy");

const pool = new Pool({
  host: "localhost",
  database: "timakan",
  user: db.user,
  password: db.password,
});

pool.on("error", (err, client) => {
  Harpy.notify(err);
  process.exit(-1);
});

const query = async (query, params) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (e) {
    throw e;
  }
};

const end = () => {
  return pool.end();
};

module.exports = { query, end };

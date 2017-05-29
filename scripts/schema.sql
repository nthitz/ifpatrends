CREATE TABLE IF NOT EXISTS tournaments_raw (
  tournament_id INTEGER PRIMARY KEY,
  listData TEXT,
  fullData TEXT,
  resultData TEXT
);

CREATE TABLE IF NOT EXISTS locations (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_code TEXT,
  country_name TEXT,
  state TEXT,
  city TEXT,
  hash TEXT UNIQUE,
  latitude REAL,
  longitude REAL
)
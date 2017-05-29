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
);

CREATE TABLE IF NOT EXISTS tournaments (
  tournament_id INTEGER PRIMARY KEY,
  location_hash TEXT,
  name TEXT,
  event_name TEXT,
  date TEXT,
  player_count INTEGER,
  tournament_type TEXT,
  periodic_count INTEGER,
  rating_strength REAL,
  ranking_strength REAL,
  base_value REAL,
  event_value REAL,
  total_wpprs REAL,
  FOREIGN KEY(location_hash) REFERENCES locations(hash)
);
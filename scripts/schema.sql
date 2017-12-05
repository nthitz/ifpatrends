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

CREATE TABLE IF NOT EXISTS players (
  player_id INTEGER PRIMARY KEY,
  name TEXT,
  initials TEXT,
  ranking REAL,
  ranking_rank INTEGER,
  rating REAL,
  rating_rank INTEGER,
  eff_percent REAL,
  eff_percent_rank INTEGER
);

CREATE TABLE IF NOT EXISTS player_history (
  player_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  tournament_id INTEGER,
  player_id INTEGER,
  position INTEGER,
  rank INTEGER,
  rating REAL,
  points REAL
);
CREATE TABLE IF NOT EXISTS gvm_trips (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  trip_date DATE NOT NULL,
  started_at TIME,
  ended_at TIME,
  origin VARCHAR(128),
  destination VARCHAR(128),
  distance INT,
  purpose VARCHAR(64),
  battery_start NUMERIC(4,2),
  battery_end NUMERIC(4,2),
  fuel_consumption NUMERIC(5,2),
  aggression_index INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

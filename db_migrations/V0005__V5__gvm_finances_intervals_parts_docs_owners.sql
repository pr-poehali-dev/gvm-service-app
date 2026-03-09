CREATE TABLE IF NOT EXISTS gvm_finances (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  category VARCHAR(64) NOT NULL,
  subcategory VARCHAR(64),
  expense_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  mileage INT,
  description TEXT,
  location VARCHAR(128),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gvm_intervals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  name VARCHAR(128) NOT NULL,
  interval_km INT,
  interval_days INT,
  last_done_km INT,
  last_done_date DATE,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gvm_parts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  category VARCHAR(64),
  name VARCHAR(128) NOT NULL,
  article VARCHAR(64),
  installed_km INT,
  installed_date DATE,
  cost NUMERIC(12,2),
  resource_km INT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gvm_documents (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  doc_type VARCHAR(32) NOT NULL,
  series VARCHAR(16),
  number VARCHAR(32),
  issued_date DATE,
  expires_date DATE,
  photo_url TEXT,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gvm_owners (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  full_name VARCHAR(128),
  city VARCHAR(64),
  mileage_start INT,
  mileage_end INT,
  owned_from DATE,
  owned_to DATE,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

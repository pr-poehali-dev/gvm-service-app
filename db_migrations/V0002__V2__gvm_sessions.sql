CREATE TABLE IF NOT EXISTS gvm_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gvm_users(id),
  token VARCHAR(256) UNIQUE NOT NULL,
  device_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
)

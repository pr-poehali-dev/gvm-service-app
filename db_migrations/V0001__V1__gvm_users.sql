CREATE TABLE IF NOT EXISTS gvm_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  telegram_bot_token VARCHAR(256),
  telegram_chat_id VARCHAR(64),
  notify_oil BOOLEAN DEFAULT TRUE,
  notify_docs BOOLEAN DEFAULT TRUE,
  notify_filters BOOLEAN DEFAULT TRUE,
  notify_idle BOOLEAN DEFAULT TRUE,
  notify_summary BOOLEAN DEFAULT TRUE,
  oil_warn_km INT DEFAULT 500,
  oil_warn_days INT DEFAULT 14,
  created_at TIMESTAMP DEFAULT NOW()
)

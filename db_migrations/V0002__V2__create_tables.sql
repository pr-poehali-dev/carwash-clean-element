CREATE TABLE t_p72039120_carwash_clean_elemen.cw_cars (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  plate VARCHAR(20) NOT NULL,
  car_class INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p72039120_carwash_clean_elemen.cw_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  price_class1 INTEGER NOT NULL DEFAULT 0,
  price_class2 INTEGER NOT NULL DEFAULT 0,
  price_class3 INTEGER NOT NULL DEFAULT 0,
  duration_class1 INTEGER NOT NULL DEFAULT 0,
  duration_class2 INTEGER NOT NULL DEFAULT 0,
  duration_class3 INTEGER NOT NULL DEFAULT 0,
  is_extra BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE t_p72039120_carwash_clean_elemen.cw_bookings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  car_id INTEGER,
  service_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  car_class INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_price INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p72039120_carwash_clean_elemen.cw_booking_extras (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL
);

CREATE TABLE t_p72039120_carwash_clean_elemen.cw_sessions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

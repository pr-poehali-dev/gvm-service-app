INSERT INTO gvm_users (username, password_hash)
VALUES ('demo', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f')
ON CONFLICT (username) DO NOTHING;

INSERT INTO gvm_cars (user_id, make, model, year, plate, engine_volume, power, fuel_type, transmission, drive_type, mileage, tire_season, tire_size, battery_voltage_start, battery_voltage_stop)
SELECT id, 'Toyota', 'Land Cruiser', 2018, 'А777МА77', 4.5, 249, 'Бензин', 'Автомат', '4WD', 87340, 'Лето', '285/60 R18', 12.6, 13.8
FROM gvm_users WHERE username = 'demo'
ON CONFLICT DO NOTHING;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP,
    registration_time TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'unverified'
);
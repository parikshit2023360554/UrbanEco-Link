-- ==========================================
-- UrbanEco Link - Database Schema DDL
-- India's SWM Rules 2026 Compliance Database
-- ==========================================

-- 1. Enable Spatial PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Enum Types for Statutory Compliance & Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('RESIDENT', 'SOCIETY_ADMIN', 'NGO', 'DELIVERY_PARTNER', 'FACTORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


DO $$ BEGIN
    CREATE TYPE waste_stream AS ENUM ('WET', 'DRY', 'SANITARY', 'HAZARDOUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'ASSIGNED', 'CLEANED', 'VERIFIED', 'FLAGGED_FRAUD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'RESIDENT',
    society_name VARCHAR(255),
    trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pillar 1: Bulk Waste Generator Logs
CREATE TABLE IF NOT EXISTS waste_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stream_category waste_stream NOT NULL,
    estimated_volume_liters NUMERIC(10, 2) NOT NULL CHECK (estimated_volume_liters >= 0),
    estimated_mass_kg NUMERIC(10, 2) NOT NULL CHECK (estimated_mass_kg >= 0),
    density_coefficient NUMERIC(5, 2) NOT NULL,
    capacity_triggered BOOLEAN DEFAULT FALSE,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pillar 2: Crowdsourced Geofenced Civic Reports
CREATE TABLE IF NOT EXISTS civic_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    waste_type waste_stream DEFAULT 'DRY',
    before_image_url TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index for Fast Geofenced Proximity Queries (ST_DWithin, ST_Distance)
CREATE INDEX IF NOT EXISTS idx_civic_reports_location ON civic_reports USING GIST (location);

-- 6. Pillar 3: Anti-Fraud Cleanup Tasks Engine
CREATE TABLE IF NOT EXISTS cleanup_tasks (
    id SERIAL PRIMARY KEY,
    report_id INTEGER UNIQUE NOT NULL REFERENCES civic_reports(id) ON DELETE CASCADE,
    ngo_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    after_image_url TEXT,
    submission_location GEOGRAPHY(Point, 4326),
    verification_distance_meters NUMERIC(10, 2),
    status report_status DEFAULT 'ASSIGNED',
    verification_notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 7. Slashing & Fraud Penalty Audit Logs
CREATE TABLE IF NOT EXISTS slashing_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES cleanup_tasks(id) ON DELETE SET NULL,
    penalty_points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Pillar 4: Pickups & Delivery Partner QR Lifecycle
CREATE TABLE IF NOT EXISTS pickups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    society_name VARCHAR(255),
    stream_category VARCHAR(50) NOT NULL,
    estimated_weight_kg NUMERIC(10, 2) NOT NULL CHECK (estimated_weight_kg >= 0),
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'REQUESTED',
    assigned_driver VARCHAR(255) DEFAULT 'Unassigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scanned_at TIMESTAMP WITH TIME ZONE
-- 9. User Profile & Address Tables for Multi-Role Auth & Geolocation
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    street VARCHAR(255),
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS society_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    society_name VARCHAR(255),
    org_name VARCHAR(255),
    building_type VARCHAR(100),
    total_flats INTEGER,
    contact_number VARCHAR(50),
    phone_number VARCHAR(50),
    registration_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factory_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    factory_name VARCHAR(255),
    license_number VARCHAR(100),
    processing_capacity_tons NUMERIC(10, 2),
    accepted_waste_category VARCHAR(100),
    daily_quota_kg NUMERIC(10, 2),
    contact_person VARCHAR(255),
    contact_number VARCHAR(50),
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_partner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    driver_name VARCHAR(255),
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(50),
    license_number VARCHAR(100),
    phone_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ngo_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ngo_name VARCHAR(255),
    darpan_id VARCHAR(100),
    focus_area VARCHAR(100),
    contact_person VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);




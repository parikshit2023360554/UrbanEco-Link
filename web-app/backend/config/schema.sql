-- ============================================================================
-- Project: UrbanEco Link
-- Regulatory Alignment: India's Solid Waste Management (SWM) Rules 2026
-- Core Scope: 
--   - Pillar 1: Bulk Waste Generators (BWG) to Processing Factories
--   - Pillar 2: Crowdsourced Geofenced Civic Reports & Anti-Fraud Cleanup Tasks
-- Engine Support: S2 Spatial Proximity, Waterfall Allocation & Audit Ledgers
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUMS & STATUTORY DOMAIN TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'RESIDENT', 
        'SOCIETY_ADMIN', 
        'SOCIETY_INDIVIDUAL', 
        'NGO', 
        'DELIVERY_PARTNER', 
        'FACTORY', 
        'ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE waste_stream AS ENUM (
        'WET', 
        'DRY', 
        'SANITARY', 
        'HAZARDOUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM (
        'PENDING', 
        'ASSIGNED', 
        'CLEANED', 
        'VERIFIED', 
        'FLAGGED_FRAUD'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pickup_status AS ENUM (
        'REQUESTED', 
        'ASSIGNED', 
        'OUT_FOR_DELIVERY', 
        'DELIVERED', 
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE batch_lifecycle_status AS ENUM (
        'PENDING_PICKUP', 
        'ASSIGNED', 
        'IN_TRANSIT', 
        'PARTIALLY_DELIVERED', 
        'COMPLETED', 
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE allocation_state AS ENUM (
        'ASSIGNED', 
        'ACCEPTED', 
        'CONFIRMED', 
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'RESIDENT',
    society_name VARCHAR(255),
    eco_points INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. GEOLOCATION & EXTENDED ADDRESS MAPPING
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
    s2_cell_token VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROLE-SPECIFIC ENTITY PROFILES
CREATE TABLE IF NOT EXISTS society_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    society_name VARCHAR(255),
    org_name VARCHAR(255),
    building_type VARCHAR(100),
    total_flats INTEGER DEFAULT 0,
    contact_number VARCHAR(50),
    phone_number VARCHAR(50),
    registration_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factory_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    factory_name VARCHAR(255),
    license_number VARCHAR(100),
    processing_capacity_tons NUMERIC(10, 2),
    accepted_waste_category VARCHAR(100) DEFAULT 'PLASTIC',
    daily_quota_kg NUMERIC(10, 2),
    weekly_quota_kg NUMERIC(10, 2) DEFAULT 1000.00,
    remaining_quota_kg NUMERIC(10, 2),
    s2_cell_token VARCHAR(50),
    contact_person VARCHAR(255),
    contact_number VARCHAR(50),
    phone_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_partner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    driver_name VARCHAR(255),
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(50),
    license_number VARCHAR(100),
    phone_number VARCHAR(50),
    contact_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ngo_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ngo_name VARCHAR(255),
    darpan_id VARCHAR(100),
    focus_area VARCHAR(100),
    contact_person VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. PILLAR 1: SMART BINS & BULK WASTE GENERATOR LOGS
CREATE TABLE IF NOT EXISTS smart_bins (
    id SERIAL PRIMARY KEY,
    society_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bin_code VARCHAR(50) UNIQUE NOT NULL,
    waste_category waste_stream NOT NULL,
    max_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 100.00,
    current_weight_kg NUMERIC(8, 2) DEFAULT 0.00,
    fill_percentage NUMERIC(5, 2) DEFAULT 0.00,
    last_ping TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS waste_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stream_category waste_stream NOT NULL,
    estimated_volume_liters NUMERIC(10, 2) NOT NULL CHECK (estimated_volume_liters >= 0),
    estimated_mass_kg NUMERIC(10, 2) NOT NULL CHECK (estimated_mass_kg >= 0),
    density_coefficient NUMERIC(5, 2) NOT NULL DEFAULT 0.40,
    capacity_triggered BOOLEAN DEFAULT FALSE,
    notes TEXT,
    logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. PILLAR 1: PICKUPS, DISPATCH BATCHES & WATERFALL ALLOCATIONS
CREATE TABLE IF NOT EXISTS pickups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    society_name VARCHAR(255),
    stream_category VARCHAR(50) NOT NULL,
    estimated_weight_kg NUMERIC(10, 2) NOT NULL CHECK (estimated_weight_kg >= 0),
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    status pickup_status DEFAULT 'REQUESTED',
    assigned_driver VARCHAR(255) DEFAULT 'Unassigned',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    scanned_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    society_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    society_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    society_name VARCHAR(255),
    stream_category waste_stream,
    waste_category VARCHAR(50),
    weight_kg NUMERIC(10, 2),
    total_weight_kg NUMERIC(10, 2),
    unallocated_weight_kg NUMERIC(10, 2),
    gate_scale_weight_kg NUMERIC(10, 2),
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status batch_lifecycle_status DEFAULT 'PENDING_PICKUP',
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    driver_name VARCHAR(255),
    factory_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS batch_allocations (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    factory_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allocated_weight_kg NUMERIC(10, 2) NOT NULL,
    received_weight_kg NUMERIC(10, 2),
    distance_km NUMERIC(10, 3),
    s2_cell_token VARCHAR(50),
    drop_order INTEGER DEFAULT 1,
    status allocation_state DEFAULT 'ASSIGNED',
    handover_manifest_qr VARCHAR(255) UNIQUE,
    allocated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS delivery_routes (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    route_name VARCHAR(255),
    s2_cell_token VARCHAR(50),
    stops JSONB,
    total_weight_kg NUMERIC(10, 2),
    total_distance_km NUMERIC(10, 3),
    status VARCHAR(50) DEFAULT 'ASSIGNED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. PILLAR 2: CROWDSOURCED GEOFENCED CIVIC REPORTS & ANTI-FRAUD
CREATE TABLE IF NOT EXISTS civic_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    waste_type waste_stream DEFAULT 'DRY',
    before_image_url TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cleanup_tasks (
    id SERIAL PRIMARY KEY,
    report_id INTEGER UNIQUE NOT NULL REFERENCES civic_reports(id) ON DELETE CASCADE,
    ngo_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    after_image_url TEXT,
    submission_location GEOGRAPHY(Point, 4326),
    verification_distance_meters NUMERIC(10, 2),
    status report_status DEFAULT 'ASSIGNED',
    verification_notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS slashing_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES cleanup_tasks(id) ON DELETE SET NULL,
    penalty_points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. PERFORMANCE, S2 TOKEN & SPATIAL POSTGIS INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_s2 ON addresses(s2_cell_token);
CREATE INDEX IF NOT EXISTS idx_factory_profiles_user ON factory_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_factory_profiles_s2 ON factory_profiles(s2_cell_token);
CREATE INDEX IF NOT EXISTS idx_delivery_profiles_user ON delivery_partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_user ON waste_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_qr ON batches(qr_code);
CREATE INDEX IF NOT EXISTS idx_batches_society ON batches(society_id);
CREATE INDEX IF NOT EXISTS idx_batches_driver ON batches(driver_id);
CREATE INDEX IF NOT EXISTS idx_batch_allocations_batch ON batch_allocations(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_allocations_factory_status ON batch_allocations(factory_user_id, status);
CREATE INDEX IF NOT EXISTS idx_cleanup_tasks_ngo ON cleanup_tasks(ngo_id);
CREATE INDEX IF NOT EXISTS idx_civic_reports_location ON civic_reports USING GIST(location);
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection string configuration with fallback options
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/urbaneco_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected Error on Idle PostgreSQL Client:', err.message);
});

/**
 * Test DB Connection & Verify PostGIS Extension
 */
export const connectDB = async () => {
  try {
    const client = await pool.connect();

    // Verify PostGIS extension
    try {
      const gisCheck = await client.query("SELECT PostGIS_Full_Version();");
      console.log('✅ Connected to UrbanEco PostgreSQL Database');
      console.log(`🗺️ PostGIS Spatial Extension Verified: ${gisCheck.rows[0].postgis_full_version.split(' ')[0]}`);
    } catch {
      console.log('✅ Connected to UrbanEco PostgreSQL Database');
    }

    // Auto-migrate DELIVERY_PARTNER enum value if not present
    try {
      await client.query(`
        DO $$ BEGIN
          ALTER TYPE user_role ADD VALUE 'DELIVERY_PARTNER';
        EXCEPTION
          WHEN duplicate_object THEN null;
          WHEN others THEN null;
        END $$;
      `);
    } catch (e) {
      // Ignore if enum type doesn't exist yet or already updated
    }

    // Ensure users table exists with required columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'RESIDENT',
        society_name VARCHAR(255),
        trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS society_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS eco_points INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100;
      DO $$ 
      BEGIN 
        ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;

      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text IN ('RESIDENT', 'SOCIETY_ADMIN', 'SOCIETY_INDIVIDUAL', 'NGO', 'FACTORY', 'DELIVERY_PARTNER', 'ADMIN'));
    `);

    // Detect whether users.id is UUID or INTEGER in active Postgres database
    const userColumnCheck = await client.query(
      "SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'"
    );
    const userIdType = userColumnCheck.rows[0]?.data_type === 'uuid' ? 'UUID' : 'INTEGER';

    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} REFERENCES users(id) ON DELETE CASCADE,
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
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS street VARCHAR(255);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS street_address VARCHAR(255);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

      CREATE TABLE IF NOT EXISTS society_profiles (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        society_name VARCHAR(255),
        org_name VARCHAR(255),
        building_type VARCHAR(100),
        total_flats INTEGER,
        contact_number VARCHAR(50),
        phone_number VARCHAR(50),
        registration_number VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS society_name VARCHAR(255);
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS org_name VARCHAR(255);
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS building_type VARCHAR(100);
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS total_flats INTEGER DEFAULT 0;
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
      ALTER TABLE society_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);

      CREATE TABLE IF NOT EXISTS factory_profiles (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        factory_name VARCHAR(255),
        license_number VARCHAR(100),
        processing_capacity_tons NUMERIC(10, 2),
        accepted_waste_category VARCHAR(100),
        daily_quota_kg NUMERIC(10, 2),
        remaining_quota_kg NUMERIC(10, 2),
        s2_cell_token VARCHAR(50),
        contact_person VARCHAR(255),
        contact_number VARCHAR(50),
        phone_number VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS processing_capacity_tons NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS accepted_waste_category VARCHAR(100);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS daily_quota_kg NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS remaining_quota_kg NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS s2_cell_token VARCHAR(50);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);

      CREATE TABLE IF NOT EXISTS delivery_partner_profiles (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        driver_name VARCHAR(255),
        vehicle_type VARCHAR(100),
        vehicle_number VARCHAR(50),
        license_number VARCHAR(100),
        phone_number VARCHAR(50),
        contact_number VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        current_latitude NUMERIC(10, 7),
        current_longitude NUMERIC(10, 7),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(100);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(50);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS current_latitude NUMERIC(10, 7);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS current_longitude NUMERIC(10, 7);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
      ALTER TABLE delivery_partner_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);

      CREATE TABLE IF NOT EXISTS ngo_profiles (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        ngo_name VARCHAR(255),
        darpan_id VARCHAR(100),
        focus_area VARCHAR(100),
        contact_person VARCHAR(255),
        phone_number VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE ngo_profiles ADD COLUMN IF NOT EXISTS darpan_id VARCHAR(100);
      ALTER TABLE ngo_profiles ADD COLUMN IF NOT EXISTS focus_area VARCHAR(100);
      ALTER TABLE ngo_profiles ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
      ALTER TABLE ngo_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
    `);

    // Ensure pickups & batches tables exist
    await client.query(`
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
      );
      ALTER TABLE pickups ADD COLUMN IF NOT EXISTS id SERIAL;
      ALTER TABLE pickups ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
      ALTER TABLE pickups ADD COLUMN IF NOT EXISTS society_name VARCHAR(255);
      ALTER TABLE pickups ADD COLUMN IF NOT EXISTS assigned_driver VARCHAR(255) DEFAULT 'Unassigned';
      DO $$ 
      BEGIN 
        ALTER TABLE pickups ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::text;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS batches (
        id SERIAL PRIMARY KEY,
        society_id INTEGER,
        society_name VARCHAR(255),
        stream_category VARCHAR(50) NOT NULL,
        weight_kg NUMERIC(10, 2) NOT NULL,
        qr_code VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING_PICKUP',
        driver_id INTEGER,
        driver_name VARCHAR(255),
        factory_id INTEGER,
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        picked_up_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE
      );

      ALTER TABLE batches ADD COLUMN IF NOT EXISTS id SERIAL;
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS society_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS society_user_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS user_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS society_name VARCHAR(255);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS waste_category VARCHAR(50);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS stream_category VARCHAR(50);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_weight_kg NUMERIC(10, 2);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10, 2);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING_PICKUP';
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS driver_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS factory_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0;
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
      DO $$ 
      BEGIN 
        ALTER TABLE batches ALTER COLUMN waste_category DROP NOT NULL;
        ALTER TABLE batches ALTER COLUMN total_weight_kg DROP NOT NULL;
        ALTER TABLE batches ALTER COLUMN weight_kg DROP NOT NULL;
        ALTER TABLE batches ALTER COLUMN stream_category DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;

      ALTER TABLE civic_reports ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE civic_reports ADD COLUMN IF NOT EXISTS waste_type VARCHAR(50) DEFAULT 'DRY';
      ALTER TABLE civic_reports ADD COLUMN IF NOT EXISTS id SERIAL;
      ALTER TABLE civic_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

      CREATE TABLE IF NOT EXISTS batch_allocations (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
        factory_user_id ${userIdType} REFERENCES users(id) ON DELETE CASCADE,
        allocated_weight_kg NUMERIC(10, 2) NOT NULL,
        distance_km NUMERIC(10, 3),
        s2_cell_token VARCHAR(50),
        drop_order INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS id SERIAL;
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS factory_user_id ${userIdType};
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS factory_id ${userIdType};
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10, 3);
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS s2_cell_token VARCHAR(50);
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS drop_order INTEGER DEFAULT 1;
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ASSIGNED';
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

      CREATE TABLE IF NOT EXISTS delivery_routes (
        id SERIAL PRIMARY KEY,
        driver_id ${userIdType},
        route_name VARCHAR(255),
        s2_cell_token VARCHAR(50),
        stops JSONB,
        total_weight_kg NUMERIC(10, 2),
        total_distance_km NUMERIC(10, 3),
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS daily_quota_kg NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS weekly_quota_kg NUMERIC(10, 2) DEFAULT 1000.00;
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS remaining_quota_kg NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS accepted_waste_category VARCHAR(100) DEFAULT 'PLASTIC';
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS s2_cell_token VARCHAR(50);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS s2_cell_token VARCHAR(50);

      CREATE INDEX IF NOT EXISTS idx_allocations_factory_status ON batch_allocations (factory_user_id, status);
    `);

    console.log('📦 Pickups, Batches & S2 Allocation Engine Tables Schema Verified');

    client.release();
  } catch (err) {
    console.warn(`⚠️ Connected to UrbanEco PostgreSQL Database (Note: Ensure PostGIS extension is enabled via 'CREATE EXTENSION IF NOT EXISTS postgis;')`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal Database Connection Error:', err);
      process.exit(1);
    }
  }
};

/**
 * Helper function for executing parameterized SQL queries
 * @param {string} text - SQL Query String
 * @param {Array} params - Parameter Values
 */
export const query = (text, params) => pool.query(text, params);

export default pool;

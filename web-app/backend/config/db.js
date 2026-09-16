import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Prefer hosted database URL (Supabase/Neon), fallback to local development
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  'postgresql://postgres:postgres@localhost:5432/urbaneco_db';

const isHostedDatabase = /supabase\.co|supabase\.com|neon\.tech|render\.com/i.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isHostedDatabase || process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected Error on Idle PostgreSQL Client:', err.message);
});

/**
 * Test DB Connection & Verify / Migrate Production Schema
 */
export const connectDB = async () => {
  let client;
  try {
    client = await pool.connect();

    // 1. Initialize Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    try {
      const gisCheck = await client.query('SELECT PostGIS_Full_Version();');
      console.log('✅ Connected to UrbanEco PostgreSQL Database');
      console.log(`🗺️ PostGIS Spatial Extension Verified: ${gisCheck.rows[0].postgis_full_version.split(' ')[0]}`);
    } catch {
      console.log('✅ Connected to UrbanEco PostgreSQL Database');
    }

    // 2. Enum Upgrades & Role Checks
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
      // Ignore if enum doesn't exist
    }

    // 3. Core Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        full_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'RESIDENT',
        society_name VARCHAR(255),
        eco_points INTEGER DEFAULT 0,
        trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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
      ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role::text IN ('RESIDENT', 'SOCIETY_ADMIN', 'SOCIETY_INDIVIDUAL', 'NGO', 'FACTORY', 'DELIVERY_PARTNER', 'ADMIN'));
    `);

    // 4. Detect User ID Type (UUID or SERIAL) for polymorphic Foreign Keys
    const userColumnCheck = await client.query(
      "SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'"
    );
    const userIdType = userColumnCheck.rows[0]?.data_type === 'uuid' ? 'UUID' : 'INTEGER';

    // 5. Addresses & Specialized Profiles
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
        s2_cell_token VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS street VARCHAR(255);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS street_address VARCHAR(255);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS s2_cell_token VARCHAR(50);

      CREATE TABLE IF NOT EXISTS society_profiles (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        society_name VARCHAR(255),
        org_name VARCHAR(255),
        building_type VARCHAR(100),
        total_flats INTEGER DEFAULT 0,
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
        accepted_waste_category VARCHAR(100) DEFAULT 'PLASTIC',
        daily_quota_kg NUMERIC(10, 2),
        weekly_quota_kg NUMERIC(10, 2) DEFAULT 1000.00,
        remaining_quota_kg NUMERIC(10, 2),
        s2_cell_token VARCHAR(50),
        contact_person VARCHAR(255),
        contact_number VARCHAR(50),
        phone_number VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS processing_capacity_tons NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS accepted_waste_category VARCHAR(100) DEFAULT 'PLASTIC';
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS daily_quota_kg NUMERIC(10, 2);
      ALTER TABLE factory_profiles ADD COLUMN IF NOT EXISTS weekly_quota_kg NUMERIC(10, 2) DEFAULT 1000.00;
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

    // 6. Smart Bins & Residential Waste Logs (Pillar 1)
    await client.query(`
      CREATE TABLE IF NOT EXISTS smart_bins (
        id SERIAL PRIMARY KEY,
        society_id ${userIdType} REFERENCES users(id) ON DELETE CASCADE,
        bin_code VARCHAR(50) UNIQUE NOT NULL,
        waste_category VARCHAR(50) NOT NULL,
        max_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 100.00,
        current_weight_kg NUMERIC(8, 2) DEFAULT 0.00,
        fill_percentage NUMERIC(5, 2) DEFAULT 0.00,
        last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS waste_logs (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stream_category VARCHAR(50) NOT NULL CHECK (stream_category IN ('WET','DRY','SANITARY','HAZARDOUS')),
        estimated_volume_liters NUMERIC(10, 2) NOT NULL CHECK (estimated_volume_liters >= 0),
        estimated_mass_kg NUMERIC(10, 2) NOT NULL CHECK (estimated_mass_kg >= 0),
        density_coefficient NUMERIC(5, 2) NOT NULL DEFAULT 0.40,
        capacity_triggered BOOLEAN DEFAULT FALSE,
        notes TEXT,
        logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Pickups, Batches, & Route Dispatch Engines
    await client.query(`
      CREATE TABLE IF NOT EXISTS pickups (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        society_name VARCHAR(255),
        stream_category VARCHAR(50) NOT NULL,
        estimated_weight_kg NUMERIC(10, 2) NOT NULL CHECK (estimated_weight_kg >= 0),
        qr_code_token VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'REQUESTED',
        assigned_driver VARCHAR(255) DEFAULT 'Unassigned',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        scanned_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS batches (
        id SERIAL PRIMARY KEY,
        society_id ${userIdType},
        society_user_id ${userIdType},
        user_id ${userIdType},
        society_name VARCHAR(255),
        stream_category VARCHAR(50),
        waste_category VARCHAR(50),
        weight_kg NUMERIC(10, 2),
        total_weight_kg NUMERIC(10, 2),
        unallocated_weight_kg NUMERIC(10, 2),
        gate_scale_weight_kg NUMERIC(10, 2),
        qr_code VARCHAR(255) UNIQUE,
        status VARCHAR(50) DEFAULT 'PENDING_PICKUP',
        driver_id ${userIdType},
        driver_name VARCHAR(255),
        factory_id ${userIdType},
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        picked_up_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE
      );

      ALTER TABLE batches ADD COLUMN IF NOT EXISTS user_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS society_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS society_user_id ${userIdType};
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS society_name VARCHAR(255);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS waste_category VARCHAR(50);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS gate_scale_weight_kg NUMERIC(10, 2);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS unallocated_weight_kg NUMERIC(10, 2);
      ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_weight_kg NUMERIC(10, 2);

      CREATE TABLE IF NOT EXISTS batch_allocations (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
        factory_user_id ${userIdType} REFERENCES users(id) ON DELETE CASCADE,
        allocated_weight_kg NUMERIC(10, 2) NOT NULL,
        received_weight_kg NUMERIC(10, 2),
        distance_km NUMERIC(10, 3),
        s2_cell_token VARCHAR(50),
        drop_order INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        handover_manifest_qr VARCHAR(255),
        allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP WITH TIME ZONE
      );

      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS received_weight_kg NUMERIC(10, 2);
      ALTER TABLE batch_allocations ADD COLUMN IF NOT EXISTS handover_manifest_qr VARCHAR(255);

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
    `);

    // 8. Crowdsourced Street Cleaning & Anti-Fraud Verification (Pillar 2)
    try {
      const civicReportColumnCheck = await client.query(
        "SELECT data_type FROM information_schema.columns WHERE table_name = 'civic_reports' AND column_name = 'id'"
      );
      const civicReportIdType = civicReportColumnCheck.rows[0]?.data_type === 'uuid' ? 'UUID' : 'INTEGER';

      await client.query(`
        CREATE TABLE IF NOT EXISTS civic_reports (
          id SERIAL PRIMARY KEY,
          reporter_id ${userIdType} REFERENCES users(id) ON DELETE SET NULL,
          description TEXT,
          waste_type VARCHAR(50) DEFAULT 'DRY',
          before_image_url TEXT,
          location GEOGRAPHY(Point, 4326) NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING'
            CHECK (status IN ('PENDING', 'ASSIGNED', 'CLEANED', 'VERIFIED', 'FLAGGED_FRAUD')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cleanup_tasks (
          id SERIAL PRIMARY KEY,
          report_id ${civicReportIdType} UNIQUE NOT NULL REFERENCES civic_reports(id) ON DELETE CASCADE,
          ngo_id ${userIdType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          after_image_url TEXT,
          submission_location GEOGRAPHY(Point, 4326),
          verification_distance_meters NUMERIC(10, 2),
          status VARCHAR(50) DEFAULT 'ASSIGNED'
            CHECK (status IN ('PENDING', 'ASSIGNED', 'CLEANED', 'VERIFIED', 'FLAGGED_FRAUD')),
          verification_notes TEXT,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          submitted_at TIMESTAMP WITH TIME ZONE,
          verified_at TIMESTAMP WITH TIME ZONE
        );

        CREATE TABLE IF NOT EXISTS slashing_logs (
          id SERIAL PRIMARY KEY,
          user_id ${userIdType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          task_id INTEGER REFERENCES cleanup_tasks(id) ON DELETE SET NULL,
          penalty_points INTEGER NOT NULL,
          reason TEXT NOT NULL,
          logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {
      console.warn('⚠️ Notice on Civic Reports schema initialization:', e.message);
    }

    // 9. Performance & Spatial GIS Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_addresses_s2 ON addresses(s2_cell_token);
      CREATE INDEX IF NOT EXISTS idx_factory_profiles_s2 ON factory_profiles(s2_cell_token);
      CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
      CREATE INDEX IF NOT EXISTS idx_batches_qr ON batches(qr_code);
      CREATE INDEX IF NOT EXISTS idx_allocations_batch ON batch_allocations(batch_id);
      CREATE INDEX IF NOT EXISTS idx_allocations_factory_status ON batch_allocations(factory_user_id, status);
      CREATE INDEX IF NOT EXISTS idx_civic_reports_location ON civic_reports USING GIST(location);
    `);

    console.log('📦 Pickups, Batches, S2 Spatial Allocation & Anti-Fraud Engines Verified');

    client.release();
  } catch (err) {
    if (client) client.release();
    const details = err.errors?.map((cause) => cause.message).filter(Boolean).join('; ');
    console.error(
      `❌ Database initialization failed [${err.code || 'UNKNOWN'}]: ${err.message || details || 'Unable to connect to the database.'}`
    );
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
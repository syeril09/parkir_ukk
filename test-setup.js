#!/usr/bin/env node
/**
 * Verification script for database setup and connectivity
 */

const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_parkir1',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};

async function testConnection() {
  console.log('🔍 Testing DATABASE connection...');
  console.log('   Host:', config.host);
  console.log('   User:', config.user);
  console.log('   Database:', config.database);
  console.log('');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!\n');

    // Test basic queries
    console.log('📋 Checking tables...');
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.database]
    );

    if (tables.length === 0) {
      console.log('⚠️  No tables found. You need to apply database-schema.sql:');
      console.log('   mysql -u root < backend/config/database-schema.sql\n');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
      console.log('');
    }

    // Check if jenis_kendaraan has data
    const [jenis] = await connection.execute('SELECT COUNT(*) as count FROM jenis_kendaraan');
    if (jenis[0].count === 0) {
      console.log('⚠️  No vehicle types (jenis_kendaraan) in database');
      console.log('   You need to seed the data. Run: node backend/config/seed.js\n');
    } else {
      console.log(`✅ Found ${jenis[0].count} vehicle types\n`);
    }

    // Check area_parkir data
    const [areas] = await connection.execute('SELECT COUNT(*) as count FROM area_parkir');
    console.log(`📊 Areas: ${areas[0].count} | Users: ${(await connection.execute('SELECT COUNT(*) as count FROM users'))[0][0].count}`);

    console.log('\n✨ Setup looks good! You can now run:');
    console.log('   cd backend && npm run dev');
    console.log('   cd frontend && npm run dev\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Check your .env credentials (DB_HOST, DB_USER, DB_PASSWORD)');
    console.error('3. Create database: mysql -e "CREATE DATABASE db_parkir1;"');
    console.error('4. Apply schema: mysql -u root < backend/config/database-schema.sql\n');
    process.exit(1);
  }
}

testConnection();

const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runSettingsMigration() {
  try {
    console.log('🚀 Starting settings migration...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'migrate_settings_to_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Settings table created successfully!');
    console.log('✅ Default settings inserted from settings.json');
    console.log('\n📌 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Settings will now be read from database');
    console.log('   3. Changes in Admin Settings will apply immediately (no restart needed)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runSettingsMigration();

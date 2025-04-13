const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',     // Default MySQL user
  password: '',     // Default empty password
  multipleStatements: true // Enable multiple SQL statements
};

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    
    // Read SQL file
    console.log('Reading SQL file...');
    const sqlFile = path.join(__dirname, 'reporting_system.sql');
    const sqlContent = await fs.readFile(sqlFile, 'utf8');
    
    // Execute SQL commands
    console.log('Setting up database...');
    await connection.query(sqlContent);
    
    console.log('Database setup completed successfully! 🎉');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Add command line arguments support for database credentials
const args = process.argv.slice(2);
if (args.length >= 2) {
  dbConfig.user = args[0];
  dbConfig.password = args[1];
}

// Run the setup
setupDatabase(); 
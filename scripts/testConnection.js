const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

console.log('Testing connection with URL:', connectionString);

async function testConnection() {
  // Test 1: SSL with rejectUnauthorized: false
  console.log('\n--- Test 1: SSL { rejectUnauthorized: false } ---');
  const client1 = new Client({
    connectionString: connectionString.replace('?sslmode=require', '').replace('?sslmode=no-verify', ''),
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client1.connect();
    console.log('✅ Connection Successful!');
    const res = await client1.query('SELECT NOW()');
    console.log('Query Result:', res.rows[0]);
    await client1.end();
    return; // Exit if successful
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    await client1.end();
  }

  // Test 2: SSL true (strict)
  console.log('\n--- Test 2: SSL true ---');
  const client2 = new Client({
    connectionString: connectionString.replace('?sslmode=require', '').replace('?sslmode=no-verify', ''),
    ssl: true
  });

  try {
    await client2.connect();
    console.log('✅ Connection Successful!');
    const res = await client2.query('SELECT NOW()');
    console.log('Query Result:', res.rows[0]);
    await client2.end();
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    await client2.end();
  }

  // Test 3: No SSL
  console.log('\n--- Test 3: No SSL ---');
  const client3 = new Client({
    connectionString: connectionString.replace('?sslmode=require', '').replace('?sslmode=no-verify', ''),
    ssl: false
  });

  try {
    await client3.connect();
    console.log('✅ Connection Successful (No SSL)!');
    await client3.end();
  } catch (err) {
    console.error('❌ Connection Failed (No SSL):', err.message);
    await client3.end();
  }
}

testConnection();

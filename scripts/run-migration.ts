import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Load environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  try {
    console.log("🚀 Running admin system migration...");
    
    // Read the migration file
    const migrationPath = join(process.cwd(), "db/migrations/0002_add_admin_system.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");
    
    console.log("📄 Migration file loaded");
    console.log("🔄 Executing SQL statements...");
    
    // Split SQL more intelligently, handling dollar-quoted strings
    const statements: string[] = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarQuoteTag = '';
    
    const lines = migrationSQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comment-only lines
      if (trimmedLine.startsWith('--') && !inDollarQuote) {
        continue;
      }
      
      // Check for dollar quote start/end
      const dollarQuoteMatch = line.match(/\$([^$]*)\$/);
      if (dollarQuoteMatch) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteTag = dollarQuoteMatch[0];
        } else if (dollarQuoteMatch[0] === dollarQuoteTag) {
          inDollarQuote = false;
          dollarQuoteTag = '';
        }
      }
      
      currentStatement += line + '\n';
      
      // Check for statement end (semicolon not in dollar quote)
      if (line.includes(';') && !inDollarQuote) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0 && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await sql(statement);
        successCount++;
        
        // Log progress for major operations
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE (\w+)/)?.[1];
          console.log(`  ✓ Created table: ${tableName}`);
        } else if (statement.includes('ALTER TABLE')) {
          const tableName = statement.match(/ALTER TABLE (\w+)/)?.[1];
          console.log(`  ✓ Modified table: ${tableName}`);
        } else if (statement.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX (\w+)/)?.[1];
          console.log(`  ✓ Created index: ${indexName}`);
        } else if (statement.includes('CREATE TYPE')) {
          const typeName = statement.match(/CREATE TYPE (\w+)/)?.[1];
          console.log(`  ✓ Created type: ${typeName}`);
        } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          const funcName = statement.match(/CREATE OR REPLACE FUNCTION (\w+)/)?.[1];
          console.log(`  ✓ Created function: ${funcName}`);
        } else if (statement.includes('CREATE TRIGGER')) {
          const triggerName = statement.match(/CREATE TRIGGER (\w+)/)?.[1];
          console.log(`  ✓ Created trigger: ${triggerName}`);
        }
      } catch (error: any) {
        // Check if error is due to object already existing
        if (error.message?.includes("already exists") || error.code === '42P07' || error.code === '42710' || error.code === '42723') {
          skipCount++;
          const objectType = statement.includes('CREATE TABLE') ? 'table' :
                           statement.includes('CREATE INDEX') ? 'index' :
                           statement.includes('CREATE TYPE') ? 'type' :
                           statement.includes('ALTER TABLE') ? 'column' : 'object';
          console.log(`  ⊘ Skipped: ${objectType} already exists`);
        } else {
          console.error(`  ✗ Error executing statement ${i + 1}:`, error.message);
          console.error(`  Statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }
    
    console.log(`\n✅ Migration completed: ${successCount} statements executed, ${skipCount} skipped (already exist)`);
    console.log("\n📊 Database schema includes:");
    console.log("  - support_tickets table");
    console.log("  - ticket_messages table");
    console.log("  - admin_actions table");
    console.log("  - users table (with role, suspension fields)");
    console.log("  - nin_verifications table (with purpose field)");
    console.log("\n🔍 Performance indexes created");
    console.log("✅ Database schema is ready for admin system");

  } catch (error: any) {
    console.error("❌ Error running migration:", error);
    throw error;
  }
}

// Run the script
runMigration()
  .then(() => {
    console.log("\n✅ Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function testSchema() {
  try {
    console.log("🧪 Testing admin system database schema...\n");

    // Test 1: Check if super admin exists
    console.log("1️⃣  Testing users table with role field...");
    const superAdmins = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.role, "super_admin")
    });
    console.log(`   ✓ Found ${superAdmins.length} super admin(s)`);
    if (superAdmins.length > 0) {
      console.log(`   ✓ Super admin email: ${superAdmins[0].email}`);
      console.log(`   ✓ Super admin role: ${superAdmins[0].role}`);
    }

    // Test 2: Check support_tickets table
    console.log("\n2️⃣  Testing support_tickets table...");
    const tickets = await db.query.supportTickets.findMany({
      limit: 1
    });
    console.log(`   ✓ support_tickets table accessible (${tickets.length} tickets found)`);

    // Test 3: Check ticket_messages table
    console.log("\n3️⃣  Testing ticket_messages table...");
    const messages = await db.query.ticketMessages.findMany({
      limit: 1
    });
    console.log(`   ✓ ticket_messages table accessible (${messages.length} messages found)`);

    // Test 4: Check admin_actions table
    console.log("\n4️⃣  Testing admin_actions table...");
    const actions = await db.query.adminActions.findMany({
      limit: 1
    });
    console.log(`   ✓ admin_actions table accessible (${actions.length} actions found)`);

    // Test 5: Check nin_verifications with purpose field
    console.log("\n5️⃣  Testing nin_verifications table with purpose field...");
    const verifications = await db.query.ninVerifications.findMany({
      limit: 1
    });
    console.log(`   ✓ nin_verifications table accessible (${verifications.length} verifications found)`);

    // Test 6: Check user suspension fields
    console.log("\n6️⃣  Testing user suspension fields...");
    const suspendedUsers = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.isSuspended, true),
      limit: 1
    });
    console.log(`   ✓ User suspension fields accessible (${suspendedUsers.length} suspended users found)`);

    console.log("\n✅ All schema tests passed!");
    console.log("\n📊 Summary:");
    console.log(`   - Super admins: ${superAdmins.length}`);
    console.log(`   - Support tickets: ${tickets.length}`);
    console.log(`   - Ticket messages: ${messages.length}`);
    console.log(`   - Admin actions: ${actions.length}`);
    console.log(`   - Verifications: ${verifications.length}`);
    console.log(`   - Suspended users: ${suspendedUsers.length}`);
    console.log("\n🎉 Admin system database schema is fully operational!");

  } catch (error) {
    console.error("❌ Schema test failed:", error);
    throw error;
  }
}

// Run the test
testSchema()
  .then(() => {
    console.log("\n✅ Test script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test script failed:", error);
    process.exit(1);
  });

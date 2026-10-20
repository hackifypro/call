import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'finance' | 'moderator' | 'support';
  phoneNumber?: string;
  phoneVerified: boolean;
  isActive: boolean;
  passwordHash: string;
  createdAt: string;
}

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1] || process.env.ADMIN_EMAIL;
  const passArg = args.find((a) => a.startsWith('--password='))?.split('=')[1] || process.env.ADMIN_PASSWORD;
  const roleArg = (args.find((a) => a.startsWith('--role='))?.split('=')[1] || process.env.ADMIN_ROLE || 'super_admin') as any;
  const nameArg = args.find((a) => a.startsWith('--name='))?.split('=')[1] || process.env.ADMIN_NAME || 'Platform Administrator';

  if (!emailArg || !passArg) {
    console.log(`
=============================================================
AURA INDIA — ADMINISTRATIVE ACCOUNT PROVISIONING TOOL
=============================================================
Usage:
  npx tsx scripts/create-admin.ts --email=<email> --password=<password> [--role=super_admin|finance|moderator|support] [--name=<name>]

Example:
  npx tsx scripts/create-admin.ts --email=admin@aura-india.com --password=Admin@2026Secure --role=super_admin --name="Chief Administrator"
=============================================================
`);
    process.exit(1);
  }

  const validRoles = ['super_admin', 'finance', 'moderator', 'support'];
  if (!validRoles.includes(roleArg)) {
    console.error(`Error: Invalid administrative role '${roleArg}'. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  if (passArg.length < 8) {
    console.error('Error: Administrator password must be at least 8 characters long.');
    process.exit(1);
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let users: UserRecord[] = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch {
      users = [];
    }
  }

  const normalized = emailArg.trim().toLowerCase();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === normalized);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passArg, salt);

  if (existingIdx !== -1) {
    users[existingIdx].role = roleArg;
    users[existingIdx].fullName = nameArg;
    users[existingIdx].passwordHash = passwordHash;
    users[existingIdx].isActive = true;
    console.log(`[OK] Updated existing administrator account for: ${normalized} (Role: ${roleArg})`);
  } else {
    const newUser: UserRecord = {
      id: `usr-admin-${Date.now()}`,
      email: normalized,
      fullName: nameArg,
      phoneNumber: '+919811000000',
      phoneVerified: true,
      role: roleArg,
      isActive: true,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    console.log(`[OK] Created new administrator account for: ${normalized} (Role: ${roleArg})`);
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  console.log(`[OK] Saved to persistent store: ${USERS_FILE}`);
  console.log(`Admin Portal: http://localhost:3000/admin/login`);
}

main().catch(console.error);

import { registerNewUser } from '../src/lib/userStore';

async function seed() {
  const custRes = await registerNewUser({
    fullName: 'Rahul Sharma',
    email: 'customer@aura-india.com',
    passwordPlain: 'Customer@2026Pass',
    role: 'customer',
    phoneNumber: '+919820112233',
  });
  console.log('Customer account seeded:', custRes);

  const compRes = await registerNewUser({
    fullName: 'Pooja Mehta',
    email: 'companion@aura-india.com',
    passwordPlain: 'Companion@2026Pass',
    role: 'companion',
    phoneNumber: '+919876543210',
  });
  console.log('Companion account seeded:', compRes);
}

seed().catch(console.error);

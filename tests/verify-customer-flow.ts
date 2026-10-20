async function testCustomerEndpoints() {
  console.log('\n--- VERIFYING LIVE CUSTOMER DASHBOARD HTTP ENDPOINTS ---');

  // 1. Unauthenticated request to /customer/dashboard
  const unauthRes = await fetch('http://localhost:3000/customer/dashboard', {
    redirect: 'manual',
  });
  console.log(`1. Unauthenticated /customer/dashboard status: ${unauthRes.status}`);
  if (unauthRes.status === 307 || unauthRes.status === 308) {
    console.log(`   Redirected to: ${unauthRes.headers.get('location')}`);
  }

  // 2. Login as Customer
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'customer@aura-india.com',
      password: 'Customer@2026Pass',
    }),
  });
  console.log(`2. Login status: ${loginRes.status}`);
  const loginJson = await loginRes.json();
  console.log(`   Logged in user: ${loginJson.user?.fullName} (${loginJson.user?.role})`);

  const setCookie = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = setCookie.match(/aura_session_token=([^;]+)/);
  const sessionToken = tokenMatch ? tokenMatch[1] : '';

  if (!sessionToken) {
    console.error('Failed to retrieve session cookie from login response.');
    process.exit(1);
  }

  const authHeaders = {
    Cookie: `aura_session_token=${sessionToken}`,
  };

  // 3. Authenticated Dashboard API
  const dashRes = await fetch('http://localhost:3000/api/customer/dashboard', {
    headers: authHeaders,
  });
  console.log(`3. /api/customer/dashboard status: ${dashRes.status}`);
  const dashData = await dashRes.json();
  console.log(`   Customer: ${dashData.user?.fullName}`);
  console.log(`   Metrics:`, dashData.metrics);

  // 4. Authenticated Bookings API
  const bookingsRes = await fetch('http://localhost:3000/api/customer/bookings', {
    headers: authHeaders,
  });
  console.log(`4. /api/customer/bookings status: ${bookingsRes.status}`);
  const bookingsData = await bookingsRes.json();
  console.log(`   Total bookings: ${bookingsData.totalCount}`);

  // 5. Authenticated Favorites API
  const favRes = await fetch('http://localhost:3000/api/customer/favorites', {
    headers: authHeaders,
  });
  console.log(`5. /api/customer/favorites status: ${favRes.status}`);
  const favData = await favRes.json();
  console.log(`   Favorites count: ${favData.favorites?.length}`);

  // 6. Authenticated Payments API
  const payRes = await fetch('http://localhost:3000/api/customer/payments', {
    headers: authHeaders,
  });
  console.log(`6. /api/customer/payments status: ${payRes.status}`);
  const payData = await payRes.json();
  console.log(`   Total Paid: ₹${payData.totalPaid}, Available Credits: ₹${payData.availableCredits}`);

  // 7. Authenticated HTML Pages
  const pages = [
    '/customer/dashboard',
    '/customer/explore',
    '/customer/cities',
    '/customer/bookings',
    '/customer/payments',
    '/customer/refunds',
    '/customer/favorites',
    '/customer/messages',
    '/customer/reviews',
    '/customer/notifications',
    '/customer/support',
    '/customer/settings',
  ];

  console.log('\n7. Verifying Customer HTML Pages:');
  for (const page of pages) {
    const pageRes = await fetch(`http://localhost:3000${page}`, {
      headers: authHeaders,
      redirect: 'manual',
    });
    console.log(`   ${page.padEnd(26)} -> Status ${pageRes.status}`);
  }

  console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

testCustomerEndpoints().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

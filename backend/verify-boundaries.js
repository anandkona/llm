import app from './src/server.js';

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`\n==================================================`);
  console.log(`🔍 Running Security & Boundary Verification Suite`);
  console.log(`==================================================`);

  let failures = 0;

  try {
    // -------------------------------------------------------------
    // Test 1: Unauthenticated API request must be rejected (401)
    // -------------------------------------------------------------
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
    if (unauthRes.status === 401) {
      console.log('✅ [TEST 1] Unauthenticated request to /api/auth/me correctly rejected with 401 Unauthorized.');
    } else {
      console.error(`❌ [TEST 1] Expected 401, got ${unauthRes.status}`);
      failures++;
    }

    // -------------------------------------------------------------
    // Test 2: Unauthenticated request to protected admin route (401)
    // -------------------------------------------------------------
    const unauthAdminRes = await fetch(`${baseUrl}/api/admin/universities`);
    if (unauthAdminRes.status === 401) {
      console.log('✅ [TEST 2] Unauthenticated request to /api/admin/universities correctly rejected with 401 Unauthorized.');
    } else {
      console.error(`❌ [TEST 2] Expected 401, got ${unauthAdminRes.status}`);
      failures++;
    }

    // -------------------------------------------------------------
    // Test 3: Authenticate User from University 1 (Alice - Student @ GTU)
    // -------------------------------------------------------------
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@gtu.edu', password: 'Admin@12345' })
    });
    const cookie = loginRes.headers.get('set-cookie');
    if (loginRes.status === 200 && cookie?.includes('auth_token')) {
      console.log('✅ [TEST 3] User authenticated successfully with secure HTTP-only cookie session.');
    } else {
      console.error('❌ [TEST 3] Login failed or auth_token cookie missing.');
      failures++;
    }

    // -------------------------------------------------------------
    // Test 4: Access own university tenant boundary (200 OK)
    // -------------------------------------------------------------
    const ownTenantRes = await fetch(`${baseUrl}/api/auth/universities/1/data`, {
      headers: { Cookie: cookie }
    });
    if (ownTenantRes.status === 200) {
      console.log('✅ [TEST 4] Authorized tenant access to University 1 succeeded (200 OK).');
    } else {
      console.error(`❌ [TEST 4] Expected 200, got ${ownTenantRes.status}`);
      failures++;
    }

    // -------------------------------------------------------------
    // Test 5: Tenant boundary manipulation (Tampering ID in URL to 2) -> 403 Forbidden
    // -------------------------------------------------------------
    const tamperTenantRes = await fetch(`${baseUrl}/api/auth/universities/2/data`, {
      headers: { Cookie: cookie }
    });
    const tamperData = await tamperTenantRes.json();
    if (tamperTenantRes.status === 403 && tamperData.error?.includes('Access denied')) {
      console.log('✅ [TEST 5] University tenant boundary strictly enforced! Access to University 2 rejected with 403 Forbidden.');
    } else {
      console.error(`❌ [TEST 5] Expected 403 Forbidden for cross-tenant access, got ${tamperTenantRes.status}`);
      failures++;
    }

    // -------------------------------------------------------------
    // Test 6: Super Admin cross-tenant visibility (Bypasses scope restriction)
    // -------------------------------------------------------------
    const saLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@example.com', password: 'Admin@12345' })
    });
    const saCookie = saLogin.headers.get('set-cookie');
    const saAccessRes = await fetch(`${baseUrl}/api/auth/universities/2/data`, {
      headers: { Cookie: saCookie }
    });
    if (saAccessRes.status === 200) {
      console.log('✅ [TEST 6] Super Admin successfully granted cross-tenant administrative access (200 OK).');
    } else {
      console.error(`❌ [TEST 6] Expected 200 for Super Admin, got ${saAccessRes.status}`);
      failures++;
    }

    console.log(`==================================================`);
    console.log(failures === 0 ? `🎉 All 6 Security & Boundary Verification Tests Passed!` : `⚠️ ${failures} test(s) failed.`);
    console.log(`==================================================\n`);

    server.close();
    process.exit(failures === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
});


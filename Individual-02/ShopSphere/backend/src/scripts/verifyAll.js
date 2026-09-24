// backend/src/scripts/verifyAll.js
// Automated regression and validation script for ShopSphere MERN marketplace.
const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

export async function runVerification() {
  console.log('--- Starting ShopSphere Automated Validation Suite ---\n');

  // 1. Health check
  const health = await request('/health');
  assert(health.status === 200 && health.data?.status === 'ok', 'Health check returns status 200 and ok');

  // 2. Permanent Staff Logins
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin', role: 'admin' }),
  });
  assert(adminLogin.status === 200 && adminLogin.data?.data?.user?.role === 'admin', 'Admin login successful (admin@gmail.com)');
  const adminToken = adminLogin.data?.data?.token;

  const supportLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'support@gmail.com', password: 'support', role: 'support' }),
  });
  assert(supportLogin.status === 200 && supportLogin.data?.data?.user?.role === 'support', 'Support login successful (support@gmail.com)');
  const supportToken = supportLogin.data?.data?.token;

  const deliveryLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'delivery@gmail.com', password: 'delivery', role: 'delivery' }),
  });
  assert(deliveryLogin.status === 200 && deliveryLogin.data?.data?.user?.role === 'delivery', 'Delivery login successful (delivery@gmail.com)');
  const deliveryToken = deliveryLogin.data?.data?.token;

  // 3. Customer & Seller Registration
  const ts = Date.now();
  const customerEmail = `customer_${ts}@test.com`;
  const sellerEmail = `seller_${ts}@test.com`;

  const customerReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Customer', email: customerEmail, password: 'password123', role: 'customer' }),
  });
  assert(customerReg.status === 201 && customerReg.data?.data?.user?.role === 'customer', 'Customer public registration successful');
  const customerToken = customerReg.data?.data?.token;

  const sellerReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Seller', email: sellerEmail, password: 'password123', role: 'seller', storeName: 'Test Tech Hub' }),
  });
  assert(sellerReg.status === 201 && sellerReg.data?.data?.user?.role === 'seller', 'Seller public registration successful with store creation');
  const sellerToken = sellerReg.data?.data?.token;

  // 4. Reject Public Staff Registration
  const rejectAdminReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Attacker Admin', email: `hacker_${ts}@test.com`, password: 'password123', role: 'admin' }),
  });
  assert(rejectAdminReg.status === 400, 'Public registration rejects admin role');

  const rejectSupportReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Attacker Support', email: `hacker2_${ts}@test.com`, password: 'password123', role: 'support' }),
  });
  assert(rejectSupportReg.status === 400, 'Public registration rejects support role');

  const rejectDeliveryReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Attacker Delivery', email: `hacker3_${ts}@test.com`, password: 'password123', role: 'delivery' }),
  });
  assert(rejectDeliveryReg.status === 400, 'Public registration rejects delivery role');

  // 5. Negative Authentication Tests
  const wrongPassword = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'wrongpassword' }),
  });
  assert(wrongPassword.status === 401, 'Login rejects incorrect password with 401');

  const nonexistentEmail = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ghost_user_9999@test.com', password: 'password123' }),
  });
  assert(nonexistentEmail.status === 401, 'Login rejects nonexistent email with 401');

  const customerAsSeller = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: customerEmail, password: 'password123', role: 'seller' }),
  });
  assert(customerAsSeller.status === 401, 'Customer attempting seller login rejected with 401 (ROLE_MISMATCH)');

  const sellerAsCustomer = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: sellerEmail, password: 'password123', role: 'customer' }),
  });
  assert(sellerAsCustomer.status === 401, 'Seller attempting customer login rejected with 401 (ROLE_MISMATCH)');

  // 6. Role Authorization Security (Backend RBAC)
  const customerOnAdmin = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(customerOnAdmin.status === 403, 'Customer token blocked from admin endpoints with 403');

  const sellerOnAdmin = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${sellerToken}` },
  });
  assert(sellerOnAdmin.status === 403, 'Seller token blocked from admin endpoints with 403');

  const adminOnAdmin = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminOnAdmin.status === 200, 'Admin token authorized on admin endpoints (200 OK)');

  const supportOnSupport = await request('/support/tickets', {
    headers: { Authorization: `Bearer ${supportToken}` },
  });
  assert(supportOnSupport.status === 200, 'Support token authorized on support endpoints (200 OK)');

  const deliveryOnDelivery = await request('/delivery', {
    headers: { Authorization: `Bearer ${deliveryToken}` },
  });
  assert(deliveryOnDelivery.status === 200, 'Delivery token authorized on delivery endpoints (200 OK)');

  // 7. Unauthenticated Protection
  const unauthWishlist = await request('/wishlist');
  assert(unauthWishlist.status === 401, 'Unauthenticated request to /api/wishlist blocked with 401');

  const unauthCheckout = await request('/orders/checkout', { method: 'POST', body: JSON.stringify({}) });
  assert(unauthCheckout.status === 401, 'Unauthenticated request to /api/orders/checkout blocked with 401');

  const unauthNotifications = await request('/notifications');
  assert(unauthNotifications.status === 401, 'Unauthenticated request to /api/notifications blocked with 401');

  const invalidToken = await request('/auth/me', { headers: { Authorization: 'Bearer totally_invalid_token' } });
  assert(invalidToken.status === 401, 'Invalid JWT token rejected with 401');

  // 8. Authenticated Customer Flows (Wishlist, Notifications, Cart)
  const customerMe = await request('/auth/me', { headers: { Authorization: `Bearer ${customerToken}` } });
  assert(customerMe.status === 200 && customerMe.data?.data?.user?.email === customerEmail, 'Authenticated /auth/me returns current user');

  const customerNotifications = await request('/notifications', { headers: { Authorization: `Bearer ${customerToken}` } });
  assert(
    customerNotifications.status === 200 && Array.isArray(customerNotifications.data?.data?.notifications),
    'Authenticated customer gets empty notifications array [] cleanly without 500 error'
  );

  const customerWishlist = await request('/wishlist', { headers: { Authorization: `Bearer ${customerToken}` } });
  assert(customerWishlist.status === 200, 'Authenticated customer retrieves their wishlist (200 OK)');

  const customerCart = await request('/cart', { headers: { Authorization: `Bearer ${customerToken}` } });
  assert(customerCart.status === 200, 'Customer cart retrieved successfully (200 OK)');

  // 9. Catalog and Product Listing
  const catalog = await request('/products');
  assert(catalog.status === 200 && Array.isArray(catalog.data?.data?.products), 'Public product catalog returns 200 with product list');

  console.log('\n--- Test Suite Summary ---');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);

  if (failed === 0) {
    console.log('\nALL VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error(`\n${failed} CHECKS FAILED! Check logs above.`);
  }

  return failed === 0;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runVerification().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}

import pool from './config/db.js';
import { register } from './controllers/authController.js';
import { createBatch, deliveryScanBatch, getMyBatches } from './controllers/batch.controller.js';
import { autoAssignBatch } from './controllers/batchAllocationController.js';
import { getFactoryShipments, confirmFactoryDelivery, updateFactorySettings } from './controllers/factoryController.js';

async function runTest() {
  const time = Date.now();

  // 1. Register Factory F1 (20kg limit)
  let f1User;
  const f1Req = { body: { role: 'FACTORY', name: 'Factory F1', factory_name: 'Factory F1', contact_person: 'Anil', accepted_waste_category: 'FOOD_WASTE', daily_quota_kg: 20, email: 'f1.' + time + '@urbaneco.com', password: 'password123', street_address: 'F1 St', city: 'Delhi', state: 'Delhi', pincode: '110001', latitude: 28.61, longitude: 77.20 } };
  await register(f1Req, { status: () => ({ json: (d) => { f1User = d.user; } }) }, (e) => console.error(e));

  // 2. Register Factory F2 (20kg limit)
  let f2User;
  const f2Req = { body: { role: 'FACTORY', name: 'Factory F2', factory_name: 'Factory F2', contact_person: 'Bhavna', accepted_waste_category: 'FOOD_WASTE', daily_quota_kg: 20, email: 'f2.' + time + '@urbaneco.com', password: 'password123', street_address: 'F2 St', city: 'Delhi', state: 'Delhi', pincode: '110002', latitude: 28.63, longitude: 77.22 } };
  await register(f2Req, { status: () => ({ json: (d) => { f2User = d.user; } }) }, (e) => console.error(e));

  // Set remaining quota to 20kg for both F1 & F2
  await pool.query(`UPDATE factory_profiles SET remaining_quota_kg = 20, daily_quota_kg = 20 WHERE user_id::text = $1`, [String(f1User.id)]);
  await pool.query(`UPDATE factory_profiles SET remaining_quota_kg = 20, daily_quota_kg = 20 WHERE user_id::text = $1`, [String(f2User.id)]);

  // 3. Register Society User
  let socUser;
  const sReq = { body: { role: 'SOCIETY_INDIVIDUAL', name: 'Lotus Society', email: 'soc.' + time + '@urbaneco.com', password: 'password123', street_address: 'Lotus St', city: 'Delhi', state: 'Delhi', pincode: '110016', latitude: 28.613, longitude: 77.205 } };
  await register(sReq, { status: () => ({ json: (d) => { socUser = d.user; } }) }, (e) => console.error(e));

  // Step 1: Create 40 kg Batch & Run Waterfall Split Auto-Allocation
  let batchObj;
  const createReq = { user: socUser, body: { stream_category: 'FOOD_WASTE', weight_kg: 40 } };
  await createBatch(createReq, { status: () => ({ json: (d) => { batchObj = d.batch; } }) }, (e) => console.error(e));

  const allocReq = { body: { batch_id: batchObj.id, society_user_id: socUser.id, total_weight_kg: 40, waste_category: 'FOOD_WASTE' } };
  let allocData;
  await autoAssignBatch(allocReq, { status: (c) => ({ json: (d) => { allocData = d; } }) }, (e) => console.error(e));

  console.log('====================================================');
  console.log('✅ STEP 1: SOCIETY CREATED 40KG BATCH & SPLIT ALLOCATED');
  console.log('  Batch ID:', batchObj.id);
  console.log('  Allocations Count:', allocData.drops_count);
  allocData.allocations?.forEach(a => console.log('    -> ' + a.factory_name + ': ' + a.allocated_weight_kg + 'kg (Quota remaining: ' + a.remaining_quota_kg + 'kg)'));

  // Step 2: Delivery Partner Scans Pickup (Marks IN_TRANSIT for both allocations)
  const scanReq = { user: { id: '288c0489-9924-45fa-9679-5632252aaa13', name: 'Driver Alex' }, body: { qr_code: batchObj.qr_code } };
  await deliveryScanBatch(scanReq, { status: () => ({ json: () => {} }) }, (e) => console.error(e));

  console.log('\n✅ STEP 2: DELIVERY PARTNER SCANNED PICKUP -> MARKED IN_TRANSIT');

  // Step 3: Check Factory Data Isolation & Society Transparency
  let f1Shipments;
  await getFactoryShipments({ user: f1User }, { status: () => ({ json: (d) => { f1Shipments = d.shipments; } }) }, (e) => console.error(e));

  let f2Shipments;
  await getFactoryShipments({ user: f2User }, { status: () => ({ json: (d) => { f2Shipments = d.shipments; } }) }, (e) => console.error(e));

  let socBatches;
  await getMyBatches({ user: socUser }, { status: () => ({ json: (d) => { socBatches = d.batches; } }) }, (e) => console.error(e));

  console.log('\n✅ STEP 3: DATA ISOLATION & SOCIETY TRANSPARENCY CHECK');
  console.log('  Factory F1 Isolated Incoming Shipments:', f1Shipments?.length, 'card(s) (Allocated:', f1Shipments[0]?.allocated_weight_kg, 'kg, Status:', f1Shipments[0]?.allocation_status, ')');
  console.log('  Factory F2 Isolated Incoming Shipments:', f2Shipments?.length, 'card(s) (Allocated:', f2Shipments[0]?.allocated_weight_kg, 'kg, Status:', f2Shipments[0]?.allocation_status, ')');
  console.log('  Society Portal Split Breakdown View:');
  socBatches[0]?.allocations?.forEach(a => console.log('    -> ' + a.factory_name + ' (' + a.allocated_weight_kg + 'kg) - Status: ' + a.status));

  // Step 4A: Factory F1 Confirms Delivery -> PARTIALLY_DELIVERED
  let f1Confirm;
  await confirmFactoryDelivery({ user: f1User, body: { allocation_id: f1Shipments[0]?.allocation_id } }, { status: () => ({ json: (d) => { f1Confirm = d; } }) }, (e) => console.error(e));

  console.log('\n✅ STEP 4A: FACTORY F1 CONFIRMED DELIVERY');
  console.log('  Message:', f1Confirm.message);
  console.log('  Overall Batch Status:', f1Confirm.overall_batch_status);

  // Step 4B: Factory F2 Confirms Delivery -> COMPLETED & 50 Eco-Points Awarded
  let f2Confirm;
  await confirmFactoryDelivery({ user: f2User, body: { allocation_id: f2Shipments[0]?.allocation_id } }, { status: () => ({ json: (d) => { f2Confirm = d; } }) }, (e) => console.error(e));

  console.log('\n✅ STEP 4B: FACTORY F2 CONFIRMED DELIVERY');
  console.log('  Message:', f2Confirm.message);
  console.log('  Overall Batch Status:', f2Confirm.overall_batch_status);
  console.log('  Is Fully Completed:', f2Confirm.is_fully_completed);

  // Step 5: Factory Quota Settings Test
  let settingsRes;
  await updateFactorySettings({ user: f1User, body: { weekly_quota_kg: 280, accepted_waste_category: ['FOOD_WASTE', 'PLASTIC'] } }, { status: () => ({ json: (d) => { settingsRes = d; } }) }, (e) => console.error(e));

  console.log('\n✅ STEP 5: FACTORY WEEKLY QUOTA SETTINGS UPDATED');
  console.log('  Weekly Quota:', settingsRes.settings?.weekly_quota_kg, 'kg');
  console.log('  Daily Quota (Computed):', settingsRes.settings?.daily_quota_kg, 'kg/day');
  console.log('  Accepted Categories:', settingsRes.settings?.accepted_waste_category);
  console.log('====================================================');

  process.exit(0);
}

runTest();

/**
 * Quick test script to verify London GIS API integration
 */

import { fetchAllPubs, fetchPubById, fetchPubsByBorough } from './app/lib/services/londonGIS';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function testAPI() {
  console.log('🧪 Testing London GIS API...\n');

  try {
    // Test 1: Fetch first few pubs
    console.log('📍 Test 1: Fetching all pubs...');
    const allPubs = await fetchAllPubs();
    console.log(`✅ Success! Fetched ${allPubs.features.length} pubs`);
    
    if (allPubs.features.length > 0) {
      const firstPub = allPubs.features[0].properties;
      console.log('\n📋 Sample pub data:');
      console.log(`   Name: ${firstPub.name}`);
      console.log(`   Address: ${firstPub.address1}`);
      console.log(`   Borough: ${firstPub.borough_name}`);
      console.log(`   Postcode: ${firstPub.postcode}`);
      console.log(`   Coordinates: [${firstPub.longitude}, ${firstPub.latitude}]`);
      console.log(`   Open Status: ${firstPub.open_status}`);

      // Test 2: Fetch by ID
      console.log('\n📍 Test 2: Fetching pub by ID...');
      const pubById = await fetchPubById(firstPub.objectid);
      console.log(`✅ Success! Fetched: ${pubById?.properties.name}`);

      // Test 3: Fetch by borough
      console.log('\n📍 Test 3: Fetching pubs in Westminster...');
      const westminsterPubs = await fetchPubsByBorough('Westminster');
      console.log(`✅ Success! Found ${westminsterPubs.features.length} pubs in Westminster`);
    }

    // Save all pubs data to JSON file
    console.log('\n💾 Saving data to pubs-data.json...');
    const outputPath = join(process.cwd(), 'pubs-data.json');
    await writeFile(outputPath, JSON.stringify(allPubs, null, 2), 'utf-8');
    console.log(`✅ Data saved to: ${outputPath}`);
    console.log(`   File size: ${(JSON.stringify(allPubs).length / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAPI();

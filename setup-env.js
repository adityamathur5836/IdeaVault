// Run this script to check your environment setup
const requiredEnvVars = [
  'VITE_SUPABASE_A_URL',
  'VITE_SUPABASE_A_ANON_KEY', 
  'VITE_SUPABASE_B_URL',
  'VITE_SUPABASE_B_ANON_KEY'
];

console.log('🔍 Checking environment variables...\n');

let allGood = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ Missing: ${varName}`);
    allGood = false;
  } else if (value.includes('your-') || value.includes('placeholder')) {
    console.log(`⚠️  Placeholder detected: ${varName}`);
    allGood = false;
  } else {
    console.log(`✅ Found: ${varName}`);
  }
});

if (allGood) {
  console.log('\n🎉 All environment variables are set correctly!');
} else {
  console.log('\n❌ Please update your .env file with actual values');
  console.log('\nExample .env file:');
  console.log('VITE_SUPABASE_A_URL=https://abcdefgh.supabase.co');
  console.log('VITE_SUPABASE_A_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...');
  console.log('VITE_SUPABASE_B_URL=https://ijklmnop.supabase.co');
  console.log('VITE_SUPABASE_B_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...');
}
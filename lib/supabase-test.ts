import { supabase } from './supabase';

// Function to test Supabase connection
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log(`🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured ✓' : 'Missing ✗'}`);
  console.log(`🔑 Supabase Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Log the first and last few characters of the key to verify it's not truncated
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log(`🔑 Key format check: ${key.substring(0, 10)}...${key.substring(key.length - 10)}`);
  }

  try {
    // Test a simple query
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Test query result:', data);
    return true;
  } catch (err) {
    console.error('❌ Unexpected error testing Supabase connection:', err);
    return false;
  }
}

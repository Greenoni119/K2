// Initialize Supabase client for public access
const supabaseUrl = 'https://shnlxniahrcfszwrvbno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmx4bmlhaHJjZnN6d3J2Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU3MTk3MjQsImV4cCI6MjAyMTI5NTcyNH0.hO_qrZz-Qkh9QTLPeHi0O6MxGPHgAhLAKqGC2qIYY2I';

// Create a separate client instance for public pages
const publicSupabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log('Public Supabase client initialized:', publicSupabase);

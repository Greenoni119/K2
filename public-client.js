// Initialize Supabase client for public access
const supabaseUrl = 'https://shnlxniahrcfszwrvbno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmx4bmlhaHJjZnN6d3J2Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTQ1MzcsImV4cCI6MjA2MjU3MDUzN30.k_UlkFgnQw2AERth9wgS_92TZdw_1vVVfE5gDJrkhOI';

// Create a separate client instance for public pages
const publicSupabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log('Public Supabase client initialized:', publicSupabase);

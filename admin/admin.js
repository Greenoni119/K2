// Initialize Supabase client
const supabaseUrl = 'https://shnlxniahrcfszwrvbno.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmx4bmlhaHJjZnN6d3J2Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTQ1MzcsImV4cCI6MjA2MjU3MDUzN30.k_UlkFgnQw2AERth9wgS_92TZdw_1vVVfE5gDJrkhOI'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const errorMessage = document.getElementById('error-message')
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) throw error

        // If login successful, redirect to dashboard
        if (data.user) {
            localStorage.setItem('admin-token', data.session.access_token)
            window.location.href = 'dashboard.html'
        }
    } catch (error) {
        errorMessage.textContent = 'Invalid email or password'
        console.error('Error:', error.message)
    }
})

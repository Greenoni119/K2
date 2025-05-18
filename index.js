// Use the public Supabase client
const supabase = publicSupabase;

// Load categories from Supabase
async function loadCategories() {
    // Get all categories from Supabase
    let { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

    // Default categories to ensure they exist
    const defaultCategories = [
        { name: 'WOMEN', slug: 'women', image_url: 'Images/women.png' },
        { name: 'OBJECTS', slug: 'objects', image_url: 'Images/objects.png' }
    ];

    // If no categories exist in Supabase yet, insert the default ones
    if (!categories || categories.length === 0) {
        const { error: insertError } = await supabase
            .from('categories')
            .insert(defaultCategories)

        if (insertError) {
            console.error('Error inserting default categories:', insertError)
            return
        }

        // Fetch categories again after inserting defaults
        const { data: updatedCategories, error: fetchError } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true })

        if (fetchError) {
            console.error('Error fetching updated categories:', fetchError)
            return
        }

        categories = updatedCategories
    }

    if (error) {
        console.error('Error:', error.message)
        return
    }

    const categoriesContainer = document.querySelector('.categories-container')
    if (!categoriesContainer) return

    categoriesContainer.innerHTML = ''

    // Add all categories
    categories?.forEach(category => {
        const categoryElement = document.createElement('div')
        categoryElement.className = 'category-item'
        categoryElement.innerHTML = `
            <a href="category.html?category=${category.slug}" class="category-link">
                <div class="category-image" style="background-image: url('${category.image_url}');">
                    <h2 class="category-title">${category.name}</h2>
                </div>
            </a>
        `
        categoriesContainer.appendChild(categoryElement)
    })
}

// Load categories when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadNavigation();
    await loadCategories();
});
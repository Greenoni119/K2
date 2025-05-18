// Function to load dynamic navigation
async function loadNavigation() {
    const navCenter = document.querySelector('.nav-center');
    const isAboutPage = window.location.pathname.endsWith('about.html');
    navCenter.innerHTML = ''; // Clear existing content
    
    // Add About link
    const aboutLink = document.createElement('a');
    aboutLink.href = 'about.html';
    aboutLink.textContent = 'About';
    if (isAboutPage) aboutLink.classList.add('active');
    navCenter.appendChild(aboutLink);
    
    // Get categories
    const { data: categories, error } = await publicSupabase
        .from('categories')
        .select('*')
        .order('created_at');

    if (error) {
        console.error('Error loading categories:', error);
        return;
    }

    // Add category links directly to nav-center
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    
    categories?.forEach(category => {
        const link = document.createElement('a');
        link.href = `category.html?category=${category.slug}`;
        link.textContent = category.name.split(/(?=[A-Z])/).join(' ');
        if (currentCategory === category.slug) {
            link.classList.add('active');
        }
        navCenter.appendChild(link);
    });
}

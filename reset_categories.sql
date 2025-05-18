-- First, delete all existing categories
DELETE FROM categories;

-- Insert the default categories
INSERT INTO categories (name, slug, image_url, created_at)
VALUES 
('WOMEN', 'women', 'Images/women.png', now()),
('OBJECTS', 'objects', 'Images/objects.png', now() + interval '1 second');

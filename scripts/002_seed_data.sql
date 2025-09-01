-- Insert sample tours
INSERT INTO public.tours (title, description, price, duration, location, image_url, max_participants) VALUES
('London Rock Legends Tour', 'Explore the iconic venues where The Beatles, Rolling Stones, and Led Zeppelin made history. Visit Abbey Road Studios, The Cavern Club replica, and legendary pubs.', 299.99, '3 days', 'London, UK', '/london-rock-venues-abbey-road-beatles.png', 15),
('German Metal Heritage', 'Discover the birthplace of industrial metal and electronic music. Tour Berlin''s underground scene and Hamburg''s historic rock venues.', 399.99, '4 days', 'Berlin & Hamburg, Germany', '/german-metal-venues-berlin-hamburg-rock.png', 12),
('Seattle Grunge Experience', 'Walk in the footsteps of Nirvana, Pearl Jam, and Soundgarden. Visit the clubs, studios, and neighborhoods that defined the 90s grunge movement.', 349.99, '3 days', 'Seattle, USA', '/seattle-grunge-venues-nirvana-pearl-jam.png', 18);

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url, stock_quantity, rating, is_on_sale, sale_price) VALUES
('Locura y Realidad Vintage T-Shirt', 'Premium black cotton t-shirt with distressed logo print. Comfortable fit with rock-inspired design.', 29.99, 'Clothing', '/merch-tshirt-black-logo-vintage.png', 50, 4.8, true, 24.99),
('Rock Tour Baseball Cap', 'Adjustable black cap with embroidered guitar design. Perfect for any rock music enthusiast.', 24.99, 'Accessories', '/merch-cap-black-guitar-embroidery.png', 30, 4.6, false, null),
('Enamel Pin Collection', 'Set of 4 rock-themed enamel pins featuring guitars, vinyl records, and band logos.', 19.99, 'Accessories', '/merch-pins-set-rock-icons-enamel.png', 75, 4.9, false, null),
('Tour Cities Hoodie', 'Comfortable black hoodie with tour city names printed on the back. Premium cotton blend.', 49.99, 'Clothing', '/merch-hoodie-tour-cities-back.png', 25, 4.7, false, null),
('Rock Logo Ceramic Mug', 'High-quality ceramic mug with gold logo print. Perfect for your morning coffee ritual.', 16.99, 'Accessories', '/merch-mug-ceramic-black-gold-logo.png', 40, 4.5, true, 14.99),
('Embroidered Logo Patch', 'Iron-on patch perfect for jackets, backpacks, or any fabric surface. Show your rock spirit.', 9.99, 'Accessories', '/merch-patch-embroidered-logo-jacket.png', 100, 4.8, false, null);

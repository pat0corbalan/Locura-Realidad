
-- ALBUMS (Para remplazar a fotos)

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE album_photos (
    id SERIAL PRIMARY KEY,
    album_id INTEGER NOT NULL,
    src TEXT NOT NULL,
    alt TEXT,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);


-- PHOTOS (INDEPENDIENTE)

CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    src TEXT NOT NULL,
    alt TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- EVENTOS

CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE
);


-- TICKETS

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER NOT NULL,
    evento_titulo VARCHAR(255) NOT NULL,

    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dni VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),

    pagado BOOLEAN DEFAULT FALSE,
    metodo_pago VARCHAR(100),
    monto DECIMAL(10,2) NOT NULL,

    usado BOOLEAN DEFAULT FALSE,
    fecha_ingreso TIMESTAMP,

    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);


-- RESERVAS

CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    tour_title VARCHAR(255) NOT NULL,

    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ticket', 'tour')),
    estado VARCHAR(20) DEFAULT 'pendiente',

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TOURS

CREATE TABLE tours (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    dates VARCHAR(255) NOT NULL,
    price VARCHAR(100) NOT NULL,
    image TEXT NOT NULL,
    grupo VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- PRODUCTS

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2) NOT NULL,
    image TEXT NOT NULL,
    image_public_id TEXT,
    category VARCHAR(100) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 5,
    in_stock BOOLEAN DEFAULT TRUE
);

CREATE TABLE product_sizes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    size VARCHAR(50) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- USERS

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);


-- INDICES

CREATE INDEX idx_tickets_evento_id ON tickets(evento_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_reservas_tipo ON reservas(tipo);
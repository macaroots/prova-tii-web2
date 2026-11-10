CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'leitor'
);

CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    ano INT,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE
);

-- senhas: admin123 e leitor123 (hash bcrypt)
INSERT INTO usuarios (usuario, senha, perfil) VALUES
('admin',  '$2b$10$VT571NID9r0GT8fwL8HXl.17iMeB50NT9qFW8nvjFAdZCuZR9Xc.e', 'admin'),
('leitor', '$2b$10$YxJl0QMrRRh7HFic/JQcFetu6vY4tyy/ZfgCzq6ycmADIgZkt9e.a', 'leitor');

INSERT INTO livros (titulo, autor, ano, disponivel) VALUES
('Dom Casmurro', 'Machado de Assis', 1899, TRUE),
('Memórias Póstumas de Brás Cubas', 'Machado de Assis', 1881, FALSE),
('Vidas Secas', 'Graciliano Ramos', 1938, TRUE),
('A Hora da Estrela', 'Clarice Lispector', 1977, TRUE),
('Grande Sertão: Veredas', 'João Guimarães Rosa', 1956, TRUE);

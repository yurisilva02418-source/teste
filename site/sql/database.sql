-- BANCO DE DADOS BASE
CREATE DATABASE IF NOT EXISTS site_base;
USE site_base;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arquivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho VARCHAR(255) NOT NULL,
  tamanho INT,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO usuarios (nome, email, senha) VALUES ('Admin', 'admin@site.com', '123456');

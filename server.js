
const express = require('express');

const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const cors = require('cors');


const app = express();

const PORT = process.env.PORT || 3000;


app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


const db = new sqlite3.Database('./biblioteca.db', (err) => {


  if (err) {
    console.error('Erro ao abrir o banco de dados "biblioteca.db":', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite3 "biblioteca.db"');

    db.run(`CREATE TABLE IF NOT EXISTS Biblioteca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  ano INTEGER,
  genero TEXT,
  autor TEXT,
  imagem TEXT
)`, (err) => {

      if (err) {
        console.error('Erro ao criar a tabela "Biblioteca"', err.message);
      } else {
        console.log('Tabela "Biblioteca" pronta!');
      }
    });
  }
});



app.get('/api/biblioteca', (req, res) => {

  const sql = 'SELECT * FROM Biblioteca';


  db.all(sql, [], (err, rows) => {

    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: rows
    });
  });
});


app.get('/api/biblioteca/:id', (req, res) => {

  const sql = 'SELECT * FROM Biblioteca WHERE id = ?';

  const params = [req.params.id];


  db.get(sql, params, (err, row) => {

    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    res.json({
      message: 'success',
      data: row
    });
  });
});


app.post('/api/biblioteca', (req, res) => {
  const { titulo, ano, genero, autor, imagem } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'O título é obrigatório' });
  }

  const sql = `INSERT INTO Biblioteca (titulo, ano, genero, autor, imagem)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [titulo, ano, genero, autor, imagem];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erro ao inserir no banco:", err.message);
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'Mangá adicionado com sucesso',
      id: this.lastID
    });
  });
});


app.put('/api/biblioteca/:id', (req, res) => {
  const { titulo, ano, genero, autor, imagem } = req.body;

  const sql = `UPDATE Biblioteca 
               SET titulo = ?, ano = ?, genero = ?, autor = ?, imagem = ?
               WHERE id = ?`;
  const params = [titulo, ano, genero, autor, imagem, req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erro ao atualizar no banco:", err.message);
      res.status(400).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Mangá não encontrado' });
      return;
    }

    res.json({
      message: 'Mangá atualizado com sucesso',
      id: req.params.id
    });
  });
});



app.delete('/api/biblioteca/:id', (req, res) => {

  const sql = 'DELETE FROM Biblioteca WHERE id = ?';

  const params = [req.params.id];


  db.run(sql, params, function (err) {

    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json({
      message: 'Game deleted successfully',
      changes: this.changes
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error("Erro interno:", err.stack);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});



app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor executando com sucesso no endereço http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com o banco de dados encerrada com sucesso.');
    process.exit(0);
  });
});

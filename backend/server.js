import express from 'express';
import cors from 'cors';
import { DatabasePostgres } from './databasePostgres.js';
import './createTable.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


const database = new DatabasePostgres();


// Cadastro
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Preencha todos os campos!' });
  }


  const existingUser = await database.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ msg: 'Email já está cadastrado!' });
  }


  await database.create({ name, email, password });
  res.status(201).json({ msg: 'Usuário criado!' });
});


// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Preencha email e senha!' });
  }


  const user = await database.findByEmail(email);
  if (!user) {
    return res.status(400).json({ msg: 'Usuário não encontrado!' });
  }


  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ msg: 'Senha inválida!' });
  }


  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'minhaChaveSuperSecreta',
    { expiresIn: '1d' }
  );


  res.json({
    msg: 'Login realizado!',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

//Rota protegida
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ msg: 'Token não oferecido!'});

  const token = authHeader.split(' ')[1];
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'minhaChaveSuperSecreta');
    res.json({ msg: 'Acesso Autorizado! '}, decoded );
  }catch(err){
    res.status(401).json({ msg: 'Token inválido! '});
  }
});

app.get('/users', async(req, res) => {
  const users = await database.list();
  res.json(users);
})

  app.post('/users', async(req, res) => {
  const { name, email, password } = req.body;
  if(!name || !email || !password){ 
    return res.status(400).json({ msg: 'Preencha todos os campos!'});
  }
  await database.create({ name, email,password })
  res.status(201).send()
});

app.put('/users/:id', async(req, res) => {
  const id = req.params.id;
  const user = req.body;
  await database.update(id, user);
  res.status(204).send()
});

app.delete('/users/:id', async(req, res) => {
  const id = req.params.id;
  await database.delete(id);
  res.status(204).send();
});

app.listen(3001, ()=> {
  console.log('Servidor rodando na porta 3001');
});

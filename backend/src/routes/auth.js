const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();
const dbPath = path.join(__dirname, '../../data/db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function tokenFor(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'marejar_dev_secret',
    { expiresIn: '8h' }
  );
}

// ==========================================
// ROTA DE LOGIN UNIFICADA (Turista e Guia)
// ==========================================
router.post('/login', async (req, res) => {
  const { cpf, password } = req.body;
  
  if (!cpf || !password) {
    return res.status(400).json({ message: 'Preencha o CPF e a senha.' });
  }

  const db = readDb();

  // Busca o usuário apenas pelo CPF (não exige mais que o frontend envie o 'role')
  const user = db.users.find(u => u.cpf === cpf);

  if (!user) {
    return res.status(401).json({
      message: 'CPF ou senha inválidos.'
    });
  } 

  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    return res.status(401).json({
      message: 'CPF ou senha inválidos.'
    });
  }

  // Retorna o token e os dados do usuário (já contendo o 'role' correto: 'usuario' ou 'guia')
  return res.json({
    token: tokenFor(user),
    user: publicUser(user)
  });
});

// ==========================================
// ROTA ALTERAR SENHA
// ==========================================
router.put('/change-password', async (req, res) => {
  const { cpf, currentPassword, newPassword } = req.body;
  
  if (!cpf || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  const db = readDb();
  
  // Busca o usuário apenas pelo CPF
  const index = db.users.findIndex(u => u.cpf === cpf);
  if (index < 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

  const passwordCorrect = await bcrypt.compare(
    currentPassword,
    db.users[index].password
  );

  if (!passwordCorrect) {
    return res.status(401).json({
      message: 'Senha atual incorreta.'
    });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  db.users[index].password = newPasswordHash;

  writeDb(db);
  return res.json({ message: 'Senha alterada com sucesso.' });
});

// ==========================================
// ROTA CADASTRO (Turista e Guia)
// ==========================================
router.post('/register', async (req, res) => {
  const { role, name, cpf, birthDate, email, phone, password, registration, city, attributes } = req.body;

  if (!role || !name || !cpf || !email || !password || !city) {
    return res.status(400).json({ message: 'Preencha os campos obrigatórios.' });
  }

  const db = readDb();
  
  // Garante que não existam dois cadastros com o mesmo CPF no banco
  if (db.users.some(u => u.cpf === cpf)) {
    return res.status(409).json({ message: 'CPF já cadastrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Cria o objeto do usuário unificado ou guia com suas propriedades
  const user = {
    id: `${role === 'guia' ? 'g' : 'u'}${Date.now()}`,
    role,
    name,
    cpf,
    birthDate,
    email,
    phone,
    password: passwordHash,
    city,
    ...(role === 'guia' ? { registration, attributes: attributes || [] } : {}),
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDb(db);

  return res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
});

module.exports = router;
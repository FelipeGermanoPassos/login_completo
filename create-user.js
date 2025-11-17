const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Primeiro vamos listar os usuários existentes
    const users = await prisma.user.findMany();
    console.log('📋 Usuários no banco:', users.length);
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.name})`);
    });

    // Tentar criar novo usuário
    const hash = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: hash,
      },
    });
    console.log('\n✅ Novo usuário criado com sucesso!');
    console.log('Email: admin@example.com');
    console.log('Senha: admin123');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('\n⚠️  Usuário admin@example.com já existe!');
      console.log('Email: admin@example.com');
      console.log('Senha: admin123');
    } else {
      console.error('Erro:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();

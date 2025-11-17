const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'teste@example.com';
    const password = 'senha123';
    
    console.log('🔍 Testando login...');
    console.log('Email:', email);
    console.log('Senha:', password);
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', user.name);
    console.log('Hash no banco:', user.passwordHash.substring(0, 20) + '...');
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Senha válida?', isValid ? '✅ SIM' : '❌ NÃO');
    
    if (!isValid) {
      console.log('\n🔧 Vou resetar a senha...');
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });
      console.log('✅ Senha resetada com sucesso!');
      
      // Testar novamente
      const updatedUser = await prisma.user.findUnique({ where: { email } });
      const isValidNow = await bcrypt.compare(password, updatedUser.passwordHash);
      console.log('Senha válida agora?', isValidNow ? '✅ SIM' : '❌ NÃO');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

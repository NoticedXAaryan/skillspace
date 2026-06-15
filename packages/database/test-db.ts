import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      }
    });
    console.log('User created:', user);
    
    // cleanup
    await prisma.user.delete({ where: { id: user.id } });
  } catch (e) {
    console.error('Error creating user:', e);
  }
}

main().finally(() => prisma.$disconnect());

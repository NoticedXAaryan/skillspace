const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test' + Date.now() + '@example.com',
        name: 'test',
        accounts: {
          create: {
            id: 'acc123',
            accountId: 'gh123',
            providerId: 'github',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });
    console.log('User and Account created:', user.id);

    // cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('User cleaned up');
    await prisma.user.delete({ where: { id: user.id } });
    console.log('User cleaned up');
  } catch (e) {
    console.error('Error creating user:', e);
  }
}

main().finally(() => prisma.$disconnect());

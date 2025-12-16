import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Listing users before deletion...');
  const before = await prisma.user.findMany();
  console.log(before);

  const testUser = await prisma.user.findUnique({ where: { twitchId: 'test-twitch-id' } });
  if (testUser) {
    console.log('Deleting test user:', testUser.id, testUser.username);
    await prisma.user.delete({ where: { id: testUser.id } });
  } else {
    console.log('No test user with twitchId=test-twitch-id found.');
  }

  console.log('Listing users after deletion...');
  const after = await prisma.user.findMany();
  console.log(after);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../lib/prisma';
import { RETENTION_DAYS } from '../lib/analytics';

async function main() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const result = await prisma.pageView.deleteMany({
    where: {
      createdAt: {
        lt: cutoff
      }
    }
  });

  console.log(`Retention cleanup complete. Removed ${result.count} rows older than ${RETENTION_DAYS} days.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
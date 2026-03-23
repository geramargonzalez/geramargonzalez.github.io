import { prisma } from '../lib/prisma';
import { hashValue } from '../lib/analytics';

async function main() {
  const existing = await prisma.pageView.count();

  if (existing > 0) {
    console.log('Seed skipped: page_views already has data.');
    return;
  }

  const now = new Date();
  const samplePaths = ['/', '/about', '/projects', '/blog/netsuite', '/contact'];
  const sampleReferrers = ['https://google.com', 'https://linkedin.com', null, 'https://github.com'];
  const sampleUas = ['Mozilla/5.0 Chrome', 'Mozilla/5.0 Safari', 'Mozilla/5.0 Firefox'];

  const records = Array.from({ length: 180 }, (_, index) => {
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - (index % 21));
    createdAt.setHours((index * 3) % 24, (index * 7) % 60, 0, 0);

    const ipSeed = `192.168.${index % 12}.0`;
    const ua = sampleUas[index % sampleUas.length];

    return {
      createdAt,
      path: samplePaths[index % samplePaths.length],
      referrer: sampleReferrers[index % sampleReferrers.length],
      ipHash: hashValue(ipSeed),
      uaHash: hashValue(ua),
      isBot: false
    };
  });

  await prisma.pageView.createMany({ data: records });

  console.log(`Seed completed: inserted ${records.length} sample page views.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
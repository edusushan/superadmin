import { NestFactory } from '@nestjs/core';
import { SeederService } from './seeder/seeder.service'; // Adjust the path
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);

  await seederService.seedAdminUser();

  await app.close();
}

bootstrap()
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

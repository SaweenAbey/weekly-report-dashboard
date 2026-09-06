import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { ReportsModule } from '../reports/reports.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    ProjectsModule,
    ReportsModule,
    ActivityLogsModule,
  ],
  providers: [SeedService],
})
class SeedAppModule {}

async function runSeed() {
  const app = await NestFactory.createApplicationContext(SeedAppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

runSeed();

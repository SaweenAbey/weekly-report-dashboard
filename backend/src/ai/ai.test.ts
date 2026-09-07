import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AiService } from './ai.service';
import { Role } from '../common/enums/role.enum';
import { UserDocument } from '../users/schemas/user.schema';

async function runTest() {
  console.log('🚀 Bootstrapping NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const aiService = app.get(AiService);

  // Mock an admin user to query all seeded reports
  const mockAdmin = {
    _id: '65e000000000000000000001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: Role.ADMIN,
    department: 'Engineering',
  } as unknown as UserDocument;

  console.log('\n--- 1. Testing AI Conversational Chat (Admin) ---');
  try {
    const chatResult = await aiService.chat(
      {
        message: 'What did the team work on and are there any key blockers?',
      },
      mockAdmin,
    );
    console.log('✅ Chat Response Received!');
    console.log('Context Reports Count:', chatResult.contextCount);
    console.log('AI Output Preview:\n', chatResult.response.slice(0, 300) + '...\n');
  } catch (err: any) {
    console.error('❌ Chat Test Failed:', err.message);
  }

  console.log('\n--- 2. Testing AI Team Summary Generation ---');
  try {
    const summaryResult = await aiService.generateTeamSummary({}, mockAdmin);
    console.log('✅ Team Summary Generated!');
    console.log('Reports Analyzed:', summaryResult.reportsAnalyzed);
    console.log('Summary Output Preview:\n', summaryResult.summary.slice(0, 300) + '...\n');
  } catch (err: any) {
    console.error('❌ Summary Test Failed:', err.message);
  }

  await app.close();
  console.log('🏁 AI Integration Tests Complete!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});

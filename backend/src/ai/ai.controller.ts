import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { TeamSummaryDto } from './dto/team-summary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() chatDto: ChatDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.aiService.chat(chatDto, currentUser);
  }

  @Post('summary')
  @HttpCode(HttpStatus.OK)
  async generateSummary(
    @Body() summaryDto: TeamSummaryDto,
    @CurrentUser() currentUser: UserDocument,
  ) {
    return this.aiService.generateTeamSummary(summaryDto, currentUser);
  }

  @Get('status')
  getStatus() {
    return {
      status: 'ready',
      provider: 'Google Gemini',
      model: 'gemini-3.6-flash',
      hasKey: !!process.env.GEMINI_API_KEY,
    };
  }
}

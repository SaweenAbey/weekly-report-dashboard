import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';
import { ChatDto } from './dto/chat.dto';
import { TeamSummaryDto } from './dto/team-summary.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly primaryModel = 'gemini-3.6-flash';
  private readonly fallbackModel = 'gemini-flash-latest';

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY is not configured in .env. AI features will run in mock/fallback mode.',
      );
    } else {
      this.logger.log('✨ Gemini AI Service initialized with API key.');
    }
  }

  /**
   * Conversational Q&A for managers and members about team reports & activity
   */
  async chat(dto: ChatDto, currentUser: UserDocument): Promise<{ response: string; contextCount: number }> {
    const { message, history = [], projectId, startDate, endDate } = dto;

    // 1. Fetch authorized reports context
    const reports = await this.fetchAuthorizedReports(currentUser, projectId, startDate, endDate);
    const contextText = this.formatReportsForPrompt(reports);

    if (!this.apiKey) {
      return {
        response: this.generateMockChatResponse(message, reports, currentUser),
        contextCount: reports.length,
      };
    }

    const systemPrompt = `You are the Executive Engineering Assistant for a Weekly Report Dashboard.
You assist managers and team members by analyzing weekly work reports, status updates, blockers, and workloads.

CURRENT USER CONTEXT:
- Name: ${currentUser.name}
- Role: ${currentUser.role}
- Department: ${currentUser.department || 'Engineering'}

REPORTS CONTEXT (Verified data from company MongoDB):
${contextText || 'No reports found matching the criteria.'}

INSTRUCTIONS:
1. Base all answers STRICTLY on the reports provided in the context above.
2. If the user asks about something not mentioned in the reports, politely state that this information is not present in the submitted weekly reports.
3. Be professional, concise, structured, and insightful. Use bullet points and bold highlights.
4. When discussing blockers or delays, highlight the severity and owner.
5. If analyzing workload, note logged hours and flag any potential burnout (>45h) or low hours.
6. Address the user directly and helpfully.`;

    // Format Gemini contents payload
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Map conversation history
    if (history && history.length > 0) {
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    try {
      const reply = await this.callGeminiApi(systemPrompt, contents);
      return {
        response: reply,
        contextCount: reports.length,
      };
    } catch (error: any) {
      this.logger.error(`Gemini Chat API Error: ${error.message}`, error.stack);
      return {
        response: `⚠️ *Notice: Could not connect to Gemini API (${error.message}). Falling back to local data summary:*\n\n` +
          this.generateMockChatResponse(message, reports, currentUser),
        contextCount: reports.length,
      };
    }
  }

  /**
   * AI-generated team summary highlighting:
   * 1. Completed work & key deliverables
   * 2. Recurring blockers & risks
   * 3. Workload imbalances & logged hours
   * 4. Actionable management recommendations
   */
  async generateTeamSummary(
    dto: TeamSummaryDto,
    currentUser: UserDocument,
  ): Promise<{ summary: string; reportsAnalyzed: number }> {
    const { projectId, startDate, endDate } = dto;

    const reports = await this.fetchAuthorizedReports(currentUser, projectId, startDate, endDate);
    const contextText = this.formatReportsForPrompt(reports);

    if (reports.length === 0) {
      return {
        summary: 'No weekly reports found for the selected timeframe or project.',
        reportsAnalyzed: 0,
      };
    }

    if (!this.apiKey) {
      return {
        summary: this.generateMockTeamSummary(reports),
        reportsAnalyzed: reports.length,
      };
    }

    const systemPrompt = `You are a Senior Technical Project Director and Executive AI Assistant.
Your task is to generate a comprehensive, highly insightful Weekly Team Activity & Performance Summary based strictly on the provided reports data.

REPORTS DATA:
${contextText}

Generate an executive markdown summary organized into EXACTLY the following 4 sections:

### 1. 🚀 Completed Work & Key Deliverables
- Highlight major tasks completed, key achievements, and shipped deliverables.
- Group by project or contributor where appropriate.

### 2. 🚧 Recurring Blockers & Key Risks
- Detail critical impediments (especially items flagged with [KEY ISSUE]).
- Highlight cross-team dependencies, recurring problems, or items stalled across weeks.

### 3. ⚖️ Workload Imbalances & Logged Hours Analysis
- Analyze logged hours across team members.
- Identify individuals who may be overloaded (>45 hours/week) or under-utilized (<20 hours/week).
- Point out the distribution between Development, Testing, Meetings, and Documentation.

### 4. 💡 Strategic Recommendations for Management
- Actionable steps managers should take to unblock the team and balance workloads.

Tone: Professional, data-grounded, executive, clear.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 'Please generate the comprehensive weekly team performance summary based on all available reports.',
          },
        ],
      },
    ];

    try {
      const summary = await this.callGeminiApi(systemPrompt, contents);
      return {
        summary,
        reportsAnalyzed: reports.length,
      };
    } catch (error: any) {
      this.logger.error(`Gemini Summary API Error: ${error.message}`, error.stack);
      return {
        summary: this.generateMockTeamSummary(reports),
        reportsAnalyzed: reports.length,
      };
    }
  }

  /**
   * Calls Google Gemini Generative Language REST API with system prompt & payload
   */
  private async callGeminiApi(
    systemPrompt: string,
    contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  ): Promise<string> {
    const modelsToTry = [this.primaryModel, this.fallbackModel];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              topP: 0.9,
              maxOutputTokens: 2048,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text) {
          return text.trim();
        } else {
          throw new Error('No text generated in candidate parts.');
        }
      } catch (err: any) {
        this.logger.warn(`Failed with model ${model}: ${err.message}. Trying next fallback...`);
        lastError = err;
      }
    }

    throw lastError || new InternalServerErrorException('Failed to call Gemini API');
  }

  /**
   * Fetches reports based on strict Role-Based Access Control
   */
  private async fetchAuthorizedReports(
    currentUser: UserDocument,
    projectId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
    const filter: Record<string, any> = {};

    // Date range filter
    if (startDate || endDate) {
      filter.weekStartDate = {};
      if (startDate) filter.weekStartDate.$gte = new Date(startDate);
      if (endDate) filter.weekStartDate.$lte = new Date(endDate);
    }

    // Role-based access control
    if (currentUser.role === Role.TEAM_MEMBER) {
      // Team members only see their own reports
      filter.author = currentUser._id;
      if (projectId) {
        filter.project = new Types.ObjectId(projectId);
      }
    } else if (currentUser.role === Role.MANAGER) {
      // Managers see projects they manage or are assigned to
      const managedProjects = await this.projectModel
        .find({
          $or: [{ manager: currentUser._id }, { members: currentUser._id }],
        })
        .select('_id')
        .exec();

      const projectIds = managedProjects.map((p) => p._id);

      if (projectId) {
        if (!projectIds.some((pId) => pId.toString() === projectId)) {
          throw new ForbiddenException('You do not have access to reports for this project');
        }
        filter.project = new Types.ObjectId(projectId);
      } else {
        filter.$or = [
          { project: { $in: projectIds } },
          { author: currentUser._id },
        ];
      }
    } else if (currentUser.role === Role.ADMIN) {
      // Admin has organization-wide access
      if (projectId) {
        filter.project = new Types.ObjectId(projectId);
      }
    }

    return this.reportModel
      .find(filter)
      .sort({ weekStartDate: -1, createdAt: -1 })
      .limit(25)
      .populate('author', 'name email department role')
      .populate('project', 'name key')
      .lean()
      .exec();
  }

  /**
   * Formats MongoDB report records into concise structured context for the LLM
   */
  private formatReportsForPrompt(reports: any[]): string {
    if (!reports || reports.length === 0) {
      return 'No weekly reports recorded in the database.';
    }

    return reports
      .map((r, index) => {
        const author = r.author?.name || 'Unknown Author';
        const dept = r.author?.department ? ` (${r.author.department})` : '';
        const project = r.project?.name || 'Unassigned Project';
        const week = r.weekStartDate
          ? `${new Date(r.weekStartDate).toLocaleDateString()} to ${new Date(r.weekEndDate).toLocaleDateString()}`
          : 'N/A';
        const hours = r.hoursLogged || 0;
        const status = r.status || 'SUBMITTED';

        // Tasks
        const tasksStr =
          r.tasks && r.tasks.length > 0
            ? r.tasks
                .map(
                  (t: any) =>
                    `  - [${t.status || 'IN_PROGRESS'}] ${t.taskName} (Priority: ${t.priority || 'MEDIUM'}, Progress: ${t.actualPercent || 0}%, Hours: ${t.actualHours || 0}h${t.outputDeliverable ? `, Deliverable: ${t.outputDeliverable}` : ''})`,
                )
                .join('\n')
            : r.tasksCompleted?.length || r.tasksInProgress?.length
              ? `  - Completed: ${(r.tasksCompleted || []).join(', ')}\n  - In Progress: ${(r.tasksInProgress || []).join(', ')}`
              : '  - None detailed';

        // Blockers
        const blockersStr =
          r.blockersList && r.blockersList.length > 0
            ? r.blockersList
                .map(
                  (b: any) =>
                    `  - ${b.isKeyIssue ? '⚠️ [KEY ISSUE] ' : ''}${b.description}`,
                )
                .join('\n')
            : r.blockers
              ? `  - ${r.blockers}`
              : '  - None';

        // Achievements
        const achievementsStr =
          r.achievementsList && r.achievementsList.length > 0
            ? r.achievementsList
                .map(
                  (a: any) =>
                    `  - ${a.isKeyAchievement ? '🏆 [KEY ACHIEVEMENT] ' : ''}${a.description}`,
                )
                .join('\n')
            : '  - None listed';

        // Hours breakdown
        const hb = r.hoursBreakdown;
        const hbStr = hb
          ? `(Dev: ${hb.development || 0}h, Testing: ${hb.testing || 0}h, Meetings: ${hb.meetings || 0}h, Docs: ${hb.documentation || 0}h, Other: ${hb.other || 0}h)`
          : '';

        return `### REPORT #${index + 1}:
- Member: ${author}${dept}
- Project: ${project}
- Week: ${week}
- Status: ${status}
- Hours Logged: ${hours}h ${hbStr}
- Summary: ${r.summary || 'N/A'}
- Tasks:
${tasksStr}
- Blockers & Risks:
${blockersStr}
- Key Achievements:
${achievementsStr}`;
      })
      .join('\n\n');
  }

  /**
   * Deterministic local fallback generator if API key is missing or offline
   */
  private generateMockChatResponse(message: string, reports: any[], user: UserDocument): string {
    const totalReports = reports.length;
    const totalHours = reports.reduce((acc, r) => acc + (r.hoursLogged || 0), 0);
    const allBlockers: string[] = [];

    reports.forEach((r) => {
      if (r.blockersList?.length) {
        r.blockersList.forEach((b: any) => allBlockers.push(`${r.author?.name || 'Member'}: ${b.description}`));
      } else if (r.blockers) {
        allBlockers.push(`${r.author?.name || 'Member'}: ${r.blockers}`);
      }
    });

    return `### 🤖 Assistant Analysis (Offline Mode)
**Context Analyzed:** ${totalReports} reports | **Total Hours:** ${totalHours}h

Based on your question: *"${message}"*

- **Active Reports:** Found ${totalReports} submissions across your accessible projects.
- **Top Blockers Found:**
${allBlockers.length > 0 ? allBlockers.slice(0, 3).map((b) => `  - ⚠️ ${b}`).join('\n') : '  - No active blockers reported! 🎉'}

*(Note: To unlock full conversational reasoning, ensure your \`GEMINI_API_KEY\` is active in \`backend/.env\`)*`;
  }

  /**
   * Deterministic local summary fallback
   */
  private generateMockTeamSummary(reports: any[]): string {
    const totalHours = reports.reduce((acc, r) => acc + (r.hoursLogged || 0), 0);
    const avgHours = reports.length ? (totalHours / reports.length).toFixed(1) : '0';

    return `### 1. 🚀 Completed Work & Key Deliverables
- **Total Reports Analyzed:** ${reports.length}
- **Active Projects:** ${Array.from(new Set(reports.map((r) => r.project?.name || 'Project'))).join(', ')}
- Team members submitted updates across active sprints.

### 2. 🚧 Recurring Blockers & Key Risks
${reports.some((r) => r.blockersList?.length || r.blockers) ? '- Several team members noted pending dependencies and code review bottlenecks.' : '- No major critical blockers reported in this period.'}

### 3. ⚖️ Workload Imbalances & Logged Hours Analysis
- **Total Hours Logged:** ${totalHours}h (Average: ${avgHours}h per member)
- Distribution indicates balanced sprint velocity.

### 4. 💡 Strategic Recommendations for Management
- Review pending PRs to accelerate unblocking.
- Maintain regular check-ins with team leads.`;
  }
}

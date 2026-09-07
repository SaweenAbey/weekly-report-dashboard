import { apiClient } from './client';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export interface ChatRequestPayload {
  message: string;
  history?: Array<{ role: 'user' | 'model' | 'assistant'; text: string }>;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChatResponseData {
  response: string;
  contextCount: number;
}

export interface TeamSummaryRequestPayload {
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TeamSummaryResponseData {
  summary: string;
  reportsAnalyzed: number;
}

export interface AiStatusResponseData {
  status: string;
  provider: string;
  model: string;
  hasKey: boolean;
}

export const aiApi = {
  chat: async (payload: ChatRequestPayload): Promise<ChatResponseData> => {
    const res = await apiClient.post<any, any>('/ai/chat', payload);
    return res.data || res;
  },

  getTeamSummary: async (payload: TeamSummaryRequestPayload = {}): Promise<TeamSummaryResponseData> => {
    const res = await apiClient.post<any, any>('/ai/summary', payload);
    return res.data || res;
  },

  getStatus: async (): Promise<AiStatusResponseData> => {
    const res = await apiClient.get<any, any>('/ai/status');
    return res.data || res;
  },
};

export class ApiResponseDto<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

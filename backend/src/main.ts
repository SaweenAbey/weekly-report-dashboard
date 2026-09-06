import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Server');
  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 5000;
    const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
    const frontendUrl =
      configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    // Global prefix
    app.setGlobalPrefix('api');

    // CORS
    app.enableCors({
      origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Global Validation Pipe for Request Body Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global Filters & Interceptors
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.listen(port);

    logger.log('===========================================================');
    logger.log(`🚀 Server successfully started & listening on Port: [${port}]`);
    logger.log(`🌐 Base API URL: http://localhost:${port}/api`);
    logger.log(`⚡ Environment: ${nodeEnv}`);
    logger.log(`🔗 Allowed Frontend Origin: ${frontendUrl}`);
    logger.log('===========================================================');
  } catch (error: any) {
    logger.error(`❌ Fatal Error starting server: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();

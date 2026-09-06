import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongoDB');
        let uri =
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/weekly-report-dashboard';

        // Strip enclosing quotes if present from .env
        uri = uri.replace(/^["']|["']$/g, '');

        logger.log('⏳ Connecting to MongoDB database...');

        return {
          uri,
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              logger.log(
                `✅ MongoDB connected successfully! Host: [${connection.host}] | DB: [${connection.name}]`,
              );
            }

            connection.on('connected', () => {
              logger.log(
                `✅ MongoDB connected successfully! Host: [${connection.host}] | DB: [${connection.name}]`,
              );
            });

            connection.on('error', (error) => {
              logger.error(
                `❌ MongoDB connection failed: ${error.message}`,
                error.stack,
              );
            });

            connection.on('disconnected', () => {
              logger.warn('⚠️ MongoDB connection disconnected');
            });

            connection.on('reconnected', () => {
              logger.log('🔄 MongoDB reconnected successfully');
            });

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

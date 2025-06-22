import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const appName = 'API do CRM Modular';
  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription('Documentação da API para o Mono-Modular CRM')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  const url = `http://localhost:${port}`;
  const env = process.env.NODE_ENV || 'development';

  const border = `\n${'='.repeat(60)}`;
  logger.log(border);
  logger.log(`✅ ${appName} iniciada com sucesso!`);
  logger.log(border);
  logger.log(`\t🏠 Ambiente............: ${env}`);
  logger.log(`\t🚀 URL da API..........: ${url}`);
  logger.log(`\t📖 Documentação........: ${url}/api-docs`);
  logger.log(`\t🌐 Frontend URL........: ${frontendUrl}`);
  logger.log(border);
}
bootstrap().catch((error) => {
  console.error('Erro ao inicializar a aplicação:', error);
  process.exit(1);
});

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const config = new DocumentBuilder()
    .setTitle('API do CRM Modular')
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

  logger.log(`🚀 Servidor rodando no ambiente: ${env}`);
  logger.log(`✅ API disponível em: ${url}`);
  logger.log(`📚 Documentação do Swagger em: ${url}/api-docs`);
}
bootstrap();

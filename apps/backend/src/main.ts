import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API do CRM Modular')
    .setDescription('Documentação da API para o Mono-Modular CRM')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
  const port = process.env.PORT ?? 3001;
  const env = process.env.NODE_ENV || 'development';
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  console.log('\n========================================');
  console.log(`🚀  Backend rodando!`);
  console.log(`🌐  URL:     http://localhost:${port}`);
  console.log(`🔧  Ambiente: ${env}`);
  console.log(`🕒  Iniciado em: ${now}`);
  console.log('========================================\n');
}
bootstrap();

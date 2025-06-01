import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { InboxesModule } from './modules/inboxes/inboxes.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { databaseConfig } from './config/database.config';
import { env } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ ...env })],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UsersModule,
    TenantsModule,
    InboxesModule,
    ConversationsModule,
    WhatsappModule,
    WebsocketModule,
  ],
})
export class AppModule {} 
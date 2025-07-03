import { Module } from '@nestjs/common';
import { InboxesController } from './inboxes.controller';
import { WebhooksController } from './webhooks.controller';
import { ConversationsController } from './conversations.controller';
import { RealtimeController } from './realtime.controller';
import { InboxesService } from './inboxes.service';
import { WebhooksService } from './webhooks.service';
import { ConversationsService } from './conversations.service';
import { RealtimeService } from './realtime.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [InboxesController, WebhooksController, ConversationsController, RealtimeController],
  providers: [InboxesService, WebhooksService, ConversationsService, RealtimeService],
  exports: [InboxesService, WebhooksService, ConversationsService, RealtimeService],
})
export class InboxesModule {}
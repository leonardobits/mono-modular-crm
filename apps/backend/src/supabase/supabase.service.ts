import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private adminSupabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.supabaseUrl');
    const supabaseKey = this.configService.get<string>('supabase.supabaseKey');
    const supabaseServiceKey = this.configService.get<string>('supabase.supabaseServiceKey');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    if (supabaseServiceKey) {
      this.adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.adminSupabase) {
      console.warn('Admin Supabase client not available, falling back to regular client');
      return this.supabase;
    }
    return this.adminSupabase;
  }
} 
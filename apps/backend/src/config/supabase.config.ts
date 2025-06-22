import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
}));

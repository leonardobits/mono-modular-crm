import { Injectable, InternalServerErrorException, ConflictException, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(status?: "active" | "inactive") {
    const supabase = this.supabaseService.getClient();
    let query = supabase.from('profiles').select('*');

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Could not fetch users.');
    }
    return data;
  }

  async create(createUserDto: CreateUserDto) {
    const supabase = this.supabaseService.getClient();
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: createUserDto.email,
      password: Math.random().toString(36).slice(-8), // Generate a random temporary password
      options: {
        data: {
          full_name: createUserDto.name,
          role: createUserDto.cargo,
        },
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      if (authError.message.includes('unique constraint')) {
        throw new ConflictException('User with this email already exists.');
      }
      throw new InternalServerErrorException('Could not create user in authentication system.');
    }

    if (!authData.user) {
      throw new InternalServerErrorException('User was not created in authentication system, but no error was reported.');
    }

    // 2. The 'profiles' table should be populated by a trigger from `auth.users`
    // We just need to fetch the newly created profile.
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile after creation:', profileError);
      // Optional: attempt to delete the auth user if profile creation fails to keep things consistent
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException('Could not retrieve user profile after creation.');
    }
    
    if (!profileData) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new NotFoundException('User profile not found after creation.');
    }

    return profileData;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const supabase = this.supabaseService.getClient();

    // 1. Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (findError || !existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // 2. Update user in Supabase Auth (if email is changed)
    if (updateUserDto.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email: updateUserDto.email,
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        throw new InternalServerErrorException('Could not update user in authentication system.');
      }
    }

    // 3. Update user in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: updateUserDto.name,
        role: updateUserDto.cargo,
      })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      throw new InternalServerErrorException('Could not update user profile.');
    }

    return profileData;
  }

  async deactivate(id: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (findError || !existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    
    // 2. "Ban" user in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: '3650d', // 10 years, effectively permanent
    });

    if (authError) {
      console.error('Error deactivating auth user:', authError);
      throw new InternalServerErrorException('Could not deactivate user in authentication system.');
    }

    // 3. Update status in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'INACTIVE' })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating user profile status to INACTIVE:', profileError);
      throw new InternalServerErrorException('Could not update user profile status.');
    }

    return profileData;
  }

  async reactivate(id: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (findError || !existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // 2. "Un-ban" user in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: 'none',
    });

    if (authError) {
      console.error('Error reactivating auth user:', authError);
      throw new InternalServerErrorException('Could not reactivate user in authentication system.');
    }

    // 3. Update status in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating user profile status to ACTIVE:', profileError);
      throw new InternalServerErrorException('Could not update user profile status.');
    }

    return profileData;
  }
} 
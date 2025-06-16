import { Injectable, InternalServerErrorException, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service";
import { CreateUserSchema, UpdateUserSchema } from "zod-schemas";


@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(status?: "active" | "inactive") {
    const adminSupabase = this.supabaseService.getAdminClient();
    try {
      const { data: { users: authUsers }, error: usersError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (usersError) {
        console.error('Error fetching auth users:', usersError);
        throw new InternalServerErrorException('Could not fetch authentication users.');
      }

      const { data: profiles, error: profilesError } = await adminSupabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw new InternalServerErrorException('Could not fetch user profiles.');
      }

      const profilesMap = new Map(profiles.map(p => [p.id, p]));

      let combinedUsers = authUsers.map(user => {
        const profile = profilesMap.get(user.id);
        return {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name ?? 'N/A',
          role: profile?.role ?? 'N/A',
          status: profile?.status ?? 'INACTIVE',
          created_at: user.created_at,
        };
      });

      if (status) {
        combinedUsers = combinedUsers.filter(user => user.status.toLowerCase() === status.toLowerCase());
      }
      
      combinedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return combinedUsers;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('Unexpected error in findAll:', error);
      throw new InternalServerErrorException('Failed to retrieve users due to an unexpected error.');
    }
  }

  async findOne(id: string) {
    const adminSupabase = this.supabaseService.getAdminClient();
    try {
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(id);
      if (authError || !authUser) {
        throw new NotFoundException(`Authentication user with ID ${id} not found.`);
      }

      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') { // Ignore 'not found' errors
        console.warn(`Could not fetch profile for user ${id}:`, profileError);
      }

      return {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: profile?.full_name,
        role: profile?.role,
        status: profile?.status,
        ...profile,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Unexpected error in findOne for user ID ${id}:`, error);
      throw new InternalServerErrorException(`Failed to retrieve user ${id}.`);
    }
  }

  async create(createUserDto: CreateUserSchema) {
    const supabase = this.supabaseService.getClient();
    
    try {
      const temporaryPassword = this.generateTemporaryPassword();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createUserDto.email,
        password: temporaryPassword,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        if (authError.message.includes('unique constraint') || authError.message.includes('already exists')) {
          throw new ConflictException('User with this email already exists.');
        }
        throw new InternalServerErrorException('Could not create user in authentication system.');
      }

      if (!authData?.user) {
        throw new InternalServerErrorException('User was not created in authentication system, but no error was reported.');
      }

      const adminSupabase = this.supabaseService.getAdminClient();
      const profileData = {
        id: authData.user.id,
        full_name: (createUserDto as any).fullName,
        role: (createUserDto as any).role,
        status: 'ACTIVE',
      };

      const { data: profileResult, error: profileError } = await adminSupabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user after profile creation failure:', cleanupError);
        }
        
        throw new InternalServerErrorException('Could not create user profile.');
      }

      return {
        ...profileResult,
        temporaryPassword: temporaryPassword,
      };

    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      console.error('UsersService.create - Unexpected error:', error);
      throw new InternalServerErrorException('User creation failed due to unexpected error.');
    }
  }

  async update(id: string, updateUserDto: UpdateUserSchema) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const { data: authUser, error: findError } = await supabase.auth.admin.getUserById(id);
      if (findError || !authUser) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      if (updateUserDto.email && updateUserDto.email !== authUser.user.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          email: updateUserDto.email,
        });

        if (authError) {
          console.error('Error updating auth user email:', authError);
          if (authError.message.includes('unique constraint')) {
            throw new ConflictException('Email already in use by another user.');
          }
          throw new InternalServerErrorException('Could not update user email.');
        }
      }

      const updateData: any = {};
      const dto = updateUserDto as any;
      
      const profileFields = [
        'fullName', 'role', 'status', 'zip_code', 'street', 
        'number', 'complement', 'neighborhood', 'city', 'state'
      ];
      const fieldMapping: { [key: string]: string } = { 'fullName': 'full_name' };

      let hasProfileUpdates = false;
      for (const field of profileFields) {
        if (dto[field] !== undefined) {
          const dbField = fieldMapping[field] || field;
          updateData[dbField] = dto[field];
          hasProfileUpdates = true;
        }
      }
      
      if (hasProfileUpdates) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', id);

        if (profileError) {
          console.error('Error updating user profile:', profileError);
          throw new InternalServerErrorException('Could not update user profile.');
        }
      }

      return this.findOne(id);

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException || error instanceof ConflictException) {
        throw error;
      }
      
      console.error(`Unexpected error in update for user ID ${id}:`, error);
      throw new InternalServerErrorException('User update failed due to unexpected error.');
    }
  }

  async updatePassword(id: string, updatePasswordDto: { password?: string }) {
    if (!updatePasswordDto.password) {
      throw new BadRequestException('Password not provided.');
    }

    const adminSupabase = this.supabaseService.getAdminClient();
    try {
      const { error } = await adminSupabase.auth.admin.updateUserById(id, {
        password: updatePasswordDto.password,
      });

      if (error) {
        console.error(`Error updating password for user ${id}:`, error);
        throw new InternalServerErrorException('Could not update user password.');
      }

      return { message: 'Password updated successfully.' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error(`Unexpected error in updatePassword for user ID ${id}:`, error);
      throw new InternalServerErrorException('Password update failed due to an unexpected error.');
    }
  }

  async deactivate(id: string) {
    return this.updateUserStatus(id, 'INACTIVE');
  }

  async reactivate(id: string) {
    return this.updateUserStatus(id, 'ACTIVE');
  }

  private async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    const adminSupabase = this.supabaseService.getAdminClient();

    try {
      const { data, error } = await adminSupabase
        .from('profiles')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating status for user ${id} to ${status}:`, error);
        throw new InternalServerErrorException(`Could not update user status.`);
      }
      
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error(`Unexpected error in updateUserStatus for user ID ${id}:`, error);
      throw new InternalServerErrorException('User status update failed unexpectedly.');
    }
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
} 
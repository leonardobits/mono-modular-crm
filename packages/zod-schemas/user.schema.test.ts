import { 
  initialAdminRegisterSchema,
  createUserSchema,
  updateUserSchema 
} from './user.schema';

describe('User Schemas', () => {
  
  describe('initialAdminRegisterSchema', () => {
    test('should validate correct admin registration data', () => {
      const validData = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        role: 'ADMIN' as const
      };

      expect(() => initialAdminRegisterSchema.parse(validData)).not.toThrow();
      
      const result = initialAdminRegisterSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should accept all role types', () => {
      const roles = ['ADMIN', 'MANAGER', 'AGENT'] as const;
      
      roles.forEach(role => {
        const data = {
          fullName: 'Teste User',
          email: 'teste@example.com',
          role
        };
        
        expect(() => initialAdminRegisterSchema.parse(data)).not.toThrow();
      });
    });

    test('should reject invalid email', () => {
      const invalidData = {
        fullName: 'João Silva',
        email: 'email-invalido',
        role: 'ADMIN' as const
      };

      expect(() => initialAdminRegisterSchema.parse(invalidData)).toThrow();
    });

    test('should reject fullName too short', () => {
      const invalidData = {
        fullName: 'Jo',
        email: 'joao@example.com',
        role: 'ADMIN' as const
      };

      expect(() => initialAdminRegisterSchema.parse(invalidData)).toThrow();
    });

    test('should reject fullName too long', () => {
      const invalidData = {
        fullName: 'a'.repeat(101),
        email: 'joao@example.com',
        role: 'ADMIN' as const
      };

      expect(() => initialAdminRegisterSchema.parse(invalidData)).toThrow();
    });

    test('should reject invalid role', () => {
      const invalidData = {
        fullName: 'João Silva',
        email: 'joao@example.com',
        role: 'INVALID_ROLE' as any
      };

      expect(() => initialAdminRegisterSchema.parse(invalidData)).toThrow();
    });

    test('should reject missing required fields', () => {
      expect(() => initialAdminRegisterSchema.parse({})).toThrow();
      expect(() => initialAdminRegisterSchema.parse({ fullName: 'Test' })).toThrow();
      expect(() => initialAdminRegisterSchema.parse({ email: 'test@example.com' })).toThrow();
    });
  });

  describe('createUserSchema', () => {
    test('should validate correct user creation data', () => {
      const validData = {
        fullName: 'Maria Santos',
        email: 'maria@example.com',
        role: 'MANAGER' as const
      };

      expect(() => createUserSchema.parse(validData)).not.toThrow();
      
      const result = createUserSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should accept all role types', () => {
      const roles = ['ADMIN', 'MANAGER', 'AGENT'] as const;
      
      roles.forEach(role => {
        const data = {
          fullName: 'Teste User',
          email: 'teste@example.com',
          role
        };
        
        expect(() => createUserSchema.parse(data)).not.toThrow();
      });
    });
  });

  describe('updateUserSchema', () => {
    test('should validate complete update data', () => {
      const validData = {
        fullName: 'João Silva Updated',
        email: 'joao.updated@example.com',
        role: 'MANAGER' as const,
        status: 'ACTIVE' as const,
        zip_code: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 456',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP'
      };

      expect(() => updateUserSchema.parse(validData)).not.toThrow();
      
      const result = updateUserSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should validate partial update data', () => {
      const partialData = {
        fullName: 'João Silva Updated'
      };

      expect(() => updateUserSchema.parse(partialData)).not.toThrow();
      
      const result = updateUserSchema.parse(partialData);
      expect(result).toEqual(partialData);
    });

    test('should validate empty update data', () => {
      const emptyData = {};

      expect(() => updateUserSchema.parse(emptyData)).not.toThrow();
      
      const result = updateUserSchema.parse(emptyData);
      expect(result).toEqual(emptyData);
    });

    test('should accept all role types', () => {
      const roles = ['ADMIN', 'MANAGER', 'AGENT'] as const;
      
      roles.forEach(role => {
        const data = { role };
        expect(() => updateUserSchema.parse(data)).not.toThrow();
      });
    });

    test('should accept all status types', () => {
      const statuses = ['ACTIVE', 'INACTIVE'] as const;
      
      statuses.forEach(status => {
        const data = { status };
        expect(() => updateUserSchema.parse(data)).not.toThrow();
      });
    });

    test('should reject invalid role', () => {
      const invalidData = {
        role: 'INVALID_ROLE' as any
      };

      expect(() => updateUserSchema.parse(invalidData)).toThrow();
    });

    test('should reject invalid status', () => {
      const invalidData = {
        status: 'INVALID_STATUS' as any
      };

      expect(() => updateUserSchema.parse(invalidData)).toThrow();
    });

    test('should reject invalid email format', () => {
      const invalidData = {
        email: 'email-invalido'
      };

      expect(() => updateUserSchema.parse(invalidData)).toThrow();
    });

    test('should reject fullName too short', () => {
      const invalidData = {
        fullName: 'Jo'
      };

      expect(() => updateUserSchema.parse(invalidData)).toThrow();
    });

    test('should reject fullName too long', () => {
      const invalidData = {
        fullName: 'a'.repeat(101)
      };

      expect(() => updateUserSchema.parse(invalidData)).toThrow();
    });

    test('should validate only address fields', () => {
      const addressData = {
        zip_code: '12345-678',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 456',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP'
      };

      expect(() => updateUserSchema.parse(addressData)).not.toThrow();
      
      const result = updateUserSchema.parse(addressData);
      expect(result).toEqual(addressData);
    });
  });

  describe('Schema Integration Tests', () => {
    test('initialAdminRegisterSchema and createUserSchema should have same structure', () => {
      const testData = {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN' as const
      };

      // Both schemas should accept the same data
      expect(() => initialAdminRegisterSchema.parse(testData)).not.toThrow();
      expect(() => createUserSchema.parse(testData)).not.toThrow();

      const initialResult = initialAdminRegisterSchema.parse(testData);
      const createResult = createUserSchema.parse(testData);
      
      expect(initialResult).toEqual(createResult);
    });

    test('updateUserSchema should accept all fields from createUserSchema', () => {
      const createData = {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'MANAGER' as const
      };

      // updateUserSchema should accept all fields from createUserSchema
      expect(() => updateUserSchema.parse(createData)).not.toThrow();
      
      const result = updateUserSchema.parse(createData);
      expect(result).toEqual(createData);
    });
  });
}); 
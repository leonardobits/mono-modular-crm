export interface User {
  id: string;
  name: string;
  email: string;
  cargo: 'ADMINISTRADOR' | 'GERENTE' | 'ATENDENTE';
  status: 'ATIVO' | 'INATIVO';
} 
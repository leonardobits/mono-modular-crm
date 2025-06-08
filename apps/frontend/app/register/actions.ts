export interface RegisterState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  }
  message?: string | null;
}

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  console.log("Registering user with data:", Object.fromEntries(formData.entries()));

  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  const errors: RegisterState['errors'] = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = ["Name must be at least 2 characters."];
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.email = ["Please enter a valid email."];
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = ["Password must be at least 6 characters."];
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Registration failed. Please check the fields." };
  }

    

  await new Promise(resolve => setTimeout(resolve, 1000)); 

  return { message: "Registration successful! Please check your email to verify your account." };
}

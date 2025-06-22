import { RegisterForm } from "@/components/ui/register-form";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Page() {
  return (
    <AuthGuard redirectIfAuth={true}>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </AuthGuard>
  );
}

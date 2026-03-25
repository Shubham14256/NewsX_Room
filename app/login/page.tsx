import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-headline text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Sign in to access your NewsroomX admin panel.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}

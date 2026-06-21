import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoginForm } from "@/features/auth/login-form";
import { RegisterForm } from "@/features/auth/register-form";

type AuthMode = "login" | "register";

export const Component = ({ initialMode = "login" }: { initialMode?: AuthMode }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-2 shadow-sm">
      <div className="relative grid grid-cols-2 rounded-lg bg-muted p-1">
        <div
          className={cn(
            "absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-md bg-primary shadow-sm transition-transform duration-300 ease-out",
            mode === "register" && "translate-x-[calc(100%+0.5rem)]"
          )}
        />
        <button
          type="button"
          onClick={() => setMode("login")}
          className={cn(
            "relative z-10 rounded-md py-2 text-sm font-medium transition-colors duration-300",
            mode === "login" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={cn(
            "relative z-10 rounded-md py-2 text-sm font-medium transition-colors duration-300",
            mode === "register" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sign up
        </button>
      </div>
      <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 pb-4">
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getLoginSchema,
  type LoginFormValues,
} from "@/validation/login.validation";
import { useTranslation } from "react-i18next";
import { useLogin } from "@/hooks/useLogin";
import { LoginBrandPanel } from "@/components/login/LoginBrandPanel";
import { LoginFormPanel } from "@/components/login/LoginFormPanel";
import { LoginShell } from "@/components/login/LoginShell";

export function LoginPage() {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = useMemo(() => getLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <LoginShell>
      <div className="grid lg:grid-cols-2">
        <LoginBrandPanel />
        <LoginFormPanel
          form={form}
          onSubmit={onSubmit}
          isPending={loginMutation.isPending}
          error={loginMutation.error}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
        />
      </div>
    </LoginShell>
  );
}

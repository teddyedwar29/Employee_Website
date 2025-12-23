import LoginForm from "@/auth/components/LoginForm";

export default function LoginPage() {
  const handleLogin = async ({ username, password }) => {
    console.log(username, password);

    // nanti ganti ke API Python
    // const res = await authService.login(...)
  };

  return <LoginForm onSubmit={handleLogin} />;
}

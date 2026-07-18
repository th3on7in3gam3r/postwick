import { AuthBackground } from "@/components/auth-background";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthBackground>{children}</AuthBackground>;
}

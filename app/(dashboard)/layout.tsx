import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.role) {
    redirect("/pending");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user.name ?? "",
          email: user.email,
          role: user.role as string,
        }}
      />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-sm font-medium text-muted-foreground">
            Gestion de dépôt de boissons
          </h1>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Loader2 } from "lucide-react";
import { updateUserRoleAction } from "@/features/users/actions/user.action";
import { useAbility } from "@/components/ability-provider";
import { USER_ROLES } from "@/lib/constants";
import { redirect } from "next/navigation";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  emailVerified: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ADMIN: { label: "Admin", variant: "destructive" },
  SECRETAIRE: { label: "Secrétaire", variant: "default" },
  GESTIONNAIRE_STOCK: { label: "Gest. Stock", variant: "outline" },
  VENDEUR: { label: "Vendeur", variant: "secondary" },
};

export default function UsersPage() {
  const ability = useAbility();
  const queryClient = useQueryClient();

  if (!ability.can("view", "User")) {
    redirect("/dashboard");
  }

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UserRow[]> => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: string | null;
    }) => {
      const result = await updateUserRoleAction(userId, role);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.getValue("name") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.getValue("role") as string | null;
        if (!role) {
          return (
            <Badge variant="outline" className="text-orange-500 border-orange-500">
              En attente
            </Badge>
          );
        }
        const cfg = ROLE_LABELS[role] || { label: role, variant: "secondary" as const };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Inscrit le",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR"),
    },
    {
      id: "actions",
      header: "Changer le rôle",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1">
            <select
              className="flex h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs"
              value={user.role ?? ""}
              onChange={(e) =>
                roleMutation.mutate({
                  userId: user.id,
                  role: e.target.value || null,
                })
              }
              disabled={roleMutation.isPending}
            >
              <option value="">Aucun (bloqué)</option>
              {Object.entries(USER_ROLES).map(([key, value]) => (
                <option key={key} value={value}>
                  {ROLE_LABELS[value]?.label || value}
                </option>
              ))}
            </select>
            {roleMutation.isPending && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les accès et les rôles des utilisateurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Utilisateurs ({users.length})
          </CardTitle>
          <CardDescription>
            Attribuez un rôle pour donner accès à l&apos;application. Sans rôle = accès bloqué.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Aucun utilisateur.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

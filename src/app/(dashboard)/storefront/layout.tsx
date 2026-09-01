import { Header } from "@/components/layout/header";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header title="จัดการหน้าร้าน" />
      <main className="p-6">{children}</main>
    </div>
  );
}

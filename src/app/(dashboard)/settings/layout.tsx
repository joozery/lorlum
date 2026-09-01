import { SettingsNav } from "@/components/settings/settings-nav";
import { Header } from "@/components/layout/header";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header title="ตั้งค่าระบบ" />
      <main className="p-6">
        <div className="flex gap-6 items-start">
          <SettingsNav />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}

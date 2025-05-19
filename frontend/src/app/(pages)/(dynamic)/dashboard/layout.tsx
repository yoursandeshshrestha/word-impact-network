import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { ReduxProvider } from "@/redux/provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ReduxProvider>
  );
}

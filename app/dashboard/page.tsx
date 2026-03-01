import Navigation from "@/components/Navigation";
import DashboardView from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <>
      <Navigation />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <DashboardView />
      </main>
    </>
  );
}

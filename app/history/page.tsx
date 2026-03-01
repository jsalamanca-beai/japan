import Navigation from "@/components/Navigation";
import HistoryView from "@/components/HistoryView";

export default function HistoryPage() {
  return (
    <>
      <Navigation />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <HistoryView />
      </main>
    </>
  );
}

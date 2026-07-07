import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageStates";

export function PosModal({
  title,
  description,
  onClose,
  children,
  wide,
  closeLabel = "Close",
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  closeLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`max-h-[85vh] w-full overflow-y-auto rounded-2xl border border-border/50 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 sm:slide-in-from-bottom-0 ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <PageHeader
          title={title}
          description={description}
          action={
            <Button variant="outline" onClick={onClose}>
              {closeLabel}
            </Button>
          }
        />
        {children}
      </div>
    </div>
  );
}

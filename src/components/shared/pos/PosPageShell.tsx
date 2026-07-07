import { cn } from "@/lib/utils";

export function PosPageShell({
  children,
  className,
  fullHeight,
  ref,
}: {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        fullHeight
          ? "flex h-full min-h-0 flex-col"
          : "p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

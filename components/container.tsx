import { cn } from "@/lib/utils";

export default function Container({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-2xl px-4 sm:px-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

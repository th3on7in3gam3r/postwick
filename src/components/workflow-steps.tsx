import { kerygmaUrl } from "@/lib/brand";

const steps = [
  { label: "Create on Kerygma", href: null as string | null, external: true },
  { label: "Share to Postwick", href: null, external: false },
  { label: "Manage in Studio", href: "/studio", external: false },
] as const;

export function WorkflowSteps() {
  return (
    <ol className="mt-5 flex max-w-xl flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {steps.map((step, index) => {
        const content =
          step.href || step.external ? (
            <a
              href={step.external ? kerygmaUrl() : step.href!}
              {...(step.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              {step.label}
            </a>
          ) : (
            <span className="font-medium text-ink">{step.label}</span>
          );

        return (
          <li key={step.label} className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {index + 1}
            </span>
            {content}
            {index < steps.length - 1 ? (
              <span className="text-accent/70" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

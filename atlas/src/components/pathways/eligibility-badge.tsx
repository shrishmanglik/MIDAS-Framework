import { Badge } from "@/components/ui/badge";

interface EligibilityBadgeProps {
  status: "eligible" | "partial" | "ineligible";
}

const STATUS_CONFIG = {
  eligible: {
    label: "Eligible",
    variant: "success" as const,
  },
  partial: {
    label: "Near Eligible",
    variant: "warning" as const,
  },
  ineligible: {
    label: "Not Eligible",
    variant: "destructive" as const,
  },
};

export function EligibilityBadge({ status }: EligibilityBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

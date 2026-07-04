import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { RiskLevel } from "@/types/contracts";

interface RiskBadgeProps {
  level: RiskLevel;
}

const config: Record<
  RiskLevel,
  {
    variant: "success" | "warning" | "danger" | "destructive";
    icon: typeof CheckCircle;
    label: string;
  }
> = {
  low: { variant: "success", icon: CheckCircle, label: "Low Risk" },
  medium: { variant: "warning", icon: AlertCircle, label: "Medium Risk" },
  high: { variant: "danger", icon: AlertTriangle, label: "High Risk" },
  critical: { variant: "destructive", icon: XCircle, label: "Critical" },
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const { variant, icon: Icon, label } = config[level];

  return (
    <Badge variant={variant}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

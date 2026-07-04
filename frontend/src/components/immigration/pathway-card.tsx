import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import type { Program } from "@/types/immigration";

interface PathwayCardProps {
  program: Program;
  userScore?: number;
}

export function PathwayCard({ program, userScore }: PathwayCardProps) {
  const meetsMinimum = userScore ? userScore >= program.minimum_score : false;

  return (
    <Card
      className={
        program.is_eligible
          ? "border-emerald-500/30"
          : "border-border"
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{program.name}</CardTitle>
            <CardDescription className="mt-1">
              {program.description}
            </CardDescription>
          </div>
          {program.is_eligible ? (
            <Badge variant="success" className="shrink-0">
              <CheckCircle className="mr-1 h-3 w-3" />
              Eligible
            </Badge>
          ) : (
            <Badge variant="danger" className="shrink-0">
              <XCircle className="mr-1 h-3 w-3" />
              Not Eligible
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Minimum Score</span>
          <span className="font-semibold text-foreground">
            {program.minimum_score} CRS
          </span>
        </div>
        {userScore !== undefined && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Score</span>
            <span
              className={`font-semibold ${meetsMinimum ? "text-emerald-400" : "text-red-400"}`}
            >
              {userScore} CRS
            </span>
          </div>
        )}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Requirements
          </p>
          <ul className="space-y-1">
            {program.requirements.map((req, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {req}
              </li>
            ))}
          </ul>
        </div>
        <Badge variant="secondary" className="mt-4">
          {program.category}
        </Badge>
      </CardContent>
    </Card>
  );
}

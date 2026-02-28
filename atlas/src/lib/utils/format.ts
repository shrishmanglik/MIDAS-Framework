export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

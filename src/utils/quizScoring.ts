export function calculatePassPercentage(
  requiredScore: number,
  questionCount: number,
): number {
  if (questionCount <= 0) {
    return 0;
  }

  return Math.round((requiredScore / questionCount) * 100);
}

export function formatPassThreshold(
  requiredScore: number,
  questionCount: number,
): string {
  const passPercentage = calculatePassPercentage(requiredScore, questionCount);
  return `${passPercentage}% (${requiredScore}/${questionCount})`;
}

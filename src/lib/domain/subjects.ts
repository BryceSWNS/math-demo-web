export const SUBJECTS = ["probability-statistics", "microeconomics"] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_LABELS: Record<Subject, string> = {
  "probability-statistics": "概率论与数理统计",
  microeconomics: "微观经济学"
};

export function isSubject(value: string): value is Subject {
  return SUBJECTS.includes(value as Subject);
}

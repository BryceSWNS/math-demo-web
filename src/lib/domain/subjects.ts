export const SUBJECTS = ["probability-statistics", "microeconomics", "microeconomics-terms"] as const;

export type Subject = (typeof SUBJECTS)[number];

export type SubjectChapter = {
  chapterNo: number;
  title: string;
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  "probability-statistics": "概率论与数理统计",
  microeconomics: "微观经济学",
  "microeconomics-terms": "微观名词解释"
};

export const SUBJECT_CHAPTERS: Partial<Record<Subject, SubjectChapter[]>> = {
  "probability-statistics": [
    { chapterNo: 1, title: "随机事件与概率" },
    { chapterNo: 2, title: "随机变量及其分布" },
    { chapterNo: 3, title: "多维随机变量及其分布" },
    { chapterNo: 4, title: "大数定律与中心极限定理" },
    { chapterNo: 5, title: "统计量及其分布" },
    { chapterNo: 6, title: "参数估计" },
    { chapterNo: 7, title: "假设检验" }
  ]
};

export function getSubjectChapters(subject: Subject): SubjectChapter[] {
  return SUBJECT_CHAPTERS[subject] ?? [];
}

export function parseQuestionNo(questionNo: string | null): { chapterNo: number; itemNo: number } | null {
  if (!questionNo) return null;
  const matched = questionNo.trim().match(/^(\d+)\.(\d+)$/);
  if (!matched) return null;
  return {
    chapterNo: Number(matched[1]),
    itemNo: Number(matched[2])
  };
}

export function isSubject(value: string): value is Subject {
  return SUBJECTS.includes(value as Subject);
}

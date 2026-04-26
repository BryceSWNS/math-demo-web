import type { Subject } from "./subjects";

export type AuthorRole = "teacher" | "student";

export type ProblemDifficulty = "easy" | "medium" | "hard";
export type ProblemSubject = Subject;
export type ChapterSection = "examples" | "exercises";

export type ProblemOption = {
  key: string;
  text: string;
};

export type ProblemRecord = {
  id: string;
  subject: ProblemSubject;
  questionNo: string | null;
  chapterSection: ChapterSection | null;
  title: string;
  stemMd: string;
  options: ProblemOption[];
  answerMd: string;
  analysisMd: string;
  tags: string[];
  difficulty: ProblemDifficulty;
  isHidden: boolean;
  createdByAlias: string;
  createdAt: string;
};

export type ProblemSummary = Pick<
  ProblemRecord,
  | "id"
  | "subject"
  | "questionNo"
  | "chapterSection"
  | "title"
  | "stemMd"
  | "tags"
  | "difficulty"
  | "createdByAlias"
  | "createdAt"
>;

export type ProblemAssetRecord = {
  id: string;
  problemId: string;
  fileUrl: string;
  fileType: "image" | "pdf";
  sortOrder: number;
};

export type CommentRecord = {
  id: string;
  problemId: string;
  parentId: string | null;
  authorRole: AuthorRole;
  authorAlias: string;
  contentMd: string;
  isHidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
};

export type IdentityContext = {
  role: AuthorRole;
  alias: string;
  userId?: string;
};

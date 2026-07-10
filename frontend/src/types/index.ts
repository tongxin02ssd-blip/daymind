export type User = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type UserContext = {
  id: string;
  userId: string;
  content: string;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DailyPlan = {
  id: string;
  entryId: string;
  content: string;
  completed: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type DailyReport = {
  id: string;
  entryId: string;
  stateType: string;
  conclusion: string;
  surfaceReason: string;
  deepReason: string;
  suggestion: string;
  backgroundSnapshot: string;
  aiRawResponse: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyEntry = {
  id: string | null;
  userId: string;
  date: string;
  record: string;
  createdAt: string | null;
  updatedAt: string | null;
  plans: DailyPlan[];
  report: DailyReport | null;
};

export type GenerateReportResponse =
  { report: DailyReport };

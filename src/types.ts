export enum Difficulty {
  Beginner = "初级",
  Intermediate = "中级",
  Advanced = "高级",
}

export enum GrammarCategory {
  NonFinite = "非谓语动词",
  RelativeClause = "定语从句",
  AdverbialClause = "状语从句",
  Conjunction = "连词",
  NounClause = "名词性从句",
  Tense = "时态语态",
}

export interface Option {
  id: string;
  text: string;
}

export interface Explanation {
  correctAnswer: string;
  rule: string;
  example: string;
  commonMistake: string;
  reviewLink?: string;
}

export interface Question {
  id: number;
  sentence: string; // Use "____" for the blank
  options: Option[];
  correctOptionId: string;
  difficulty: Difficulty;
  category: GrammarCategory;
  explanation: Explanation;
}

export interface UserAnswer {
  questionId: number;
  selectedOptionId: string;
  isCorrect: boolean;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Info, 
  ExternalLink,
  Trophy,
  Filter,
  GraduationCap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Markdown from "react-markdown";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { questions } from "./data/questions";
import { Difficulty, GrammarCategory, Question, UserAnswer } from "./types";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "全部">("全部");
  const [filterCategory, setFilterCategory] = useState<GrammarCategory | "全部">("全部");
  const [timerDuration, setTimerDuration] = useState<number | null>(null); // in seconds
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Shuffled questions state to ensure order is fixed for the session but random on load
  const [allQuestions, setAllQuestions] = useState(() => shuffleArray(questions).slice(0, 20));

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchDifficulty = filterDifficulty === "全部" || q.difficulty === filterDifficulty;
      const matchCategory = filterCategory === "全部" || q.category === filterCategory;
      return matchDifficulty && matchCategory;
    });
  }, [allQuestions, filterDifficulty, filterCategory]);

  // Timer logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isFinished && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeRemaining === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(interval);
  }, [isStarted, isFinished, timeRemaining]);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleStart = () => {
    if (filteredQuestions.length === 0) return;
    setIsStarted(true);
    setStartTime(Date.now());
    if (timerDuration) {
      setTimeRemaining(timerDuration);
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || !currentQuestion) return;
    
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect,
    };

    setAnswers([...answers, newAnswer]);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setAllQuestions(shuffleArray(questions).slice(0, 20));
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setAnswers([]);
    setIsFinished(false);
    setIsStarted(false);
    setTimeRemaining(null);
  };

  const score = answers.filter(a => a.isCorrect).length;
  const total = filteredQuestions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isLastCorrect = answers.length > 0 && answers[answers.length - 1].isCorrect;

  const getEncouragement = (p: number) => {
    if (p === 100) return "太棒了！你是语法大师！";
    if (p >= 80) return "做得好！继续保持！";
    if (p >= 60) return "不错，再接再厉！";
    return "别灰心，多练习会进步的！";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Home Page View
  if (!isStarted) {
    return (
      <div className="min-h-screen vibrant-bg flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
        >
          <div className="bg-emerald-600 p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-40 h-40 rounded-full bg-white blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 rounded-full bg-white blur-3xl"></div>
            </div>
            <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl font-black tracking-tight mb-2">语法大师</h1>
            <p className="text-emerald-100 font-medium tracking-wide uppercase text-sm">初中英语语法填空互动练习</p>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Difficulty Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Filter className="w-4 h-4" /> 选择难度
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["全部", ...Object.values(Difficulty)].map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDifficulty(d as any)}
                      className={cn(
                        "py-3 rounded-2xl text-sm font-bold transition-all border-2",
                        filterDifficulty === d 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" 
                          : "bg-white border-gray-100 text-gray-500 hover:border-emerald-200"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <RotateCcw className="w-4 h-4" /> 设置计时
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "不计时", value: null },
                    { label: "2 分钟", value: 120 },
                    { label: "5 分钟", value: 300 },
                    { label: "10 分钟", value: 600 },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setTimerDuration(t.value)}
                      className={cn(
                        "py-3 rounded-2xl text-sm font-bold transition-all border-2",
                        timerDuration === t.value 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" 
                          : "bg-white border-gray-100 text-gray-500 hover:border-emerald-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleStart}
                disabled={filteredQuestions.length === 0}
                className={cn(
                  "w-full py-5 rounded-[1.5rem] text-xl font-black flex items-center justify-center gap-3 transition-all",
                  filteredQuestions.length > 0
                    ? "bg-gray-900 text-white shadow-2xl shadow-gray-200 hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                开始练习
                <ChevronRight className="w-6 h-6" />
              </button>
              <p className="text-center mt-4 text-xs font-bold text-gray-400">
                当前筛选条件下共有 <span className="text-emerald-600">{filteredQuestions.length}</span> 道题目
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const getDetailedEvaluation = (p: number) => {
    if (p === 100) return "卓越的表现！你不仅展现了扎实的语法功底，更体现了对英语逻辑结构的深刻理解。从非谓语动词的微妙变化到复杂从句的精准引导，你都游刃有余。建议开始尝试阅读原版学术文章或文学作品，进一步提升语感。";
    if (p >= 85) return "非常优秀！你已经构建了完整的语法体系，能够准确辨析绝大多数高频考点。目前的失分点可能集中在一些极具迷惑性的特殊用法或长难句的逻辑拆解上。建议针对错题所属的分类（如定语从句或非谓语）进行专项深度复习，追求极致的严谨。";
    if (p >= 70) return "表现良好。你对核心语法规则有清晰的认识，但在实际应用中仍存在一定的思维盲区，尤其是在多种语法现象交织的情况下容易混淆。建议在练习时多问自己‘为什么不选其他项’，通过排除法强化对干扰项特征的识别能力。";
    if (p >= 50) return "基础尚可，但仍有较大的提升空间。目前的得分反映出你在某些关键考点（如时态语态或状语从句）上存在概念模糊的情况。建议回归课本，系统性地梳理语法图谱，并结合本次练习中的‘详解卡片’进行针对性巩固，建立更稳固的知识连接。";
    return "目前的成绩提醒你需要重新审视自己的学习策略。语法是语言的骨架，基础不牢会直接限制阅读和写作能力的提升。不要被挫折打败，建议从最基础的简单句结构开始复习，每天坚持完成一组20题的练习，并逐一消化解析内容。坚持一个月，你一定会看到质的飞跃。";
  };

  const chartData = [
    { name: '正确', value: score },
    { name: '错误', value: total - score },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
        {value > 0 ? `${value}题` : ''}
      </text>
    );
  };

  if (isFinished) {
    return (
      <div className="min-h-screen vibrant-bg flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">练习完成</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="w-full md:w-1/2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 text-left space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-3xl font-black text-emerald-600">{score} / {total}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black">最终得分</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-3xl font-black text-gray-900">
                  {startTime ? formatTime(Math.floor((Date.now() - startTime) / 1000)) : "0:00"}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black">所用时间</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 mb-8 border border-emerald-100 text-left">
            <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> 学习评价
            </h3>
            <p className="text-emerald-700 text-sm leading-relaxed">
              {getDetailedEvaluation(percentage)}
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <RotateCcw className="w-5 h-5" />
            重新开始
          </button>
        </motion.div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen vibrant-bg flex flex-col items-center justify-center p-4 font-sans">
        <div className="text-white/80 mb-4 font-bold">没有找到符合条件的题目</div>
        <button 
          onClick={() => { setFilterDifficulty("全部"); setFilterCategory("全部"); }}
          className="text-emerald-600 font-medium hover:underline"
        >
          重置过滤器
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen vibrant-bg text-gray-900 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">语法大师</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">初中英语语法填空</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filterDifficulty} 
              onChange={(e) => { setFilterDifficulty(e.target.value as any); setCurrentIndex(0); setAnswers([]); }}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              <option value="全部">所有难度</option>
              {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <select 
              value={filterCategory} 
              onChange={(e) => { setFilterCategory(e.target.value as any); setCurrentIndex(0); setAnswers([]); }}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              <option value="全部">所有考点</option>
              {Object.values(GrammarCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">进度</span>
              <span className="text-sm font-bold text-emerald-600">{currentIndex + 1} / {total}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {timeRemaining !== null && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">剩余时间</h3>
              <div className={cn(
                "text-3xl font-black tabular-nums",
                timeRemaining < 30 ? "text-red-500 animate-pulse" : "text-gray-900"
              )}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">当前考点</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                {currentQuestion.category}
              </span>
              <span className={cn(
                "px-3 py-1 text-xs font-bold rounded-full border",
                currentQuestion.difficulty === Difficulty.Beginner && "bg-blue-50 text-blue-700 border-blue-100",
                currentQuestion.difficulty === Difficulty.Intermediate && "bg-orange-50 text-orange-700 border-orange-100",
                currentQuestion.difficulty === Difficulty.Advanced && "bg-red-50 text-red-700 border-red-100"
              )}>
                {currentQuestion.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isSubmitted && !answers[answers.length - 1]?.isCorrect 
              ? { x: [0, -10, 10, -10, 10, 0], opacity: 1, y: 0 } 
              : { opacity: 1, y: 0 }
            }
            transition={{ duration: isSubmitted && !answers[answers.length - 1]?.isCorrect ? 0.4 : 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[300px] flex flex-col"
          >
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">题目内容</span>
                {isSubmitted && (
                  <motion.span 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                      isLastCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {isLastCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {isLastCorrect ? "正确" : "错误"}
                  </motion.span>
                )}
              </div>
              <p className="text-2xl md:text-3xl font-light leading-relaxed text-gray-800 mb-12">
                {currentQuestion.sentence.split("______").map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={cn(
                        "inline-block min-w-[120px] border-b-2 mx-2 text-center transition-all duration-300",
                        !selectedOptionId && "border-gray-300 text-transparent",
                        selectedOptionId && !isSubmitted && "border-emerald-500 text-emerald-600 font-medium",
                        isSubmitted && selectedOptionId === currentQuestion.correctOptionId && "border-emerald-500 text-emerald-600 font-bold",
                        isSubmitted && selectedOptionId !== currentQuestion.correctOptionId && "border-red-500 text-red-600 font-bold"
                      )}>
                        {selectedOptionId ? currentQuestion.options.find(o => o.id === selectedOptionId)?.text : "______"}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    disabled={isSubmitted}
                    onClick={() => handleOptionClick(option.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden",
                      // Base state: White background
                      "bg-white border-gray-100",
                      // Selected state (before submission)
                      selectedOptionId === option.id && !isSubmitted && "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10",
                      // Hover state (only if not submitted)
                      !isSubmitted && selectedOptionId !== option.id && "hover:border-emerald-200 hover:bg-gray-50",
                      // Correct answer state (after submission)
                      isSubmitted && option.id === currentQuestion.correctOptionId && "bg-emerald-50 border-emerald-500",
                      // Incorrect selection state (after submission)
                      isSubmitted && selectedOptionId === option.id && option.id !== currentQuestion.correctOptionId && "bg-red-50 border-red-500",
                      // Disabled state
                      isSubmitted && "cursor-default"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-lg font-bold tracking-wide",
                        // Text colors
                        !isSubmitted && selectedOptionId === option.id && "text-emerald-700",
                        !isSubmitted && selectedOptionId !== option.id && "text-gray-600",
                        isSubmitted && option.id === currentQuestion.correctOptionId && "text-emerald-700",
                        isSubmitted && selectedOptionId === option.id && option.id !== currentQuestion.correctOptionId && "text-red-700",
                        isSubmitted && option.id !== currentQuestion.correctOptionId && selectedOptionId !== option.id && "text-gray-400"
                      )}>
                        {option.text}
                      </span>
                      {isSubmitted && option.id === currentQuestion.correctOptionId && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      {isSubmitted && selectedOptionId === option.id && option.id !== currentQuestion.correctOptionId && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOptionId}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all",
                    selectedOptionId 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  提交答案
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  {currentIndex === total - 1 ? "查看结果" : "下一题"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Feedback Banner */}
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "rounded-3xl p-6 flex items-center gap-4 shadow-sm border",
                    answers[answers.length - 1]?.isCorrect 
                      ? "bg-emerald-500 border-emerald-400 text-white" 
                      : "bg-red-500 border-red-400 text-white"
                  )}
                >
                  <div className="bg-white/20 p-3 rounded-2xl">
                    {answers[answers.length - 1]?.isCorrect ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <XCircle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {answers[answers.length - 1]?.isCorrect ? "太棒了，回答正确！" : "哎呀，选错了哦"}
                    </h3>
                    <p className="text-white/80 text-sm font-medium">
                      {answers[answers.length - 1]?.isCorrect 
                        ? "你对这个语法点的掌握非常扎实。" 
                        : `正确答案应该是：${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.text}`}
                    </p>
                  </div>
                </motion.div>

                {/* Explanation Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Info className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold">详解卡片</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">语法规则</h4>
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation.rule}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">例句</h4>
                        <p className="text-emerald-900 font-medium italic">"{currentQuestion.explanation.example}"</p>
                      </div>
                      <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                        <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">常见错误</h4>
                        <p className="text-red-900 text-sm">{currentQuestion.explanation.commonMistake}</p>
                      </div>
                    </div>

                    {currentQuestion.explanation.reviewLink && (
                      <div className="pt-4 border-t border-gray-100">
                        <a 
                          href={currentQuestion.explanation.reviewLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          推荐复习链接
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

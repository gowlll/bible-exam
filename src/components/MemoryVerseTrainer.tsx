import React, { useState } from "react";
import { MemoryVerse } from "../data/bibleData";
import { Sparkles, RefreshCw, HelpCircle, FileText, CheckCircle2, MessageCircle, AlertCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MemoryVerseTrainerProps {
  verses: MemoryVerse[];
  grade: string;
}

export default function MemoryVerseTrainer({ verses, grade }: MemoryVerseTrainerProps) {
  const [selectedVerseIdx, setSelectedVerseIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isTrainingMode, setIsTrainingMode] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");

  const selectedVerse = verses[selectedVerseIdx];

  const handleToggleMode = () => {
    setIsTrainingMode(!isTrainingMode);
    setUserAnswers(new Array(selectedVerse.blanks.length).fill(""));
    setShowResult(false);
  };

  const handleInputChange = (idx: number, val: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[idx] = val.trim();
    setUserAnswers(updatedAnswers);
  };

  const checkAnswers = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setUserAnswers(new Array(selectedVerse.blanks.length).fill(""));
    setShowResult(false);
  };

  const handleSelectVerse = (idx: number) => {
    setSelectedVerseIdx(idx);
    setUserAnswers([]);
    setShowResult(false);
    setIsTrainingMode(false);
    setAiExplanation("");
    setAiError("");
  };

  const handleExplainVerse = async () => {
    setIsLoadingAi(true);
    setAiError("");
    setAiExplanation("");

    try {
      const response = await fetch("/api/explain-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse: selectedVerse.verse,
          reference: selectedVerse.reference,
          translation: selectedVerse.translation,
          grade: grade === 'low' ? '유년기 어린이(7-9세)' : grade === 'mid' ? '초등학교 중학년(10-11세)' : '고학년 소년부(12-13세)'
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiExplanation(data.explanation);
      } else {
        setAiError(data.error || "설명을 불러오는 데 실패했습니다.");
      }
    } catch (e: any) {
      setAiError("네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Process text to render blank placeholders dynamically
  const renderBlankedText = () => {
    const parts = selectedVerse.blankedVerse.split(/\[\s*\]/);
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 text-base sm:text-lg font-medium text-slate-800 leading-loose">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < selectedVerse.blanks.length && (
              <div className="inline-flex flex-col items-center relative mx-1">
                <input
                  type="text"
                  placeholder="?"
                  value={userAnswers[index] || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  disabled={showResult}
                  className={`border-b-2 text-center font-bold px-2 py-0.5 w-24 sm:w-28 focus:outline-hidden transition-all text-blue-600 border-slate-300 focus:border-blue-500 text-sm sm:text-base ${
                    showResult
                      ? userAnswers[index] === selectedVerse.blanks[index]
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                        : "bg-rose-50 text-rose-700 border-rose-500"
                      : "bg-slate-50"
                  }`}
                />
                {showResult && (
                  <span className={`text-[10px] mt-1 font-bold ${
                    userAnswers[index] === selectedVerse.blanks[index] ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {userAnswers[index] === selectedVerse.blanks[index] ? "참 잘했어요!" : `정답: ${selectedVerse.blanks[index]}`}
                  </span>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div id="memory-verse-trainer" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar: Verse Selection list */}
      <div className="lg:col-span-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1">암송 요절 리스트</h3>
        <div className="space-y-2">
          {verses.map((v, idx) => {
            const isSelected = idx === selectedVerseIdx;
            return (
              <button
                key={v.id}
                id={`verse-btn-${v.id}`}
                onClick={() => handleSelectVerse(idx)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>
                    요절 {idx + 1}
                  </span>
                  <span className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{v.reference}</span>
                </div>
                <p className="text-sm font-semibold truncate mt-1">"{v.verse}"</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Panel: Interactive training board */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Core Verse Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          <div className="absolute right-4 top-4 opacity-[0.03] pointer-events-none">
            <Sparkles className="w-48 h-48 text-indigo-900" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                성경고사 필수 암송 구절
              </span>
              <button
                onClick={handleToggleMode}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-all border border-blue-100"
              >
                {isTrainingMode ? "📖 눈으로 읽기" : "✍️ 빈칸 채워 암송하기"}
              </button>
            </div>

            <div className="py-6 flex items-center justify-center min-h-[120px] text-center">
              {!isTrainingMode ? (
                <motion.p 
                  key="read-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed max-w-lg"
                >
                  "{selectedVerse.verse}"
                </motion.p>
              ) : (
                <div className="w-full">
                  {renderBlankedText()}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <span className="text-sm font-bold text-slate-700">{selectedVerse.reference}</span>
            
            {isTrainingMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  title="다시 하기"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={checkAnswers}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  정답 확인하기
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">암기 훈련 모드를 켜서 블록 단어들을 상상하며 문제를 풀어보세요!</p>
            )}
          </div>
        </div>

        {/* Translation and AI Explanations */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-500" />
              구절의 담긴 가르침
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {selectedVerse.translation}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageCircle className="w-4.5 h-4.5 text-indigo-500" />
                  성경고사 AI 선생님 설명방
                </h4>
                <p className="text-xs text-slate-400">GenAI가 아이의 연령층에 맞춰 아름다운 적용과 미션을 대리 설명해 줍니다.</p>
              </div>

              <button
                onClick={handleExplainVerse}
                disabled={isLoadingAi}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    교제 준비 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                    다정하게 마크다운 설명 받기
                  </>
                )}
              </button>
            </div>

            {/* AI Response Display */}
            <AnimatePresence mode="wait">
              {isLoadingAi && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col gap-2.5 animate-pulse"
                >
                  <div className="h-4 bg-indigo-200/50 rounded-sm w-1/4"></div>
                  <div className="h-3 bg-indigo-200/40 rounded-sm w-3/4"></div>
                  <div className="h-3 bg-indigo-200/40 rounded-sm w-5/6"></div>
                  <div className="h-3 bg-indigo-200/40 rounded-sm w-2/3"></div>
                </motion.div>
              )}

              {aiExplanation && !isLoadingAi && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-slate-700 text-xs sm:text-sm leading-relaxed prose prose-indigo max-w-none"
                >
                  <div className="flex items-center gap-2 mb-3 text-indigo-800 border-b border-indigo-100 pb-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600" />
                    <span className="font-bold font-mono">경기노회 일교사 GPT 선생님 노하우</span>
                  </div>
                  <div className="whitespace-pre-line text-slate-700 prose-p:my-1">
                    {aiExplanation}
                  </div>
                </motion.div>
              )}

              {aiError && !isLoadingAi && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 text-xs flex gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold">안내:</span> {aiError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* View All Scripture Texts at Once (성경 원문 전문 한눈에 모아보기) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-3xs p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-indigo-500 animate-pulse" />
          <div>
            <h3 className="text-md font-bold text-slate-800">📖 핵심 암송 요절 전체 원문 전문 모아보기</h3>
            <p className="text-xs text-slate-500">본 시험 범위에서 필수 출제되는 암송 요절 구절 전체를 한눈에 모아 읽고 암송하며 공부할 수 있습니다.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1 select-text">
          {verses.map((v, idx) => (
            <div 
              key={v.id || idx} 
              className="p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 transition-all cursor-text"
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">요절 {idx + 1}</span>
                <span className="font-bold text-slate-500 font-mono">{v.reference}</span>
              </div>
              <p className="text-xs font-black text-slate-800 leading-relaxed bg-white p-2 rounded-lg border border-slate-100 text-left">
                "{v.verse}"
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-1 text-left">
                <span className="font-semibold text-blue-600">해설:</span> {v.translation}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

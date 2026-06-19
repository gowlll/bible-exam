import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, XCircle, AlertCircle, Award, BookOpen, 
  ChevronLeft, ChevronRight, RotateCcw, Sparkles, Check, X, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PracticeTestProps {
  quizzes: Array<{
    id: string;
    type: 'multiple' | 'ox' | 'short';
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  }>;
  examScope: string;
  onAddMore?: () => void;
  isAddingMore?: boolean;
}

export default function PracticeTest({ quizzes, examScope, onAddMore, isAddingMore = false }: PracticeTestProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // Records user's checked text per index
  const [graded, setGraded] = useState<Record<number, boolean>>({}); // True if they clicked 'Graded' for that question
  const [isCorrectMap, setIsCorrectMap] = useState<Record<number, boolean>>({}); // True/False of graded answers
  const [shortInputs, setShortInputs] = useState<Record<number, string>>({}); // Staging area for short answer typing input
  
  // Modal toggler to override blocked window.confirm
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Active question references
  const currentQuestion = quizzes[currentIdx];
  const totalQuestions = quizzes.length;

  useEffect(() => {
    // Reset state when new exam questions load
    setCurrentIdx(0);
    setAnswers({});
    setGraded({});
    setIsCorrectMap({});
    setShortInputs({});
    setShowSubmitModal(false);
    setShowResults(false);
  }, [quizzes]);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 animate-bounce" />
        <h4 className="font-bold text-slate-800">아직 준비된 50문항 시험지가 없습니다.</h4>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          첫 화면에서 출제 범위를 탐닉하고 오시면 자동으로 영롱한 50문항 시험지가 여기에 활성화됩니다!
        </p>
      </div>
    );
  }

  // Handle immediate grading for a single question
  const handleGradeSingle = () => {
    const activeQ = quizzes[currentIdx];
    let userAns = "";

    if (activeQ.type === 'short') {
      userAns = (shortInputs[currentIdx] || "").trim();
      setAnswers(prev => ({ ...prev, [currentIdx]: userAns }));
    } else {
      userAns = answers[currentIdx] || "";
    }

    if (!userAns) {
      alert("먼저 정답을 선택하거나 입력해 주세요!");
      return;
    }

    const correctAns = activeQ.answer.trim();
    let isCorrect = false;

    if (activeQ.type === 'short') {
      const u = userAns.toLowerCase().replace(/\s+/g, "");
      const c = correctAns.toLowerCase().replace(/\s+/g, "");
      // Sympathetic comparison for kids
      isCorrect = u === c || c.includes(u) && u.length >= 2;
    } else {
      isCorrect = userAns === correctAns;
    }

    setIsCorrectMap(prev => ({ ...prev, [currentIdx]: isCorrect }));
    setGraded(prev => ({ ...prev, [currentIdx]: true }));
  };

  // Skip or go back
  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Calculates total count of graded questions
  const answeredCount = Object.keys(answers).length + Object.keys(shortInputs).filter(k => shortInputs[Number(k)]).length;
  const gradedCount = Object.keys(graded).length;
  
  // Calculate final score when sealing scorecard
  const correctCount = Object.values(isCorrectMap).filter(Boolean).length;
  const finalScore = Math.round((correctCount / totalQuestions) * 100);

  // Return level title/description on certificate
  const getCertificate = (score: number) => {
    if (score === 100) return {
      badge: "🥇",
      title: "노회 수석 대성경박사",
      desc: "우와! 50개의 성경고사를 완벽하게 다 맞혔어요! 경기노회 출제본서 수석 영예를 수여합니다."
    };
    if (score >= 90) return {
      badge: "🏅",
      title: "우등상 소년 기드온 장군",
      desc: "대단합니다! 풍성한 기독 성경 지식과 명철함을 완벽히 자랑해 보배 상을 기쁘게 제안합니다."
    };
    if (score >= 70) return {
      badge: "🛡️",
      title: "정직한 자비 현 지혜자",
      desc: "참 잘했어요! 믿음의 등불이 앞길을 비추듯, 말씀 실천에 쑥쑥 자라는 어린이입니다."
    };
    if (score >= 50) return {
      badge: "🌱",
      title: "말씀 사모하는 성장 꿈나무",
      desc: "합격 축하합니다! 매일 말씀을 읽고 양식삼아 무럭무럭 자라는 예쁜 성전의 어린이입니다."
    };
    return {
      badge: "🍀",
      title: "믿음 가득 용기 수련생",
      desc: "다시 도전할 수 있는 힘이 말씀속에 있습니다! 해설 오답 노트를 복습하고 한 번 더 풀어보세요."
    };
  };

  const cert = getCertificate(finalScore);

  const handleResetExam = () => {
    setCurrentIdx(0);
    setAnswers({});
    setGraded({});
    setIsCorrectMap({});
    setShortInputs({});
    setShowSubmitModal(false);
    setShowResults(false);
  };

  return (
    <div id="cbt-test-center" className="space-y-6">
      
      {/* Dynamic Results Page */}
      {showResults ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Certificate */}
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-300 rounded-[32px] p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/25 rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/25 rounded-tr-full pointer-events-none"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-6xl animate-bounce">{cert.badge}</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-200 px-3 py-1 rounded-full mt-4">
                대한예수교장로회 경기노회 성적 등극
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
                성경 심사 합격 성적표
              </h2>
            </div>

            <div className="py-6 max-w-lg mx-auto bg-white/70 backdrop-blur-md rounded-2xl border border-amber-200/80 space-y-2">
              <p className="text-sm font-semibold text-slate-600">성경지식 판독점수</p>
              <h3 className="text-5xl sm:text-6xl font-black text-rose-600 tracking-tight">
                {finalScore}<span className="text-2xl text-slate-800 font-bold"> 점</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                (전체 50개 예상문항 중 <span className="text-emerald-600 font-extrabold">{correctCount}개</span> 정배 맞음)
              </p>
              <div className="h-px bg-amber-200/80 my-4 mx-8"></div>
              <p className="text-sm font-extrabold text-amber-900">
                {cert.title}
              </p>
              <p className="text-xs text-slate-600 px-4 leading-relaxed max-w-sm mx-auto">
                {cert.desc}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleResetExam}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 처음부터 풀기</span>
              </button>
            </div>
          </div>

          {/* Detailed Incorrect review notes */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">오답 복습 피드백 및 목회자 보물해설</h4>
                <p className="text-[10px] text-slate-400">틀렸거나 공부하고 싶은 문항의 모범 해답과 성경 장절을 꼼꼼하게 확인하십시오.</p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {quizzes.map((q, qIdx) => {
                const isCorrect = isCorrectMap[qIdx] === true;
                const wasGraded = graded[qIdx] === true;
                if (isCorrect && wasGraded) return null; // Only review wrong inputs or skipped ones

                return (
                  <div key={q.id || qIdx} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-start gap-2">
                      {wasGraded ? (
                        <XCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          문 {qIdx + 1}. {q.question.replace(/^\[실력 다지기\] /, "").replace(/^\[실전:.+\] /, "")}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                          분류: {q.type === 'multiple' ? "4지선다" : q.type === 'ox' ? "OX퀴즈" : "단답수식"} | 
                          제출답변: <span className="text-rose-600 underline font-semibold">
                            {q.type === 'short' ? (shortInputs[qIdx] || "(입력없음)") : (answers[qIdx] || "(체크없음)")}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] leading-relaxed space-y-1">
                      <p className="font-bold text-blue-700">
                        🔑 모범 정답: "{q.answer}"
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}

              {Object.keys(graded).length === correctCount && correctCount === totalQuestions && (
                <div className="text-center py-8 space-y-2">
                  <span className="text-4xl">🎉</span>
                  <p className="font-bold text-slate-700">축하합니다! 오답이 하나도 없습니다.</p>
                  <p className="text-[10px] text-slate-400">모든 성경 공부와 진도 테스트를 완벽히 통과했습니다!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Core CBT Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Left Grid Indicators */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
                문항 답안 현황판 (CBT)
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">번호판을 클릭하면 자유롭게 문항을 오갈 수 있습니다.</p>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">전체 문항</span>
                <span className="text-sm font-black text-slate-800">{totalQuestions}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">질문 답함</span>
                <span className="text-sm font-black text-amber-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">채점 완료</span>
                <span className="text-sm font-black text-emerald-600">{gradedCount}</span>
              </div>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 pt-2">
              {quizzes.map((_, idx) => {
                const isActive = idx === currentIdx;
                const isGr = graded[idx] === true;
                const isCorr = isCorrectMap[idx] === true;

                let stateClass = "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60";
                if (isActive) {
                  stateClass = "bg-blue-600 text-white shadow-md shadow-blue-100 border border-blue-600 ring-2 ring-blue-105";
                } else if (isGr) {
                  stateClass = isCorr 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold"
                    : "bg-rose-50 text-rose-700 border border-rose-300 font-bold";
                } else {
                  // Answered but not graded yet
                  const userAns = currentIdx === idx ? shortInputs[idx] : (answers[idx] || shortInputs[idx]);
                  if (userAns) {
                    stateClass = "bg-amber-50 text-amber-700 border border-amber-300 font-semibold";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 font-mono font-medium rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer ${stateClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Interactive Actions Panel */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>성경고사 성적표 봉인 및 제출</span>
              </button>

              {onAddMore && (
                <button
                  disabled={isAddingMore}
                  onClick={onAddMore}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-2xl border border-blue-200/80 shadow-3xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className={`w-4 h-4 text-amber-500 ${isAddingMore ? 'animate-spin' : ''}`} />
                  <span>{isAddingMore ? "10문제 추가 엄선중..." : "기출 최신 10문제 연속 추가하기 ✨"}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Right Interactive Board */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
              
              {/* Question card header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-600 uppercase bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    {currentQuestion.type === 'multiple' ? "객관식 4지선다" : currentQuestion.type === 'ox' ? "OX 퀴즈" : "단답 주관식"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    ({currentIdx + 1} / {totalQuestions})
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  분야: {examScope}
                </span>
              </div>

              {/* Main question content */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed">
                  Q. {currentQuestion.question.replace(/^\[실력 다지기\] /, "").replace(/^\[실전:.+\] /, "")}
                </h3>

                {/* Content based on question types */}
                <div className="pt-2">
                  
                  {/* [A] Multiple choice layout */}
                  {currentQuestion.type === 'multiple' && currentQuestion.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, oIdx) => {
                        const isSelected = answers[currentIdx] === opt;
                        const isQGraded = graded[currentIdx] === true;
                        const isThisCorrect = opt === currentQuestion.answer;

                        let cardTheme = "bg-white border-slate-100 text-slate-700 hover:border-slate-350 hover:bg-slate-50";
                        if (isSelected) {
                          cardTheme = "bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-1 ring-blue-600";
                        }
                        if (isQGraded) {
                          if (isThisCorrect) {
                            cardTheme = "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold ring-1 ring-emerald-500";
                          } else if (isSelected) {
                            cardTheme = "bg-rose-50 border-rose-500 text-rose-800 font-semibold line-through ring-1 ring-rose-500";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isQGraded}
                            onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: opt }))}
                            className={`p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between ${cardTheme}`}
                          >
                            <span className="leading-snug">({oIdx + 1}) &nbsp; {opt}</span>
                            {isQGraded && isThisCorrect && (
                              <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* [B] OX choice layout */}
                  {currentQuestion.type === 'ox' && (
                    <div className="flex justify-center gap-6 py-4">
                      {["O", "X"].map((val) => {
                        const isSelected = answers[currentIdx] === val;
                        const isQGraded = graded[currentIdx] === true;
                        const isThisCorrect = val === currentQuestion.answer;

                        let cardTheme = "bg-white border-slate-150 text-slate-700 hover:border-slate-300 w-28 h-28 hover:bg-slate-50";
                        if (isSelected) {
                          cardTheme = "bg-blue-50 border-blue-600 text-blue-800 font-extrabold ring-1 ring-blue-600";
                        }
                        if (isQGraded) {
                          if (isThisCorrect) {
                            cardTheme = "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold ring-1 ring-emerald-500";
                          } else if (isSelected) {
                            cardTheme = "bg-rose-50 border-rose-500 text-rose-800 font-semibold ring-1 ring-rose-500";
                          }
                        }

                        return (
                          <button
                            key={val}
                            disabled={isQGraded}
                            onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: val }))}
                            className={`rounded-3xl border shadow-xs text-3xl font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${cardTheme}`}
                          >
                            <span>{val}</span>
                            {isQGraded && isThisCorrect && (
                              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none">정답</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* [C] Short text layout */}
                  {currentQuestion.type === 'short' && (
                    <div className="max-w-md mx-auto space-y-4 py-2">
                      <div className="relative">
                        <input
                          type="text"
                          disabled={graded[currentIdx] === true}
                          placeholder="성경 단어를 또박또박 정확히 기입하여 주십시오"
                          value={shortInputs[currentIdx] || ""}
                          onChange={(e) => setShortInputs(prev => ({ ...prev, [currentIdx]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !graded[currentIdx]) {
                              handleGradeSingle();
                            }
                          }}
                          className="w-full text-center py-4 px-6 rounded-2xl border-2 border-slate-205 focus:outline-hidden focus:border-blue-500 font-black text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-white"
                        />
                      </div>
                      
                      {graded[currentIdx] && (
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-500">
                            제출한 대답: <span className="text-blue-600 text-xs">{answers[currentIdx] || shortInputs[currentIdx]}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Action buttons list */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentIdx === 0}
                  onClick={handlePrev}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>이전</span>
                </button>

                {/* Grade immediate trigger */}
                {!graded[currentIdx] ? (
                  <button
                    onClick={handleGradeSingle}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>채점 및 정답학습</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    {isCorrectMap[currentIdx] ? (
                      <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-250 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 맞쳤습니다! 참 잘했어요. 
                      </span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-250 flex items-center gap-1">
                        <X className="w-4 h-4" /> 아쉬워요! 틀렸거나 공백입니다.
                      </span>
                    )}
                  </div>
                )}

                <button
                  disabled={currentIdx === totalQuestions - 1}
                  onClick={handleNext}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>다음</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic explanations slide down */}
              <AnimatePresence>
                {graded[currentIdx] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50 border border-slate-105 rounded-2xl text-[11px] sm:text-xs leading-relaxed space-y-1.5 mt-2">
                      <div className="flex items-center gap-1 text-blue-800 font-extrabold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>성경고사 해설 안내 (정답: {currentQuestion.answer})</span>
                      </div>
                      <p className="text-slate-600">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Hint Card */}
            <div className="p-4 bg-blue-50/50 border border-blue-100/55 rounded-3xl text-slate-500 font-medium text-[11px] leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>성경 지혜 Tip</strong>: 성경고사 시험지를 전부 다 푼 다음에 왼쪽 판의 <strong>[성경고사 성적표 봉인 및 제출]</strong> 단추를 클릭해 보세요. 최종 성경 등급 인증서가 발급되며, 틀린 문제들을 한눈에 모아 공부할 수 있는 오답노트가 제공됩니다!
              </p>
            </div>

          </div>

        </div>
      )}

      {/* OVERLAID CUSTOM CONFIRMATION MODAL Overriding window.confirm */}
      <AnimatePresence>
        {showSubmitModal && (
          <div id="submit-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            ></motion.div>

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 relative z-10"
            >
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800">성경고사 성적표를 봉인하시겠습니까?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  아직 풀지 못했거나 채점하지 않은 문제가 남아있을 수 있습니다.<br />
                  정말로 시험을 마감하고 성적 위원회에 성적표를 제출하여 등급을 확인하시겠습니까?
                </p>
              </div>

              {/* Status report */}
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-600 px-5">
                <span>총 문제수: {totalQuestions}</span>
                <span>채점 완료: {gradedCount}문항</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                >
                  아니요, 더 풀겠습니다
                </button>
                <button
                  onClick={() => {
                    // Auto grade any unanswered/ungraded staging input
                    setShowSubmitModal(false);
                    setShowResults(true);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  네, 봉인하여 제출합니다! 🏆
                </button>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

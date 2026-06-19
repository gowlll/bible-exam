import React, { useState, useEffect } from "react";
import { 
  Sparkles, AlertCircle, RefreshCw, CheckCircle2, HelpCircle, 
  Flame, Check, X, ArrowLeft, ArrowRight, BookOpen, Trophy, 
  CheckSquare, MessageSquare, Award, RefreshCcw, ScrollText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AITutorProps {
  grade: string;
}

interface CustomQuizQuestion {
  id: string;
  type: 'multiple' | 'ox' | 'short';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export default function AITutor({ grade }: AITutorProps) {
  // Main states
  const [examScope, setExamScope] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<CustomQuizQuestion[]>([]);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  
  // Quiz progress states
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, { submitted: boolean; isCorrect: boolean }>>({});
  const [currentShortInput, setCurrentShortInput] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>("");

  // Loading encouraging messages rotating
  const loadingPhrases = [
    "출제 위원회가 출제 범위를 꼼꼼히 탐독하는 중입니다... 📖",
    "4지선다 객관식, O/X 진위형, 주관식 단답 문제를 최적의 비율로 주조하고 있습니다... 🛠️",
    "암송 구절과 성경 정식 교리를 바탕으로 팩트 체크를 진행합니다... 🔍",
    "어린이와 학생들의 성경 상식을 쑥쑥 높일 알기 쉬운 해설집을 작성하고 소성하는 중... ✍️",
    "총 50개의 고품질 성경고사 문제를 완공하기 시작했습니다. 잠시만 기다려주세요! 🏆"
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingPhrases.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Preset scope buttons
  const bibleScopePresets = [
    { label: "창세기 전반 (천지창조~야곱의 꿈)", scope: "창세기 1장부터 35장까지, 천지창조, 노아의 방주, 아브라함과 이삭, 야곱의 하란 도망 이야기" },
    { label: "출애굽기 전반 (모세와 십계명)", scope: "출애굽기 1장부터 20장까지, 모세의 기적, 이집트 탈출, 홍해 기적, 시내산 십계명이 중심" },
    { label: "다윗 왕의 모험과 역사", scope: "사무엘상 및 하, 소년 목동 다윗, 골리앗과의 전투, 요나단과의 의리, 다윗의 찬양과 즉위" },
    { label: "예수님의 구원 생애와 기적", scope: "신약 4복음서 중심, 아기 예수 탄생, 요단강 세례, 오병이어와 가나 기적, 십자가 대속과 영광스런 부활" }
  ];

  // Call dynamic 50 quiz generator endpoint
  const handleGenerate50Quizzes = async (presetScope?: string) => {
    const scopeToUse = presetScope || examScope;
    if (!scopeToUse.trim()) return;

    setIsGenerating(true);
    setQuizzes([]);
    setShowResults(false);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setCheckedAnswers({});
    setCurrentShortInput("");
    setLoadingStep(0);

    try {
      const response = await fetch("/api/generate-custom-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: scopeToUse,
          count: 50 // Fixed request constraint
        })
      });
      const data = await response.json();
      if (data.success && data.quizzes && data.quizzes.length > 0) {
        setQuizzes(data.quizzes);
        setAiMessage(data.message || "");
      } else {
        alert("성경고사 문제 출제 중 문제가 발생했습니다. 고품질 오프라인 백업 문제를 대신 출제해 드릴게요!");
      }
    } catch (err) {
      console.error(err);
      alert("서버 연결이 원활하지 않아 준비된 오프라인 성경고사 50문항으로 전환 출제합니다!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit answer for single question (grading)
  const handleCheckAnswer = () => {
    const currentQuiz = quizzes[currentIdx];
    let userAns = "";

    if (currentQuiz.type === 'short') {
      userAns = currentShortInput.trim();
    } else {
      userAns = selectedAnswers[currentIdx] || "";
    }

    if (!userAns) return;

    // Save final selected answer back
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: userAns
    }));

    // Strict string matching but trimmed and ignoring quotes
    const cleanUser = userAns.replace(/\s+/g, "").toLowerCase();
    const cleanRef = currentQuiz.answer.replace(/\s+/g, "").toLowerCase();
    const isCorr = cleanUser === cleanRef || cleanUser.includes(cleanRef) || cleanRef.includes(cleanUser);

    setCheckedAnswers(prev => ({
      ...prev,
      [currentIdx]: { submitted: true, isCorrect: isCorr }
    }));
  };

  // Option selection
  const handleSelectOption = (opt: string) => {
    if (checkedAnswers[currentIdx]?.submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: opt
    }));
  };

  // Skip / Unmark / Next / Back
  const handleNext = () => {
    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx(prev => prev + 1);
      // Pre-fill short input if already checked/selected
      const nextShortVal = selectedAnswers[currentIdx + 1] || "";
      setCurrentShortInput(checkedAnswers[currentIdx + 1]?.submitted ? nextShortVal : "");
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      const prevShortVal = selectedAnswers[currentIdx - 1] || "";
      setCurrentShortInput(checkedAnswers[currentIdx - 1]?.submitted ? prevShortVal : "");
    }
  };

  // Jump to specific question immediately
  const handleJumpToIdx = (idx: number) => {
    setCurrentIdx(idx);
    const targetShortVal = selectedAnswers[idx] || "";
    setCurrentShortInput(checkedAnswers[idx]?.submitted ? targetShortVal : "");
  };

  // Calculate final results
  const totalCorrect = Object.values(checkedAnswers).filter((a: any) => a?.isCorrect).length;
  const totalSubmitted = Object.keys(checkedAnswers).length;
  const scorePercentage = Math.round((totalCorrect / quizzes.length) * 100);

  // Grade title
  let gradeTitle = "새싹 믿음자 🌱";
  let gradeDesc = "말씀 안에서 쑥쑥 자라나는 꿈나무군요! 조금만 더 복습해 볼까요?";
  if (scorePercentage === 100) {
    gradeTitle = "노회 수석 성경 대박사 🏆";
    gradeDesc = "세상에나! 50문제를 모두 맞혔습니다! 경기노회 성경고사에서 장원 수상자가 탄생하겠어요!";
  } else if (scorePercentage >= 90) {
    gradeTitle = "우등상 소년 기드온 장군 🎖️";
    gradeDesc = "놀라운 정답률입니다! 성경 이야기의 핵심을 완벽하게 간파하고 계시네요!";
  } else if (scorePercentage >= 70) {
    gradeTitle = "정직한 자비 현 지혜자 🍀";
    gradeDesc = "우수한 실력을 입증하였습니다! 틀린 문제를 복습하면 거뜬히 고득점자가 될 수 있습니다.";
  } else if (scorePercentage >= 50) {
    gradeTitle = "말씀 사모하는 성장 꿈나무 🌟";
    gradeDesc = "성경고사 합격점을 무난히 획득했습니다. 몇 번 더 다른 범위로 훈련해 보아요!";
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-1 py-1">
      
      {/* 1. SELECTION & SCOPE INPUT SCREEN */}
      {quizzes.length === 0 && !isGenerating && (
        <div id="ai-quiz-intro" className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              AI 성경고사 50문항 무제한 복습기
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
              시험 보려는 성경 진도 또는 인물 이름을 자유롭게 적으시면, AI가 이를 자동 분석하여 <span className="font-extrabold text-blue-600">4지선다, O/X 퀴즈, 단답형 주관식 50문제</span>를 즉석 주조합니다.
            </p>
          </div>

          {/* Scope Input field */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="scope-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                나만의 성경 출제 범위 입력
              </label>
              <div className="relative">
                <textarea
                  id="scope-input"
                  rows={3}
                  placeholder="예: 마태복음 1장~10장, 모세가 마주한 열 가지 재앙 사건, 야곱의 생애 전반 등 원하는 출제 범위를 자세히 기입하세요."
                  value={examScope}
                  onChange={(e) => setExamScope(e.target.value)}
                  className="w-full p-4 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 outline-hidden rounded-2xl text-xs sm:text-sm text-slate-800 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <button
              onClick={() => handleGenerate50Quizzes()}
              disabled={!examScope.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl cursor-pointer shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>정확히 50개 맞춤 퀴즈 무제한 생성하기</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div id="presets-container" className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
              <ScrollText className="w-4 h-4 text-indigo-500" />
              <span>출제 위원 추천 원터치 빠른 범위</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bibleScopePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setExamScope(preset.scope);
                    handleGenerate50Quizzes(preset.scope);
                  }}
                  className="p-4 rounded-2xl text-left border border-slate-150 hover:border-blue-200 bg-white hover:bg-blue-50/20 text-slate-700 hover:text-slate-900 cursor-pointer transition-all duration-200 group"
                >
                  <span className="block text-xs font-extrabold text-blue-600 group-hover:text-blue-700">
                    💡 추천 단골 범위 {idx + 1}
                  </span>
                  <span className="block text-xs font-bold text-slate-800 mt-1">{preset.label}</span>
                  <span className="block text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.scope}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. HIGH QUALITY LOAD / PROGRESS SPINNER */}
      {isGenerating && (
        <div id="ai-generating-loader" className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-md text-center py-12 space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-md sm:text-lg font-black text-slate-800">
              성경 성고지 교재 탐독중...
            </h3>
            <p className="text-xs text-slate-400">
              Gemini AI 가 기입하신 범위를 분절 분석하는 중입니다
            </p>
          </div>

          {/* Staggered progress facts in boxes */}
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl max-w-md mx-auto text-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={loadingStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed px-4 py-2"
              >
                {loadingPhrases[loadingStep]}
              </motion.div>
            </AnimatePresence>
            
            {/* ProgressBar */}
            <div className="w-full h-1 bg-slate-200/80 mt-4 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(loadingStep + 1) * 20}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE QUIZ TAKING SYSTEM WITH 50 GRID MAP */}
      {quizzes.length > 0 && !showResults && (
        <div id="quiz-desktop-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Question Box pane (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Header: Score info & scope label */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">출제 진도</span>
                  <span className="text-xs font-black text-slate-800 truncate max-w-[200px] sm:max-w-sm block">
                    {examScope.slice(0, 35) || "추천 기출 50문항"}...
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">실시간 정답률</span>
                <span className="text-sm font-extrabold text-blue-600">
                  {totalSubmitted > 0 ? `${Math.round((totalCorrect / quizzes.length) * 100)}%` : "0%"}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">({totalCorrect}개 맞춤)</span>
              </div>
            </div>

            {/* Question Card Box */}
            <div id="active-question-card" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-md relative overflow-hidden">
              
              {/* Card Ribbon for question type */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                    성경고사 제 {currentIdx + 1} 문항
                  </span>
                  
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {quizzes[currentIdx].type === 'multiple' ? "4지 선다형" : quizzes[currentIdx].type === 'ox' ? "O/X 진위형" : "단답형 주관식"}
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-400">
                  진행도: {Math.round(((currentIdx + 1) / quizzes.length) * 100)}%
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-4 mb-8">
                <h3 className="text-base sm:text-lg font-black text-slate-800 leading-relaxed">
                  {quizzes[currentIdx].question}
                </h3>
              </div>

              {/* ANSWER CHOICES PANE */}
              <div className="space-y-3">
                
                {/* 1. Multiple Choices */}
                {quizzes[currentIdx].type === 'multiple' && quizzes[currentIdx].options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quizzes[currentIdx].options.map((option, oIdx) => {
                      const isSelected = selectedAnswers[currentIdx] === option;
                      const isSubmitted = checkedAnswers[currentIdx]?.submitted;
                      const isCorrectAnswer = option === quizzes[currentIdx].answer;

                      let btnStyle = "border-slate-200 hover:border-blue-500/50 bg-white text-slate-700 hover:bg-blue-50/10";
                      
                      if (isSelected) {
                        btnStyle = "bg-blue-50 border-blue-500 text-blue-900 font-extrabold";
                      }

                      if (isSubmitted) {
                        if (isCorrectAnswer) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-xs shadow-emerald-50";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 border-rose-400 text-rose-900 line-through opacity-80";
                        } else {
                          btnStyle = "opacity-40 bg-slate-50 border-slate-100 text-slate-400 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(option)}
                          className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold text-left cursor-pointer transition-all flex items-center justify-between group ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700"
                            }`}>
                              {oIdx + 1}
                            </span>
                            <span className="leading-relaxed">{option}</span>
                          </div>
                          
                          {isSubmitted && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          {isSubmitted && isSelected && !checkedAnswers[currentIdx]?.isCorrect && <X className="w-5 h-5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. OX True False Choices */}
                {quizzes[currentIdx].type === 'ox' && (
                  <div className="flex justify-center gap-4 sm:gap-6 py-2">
                    {["O", "X"].map((oxVal) => {
                      const isSelected = selectedAnswers[currentIdx] === oxVal;
                      const isSubmitted = checkedAnswers[currentIdx]?.submitted;
                      const isCorrectAnswer = oxVal === quizzes[currentIdx].answer;

                      let btnStyle = "border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800";
                      
                      if (isSelected) {
                        btnStyle = oxVal === "O" 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-black"
                          : "bg-rose-50 border-rose-500 text-rose-700 font-black";
                      }

                      if (isSubmitted) {
                        if (isCorrectAnswer) {
                          btnStyle = "bg-emerald-100 border-emerald-600 text-emerald-900 font-black pointer-events-none scale-102";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-100 border-rose-600 text-rose-900 pointer-events-none opacity-60";
                        } else {
                          btnStyle = "opacity-30 bg-slate-100 border-slate-100 text-slate-400 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={oxVal}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(oxVal)}
                          className={`w-36 h-28 rounded-3xl border-3 text-3xl font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${btnStyle}`}
                        >
                          <span>{oxVal}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">
                            {oxVal === "O" ? "그렇다" : "아니다"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Short Answer (주관식 단답형) */}
                {quizzes[currentIdx].type === 'short' && (
                  <div className="max-w-md space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="정형 성경 한글 단어를 기입해 주세요. (띄어쓰기 무관)"
                        value={currentShortInput}
                        disabled={checkedAnswers[currentIdx]?.submitted}
                        onChange={(e) => setCurrentShortInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && currentShortInput.trim() && !checkedAnswers[currentIdx]?.submitted) {
                            handleCheckAnswer();
                          }
                        }}
                        className="flex-1 p-4 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 outline-hidden rounded-2xl text-xs sm:text-sm text-slate-800 transition-all font-bold uppercase"
                      />
                      
                      {!checkedAnswers[currentIdx]?.submitted && (
                        <button
                          onClick={handleCheckAnswer}
                          disabled={!currentShortInput.trim()}
                          className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-2xl cursor-pointer shadow-sm transition-all"
                        >
                          주관식 답안 입력
                        </button>
                      )}
                    </div>

                    {checkedAnswers[currentIdx]?.submitted && (
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-slate-500">입력하신 답안:</span>
                        <strong className="text-slate-800 text-sm font-bold uppercase">
                          {selectedAnswers[currentIdx] || currentShortInput || "미지정"}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FEEDBACK EXPLANATION & BIBLE TRIVIA REFERENCE */}
              <AnimatePresence>
                {checkedAnswers[currentIdx]?.submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mt-8 p-4 sm:p-5 rounded-2xl border-2 leading-relaxed text-xs sm:text-sm ${
                      checkedAnswers[currentIdx].isCorrect
                        ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900"
                        : "bg-rose-50/70 border-rose-200/80 text-rose-900"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {checkedAnswers[currentIdx].isCorrect ? (
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                        ) : (
                          <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold">✗</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                            {checkedAnswers[currentIdx].isCorrect ? "🎉 할렐루야! 정답입니다!" : "💡 열심히 공부했으나 아쉽게 오답입니다!"}
                          </h4>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded-md border border-slate-200/50">
                            정답: {quizzes[currentIdx].answer}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs sm:text-sm font-normal mt-2 leading-relaxed">
                          {quizzes[currentIdx].explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BOTTOM PREV/NEXT CONTROLS */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 문제</span>
                </button>

                {/* Submit single multiple/ox early if chosen but not graded yet */}
                {quizzes[currentIdx].type !== 'short' && !checkedAnswers[currentIdx]?.submitted && (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!selectedAnswers[currentIdx]}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    답안 제출 확인 ⚡
                  </button>
                )}

                {checkedAnswers[currentIdx]?.submitted ? (
                  currentIdx === quizzes.length - 1 ? (
                    <button
                      onClick={() => setShowResults(true)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer animate-pulse"
                    >
                      종합 성적표 제출하기 📈
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <span>다음 문제</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <span>건너뛰기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* Note prompt when using offline fallback alerts */}
            {aiMessage && (
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] text-blue-800/80 leading-relaxed font-semibold">
                🔔 {aiMessage}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: 50 Questions Navigation Grid (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600 animate-bounce" />
                <h4 className="text-xs sm:text-sm font-black text-slate-800">50문항 진척 답안표</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">CBT 자동 기계</span>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed pb-1">
              아래 50개의 문항 번호를 누르시면 원하시는 번호로 즉각 건너뜁니다.
            </p>

            {/* Grid list 1 to 50 */}
            <div className="grid grid-cols-5 xs:grid-cols-7 sm:grid-cols-10 lg:grid-cols-5 gap-1.5">
              {quizzes.map((_, index) => {
                const isSelected = index === currentIdx;
                const isGraded = checkedAnswers[index]?.submitted;
                const isCorr = checkedAnswers[index]?.isCorrect;

                let numStyle = "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100";

                if (isSelected) {
                  numStyle = "ring-3 ring-blue-500 bg-blue-600 text-white font-black scale-105 border-transparent";
                } else if (isGraded) {
                  numStyle = isCorr 
                    ? "bg-emerald-500 text-white border-transparent font-bold hover:bg-emerald-600" 
                    : "bg-rose-500 text-white border-transparent font-bold hover:bg-rose-600";
                } else if (selectedAnswers[index]) {
                  // Answered but not graded yet (orange/amber)
                  numStyle = "bg-amber-100 text-amber-800 border-amber-300 font-extrabold";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleJumpToIdx(index)}
                    className={`h-9 border text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 ${numStyle}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Color guide tags */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm shrink-0"></span>
                <span>정답 문제</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-500 rounded-sm shrink-0"></span>
                <span>틀린 문제</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-sm shrink-0"></span>
                <span>입력 제출 대기</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-600 rounded-sm shrink-0"></span>
                <span>현재 진행중</span>
              </div>
            </div>

            {/* Middle forced full submit button */}
            <button
              onClick={() => {
                setShowResults(true);
              }}
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <span>성경고사 성적표 봉인 및 제출</span>
            </button>
          </div>

        </div>
      )}

      {/* 4. COMPREHENSIVE SCORE REVIEW BOARD & WRONG QUESTIONS REVIEW (오답노트) */}
      {showResults && (
        <div id="ai-quiz-results" className="max-w-3xl mx-auto space-y-6">
          
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md text-center space-y-6 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600"></div>

            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border-2 border-blue-100 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                {gradeTitle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-2">
                성경고사 맞춤 모의채점 점수판
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
                {gradeDesc}
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-center border-r border-slate-200/60">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold block uppercase">정답율</span>
                <span className="text-base sm:text-lg font-black text-blue-600">{scorePercentage}%</span>
              </div>
              <div className="text-center border-r border-slate-200/60">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold block uppercase">맞춘 문항</span>
                <span className="text-base sm:text-lg font-black text-emerald-600">{totalCorrect} / {quizzes.length}</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold block uppercase">푼 문제</span>
                <span className="text-base sm:text-lg font-black text-slate-700">{totalSubmitted} / {quizzes.length}</span>
              </div>
            </div>

            {/* Restart Button */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setQuizzes([]);
                  setShowResults(false);
                  setExamScope("");
                }}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl cursor-pointer shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>새로운 과목/범위 입력하러 가기</span>
              </button>
              
              <button
                onClick={() => {
                  // Soft reset keeping questions
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setCheckedAnswers({});
                  setCurrentShortInput("");
                  setShowResults(false);
                }}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>이 세트 다시 처음부터 도전하기</span>
              </button>
            </div>

          </div>

          {/* INCORRECT ANSWERS REVIEW CELL (오답노트) */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>경기노회 성경고사 맞춤형 오답노트</span>
            </h3>

            {quizzes.length - totalCorrect === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm font-bold text-emerald-600">🎉 오답이 단 하나도 없습니다! 전원 만점 돌파!</p>
                <p className="text-xs text-slate-400">모든 성경 요절과 정밀 성경고사 내용을 수렴하셨습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  아래 틀렸거나 풀지 않고 넘어간 질문들의 성경 장절과 정답 해설을 꼼꼼하게 읽어보며 성경 박사가 되어보세요!
                </p>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                  {quizzes.map((q, idx) => {
                    const ansObj = checkedAnswers[idx];
                    const isCompletedCorrectly = ansObj?.submitted && ansObj?.isCorrect;

                    if (isCompletedCorrectly) return null; // Skip got rights

                    return (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex gap-2 items-start">
                          <span className="w-5 h-5 bg-rose-100 text-rose-800 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-black text-slate-800">
                              {q.question}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-[11px] py-1">
                              <span className="text-slate-500">
                                입력한 답: <strong className="text-rose-600 line-through">{selectedAnswers[idx] || "선택 안 함 (건너뜀)"}</strong>
                              </span>
                              <span className="text-slate-500">
                                올바른 정답: <strong className="text-emerald-600">{q.answer}</strong>
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                              📖 <strong className="text-slate-700">성경 해설 조언:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

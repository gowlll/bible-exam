import React, { useState, useEffect } from "react";
import { GradeCurriculum } from "./data/bibleData";
import { generate100Questions, getCurriculumForGrade } from "./data/bibleLessonsData";
import PrintSheet from "./components/PrintSheet";
import { 
  Sparkles, ArrowLeft, 
  ChevronRight, BookOpen, Settings, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [scopeChosen, setScopeChosen] = useState<boolean>(false);
  
  // Dynamic state loaded on first launch click
  const [activeCurriculum, setActiveCurriculum] = useState<GradeCurriculum>(getCurriculumForGrade());
  const [active100Questions, setActive100Questions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState<number>(0);

  // Rotate loading phrases
  const loadingPhrases = [
    "예장 경기노회 성경고사 출제 위원회가 소집되는 중입니다...",
    "공과 범위 성경 말씀에서 보화 같은 100문제를 엄선하고 있습니다...",
    "상/중/하 입체 난이도와 성경구절 빈칸 채우기 주관식을 조율하고 있습니다...",
    "단원별 공식 100문항 예상고사 시험지와 정답지 해설서를 정렬하고 있습니다...",
    "교회 주일학교 배포용 인쇄 및 PDF 저장 전용 시험지를 가공하고 있습니다...",
    "조금만 기다려 주세요! 말씀의 지혜가 곧 임합니다. 💖"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % loadingPhrases.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Launch handler using server-side Gemini API or custom offline dataset fallback
  const handleLaunchStudy = async () => {
    setIsGenerating(true);
    setLoadingPhraseIdx(0);

    try {
      const response = await fetch("/api/generate-100-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Request a unified 100-question set
      });
      
      const resData = await response.json();
      if (resData.success && resData.quizzes && resData.quizzes.length === 100) {
        const curriculum = getCurriculumForGrade();
        setActiveCurriculum(curriculum);
        setActive100Questions(resData.quizzes);
        setScopeChosen(true);
      } else {
        throw new Error(resData.error || "질문 생성이 불충분하거나 실패했습니다.");
      }
    } catch (err) {
      console.warn("실시간 AI 시험지 생성 실패 또는 키 미등록으로 로컬 백업 모드로 전환합니다:", err);
      try {
        const curriculum = getCurriculumForGrade();
        const questions = generate100Questions();

        setActiveCurriculum(curriculum);
        setActive100Questions(questions);
        setScopeChosen(true);
      } catch (fallbackErr) {
        console.error("로컬 백업 생성 도중 오류 발생:", fallbackErr);
        alert("성경고사 시험집을 생성하는 동안 일시적인 오작동이 발생했습니다.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      
      {/* Dynamic Render: 1) Initial Scope Selection Page screen */}
      {!scopeChosen ? (
        <div id="scope-selector-landing" className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full space-y-8 select-none my-6">
          
          <div className="text-center space-y-3.5">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-105 shadow-3xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              대한예수교장로회 경기노회 주일학교연합회
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              어린이 성경고사 <span className="text-blue-600 block sm:inline">공식 100문항 시험 출제기</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              성경고사 완벽 대비를 위한 **공과 1과 ~ 26과 통합 공식 100문항 예상고사 시험지 및 정답 해설서**를 출제 버튼을 누를 때마다 완벽히 무작위 배치하여 새롭게 생성합니다.
            </p>
          </div>

          {/* Curriculum Details Board */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm w-full space-y-5 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">출제 연령 범위 및 공과 정보</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  구약 범위 (공과 1과~7과, 20과~23과, 26과)
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  천지창조, 하와와 가정이룸, 노아 방주와 무지개, 아브라함 믿음과 이삭 바침, 요셉 총리 극복과 용서, 모세 가시나무 떨기 소명, 시내산 언약과 십계명, 대속죄일 아사셀 염소, 일상 속 밭 모퉁이 남기기, 신명기 쉐마 교육, 에스겔 마른 뼈와 하나 됨
                </p>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  신약 범위 (공과 8과~19과, 24과~25과)
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  예수님 탄생과 동방박사 세 예물, 요단강 세례와 사탄 유혹 극복, 산상수훈 팔복과 소금빛, 오병이어 긍휼, 물 위를 걸으심, 베드로 신앙고백과 음부 이기는 교회, 나귀 입성, 십자가 고난과 사흘 만의 부활, 그리스도의 겸손 마음, 부모 순종의 첫 계명, 재림 소망과 인내, 행함이 있는 참 믿음
                </p>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 flex items-start gap-2 text-xs text-blue-800 font-medium leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-900 block font-extrabold mb-0.5">상/중/하 난이도 입체 조율 &amp; 주관식 빈칸 문제 탑재</strong>
                어린이의 연령과 실력을 조율하여 다양한 난이도의 문제가 골고루 섞여 나오며, 말씀 요절을 암송하여 채워넣는 **성경구절 빈칸 채우기(주관식)** 문제가 필수 출제됩니다.
              </div>
            </div>
          </div>

          {/* Launch Trigger Button */}
          <div className="w-full flex flex-col items-center justify-center pt-2 gap-3">
            <button
              onClick={handleLaunchStudy}
              disabled={isGenerating}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-3xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:shadow-blue-200 max-w-md w-full justify-center hover:scale-[1.01]"
            >
              <span>성경고사 100문항 출제 시작 📖</span>
              <ChevronRight className="w-4 h-4 text-blue-200" />
            </button>
            <p className="text-[10px] text-slate-400 font-semibold text-center">
              * 버튼을 누를 때마다 100% 다른 최신 무작위 100문항 예상지 세트와 모범 답안지 해설서가 생성됩니다.
            </p>
          </div>

          {/* Overlaid Rotating Sunday School Loading Gate */}
          <AnimatePresence>
            {isGenerating && (
              <div id="ai-generation-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[36px] border border-slate-100 shadow-2xl p-8 max-w-md w-full text-center space-y-6"
                >
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                    <BookOpen className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      출제 위원회 구성 및 성경고사 생성 중
                    </h3>
                    <div className="h-10 flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-slate-500 leading-normal font-medium px-4">
                        {loadingPhrases[loadingPhraseIdx]}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    <span>말씀을 가까이 하는 행복한 성전</span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        /* Workspace Screen */
        <div className="flex-1 flex flex-col">
          
          {/* Header */}
          <header id="workspace-header" className="bg-white border-b border-slate-150 py-4 sticky top-0 z-40 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScopeChosen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer transition-all flex items-center justify-center"
                  title="처음으로 돌아가기"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 rounded-md uppercase">
                    활성 평가 범위
                  </span>
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {activeCurriculum.title}
                  </h1>
                </div>
              </div>

              {/* Back to Home / Regenerate button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScopeChosen(false)}
                  className="px-3.5 py-1.5 border border-slate-200/80 hover:border-slate-350 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 bg-slate-50/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>처음으로</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full">
            <PrintSheet 
              curriculum={activeCurriculum} 
              active100Questions={active100Questions}
            />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-100 py-6 mt-12 print:hidden text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-500">
              대한예수교장로회 경기노회 주일학교연합회 어린이 성경고사 특화 학습 가이드
            </p>
            <p className="mt-1">
              © 2026-2027 Sunday School Union. 성경 공부는 기쁘고 한없는 현숙한 마음의 축복입니다.
            </p>
          </footer>

        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { bibleData, GradeCurriculum, getOffline50Questions } from "./data/bibleData";
import Header from "./components/Header";
import CurriculumOverview from "./components/CurriculumOverview";
import MemoryVerseTrainer from "./components/MemoryVerseTrainer";
import CharacterExplorer from "./components/CharacterExplorer";
import PracticeTest from "./components/PracticeTest";
import PrintSheet from "./components/PrintSheet";
import TeacherQnaTrainer from "./components/TeacherQnaTrainer";
import { 
  BookMarked, Award, User, BookOpen, Printer, Sparkles, 
  Sprout, Leaf, TreeDeciduous, ArrowLeft, Settings, CheckCircle2, ChevronRight, AlertCircle, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [scopeChosen, setScopeChosen] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<'low' | 'mid' | 'high'>('low');
  const [customScopeText, setCustomScopeText] = useState<string>("창세기 1~25장 / 마태복음 1~10장");
  
  // Dynamic state loaded on first launch click
  const [activeCurriculum, setActiveCurriculum] = useState<GradeCurriculum>(bibleData.low);
  const [active50Questions, setActive50Questions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAddingMore, setIsAddingMore] = useState<boolean>(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<'overview' | 'verses' | 'characters' | 'qna' | 'quiz50'>('overview');
  const [quizSubView, setQuizSubView] = useState<'interactive' | 'print'>('interactive');

  // Friendly Sunday school loading messages
  const loadingPhrases = [
    "예장 경기노회 성경고사 출제 위원회가 소집되는 중입니다...",
    "선택하신 범위 성경 말씀에서 보화 같은 50문제를 선별하고 있습니다...",
    "CBT 인터랙티브 컴퓨터 모의고사 오답노트 시스템을 탑재하는 중입니다...",
    "선생님이 소통하며 교육할 수 있는 구두 피드백 Q&A 지도 가이드를 조율 중입니다...",
    "교회 주일학교 배포용 예쁜 인쇄용 학습 가이드와 해설답안을 구성하는 중입니다...",
    "조금만 기다려 주세요! 말씀의 지혜가 곧 임합니다. 💖"
  ];

  // Rotate loading phrases
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Launch handler with Parallel fetches
  const handleLaunchStudy = async () => {
    if (!customScopeText.trim()) {
      alert("원하시는 맞춤형 성경 출제 범위를 입력 또는 지정해 주세요!");
      return;
    }

    setIsGenerating(true);
    setLoadingPhraseIdx(0);

    const finalTopic = customScopeText.trim();

    try {
      // 1. Fetch BOTH compiled questions and extra materials in PARALLEL
      const [quizRes, materialRes] = await Promise.all([
        fetch("/api/generate-custom-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: finalTopic, count: 50, grade: selectedGrade })
        }),
        fetch("/api/generate-custom-study-materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: finalTopic, grade: selectedGrade })
        })
      ]);

      const [quizJson, materialJson] = await Promise.all([
        quizRes.json(),
        materialRes.json()
      ]);

      if (materialJson.success && materialJson.data) {
        const generatedMaterials = materialJson.data;
        
        const customCurriculum: GradeCurriculum = {
          title: `[맞춤형] ${finalTopic}`,
          gradeText: selectedGrade === "low" ? "유년부 저학년 (초등 1~2학년)" : selectedGrade === "mid" ? "초등부 중학년 (초등 3~4학년)" : "소년부 고학년 (초등 5~6학년)",
          scopeOld: `구약: ${finalTopic}`,
          scopeNew: `신약: ${finalTopic}`,
          summarySections: generatedMaterials.summarySections || [],
          detailedStories: generatedMaterials.detailedStories || [],
          verses: generatedMaterials.verses || [],
          characters: generatedMaterials.characters || [],
          teachersQna: generatedMaterials.teachersQna || [],
          expectedQuestions: [],
          mockEvaluation: []
        };
        setActiveCurriculum(customCurriculum);
      } else {
        throw new Error("학습 보조 지도집 가공에 일시 실패했습니다.");
      }

      if (quizJson.success && quizJson.quizzes) {
        setActive50Questions(quizJson.quizzes);
      } else {
        throw new Error("50문항 시험지 추출 실패");
      }

      // Transition to Workspace
      setActiveTab("overview");
      setScopeChosen(true);

    } catch (err) {
      console.error("Study Package Load Error, executing intelligent offline fallback:", err);
      
      const defaultLowText = "창세기 1~25장 / 마태복음 1~10장";
      const defaultMidText = "출애굽기 1~20장 / 누가복음 1~12장";
      const defaultHighText = "사무엘상 1~31장 / 사도행전 1~28장";

      const matchedDefault = 
        (selectedGrade === "low" && finalTopic === defaultLowText) ||
        (selectedGrade === "mid" && finalTopic === defaultMidText) ||
        (selectedGrade === "high" && finalTopic === defaultHighText);

      if (matchedDefault) {
        // High quality accurate pre-baked offline curriculum
        setActiveCurriculum(bibleData[selectedGrade]);
      } else {
        // Smart customized offline curriculum using closest baseline preset templates
        const basePreset = bibleData[selectedGrade];
        const fallbackCurriculum: GradeCurriculum = {
          title: `[자녀맞춤] ${finalTopic}`,
          gradeText: selectedGrade === "low" ? "유년부 저학년 (초등 1~2학년)" : selectedGrade === "mid" ? "초등부 중학년 (초등 3~4학년)" : "소년부 고학년 (초등 5~6학년)",
          scopeOld: `구약: ${finalTopic}`,
          scopeNew: `신약: ${finalTopic}`,
          summarySections: [
            {
              title: `'${finalTopic}' 주요 교육과정 핵심 요점집`,
              content: [
                `입력하신 범위인 [${finalTopic}] 속 대표 주제들을 탐색하며 영적인 교훈을 배웁니다.`,
                "제공되는 50개 성경고사 기출 모의문제를 번갈아 풀고, 풀이 결과를 검토합시다.",
                "선생님용 Q&A 구두 학습 가이드와 완성형 학습지를 인쇄하여 편리하게 공부할 수 있습니다."
              ]
            },
            ...(basePreset.summarySections || [])
          ],
          detailedStories: basePreset.detailedStories || [],
          verses: basePreset.verses || [],
          characters: basePreset.characters || [],
          teachersQna: basePreset.teachersQna || [],
          expectedQuestions: [],
          mockEvaluation: []
        };
        setActiveCurriculum(fallbackCurriculum);
      }

      // Load exactly 50 high-quality diversified questions instantly
      const assembled50 = getOffline50Questions(selectedGrade, finalTopic);
      setActive50Questions(assembled50);
      
      // Transit
      setActiveTab("overview");
      setScopeChosen(true);

    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchStandardStudy = () => {
    setIsGenerating(true);
    // Standard bypass mode - load standard prebuilt curriculum and offline 50 questions instantly!
    setTimeout(() => {
      const finalTopic = selectedGrade === "low" 
        ? "창세기 1~25장 / 마태복음 1~10장" 
        : selectedGrade === "mid" 
          ? "출애굽기 1~20장 / 누가복음 1~12장" 
          : "사무엘상 1~31장 / 사도행전 1~28장";
      
      // Set to high quality accurate pre-baked offline curriculum
      setActiveCurriculum(bibleData[selectedGrade]);
      
      // Load offline 50 questions
      const assembled50 = getOffline50Questions(selectedGrade, finalTopic);
      setActive50Questions(assembled50);
      
      setActiveTab("overview");
      setScopeChosen(true);
      setIsGenerating(false);
    }, 400);
  };

  const handleAddMoreQuestions = async () => {
    if (isAddingMore) return;
    setIsAddingMore(true);
    try {
      const res = await fetch("/api/generate-more-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeCurriculum.title,
          grade: selectedGrade,
          currentCount: active50Questions.length
        })
      });
      const data = await res.json();
      if (data.success && data.quizzes) {
        setActive50Questions(prev => [...prev, ...data.quizzes]);
        alert(`신규 맞춤 기출 10문항을 기존 모험에 성공적으로 더하여 탑재했습니다! (현재 시험지 총 ${active50Questions.length + data.quizzes.length}문제)`);
      } else {
        alert("10개 문항 추가 도중 오류가 발생했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("네트워크 통신 불개로 추가 문제 게시에 실패했습니다.");
    } finally {
      setIsAddingMore(false);
    }
  };

  const mainTabs = [
    { id: 'overview' as const, label: "출제 범위 & 요약정리", icon: BookMarked },
    { id: 'verses' as const, label: "핵심 요절 암송", icon: Award },
    { id: 'characters' as const, label: "대표 인물 탐구", icon: User },
    { id: 'qna' as const, label: "선생님 Q&A 지도안 ✨", icon: HelpCircle },
    { id: 'quiz50' as const, label: "실전대비 50문항 ⚡", icon: BookOpen }
  ];

  const presets = [
    {
      id: 'low' as const,
      gradeName: "저학년 (유년부 · 초등 1~2학년)",
      desc: "천지창조, 노아의 방주, 아브라함의 부르심과 믿음의 계보",
      books: "기본 범위: 창세기 1~25장 / 마태복음 1~10장",
      color: "border-amber-200 bg-amber-50/20 hover:border-amber-300 hover:bg-amber-50/50 text-amber-900",
      iconClass: "bg-amber-100 text-amber-700",
      icon: Sprout
    },
    {
      id: 'mid' as const,
      gradeName: "중학년 (초등부 · 초등 3~4학년)",
      desc: "모세의 출애굽, 열 재앙과 홍해, 시내산 계명과 요단 고개",
      books: "기본 범위: 출애굽기 1~20장 / 누가복음 1~12장",
      color: "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-950",
      iconClass: "bg-emerald-100 text-emerald-700",
      icon: Leaf
    },
    {
      id: 'high' as const,
      gradeName: "고학년 (소년부 · 초등 5~6학년)",
      desc: "사무엘과 사울 왕, 소년 다윗과 골리앗, 초대교회 부흥과 사도 바울 전도",
      books: "기본 범위: 사무엘상 1~31장 / 사도행전 1~28장",
      color: "border-sky-200 bg-sky-50/20 hover:border-sky-305 hover:bg-sky-50/50 text-sky-900",
      iconClass: "bg-sky-100 text-sky-700",
      icon: TreeDeciduous
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      
      {/* Dynamic Render: 1) Initial Scope Selection Page screen */}
      {!scopeChosen ? (
        <div id="scope-selector-landing" className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full space-y-8 select-none my-6">
          
          <div className="text-center space-y-3.5">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-3xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              대한예수교장로회 경기노회 주일학교연합회
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              어린이 성경고사 <span className="text-blue-600 block sm:inline">학습교재 & 자동 맞춤 출제기</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              성경고사 완벽 점수를 위한 **요점정리노트, 빈칸 요절 구절, 캐릭터 프로필**, 그리고 **CBT 모의평가(50문항)**와 **인쇄용 프린트 자료집(50문항)**까지 단 한 번의 범위 선택으로 한곳에 완성됩니다.
            </p>
          </div>

          {/* Core Launch Cards List */}
          <div className="w-full space-y-3 text-left">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 pl-1">
              <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full">1</span>
              첫 번째: 맞춤형 출제 난이도(학년)를 선택하십시오
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full animate-fadeIn">
              {presets.map((p) => {
                const Icon = p.icon;
                const matchesSelected = selectedGrade === p.id;
                
                return (
                  <button
                    key={p.id}
                    id={`preset-card-${p.id}`}
                    onClick={() => {
                      setSelectedGrade(p.id);
                      if (p.id === 'low') {
                        setCustomScopeText("창세기 1~25장 / 마태복음 1~10장");
                      } else if (p.id === 'mid') {
                        setCustomScopeText("출애굽기 1~20장 / 누가복음 1~12장");
                      } else if (p.id === 'high') {
                        setCustomScopeText("사무엘상 1~31장 / 사도행전 1~28장");
                      }
                    }}
                    className={`border-2 p-5 rounded-3xl text-left cursor-pointer transition-all flex flex-col justify-between h-44 relative overflow-hidden ${
                      p.color
                    } ${matchesSelected ? "border-blue-500 bg-white ring-2 ring-blue-105 shadow-xs scale-[1.01]" : "border-slate-150 bg-white hover:border-slate-350"}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${p.iconClass} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {matchesSelected && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                            선택됨 <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{p.gradeName}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal mt-1">{p.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Custom Bible Range Input Field */}
          <div className="w-full space-y-3 text-left">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 pl-1">
              <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full">2</span>
              두 번째: 출제할 범위를 선택 상자에서 직접 선택하거나 입력란에 편집하세요
            </span>
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-3xs w-full">
              
              {/* Single dropdown range selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5 uppercase pl-0.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  출제 범위 공식 성경책 범위 원클릭 지정
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) setCustomScopeText(e.target.value);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white cursor-pointer transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- 원클릭 성경책 대표 출제 범위 선택 --</option>
                  
                  <optgroup label="📜 구약성경 범위">
                    <option value="창세기 1~25장 (천지창조와 아브라함 믿음의 기원)">창세기 1~25장 (창조와 아브라함)</option>
                    <option value="창세기 26~50장 (이삭, 야곱, 요셉 가족의 믿음 상속)">창세기 26~50장 (이삭과 요셉)</option>
                    <option value="출애굽기 1~20장 (열 재앙과 유월절 구원 및 시내산 십계명)">출애굽기 1~20장 (출애굽과 십계명)</option>
                    <option value="출애굽기 21~40장 (광야 성막 건립 및 번제 규례 역사)">출애굽기 21~40장 (성막 건립)</option>
                    <option value="사무엘상 1~31장 (사무엘 선지자와 소년 다윗 물매돌 승리)">사무엘상 1~31장 (초대왕과 사울 다윗)</option>
                    <option value="열왕기상 1~22장 (솔로몬의 예언적 지혜와 분열 엘리야 대결)">열왕기상 1~22장 (솔로몬과 엘리야)</option>
                    <option value="다니엘 1~12장 (세 친구의 풀무불 이적과 사자굴 다니엘 믿음)">다니엘 1~12장 (다니엘 성결 수임)</option>
                  </optgroup>

                  <optgroup label="✝️ 신약성경 범위">
                    <option value="마태복음 1~15장 (예수님의 족보, 공생애 시작 및 산상수훈 팔복)">마태복음 1~15장 (예수님 탄생과 교훈)</option>
                    <option value="마태복음 16~28장 (예수님의 최후만찬, 십자가 대속과 주님의 부활)">마태복음 16~28장 (십자가 죽음과 부활)</option>
                    <option value="누가복음 1~12장 (구세주 아기 예수님 탄생과 잃어버린 양 비유)">누가복음 1~12장 (성탄과 선한 비유)</option>
                    <option value="요한복음 1~21장 (길과 진리와 생명 되신 독생자 말씀과 성령)">요한복음 1~21장 (진리의 샘 영생수)</option>
                    <option value="사도행전 1~15장 (오순절 마가 다락방 불꽃 임재와 예루살렘 초대교회)">사도행전 1~15장 (교회 개척과 오순절)</option>
                    <option value="사도행전 16~28장 (바울 사도의 소아시아 및 로마 전도 선교 여정)">사도행전 16~28장 (사도 바울 로마선교)</option>
                    <option value="요한계시록 1~22장 (새 예루살렘 성전 영광과 어린양 예수 최종 승리)">요한계시록 1~22장 (종말 승리 영광 계시)</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5 text-slate-450" />
                  글자들을 지우고 출제하고 장 범위 혹은 특정 단원명을 원하시는 대로 편집하셔도 좋습니다:
                </label>
                <textarea
                  value={customScopeText}
                  onChange={(e) => setCustomScopeText(e.target.value)}
                  placeholder="예: 모세의 열재앙과 출애굽 기적, 다니엘과 세 친구의 세배 시험, 야곱 요셉 이야기, 마태복음 산상수훈 말씀"
                  rows={2}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all shadow-inner cursor-text"
                />
              </div>

              {/* Quick recommended pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 block uppercase">
                  ⚡ 간편 추천 시험주제 (누르면 즉시 입력됩니다)
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    "다니엘과 세 친구의 풀무불 시험과 굳센 믿음",
                    "요셉의 해와 달 꿈 이야기와 이집트 총리 등극",
                    "예수님이 보여주신 여덟 가지 복(팔복)의 가르침",
                    "모세가 받은 돌판 십계명과 여호수아의 순종 요단강"
                  ].map((topic, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => setCustomScopeText(topic)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-[10px] font-bold rounded-xl border border-slate-150 transition-all cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Launch Trigger Button */}
          <div className="w-full flex flex-col items-center justify-center pt-2 gap-2">
            <button
              onClick={handleLaunchStudy}
              disabled={isGenerating}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-3xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:shadow-blue-200 max-w-md w-full justify-center"
            >
              <span>{selectedGrade === 'low' ? "저학년용" : selectedGrade === 'mid' ? "중학년용" : "고학년용"} 맞춤 학습 교재 & 성경고사 문제 제작 시작 📖</span>
              <ChevronRight className="w-4 h-4 text-blue-200" />
            </button>
            <p className="text-[10px] text-slate-400 font-semibold text-center">
              * 기출예상 50문항 시험지와 프린트 교재가 실시간으로 자동 재배정됩니다.
            </p>
            <button
              onClick={handleLaunchStandardStudy}
              disabled={isGenerating}
              className="mt-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:shadow-emerald-100 max-w-xs justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>교단 표준 성경고사 즉시 시작하기 ⚡ (대기 없음)</span>
            </button>
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
                    <h3 className="text-base sm:text-lg font-black text-slate-800">
                      [예장 성경고사 학습집 제작]
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed min-h-[40px] px-2 text-center text-blue-600">
                      {loadingPhrases[loadingPhraseIdx]}
                    </p>
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
          <header id="workspace-header" className="bg-white border-b border-slate-150 py-4 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScopeChosen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer transition-all flex items-center justify-center"
                  title="출제 범위 재선택"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 rounded-md uppercase">
                    활성 범위
                  </span>
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {activeCurriculum.title}
                  </h1>
                </div>
              </div>

              {/* Status capsule */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScopeChosen(false)}
                  className="px-3.5 py-1.5 border border-slate-200/80 hover:border-slate-350 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 bg-slate-50/50"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">단원 범위 재선택</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full">
            
            {/* Greeting banner inside workspace */}
            <div id="greeting-banner" className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs relative overflow-hidden mb-6">
              <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-10 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.15),transparent)]"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest text-blue-300 uppercase">
                    예장 경기노회 주일학교 영성 특화 학습관
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    {activeCurriculum.title} 맞춤 공부실
                  </h2>
                </div>

                <div className="shrink-0 text-center sm:text-right">
                  <p className="text-[10px] text-slate-400">성경 모의평가 목표</p>
                  <p className="text-xs font-black text-amber-400 mt-0.5">완전 무장 백점 박사 달성! 🎓</p>
                </div>
              </div>
            </div>

            {/* Gorgeous Segmented Tabs switch bar */}
            <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 gap-1 min-w-max">
                {mainTabs.map((t) => {
                  const Icon = t.icon;
                  const isTabActive = activeTab === t.id;
                  
                  return (
                    <button
                      key={t.id}
                      id={`workspace-tab-btn-${t.id}`}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isTabActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-105"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isTabActive ? "text-white" : "text-slate-400"}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tabs View Controller with transition */}
            <div id="tab-content" className="min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedGrade}-${activeTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.12 }}
                >
                  
                  {activeTab === "overview" && (
                    <CurriculumOverview curriculum={activeCurriculum} />
                  )}

                  {activeTab === "verses" && (
                    <MemoryVerseTrainer 
                      verses={activeCurriculum.verses} 
                      grade={selectedGrade}
                    />
                  )}

                  {activeTab === "characters" && (
                    <CharacterExplorer characters={activeCurriculum.characters} />
                  )}

                  {activeTab === "qna" && (
                    <TeacherQnaTrainer qnaList={activeCurriculum.teachersQna} />
                  )}

                  {activeTab === "quiz50" && (
                    <div className="space-y-6">
                      {/* Sub-navigation controls inside the 5th tab */}
                      <div className="bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 max-w-md mx-auto flex gap-1 shadow-inner">
                        <button
                          onClick={() => setQuizSubView('interactive')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            quizSubView === 'interactive'
                              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>💻 실시간 모의평가 (CBT)</span>
                        </button>
                        <button
                          onClick={() => setQuizSubView('print')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            quizSubView === 'print'
                              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>🖨️ 프린트 지면 시험지</span>
                        </button>
                      </div>

                      <div className="pt-2">
                        {quizSubView === 'interactive' ? (
                          <PracticeTest 
                            quizzes={active50Questions}
                            examScope={activeCurriculum.title}
                            onAddMore={handleAddMoreQuestions}
                            isAddingMore={isAddingMore}
                          />
                        ) : (
                          <PrintSheet 
                            curriculum={activeCurriculum} 
                            active50Questions={active50Questions}
                          />
                        )}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

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

import React, { useState } from "react";
import { MessageSquare, HelpCircle, CheckCircle2, ChevronRight, Sparkles, AlertCircle } from "lucide-react";

interface QnaItem {
  question: string;
  answer: string;
  guidance: string;
}

interface TeacherQnaTrainerProps {
  qnaList?: QnaItem[];
}

export default function TeacherQnaTrainer({ qnaList = [] }: TeacherQnaTrainerProps) {
  const [revealedIdx, setRevealedIdx] = useState<Record<number, boolean>>({});

  const toggleReveal = (idx: number) => {
    setRevealedIdx((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!qnaList || qnaList.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-250 p-6 rounded-3xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold text-amber-900 text-sm">등록된 선생님 Q&A 지도안이 없습니다</h3>
        <p className="text-xs text-amber-700 leading-relaxed max-w-md mx-auto">
          선택하신 범위 성경 말씀에 대한 고유 Q&A 지도 가이드 데이터를 생성하거나 다른 데이터셋을 탐색해 주시기 바랍니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
          <Sparkles className="w-3 h-3 text-amber-500" />
          구두 소통 및 신앙 학습 지도안
        </span>
        <h2 className="text-base sm:text-lg font-black text-slate-900">
          선생님과 아이의 1:1 대화형 성경 학습 (단답 및 구두 지도안)
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          필기 점수만큼 중요한 것은 아이들이 원리를 이해해 자기 입으로 고백하는 힘입니다. 
          **선생님(또는 학부모님)**께서 다정히 문제를 읽어 주시고, 아이가 정확한 방향을 잡도록 아래 가이드에 따라 지도 및 칭찬해 주세요. 💖
        </p>
      </div>

      {/* Interactive Flashcard list */}
      <div className="space-y-4">
        {qnaList.map((item, idx) => {
          const isRevealed = !!revealedIdx[idx];
          
          return (
            <div
              key={idx}
              className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-3xs ${
                isRevealed ? "border-blue-200 ring-2 ring-blue-50" : "border-slate-150 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="space-y-2 flex-1">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-md">
                    <HelpCircle className="w-3.5 h-3.5" />
                    질문 {idx + 1}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed">
                    "{item.question}"
                  </h3>
                </div>

                <button
                  onClick={() => toggleReveal(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all shrink-0 cursor-pointer ${
                    isRevealed
                      ? "bg-slate-100 text-slate-650 hover:bg-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                  }`}
                >
                  {isRevealed ? "해답 가이드 접기" : "정답 및 피드백 개방"}
                </button>
              </div>

              {/* Reveal Section */}
              {isRevealed ? (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                  
                  {/* Expected child response */}
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100/70 rounded-2xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-blue-700 block text-left">
                        어린이 모범 답변 핵심
                      </span>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>

                  {/* Teacher's follow-up guidance */}
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100/70 rounded-2xl flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-emerald-700 block text-left">
                        선생님의 사랑 촉진 칭찬 및 보충 가이드
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.guidance}
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div onClick={() => toggleReveal(idx)} className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1 cursor-pointer select-none">
                  <span>눌러서 정답 및 교사 피드백 지침서 보기</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}

import React from "react";
import { GradeCurriculum } from "../data/bibleData";
import { BookOpen, MapPin, ChevronRight, Bookmark, Gift, Stars } from "lucide-react";
import { motion } from "motion/react";

interface CurriculumOverviewProps {
  curriculum: GradeCurriculum;
}

export default function CurriculumOverview({ curriculum }: CurriculumOverviewProps) {
  // Check if scopeOld and scopeNew are identical (as in custom topic generation) or if we want a unified view
  const isCustom = curriculum.title?.includes("[맞춤형]");
  const displayScopeText = isCustom 
    ? curriculum.title.replace("[맞춤형] ", "") 
    : `${curriculum.scopeOld.split(" (")[0]} 및 ${curriculum.scopeNew.split(" (")[0]}`;

  const displayScopeDetail = isCustom
    ? "아동 눈높이에 정확히 수렴하는 맞춤형 성경 요절과 기출 예상문제 교재가 자동 완공되었습니다."
    : `${curriculum.scopeOld.match(/\(([^)]+)\)/)?.[1] || ""} / ${curriculum.scopeNew.match(/\(([^)]+)\)/)?.[1] || ""}`;

  return (
    <div id="curriculum-overview" className="space-y-6">
      
      {/* Combined Single Scope Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-radial from-blue-50 to-indigo-50/50 border border-blue-200/80 p-6 rounded-3xl shadow-xs relative overflow-hidden"
      >
        <div className="absolute right-3 top-3 opacity-10">
          <BookOpen className="w-24 h-24 text-blue-800" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">선택된 단일 통합 출제 범위</span>
          <h3 className="text-lg font-bold text-blue-900 tracking-tight">{curriculum.gradeText} 공식 시험 범위</h3>
        </div>
        <p className="text-xl font-black text-slate-800 tracking-tight mt-1 mb-2 leading-relaxed">
          📖 {displayScopeText}
        </p>
        <p className="text-sm text-indigo-900 leading-relaxed bg-white/75 p-4 rounded-2xl border border-blue-100 shadow-3xs mt-3">
          <span className="font-extrabold text-blue-800">출제 핵심 요점: </span>
          {displayScopeDetail}
        </p>
      </motion.div>

      {/* Original Bible Verse Texts (성경 요절 원문 전문) Section */}
      {curriculum.verses && curriculum.verses.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">📖 출제 범위 성경 요절 원문 전문</h3>
              <p className="text-xs text-slate-500">본 시험 범위에서 출제되는 핵심 암송 요절의 실제 성경 원문 전문과 친절한 어린이용 해설입니다.</p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {curriculum.verses.map((v, idx) => (
              <div 
                key={v.id || idx} 
                className="p-4 bg-emerald-50/20 hover:bg-emerald-50/45 rounded-2xl border border-emerald-100/60 transition-all flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                    요절 {idx + 1}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 font-mono">
                    {v.reference}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100/30">
                  "{v.verse}"
                </p>
                <p className="text-xs text-slate-500 pl-1 leading-relaxed">
                  <span className="font-bold text-emerald-600">해설:</span> {v.translation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Lesson Plans / Summaries */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Stars className="w-5 h-5 text-yellow-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">교재 요점 다이제스트</h3>
            <p className="text-xs text-slate-500">성경의 흐름을 한눈에 기억하기 쉽게 요약한 주일학교 핵심 강의노트입니다.</p>
          </div>
        </div>

        <div className="space-y-6">
          {curriculum.summarySections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="inline-flex items-center gap-1.5 text-md font-bold text-slate-800 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-xl">
                <Bookmark className="w-4 h-4 text-blue-500 shrink-0" />
                {section.title}
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {section.content.map((point, pIdx) => {
                  const parts = point.split(": ");
                  const label = parts[0];
                  const detail = parts[1];
                  return (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={pIdx}
                      className="p-4 bg-slate-50/40 rounded-2xl border border-slate-100/60 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center justify-center shrink-0">
                          {pIdx + 1}
                        </span>
                        <h5 className="font-bold text-slate-800 text-sm">{label}</h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {detail || point}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Study tips card */}
        <div className="bg-radial from-slate-50 to-slate-100/40 border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3 mt-4">
          <div className="p-2 bg-white text-slate-700 rounded-xl shrink-0 border border-slate-100">
            <Gift className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-sm">성경고사 고득점 핵심 비법!</h5>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              어린이 성경고사는 장(Chapter) 제목과 각 장의 주요 인물이 매치되는 문제가 자주 나옵니다. 
              **인물 탐구 탭**에서 중심인물의 주된 업적과 연관 요절을 함께 매칭하여 암송하면 고득점을 싹쓸이할 수 있답니다!
            </p>
          </div>
        </div>

      </div>

      {/* Detailed Stories Section */}
      {curriculum.detailedStories && curriculum.detailedStories.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">출제 범위 전체 스토리 요약 (디테일 분석)</h3>
              <p className="text-xs text-slate-500">지정된 성경 범위 안의 모든 사건과 스토리를 흐름에 따라 아주 자세하고 재미있게 요약한 파트입니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curriculum.detailedStories.map((episode, idx) => (
              <motion.div
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block py-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold leading-none">
                      스토리 {idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {episode.scope}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 tracking-tight">
                    {episode.episodeTitle}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100/50">
                    {episode.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50">
                  <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    핵심 교육포인트 (성경고사 유의사항)
                  </h5>
                  <ul className="space-y-1.5">
                    {episode.keyPoints.map((point, kIdx) => (
                      <li key={kIdx} className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

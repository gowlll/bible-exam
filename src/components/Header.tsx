import React from "react";
import { BookOpen, GraduationCap, Sparkles, Sprout, Leaf, TreeDeciduous } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  selectedGrade: 'low' | 'mid' | 'high';
  setSelectedGrade: (grade: 'low' | 'mid' | 'high') => void;
}

export default function Header({ selectedGrade, setSelectedGrade }: HeaderProps) {
  const grades = [
    {
      id: 'low' as const,
      name: "저학년 (유년부)",
      level: "초등 1~2학년",
      color: "from-amber-400 to-orange-500",
      bgSelected: "bg-amber-50 text-amber-900 border-amber-300 shadow-sm",
      icon: Sprout,
    },
    {
      id: 'mid' as const,
      name: "중학년 (초등부)",
      level: "초등 3~4학년",
      color: "from-emerald-400 to-teal-600",
      bgSelected: "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm",
      icon: Leaf,
    },
    {
      id: 'high' as const,
      name: "고학년 (소년부)",
      level: "초등 5~6학년",
      color: "from-sky-400 to-blue-600",
      bgSelected: "bg-sky-50 text-sky-900 border-sky-300 shadow-sm",
      icon: TreeDeciduous,
    }
  ];

  return (
    <header id="app-header" className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and Presbytery Subtitle */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-1 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                대한예수교장로회 경기노회 주일학교연합회
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                어린이 성경고사 <span className="text-blue-600">학습 도우미</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium align-middle">말씀으로 지혜 가득!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                핵심 암송 요절 요약 정리, 주요 인물 탐구, 예상 문제 및 모의고사 해설집
              </p>
            </div>
          </div>

          {/* Grade Selector */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block sm:hidden">
              학년 수준을 선택하세요
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl gap-1.5 border border-slate-200">
              {grades.map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGrade === g.id;
                return (
                  <button
                    key={g.id}
                    id={`grade-btn-${g.id}`}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? g.bgSelected + " font-semibold ring-1 ring-white/10"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-slate-800" : "text-slate-400"}`} />
                    <div className="text-left">
                      <span className="block leading-none">{g.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5 block leading-none">
                        {g.level}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

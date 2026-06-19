import React, { useState } from "react";
import { CharacterProfile } from "../data/bibleData";
import { User, Award, CheckCircle2, Calendar, HelpCircle, Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CharacterExplorerProps {
  characters: CharacterProfile[];
}

export default function CharacterExplorer({ characters }: CharacterExplorerProps) {
  const [selectedCharIdx, setSelectedCharIdx] = useState<number>(0);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<string>("");
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean>(false);

  const character = characters[selectedCharIdx];

  const handleSelectCharacter = (idx: number) => {
    setSelectedCharIdx(idx);
    setQuizAnswerSelected("");
    setQuizSubmitted(false);
    setQuizIsCorrect(false);
  };

  const handleSelectOption = (opt: string) => {
    if (quizSubmitted) return;
    setQuizAnswerSelected(opt);
  };

  const handleSubmitQuiz = (quizItem: typeof character.quiz[0]) => {
    if (!quizAnswerSelected) return;
    setQuizSubmitted(true);
    setQuizIsCorrect(quizAnswerSelected === quizItem.answer);
  };

  const handleResetQuiz = () => {
    setQuizAnswerSelected("");
    setQuizSubmitted(false);
    setQuizIsCorrect(false);
  };

  return (
    <div id="character-explorer" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar Selector */}
      <div className="lg:col-span-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1">성경 인물 탐구</h3>
        <div className="space-y-2">
          {characters.map((c, idx) => {
            const isSelected = idx === selectedCharIdx;
            return (
              <button
                key={c.name}
                id={`char-btn-${c.name}`}
                onClick={() => handleSelectCharacter(idx)}
                className={`w-full text-left p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base leading-none">{c.name}</h4>
                    <span className={`text-[10px] mt-1 block leading-none ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {c.role}
                    </span>
                  </div>
                </div>
                <Calendar className={`w-4 h-4 ${isSelected ? "text-slate-400" : "text-slate-300"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Details Page */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Main Details */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{character.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                  {character.period}
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600 mt-1">{character.role}</p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              대표 요절: <span className="font-bold text-slate-700">"{character.keyVerses.split(" (")[0]}"</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">이야기 한마디</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {character.summary}
            </p>
          </div>

          {/* Key Achievements */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              믿음의 대표적 공적과 일대기
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {character.achievements.map((ach, idx) => (
                <li key={idx} className="flex gap-2 items-start p-3 rounded-2xl bg-amber-50/20 border border-amber-100/50">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">{ach}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chronological Steps / Timeline */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-blue-500 shrink-0" />
            성경 행적 연대기 (일화 순서)
          </h4>
          <div className="relative pl-6 border-l-2 border-blue-100 space-y-6 ml-2.5">
            {character.timeline.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-xs sm:text-sm text-slate-800">{idx + 1}. {step.title}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Mini Quiz */}
        {character.quiz && character.quiz.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-800">지혜를 확인하는 일 인물 요약 퀴즈</h4>
            </div>

            {character.quiz.map((q, idx) => (
              <div key={idx} className="space-y-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed bg-indigo-50/30 p-3.5 rounded-2xl border border-indigo-100/50">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((option) => {
                    const isSelected = quizAnswerSelected === option;
                    let optionStyle = "border-slate-150 bg-white hover:bg-slate-50 text-slate-700";
                    if (isSelected) {
                      optionStyle = "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold";
                    }
                    if (quizSubmitted) {
                      if (option === q.answer) {
                        optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                      } else if (isSelected && !quizIsCorrect) {
                        optionStyle = "bg-rose-50 border-rose-500 text-rose-900 line-through";
                      } else {
                        optionStyle = "opacity-60 bg-white border-slate-100 text-slate-400";
                      }
                    }

                    return (
                      <button
                        key={option}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectOption(option)}
                        className={`p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && option === q.answer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {quizSubmitted && isSelected && !quizIsCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 items-center">
                  {quizSubmitted ? (
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      다시 풀기
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmitQuiz(q)}
                      disabled={!quizAnswerSelected}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      체크하기
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {quizSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed flex gap-2 ${
                        quizIsCorrect
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                          : "bg-rose-50 text-rose-800 border-rose-100"
                      }`}
                    >
                      <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${quizIsCorrect ? "text-emerald-600" : "text-rose-600"}`} />
                      <div>
                        <span className="font-bold mr-1">
                          {quizIsCorrect ? "참 잘했어요! 정말 정확해요! 🎉" : "어랄라? 다시 성경책을 되짚어보며 공부해봐요! 💡"}
                        </span>
                        {q.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

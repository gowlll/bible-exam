import React from "react";
import { GradeCurriculum } from "../data/bibleData";
import { Printer, FileText, CheckSquare, Award, BookOpen, AlertCircle } from "lucide-react";

interface PrintSheetProps {
  curriculum: GradeCurriculum;
  active50Questions: any[];
}

export default function PrintSheet({ curriculum, active50Questions }: PrintSheetProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-sheet-component" className="space-y-6">
      
      {/* Settings Panel banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Printer className="w-4.5 h-4.5 text-blue-500 shrink-0" />
            교사/학부모 전용 인쇄용 자료집 (50문항 완결작)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            주일학교 훈련 및 배포를 위해 출제 범위별로 완성된 **요점 노트 + 괄호 요절 + 50개 성경고사 기출문제**를 일목요연하게 출력할 수 있습니다.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          종이 인쇄 및 PDF 저장
        </button>
      </div>

      {/* Main printable paper preview sheet */}
      <div id="printable-area" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto space-y-8 text-slate-900 border-dashed print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Printable Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
          <p className="text-[10px] sm:text-xs font-black tracking-widest text-slate-500 uppercase">
            예수교장로회 경기노회 주일학교연합회 어린이성경고사
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            [대비 예상문제집] {curriculum.title}
          </h1>
          <div className="flex justify-center gap-6 text-[10px] sm:text-xs text-slate-500 font-bold">
            <span>대상: {curriculum.gradeText || "성경 학습 참여생"}</span>
            <span>년도: 2026-2027 기출대비</span>
            <span>문항수: 50문항 전격 탑재</span>
          </div>
        </div>

        {/* 1. Scopes & Books */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-805 border-l-4 border-slate-900 pl-2">
            Ⅰ. 성경 출제 범위 및 안내
          </h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-slate-700 bg-amber-100 text-[10px] px-1.5 py-0.5 rounded-sm">선택 범위</span>
            <p className="font-bold text-slate-800 mt-1">{curriculum.title}</p>
            <p className="text-slate-500 leading-relaxed mt-1">
              본 학습 인쇄집은 사용자가 설정한 범위에 맞추어 생성학습 50문제를 수집, 수록한 표준 교육과정 배포용 모의 시험지입니다.
            </p>
          </div>
        </div>

        {/* 2. Mini Summary sections */}
        {curriculum.summarySections && curriculum.summarySections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-805 border-l-4 border-slate-900 pl-2">
              Ⅱ. 단원별 대표 요점집 정리노트
            </h3>
            <div className="space-y-4">
              {curriculum.summarySections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 underline decoration-slate-300">
                    {sIdx + 1}. {sec.title}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-4">
                    {sec.content.map((point, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2.5 Detailed Stories timeline for print */}
        {curriculum.detailedStories && curriculum.detailedStories.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-805 border-l-4 border-slate-900 pl-2">
              Ⅲ. 출제 범위 전체 상세 스토리 분석집 (에피소드 분석)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {curriculum.detailedStories.map((ep, eIdx) => (
                <div key={eIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 print:bg-white print:break-inside-avoid">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">스토리 에피소드 {eIdx + 1}</span>
                    <span className="font-mono">{ep.scope}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">{ep.episodeTitle}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white/60 p-2 rounded-lg border border-slate-100 print:bg-white">
                    {ep.summary}
                  </p>
                  <div className="pt-1.5 border-t border-slate-200/50">
                    <p className="text-[10px] font-bold text-slate-700">핵심 포인트:</p>
                    <ul className="list-inside list-disc text-[10px] text-slate-500 space-y-0.5 pl-1.5">
                      {ep.keyPoints.map((kp, kIdx) => (
                        <li key={kIdx} className="leading-relaxed">{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Memory Verses with missing blanks */}
        {curriculum.verses && curriculum.verses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-805 border-l-4 border-slate-900 pl-2">
              Ⅳ. 성경 요절 구절 암송 자가 테스트
            </h3>
            <p className="text-[11px] text-slate-500">
              * 괄호 [ ] 안에 들어갈 알맞은 단어를 직접 자필 연필로 적어 빈칸을 채워보세요.
            </p>
            <div className="space-y-3.5 pl-4">
              {curriculum.verses.map((v, vIdx) => (
                <div key={v.id || vIdx} className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    [구절 {vIdx + 1}] {v.reference}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold font-mono tracking-wide p-3 bg-slate-50 border border-slate-100/70 rounded-lg">
                    "{v.blankedVerse}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Dynamic 50 Expected Questions */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-805 border-l-4 border-slate-900 pl-2">
            Ⅴ. 단원별 공식 50문항 예상고사 시험지 (정답 별도 수록)
          </h3>
          
          <div className="space-y-6 pt-2 divide-y divide-slate-100 print:divide-none">
            {active50Questions.map((eq, qIdx) => (
              <div key={eq.id || qIdx} className={`space-y-2.5 ${qIdx > 0 ? "pt-5" : ""} print:break-inside-avoid`}>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                  문 {qIdx + 1}. {eq.question.replace(/^\[실력 다지기\] /, "").replace(/^\[실전:.+\] /, "")}
                </p>
                
                {/* 4-1. Multiple choice layout */}
                {eq.type === 'multiple' && eq.options && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pl-4">
                    {eq.options.map((opt: string, oIdx: number) => (
                      <span key={oIdx} className="leading-relaxed">
                        ({oIdx + 1}) {opt}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 4-2. OX layout */}
                {eq.type === 'ox' && (
                  <span className="text-[11px] text-slate-500 pl-4 font-semibold block">
                    정답 체크: ( &nbsp; O &nbsp; &nbsp; / &nbsp; &nbsp; X &nbsp; )
                  </span>
                )}
                
                {/* 4-3. Short answer layout */}
                {eq.type === 'short' && (
                  <div className="flex items-center gap-2 pl-4 text-xs font-bold text-slate-400">
                    <span>답안란: </span>
                    <div className="border-b-2 border-slate-300 w-48 h-6"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Teachers QNA Guidance Block */}
        {curriculum.teachersQna && curriculum.teachersQna.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-200 print:break-before-page">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-l-4 border-slate-900 pl-2">
              Ⅵ. 교사/학부모 전용 1:1 구두 질문 및 단답형 피드백 지도서
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * 주일학교 어린이에게 아래의 질문들을 소리 내어 다정하게 읽어주신 후, 아이가 스스로의 힘으로 고백할 수 있도록 조율해 주시고 촉진 지침을 바탕으로 사랑을 가득 담아 칭찬 및 보완 영적 설명을 보태주세요.
            </p>
            <div className="space-y-4 pl-4 pt-1">
              {curriculum.teachersQna.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 print:bg-white print:break-inside-avoid">
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    <span className="text-blue-700 bg-white border border-blue-150 rounded-sm px-1.5 py-0.5 text-[10px] mr-1.5 shrink-0 inline-block font-mono">대화 질문 {qIdx + 1}</span>
                    "{q.question}"
                  </p>
                  <p className="text-xs text-slate-800 pl-2 leading-relaxed">
                    <span className="font-extrabold text-slate-900">어린이 답변 골자: </span>
                    {q.answer}
                  </p>
                  <p className="text-[11px] text-emerald-800 pl-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/40 print:bg-white leading-relaxed">
                    <span className="font-extrabold text-emerald-900">교사 행동 지도 및 칭찬 피드백: </span>
                    {q.guidance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Separate Answer Keys bottom page break */}
        <div className="pt-8 border-t-2 border-dashed border-slate-300 print:break-before-page">
          <div className="text-center pb-4 border-b border-slate-900 space-y-1">
            <h2 className="text-md sm:text-lg font-black text-slate-800 uppercase tracking-widest">
              [경기노회 어린이성경고사 50문항 세트 모범 정답지 및 해설서]
            </h2>
          </div>

          <div className="space-y-8 pt-5 text-xs">
            
            {/* Verses Answer keys */}
            {curriculum.verses && curriculum.verses.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 underline">💡 암송구절 괄호 정답표</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  {curriculum.verses.map((v, idx) => (
                    <p key={v.id || idx} className="text-slate-600">
                      <span className="font-bold text-slate-800">구절 {idx + 1} ({v.reference}): </span>
                      {v.blanks.join(", ")}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Answer keys & explaining booklet */}
            <div className="space-y-4 pt-3">
              <h4 className="font-bold text-blue-900 underline">💡 50개 성경 예상문항 공식 답안지 및 친절 교사 해설본</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {active50Questions.map((eq, qIdx) => (
                  <div key={eq.id || qIdx} className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-205/60 print:border-slate-100 print:bg-white print:break-inside-avoid">
                    <p className="font-bold text-slate-800">
                      정답 {qIdx + 1}번: <span className="text-blue-700 bg-white font-mono px-1.5 py-0.5 border border-slate-150 rounded-sm">{eq.answer}</span>
                    </p>
                    <p className="text-slate-500 text-[10px] leading-relaxed">
                      {eq.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Printable stamp */}
        <div className="text-center pt-6 text-[10px] text-slate-400 font-bold border-t border-slate-100">
          대한예수교장로회 경기노회 주일학교연합회 어린이성경고사 완벽대비 전용 학습족보집
        </div>

      </div>

    </div>
  );
}

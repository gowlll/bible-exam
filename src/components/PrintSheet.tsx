import React from "react";
import { GradeCurriculum } from "../data/bibleData";
import { Printer, FileText, CheckSquare, Award } from "lucide-react";

interface PrintSheetProps {
  curriculum: GradeCurriculum;
  active100Questions: any[];
}

export default function PrintSheet({ curriculum, active100Questions }: PrintSheetProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-sheet-component" className="space-y-6">
      
      {/* Settings Panel banner - hidden in print */}
      <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Printer className="w-4.5 h-4.5 text-blue-500 shrink-0" />
            교사/학부모 전용 성경고사 인쇄 시험지 (100문항 완결작)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            주일학교 성경 학습 및 평가를 위한 **단원별 공식 100문항 예상고사 시험지**와 **친절한 정답지 및 해설서**를 인쇄하거나 PDF로 저장할 수 있습니다.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02]"
        >
          <Printer className="w-4.5 h-4.5" />
          종이 인쇄 및 PDF 저장
        </button>
      </div>

      {/* Main printable paper preview sheet */}
      <div 
        id="printable-area" 
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto space-y-8 text-slate-900 border-dashed print:border-none print:shadow-none print:p-0 print:max-w-none"
      >
        {/* Custom Print Style Injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            #printable-area {
              width: 100% !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            /* Hide browser default header/footer text if configured */
            @page {
              size: A4;
              margin: 20mm 15mm 20mm 15mm;
            }
            /* Prevent questions splitting awkwardly across pages */
            .print-avoid-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Force page break for answers */
            .print-force-break {
              page-break-before: always !important;
              break-before: page !important;
            }
          }
        ` }} />
        
        {/* Printable Header */}
        <div className="text-center pb-6 border-b-2 border-slate-950 space-y-2">
          <p className="text-[10px] sm:text-xs font-black tracking-widest text-slate-500 uppercase">
            예수교장로회 경기노회 주일학교연합회 어린이성경고사
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            [대비 예상문제집] {curriculum.title}
          </h1>
          <div className="flex justify-center gap-6 text-[10px] sm:text-xs text-slate-500 font-bold">
            <span>대상: {curriculum.gradeText || "성경 학습 참여생"}</span>
            <span>년도: 2026-2027 기출대비</span>
            <span>문항수: 100문항 전격 탑재</span>
          </div>
        </div>

        {/* 1. Dynamic 100 Expected Questions */}
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-l-4 border-slate-950 pl-2">
            Ⅰ. 단원별 공식 100문항 예상고사 시험지
          </h3>
          
          <div className="space-y-6 pt-2 divide-y divide-slate-100 print:divide-none">
            {active100Questions.map((eq, qIdx) => (
              <div 
                key={eq.id || qIdx} 
                className={`space-y-2.5 ${qIdx > 0 ? "pt-5" : ""} print-avoid-break`}
              >
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                  문 {qIdx + 1}. {eq.question.replace(/^\[실력 다지기\] /, "").replace(/^\[실전:.+\] /, "")}
                </p>
                
                {/* Multiple choice layout */}
                {eq.type === 'multiple' && eq.options && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pl-4">
                    {eq.options.map((opt: string, oIdx: number) => (
                      <span key={oIdx} className="leading-relaxed">
                        ({oIdx + 1}) {opt}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* OX layout */}
                {eq.type === 'ox' && (
                  <span className="text-[11px] text-slate-500 pl-4 font-semibold block">
                    정답 체크: ( &nbsp; O &nbsp; &nbsp; / &nbsp; &nbsp; X &nbsp; )
                  </span>
                )}
                
                {/* Short answer layout */}
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

        {/* 2. Separate Answer Keys bottom page break */}
        <div className="pt-8 border-t-2 border-dashed border-slate-300 print-force-break">
          <div className="text-center pb-4 border-b border-slate-900 space-y-1">
            <h2 className="text-md sm:text-lg font-black text-slate-800 uppercase tracking-widest">
              [경기노회 어린이성경고사 100문항 세트 모범 정답지 및 해설서]
            </h2>
          </div>

          <div className="space-y-8 pt-5 text-xs">
            {/* Questions Answer keys & explaining booklet */}
            <div className="space-y-4 pt-3">
              <h4 className="font-bold text-blue-900 underline flex items-center gap-1 text-sm">
                <CheckSquare className="w-4.5 h-4.5 text-blue-600" />
                100개 성경 예상문항 공식 답안지 및 친절 교사 해설본
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {active100Questions.map((eq, qIdx) => (
                  <div 
                    key={eq.id || qIdx} 
                    className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60 print:border-slate-100 print:bg-white print-avoid-break"
                  >
                    <p className="font-bold text-slate-800 flex justify-between items-center text-xs">
                      <span>정답 {qIdx + 1}번: <span className="text-blue-700 bg-white font-mono px-1.5 py-0.5 border border-slate-150 rounded-sm">{eq.answer}</span></span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 font-extrabold px-1.5 py-0.5 rounded-md">공과 {eq.lesson}과</span>
                    </p>
                    <p className="text-slate-500 text-[10px] leading-relaxed pt-1">
                      {eq.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Printable stamp */}
        <div className="text-center pt-6 text-[10px] text-slate-400 font-bold border-t border-slate-100 print-avoid-break">
          대한예수교장로회 경기노회 주일학교연합회 어린이성경고사 완벽대비 전용 학습족보집
        </div>

      </div>

    </div>
  );
}

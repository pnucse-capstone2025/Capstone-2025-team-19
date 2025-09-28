// components/FAQ.tsx
export default function FAQ() {
    const faqs = [
      {
        question: "AI 요약은 언제 생성되나요?",
        answer: "녹음을 시작하면 AI가 강의를 분석해 자동으로 요약 주석을 생성합니다.",
      },
      {
        question: "생성된 주석을 편집할 수 있나요?",
        answer:
          "각 주석 카드는 개별적으로 텍스트를 편집하거나 삭제할 수 있으며 위치와 크기도 조정할 수 있습니다.",
      },
      {
        question: "주석을 PDF 위에 배치할 수 있나요?",
        answer:
          "드래그 앤 드롭을 통해 원하는 위치에 주석을 올릴 수 있습니다.",
      },
    ];
  
    return (
      <section id="faq-section" className="bg-gray-100 py-24">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-14">
            자주 묻는 질문
          </h2>
  
          <div className="space-y-10">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <p className="text-blue-900 font-semibold mb-1">{faq.question}</p>
                <p className="text-slate-600 text-sm">{faq.answer}</p>
                {idx < faqs.length - 1 && <hr className="my-6 border-slate-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
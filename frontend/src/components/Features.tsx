export default function Features() {
    const features = [
      {
        icon: '📄',
        title: 'PDF 스마트 분석',
        desc: 'Upstage Document Parse를 활용하여 PDF 문서를 AI가 이해하기 쉬운 형태로 변환합니다',
      },
      {
        icon: '🎤',
        title: '음성 인식 기술',
        desc: '실시간으로 음성을 인식하여 텍스트로 인식합니다',
      },
      {
        icon: '🤖',
        title: 'AI 기반 주석 생성',
        desc: 'GPT & CRAG를 사용하여 문맥에 맞는 스마트한 주석과 설명을 제공합니다',
      },
      {
        icon: '✏️',
        title: '직관적인 편집',
        desc: '드래그앤드롭으로 주석을 자유롭게 배치하고 실시간으로 편집할 수 있습니다',
      },
      {
        icon: '💾',
        title: '간편한 저장',
        desc: '작업이 완료된 PDF를 즉시 저장하고 다운로드할 수 있습니다',
      },
      {
        icon: '⚡',
        title: '빠른 처리',
        desc: '최적화된 알고리즘으로 빠른 음성 인식과 내용 요약을 제공합니다',
      },
    ];

    const annotationTypes = [
      {
        icon: '🔍',
        title: '웹 검색 기반 주석',
        desc: 'PPT에 없는 새로운 발화 내용을 AI가 실시간으로 인식하고, 관련된 웹 정보를 검색하여 자연스럽게 설명합니다. 생소한 용어나 이슈를 자동으로 찾아주는 스마트한 주석입니다.',
      },
      {
        icon: '📘',
        title: '자료 기반 주석',
        desc: '발화와 PDF 문서 내용을 비교해 가장 관련 있는 내용을 찾아냅니다. 해당 주석에는 정확한 페이지 번호가 함께 표시되어 빠른 복습이 가능합니다.',
      },
    ];
  
    return (
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-14">
            주요 기능
          </h2>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition"
              >
                <div className="w-16 h-16 flex items-center justify-center text-2xl bg-blue-400 text-white rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          {/* 주석 유형 소개 */}
{/* 주석 유형 소개 */}
<div className="mt-24">
  <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-14">
    제공되는 주석 유형
  </h2>

  {/* 웹 검색 기반 주석 */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
    {/* 설명 */}
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
      <div className="w-16 h-16 flex items-center justify-center text-2xl bg-indigo-400 text-white rounded-full mb-4">
        🔍
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">웹 검색 기반 주석</h3>
      <p className="whitespace-pre-line text-slate-600 text-sm">
        PPT에 없는 새로운 발화 내용을 AI가 실시간으로 인식하고,</p> 
        <p className="whitespace-pre-line text-slate-600 text-sm">관련된 웹 정보를 검색하여 자연스럽게 설명합니다.</p>
        <p className="whitespace-pre-line text-slate-600 text-sm">생소한 용어나 이슈를 자동으로 찾아주는 스마트한 주석입니다.
      </p>
    </div>
    {/* 이미지 */}
    <div className="flex justify-center">
      <img
        src="/annotation-web.png"
        alt="웹 검색 기반 주석 예시"
        className="rounded-xl shadow-md w-full max-w-md"
      />
    </div>
  </div>

  {/* 자료 기반 주석 */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
    {/* 설명 */}
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
      <div className="w-16 h-16 flex items-center justify-center text-2xl bg-indigo-400 text-white rounded-full mb-4">
        📘
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">자료 기반 주석</h3>
      <p className="whitespace-pre-line text-slate-600 text-sm">
        발화와 PDF 문서 내용을 비교해 가장 관련 있는 내용을 찾아냅니다.</p>
        <p className="whitespace-pre-line text-slate-600 text-sm">해당 주석에는 정확한 페이지 번호가 함께 표시되어 빠른 복습이 가능합니다.
      </p>
    </div>
    {/* 이미지 */}
    <div className="flex justify-center">
      <img
        src="/annotation-document.png"
        alt="자료 기반 주석 예시"
        className="rounded-xl shadow-md w-full max-w-md"
      />
    </div>
  </div>
</div>

        </div>
      </section>
    );
  }
  
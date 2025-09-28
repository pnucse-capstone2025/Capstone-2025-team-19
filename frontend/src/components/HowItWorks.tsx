// components/HowItWorks.tsx
import Image from "next/image";

const steps = [
  {
    number: 1,
    title: "PDF를 업로드해요",
    desc: "설명을 보고 싶은 PDF 문서를 업로드하세요.",
    img: "/gif/step1-upload.gif",
    reverse: false,
  },
  {
    number: 2,
    title: "음성을 통해 답변을 생성해요",
    desc: "실시간으로 사용자의 발화를 인식하여 텍스트로 변환합니다.\n AI가 텍스트를 정제하고 문서와 비교하여 관련 내용을 찾아냅니다.\n문서 기반 또는 웹 기반으로 자연스러운 답변을 제공합니다.",
    img: "/gif/step2.gif",
    reverse: true,
  },
  {
    number: 3,
    title: "주석을 편집해요",
    desc: "정제된 답변을 원하는 위치로 옮기고, 수정할 수 있습니다.",
    img: "/gif/step3.gif",
    reverse: false,
  },
  {
    number: 4,
    title: "PDF 저장 완성!",
    desc: "원하는 위치에 달린 주석을 저장된 PDF를 확인하세요!",
    img: "/gif/step4.gif",
    reverse: true,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-100 py-24">
      <div className="max-w-screen-xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-16">
          어떻게 작동하나요?
        </h2>

        <div className="flex flex-col gap-24">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col md:flex-row ${
                step.reverse ? "md:flex-row-reverse" : ""
              } items-center gap-12`}
            >
              <div className="w-full md:w-1/2">
                <Image
                  src={step.img}
                  alt={`${step.number}단계`}
                  width={600}
                  height={400}
                  className="rounded-xl shadow"
                />
              </div>
              <div className="w-full md:w-1/2">
                <div className="w-12 h-12 bg-blue-400 text-white font-bold rounded-full flex items-center justify-center mb-4 text-lg">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="whitespace-pre-line text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

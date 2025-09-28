// components/Footer.tsx
export default function Footer() {
    return (
      <footer id="contact" className="bg-slate-800 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* 브랜드 소개 */}
          <div>
            <h3 className="text-xl font-bold mb-3">SPEAK NOTE</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              AI 기반 음성 주석 솔루션으로<br />
              더 스마트한 문서 관리를 경험하세요.
            </p>
          </div>
  
          {/* 제품 섹션 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-100">제품</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white">기능</a></li>
              <li><a href="#" className="hover:text-white">가격</a></li>
              <li><a href="#" className="hover:text-white">API</a></li>
              <li><a href="#" className="hover:text-white">문서</a></li>
            </ul>
          </div>
  
          {/* 지원 섹션 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-100">지원</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white">고객센터</a></li>
              <li><a href="#faq-section" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">튜토리얼</a></li>
              <li><a href="#" className="hover:text-white">커뮤니티</a></li>
            </ul>
          </div>
        </div>
  
        <div className="border-t border-slate-600 pt-6 text-center text-sm text-slate-400">
          &copy; 2025 SPEAK NOTE - All rights reserved.
        </div>
      </footer>
    );
  }
  
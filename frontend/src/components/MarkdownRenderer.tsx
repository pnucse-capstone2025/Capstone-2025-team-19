"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";

type MarkdownRendererProps = {
  markdown: string;
  className?: string;
};

/**
 * MarkdownRenderer
 * - GFM 지원(리스트, 체크박스, 테이블 등)
 * - 코드 블록 프리즘 하이라이트(nord 테마)
 * - 인용문/이미지/이탤릭 최소 커스터마이즈
 */
export default function MarkdownRenderer({ markdown, className }: MarkdownRendererProps) {
  // 약간의 정규화: 일부 소스에서는 연속 단일 개행으로 문단이 합쳐지는 경우가 있어
  // 문단 구분을 위해 단일 개행을 이중 개행으로 보정 (리스트/코드 블록은 remarkGfm이 처리)
  const normalized = markdown;

  return (
    <div
      className={
        className ??
        "leading-tight [&_*]:m-0 [&_*]:p-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:list-inside [&_ol]:list-inside [&_ul]:pl-0 [&_ol]:pl-0 [&_ul]:ml-0 [&_ol]:ml-0 [&_li]:pl-0 [&_li]:ml-0 [&_blockquote]:m-0 [&_blockquote]:pl-0 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-gray-100"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // react-markdown의 code 컴포넌트 시그니처(node, inline, className, children, ...props)
          // 타입 경고 방지를 위해 any로 지정
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={nord}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          blockquote({ children, ...props }) {
            return <blockquote {...props}>{children}</blockquote>;
          },
          img({ src, alt }) {
            return (
              // public 경로 보정 (필요 시 적용)
              <img style={{ maxWidth: "40vw" }} src={src} alt={alt ?? "image"} />
            );
          },
          em({ children, ...props }) {
            return (
              <span style={{ fontStyle: "italic" }} {...props}>
                {children}
              </span>
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}



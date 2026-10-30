import { faqs } from "@/lib/catalog";
export function FaqList({ limit }: { limit?: number }) {
  return (
    <div className="faq-list">
      {faqs.slice(0, limit).map((f, i) => (
        <details key={f.question}>
          <summary>
            <span className="faq-num">0{i + 1}</span>
            {f.question}
            <span className="plus">+</span>
          </summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

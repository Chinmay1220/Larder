"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is Larder really free?",
    a: "Yes — completely free to start. No credit card required. You get unlimited receipt scans, up to 100 pantry items, expiry alerts, and freshness bars at no cost.",
  },
  {
    q: "How does receipt scanning work?",
    a: "Take a photo of your receipt or upload a file. Claude AI reads every item and adds it to your pantry automatically — including estimated expiry dates based on the item type.",
  },
  {
    q: "What file types can I upload?",
    a: "Larder supports JPEG, PNG, PDF, Excel, Word, CSV, and plain text files. Pretty much any format your receipt might come in.",
  },
  {
    q: "How accurate is the expiry detection?",
    a: "Very accurate for common grocery items. Larder uses AI-trained expiry estimates based on item category — dairy, produce, pantry staples, etc. You can always adjust dates manually.",
  },
  {
    q: "Can I share my pantry with family?",
    a: "Multi-household sharing is coming in the Pro plan. For now, one account per pantry — but the Pro plan is in active development.",
  },
  {
    q: "Does it work without a receipt?",
    a: "Yes — you can add items manually at any time. The receipt scanner just makes it faster. You can also bulk-add items by typing a list.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-(--color-border) rounded-2xl overflow-hidden bg-(--color-card)">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-(--color-surface) transition-colors"
          >
            <span className="font-medium text-(--color-text-primary) text-sm pr-4">{faq.q}</span>
            <span className="text-(--color-text-faint) text-xl leading-none shrink-0">
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 pt-1 text-(--color-text-muted) text-sm leading-relaxed border-t border-(--color-border)">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

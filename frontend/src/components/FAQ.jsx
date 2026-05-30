import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="py-4">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-6 text-left"
              data-testid={`faq-item-${i}`}
            >
              <span className="text-[15px] font-medium text-zinc-900">{it.q}</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-500">
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            {isOpen && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">{it.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

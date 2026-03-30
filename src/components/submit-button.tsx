"use client";

import { useFormStatus } from "react-dom";

type Props = {
  text: string;
  pendingText?: string;
  className?: string;
};

export function SubmitButton({ text, pendingText = "提交中...", className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending}>
      {pending ? pendingText : text}
    </button>
  );
}

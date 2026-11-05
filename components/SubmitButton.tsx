"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = Omit<ComponentProps<"button">, "type"> & {
  /** Text shown while the form is submitting (defaults to the normal label). */
  pendingText?: string;
  /** Asks the user to confirm before the form is submitted. */
  confirm?: string;
};

/**
 * Submit button for server-action forms: shows a spinner on the button that was clicked
 * and disables every submit button in the same form until the action finishes.
 */
export function SubmitButton({ children, pendingText, confirm, onClick, disabled, name, value, className, ...rest }: Props) {
  const { pending, data } = useFormStatus();
  // In forms with several named submit buttons (e.g. intent=draft/publish) only the clicked one spins.
  const active = pending && (!name || data?.get(name) === value);

  return (
    <button
      {...rest}
      aria-busy={active || undefined}
      className={`${className ?? ""}${active ? " is-loading" : ""}`.trim() || undefined}
      disabled={disabled || pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      name={name}
      type="submit"
      value={value}
    >
      {active && <span aria-hidden="true" className="spinner" />}
      {active && pendingText ? pendingText : children}
    </button>
  );
}

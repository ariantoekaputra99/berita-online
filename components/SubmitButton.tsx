"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";

type Props = Omit<ComponentProps<"button">, "type"> & {
  /** Text shown while the form is submitting (defaults to the normal label). */
  pendingText?: string;
  /** Opens a confirmation modal with this message before the form is submitted. */
  confirm?: string;
};

/**
 * Submit button for server-action forms.
 * - Spinner on the clicked button; every submit button in the form is disabled until the action finishes.
 * - `confirm` shows a modal first; the form is only submitted once the user agrees.
 * - A blocking progress modal appears when the action takes more than a moment.
 */
export function SubmitButton({ children, pendingText, confirm, onClick, disabled, name, value, className, ...rest }: Props) {
  const { pending, data } = useFormStatus();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const approved = useRef(false);
  const [asking, setAsking] = useState(false);
  const [slow, setSlow] = useState(false);

  // In forms with several named submit buttons (e.g. intent=draft/publish) only the clicked one spins.
  const active = pending && (!name || data?.get(name) === value);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 600);
    return () => clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!asking) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setAsking(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [asking]);

  const label = typeof children === "string" ? children : "Lanjutkan";
  const danger = /danger/.test(className ?? "");

  return (
    <>
      <button
        {...rest}
        aria-busy={active || undefined}
        className={`${className ?? ""}${active ? " is-loading" : ""}`.trim() || undefined}
        disabled={disabled || pending}
        name={name}
        onClick={(event) => {
          if (confirm && !approved.current) {
            event.preventDefault();
            setAsking(true);
            return;
          }
          approved.current = false;
          onClick?.(event);
        }}
        ref={buttonRef}
        type="submit"
        value={value}
      >
        {active && <span aria-hidden="true" className="spinner" />}
        {active && pendingText ? pendingText : children}
      </button>

      {asking &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setAsking(false)}>
            <div aria-labelledby="confirm-title" aria-modal="true" className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
              <h2 id="confirm-title">Konfirmasi</h2>
              <p>{confirm}</p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setAsking(false)} type="button">
                  Batal
                </button>
                <button
                  autoFocus
                  className={danger ? "btn btn-danger" : "btn"}
                  onClick={() => {
                    approved.current = true;
                    setAsking(false);
                    buttonRef.current?.click(); // re-click so the form submits with this button's name/value
                  }}
                  type="button"
                >
                  {danger ? `Ya, ${label.toLowerCase()}` : label}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {slow &&
        createPortal(
          <div className="modal-backdrop modal-busy" role="alertdialog" aria-live="polite" aria-label="Sedang diproses">
            <div className="modal modal-loading">
              <span aria-hidden="true" className="spinner spinner-lg" />
              <p>{pendingText ?? "Sedang diproses…"}</p>
              <small>Mohon tunggu, jangan tutup halaman ini.</small>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

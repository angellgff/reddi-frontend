"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay(
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
) {
  return (
    <DialogPrimitive.Overlay
      {...props}
      className={
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" +
        (props.className ? ` ${props.className}` : "")
      }
    />
  );
}

export function DialogContent(
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
) {
  const { className, children, ...rest } = props;
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        {...rest}
        className={
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg duration-200 rounded-2xl" +
          (className ? ` ${className}` : "")
        }
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "flex flex-col space-y-1.5 text-center sm:text-left" +
        (props.className ? ` ${props.className}` : "")
      }
    />
  );
}

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={
        "text-lg font-semibold leading-none tracking-tight" +
        (props.className ? ` ${props.className}` : "")
      }
    />
  );
}

export function DialogDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>
) {
  return (
    <p
      {...props}
      className={
        "text-sm text-muted-foreground" +
        (props.className ? ` ${props.className}` : "")
      }
    />
  );
}

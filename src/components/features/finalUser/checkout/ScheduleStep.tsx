"use client";

import React, { useState } from "react";

export type ScheduleValue =
  | { mode: "now" }
  | { mode: "later"; date: string; time: string };

export default function ScheduleStep({
  value,
  onChange,
}: {
  value: ScheduleValue;
  onChange: (v: ScheduleValue) => void;
}) {
  const [local, setLocal] = useState<ScheduleValue>(value);

  const setMode = (mode: "now" | "later") => {
    const next =
      mode === "now"
        ? ({ mode: "now" } as ScheduleValue)
        : ({ mode: "later", date: "", time: "" } as ScheduleValue);
    setLocal(next);
    onChange(next);
  };

  const setDate = (date: string) => {
    const next: ScheduleValue = { ...(local as any), date, mode: "later" };
    setLocal(next);
    onChange(next);
  };
  const setTime = (time: string) => {
    const next: ScheduleValue = { ...(local as any), time, mode: "later" };
    setLocal(next);
    onChange(next);
  };

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="text-base font-semibold">Programación de entrega</div>
      <div className="text-xs text-gray-500 mt-1">
        Seleccione al menos dos opciones
      </div>

      <div className="mt-3 flex items-center gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="schedule"
            checked={local.mode === "now"}
            onChange={() => setMode("now")}
          />
          Ahora
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="schedule"
            checked={local.mode === "later"}
            onChange={() => setMode("later")}
          />
          Programar
        </label>
      </div>

      {local.mode === "later" && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="">Fecha</label>
          <div className="flex  items-center gap-2 border rounded-xl px-3 h-10">
            <input
              type="date"
              value={(local as any).date || ""}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-8 outline-none text-sm"
            />
          </div>
          <label className="">Hora</label>
          <div className="flex items-center gap-2 border rounded-xl px-3 h-10">
            <input
              type="time"
              value={(local as any).time || ""}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-8 outline-none text-sm"
            />
          </div>
        </div>
      )}
    </section>
  );
}

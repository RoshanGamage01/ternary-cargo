"use client";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { fmtDate, fromISO, toISO } from "@/lib/date";
import { cn } from "@/lib/utils";
/** Styled date picker: shows 26 Oct 2026, stores ISO yyyy-mm-dd. */
export function DateField({ value, onChange, name, label, className }: { value: string; onChange: (iso: string) => void; name?: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>
    <button type="button" aria-label={label} className={cn("flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm hover:bg-muted/50", !value && "text-muted-foreground", className)}>{value ? fmtDate(value) : "Pick a date"}<CalendarDays size={15} className="text-muted-foreground" /></button>
  </PopoverTrigger>{name && <input type="hidden" name={name} value={value} />}
    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" weekStartsOn={1} selected={fromISO(value)} defaultMonth={fromISO(value)} onSelect={d => { if (d) { onChange(toISO(d)); setOpen(false); } }} /></PopoverContent></Popover>;
}

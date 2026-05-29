"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ExpandableCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: () => void;
  addLabel?: string;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function ExpandableCard({
  id,
  title,
  subtitle,
  icon,
  badge,
  defaultOpen = false,
  open,
  onOpenChange,
  onAdd,
  addLabel,
  onEdit,
  editLabel,
  children,
  className,
}: ExpandableCardProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  const handleAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setOpen(true);
    onAdd?.();
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setOpen(true);
    onEdit?.();
  };

  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-border bg-surface overflow-hidden transition-shadow duration-300",
        isOpen && "shadow-md shadow-lifemed-500/5",
        className
      )}
    >
      <div className="relative flex items-center gap-2 p-5">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left transition-colors hover:text-lifemed-600 dark:hover:text-lifemed-400"
          aria-expanded={isOpen}
        >
          {icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lifemed-50 text-lifemed-600 dark:bg-lifemed-950/50 dark:text-lifemed-400">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{title}</h3>
              {badge}
            </div>
            {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown className="h-5 w-5 text-muted" />
          </motion.div>
        </button>
        {(onAdd || onEdit) && (
          <div className="relative z-20 flex shrink-0 items-center gap-1">
            {onAdd && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative z-20 h-8 w-8"
                aria-label={addLabel ?? editLabel}
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {onEdit && editLabel && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative z-20 h-8 w-8"
                aria-label={editLabel}
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

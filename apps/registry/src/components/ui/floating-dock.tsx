"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface DockItem {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const FloatingDock = ({
  items,
  activeItem,
  onItemChange,
  className,
}: {
  items: DockItem[];
  activeItem: string;
  onItemChange: (id: string) => void;
  className?: string;
}) => {
  return (
    <div className={cn("fixed bottom-8 inset-x-0 w-full flex justify-center z-50 pointer-events-none", className)}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="pointer-events-auto flex items-center justify-center gap-4 bg-black/80 backdrop-blur-md border border-neutral-800 px-6 py-4 rounded-full shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]"
      >
        {items.map((item) => (
          <DockItemComponent
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onClick={() => onItemChange(item.id)}
          />
        ))}
      </motion.div>
    </div>
  );
};

const DockItemComponent = ({
  item,
  isActive,
  onClick,
}: {
  item: DockItem;
  isActive: boolean;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.2, y: -8 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center p-3 rounded-xl transition-colors duration-200",
        isActive ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
      )}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap shadow-xl border border-neutral-700"
          >
            {item.name}
          </motion.div>
        )}
      </AnimatePresence>
      <item.icon className="w-5 h-5" />
      {isActive && (
        <motion.div
          layoutId="dock-indicator"
          className="absolute -bottom-1.5 w-1 h-1 bg-white rounded-full"
        />
      )}
    </motion.button>
  );
};

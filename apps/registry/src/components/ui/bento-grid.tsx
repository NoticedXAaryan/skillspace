import { cn } from "@/lib/utils";
import React from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500 shadow-none p-6 bg-black border border-white/10 hover:border-blue-500/30 hover:bg-neutral-900/50 justify-between flex flex-col space-y-4 overflow-hidden relative backdrop-blur-md",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-purple-500/10 opacity-0 group-hover/bento:opacity-100 transition duration-700 pointer-events-none" />
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-500 relative z-10">
        <div className="mb-4">{icon}</div>
        <div className="font-sans font-bold text-neutral-200 mb-2 mt-2 text-lg">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-400 text-sm leading-relaxed max-w-xs">
          {description}
        </div>
      </div>
    </div>
  );
};

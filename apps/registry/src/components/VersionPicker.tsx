"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Version {
  version: string;
  isLatest: boolean;
}

interface VersionPickerProps {
  pkgName: string;
  currentVersion: string;
  versions: Version[];
}

export default function VersionPicker({ pkgName, currentVersion, versions }: VersionPickerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (version: string) => {
    setIsOpen(false);
    router.push(`/packages/${pkgName}/${version}`);
  };

  if (!versions || versions.length === 0) return null;

  return (
    <div className="versionPickerContainer" ref={dropdownRef}>
      <button 
        className="versionPickerBtn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="versionLabel">v{currentVersion}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="versionPickerMenu" role="listbox">
          <div className="versionPickerHeader">Versions</div>
          <div className="versionList">
            {versions.map((v) => (
              <button
                key={v.version}
                className={`versionOption ${v.version === currentVersion ? 'selected' : ''}`}
                onClick={() => handleSelect(v.version)}
                role="option"
                aria-selected={v.version === currentVersion}
              >
                <div className="versionText">
                  {v.version}
                  {v.isLatest && <span className="latestBadge">latest</span>}
                </div>
                {v.version === currentVersion && <Check size={16} className="checkIcon" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { TABS } from "../constants";
import type { PageTab } from "../types";

interface CustomMerchTabBarProps {
  pageTab: PageTab;
  onTabChange: (tab: PageTab) => void;
}

export default function CustomMerchTabBar({
  pageTab,
  onTabChange,
}: CustomMerchTabBarProps) {
  return (
    <div className="inline-flex gap-1 p-1 bg-admin-primary/5 rounded-lg mb-8">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
            pageTab === tab.id
              ? "bg-admin-primary text-white"
              : "bg-transparent text-admin-primary/70 hover:bg-admin-primary/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

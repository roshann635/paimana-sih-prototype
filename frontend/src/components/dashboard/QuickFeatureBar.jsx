import React from "react";
import {
  PieChart,
  DollarSign,
  Calendar,
  BarChart2,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    path: "/analytics/portfolio",
    title: "RISK ANALYTICS",
    desc: "Deep dive into risk patterns & trends",
    icon: PieChart,
    color: "#F59E0B",
    bgColor: "bg-[#F59E0B]/10",
    borderColor: "border-[#F59E0B]/30",
  },
  {
    path: "/analytics/ministries",
    title: "COST RISK",
    desc: "Analyze cost overrun probabilities",
    icon: DollarSign,
    color: "#00E5FF",
    bgColor: "bg-[#00E5FF]/10",
    borderColor: "border-[#00E5FF]/30",
  },
  {
    path: "/analytics/sectors",
    title: "SCHEDULE RISK",
    desc: "Track schedule delays & critical paths",
    icon: Calendar,
    color: "#10B981",
    bgColor: "bg-[#10B981]/10",
    borderColor: "border-[#10B981]/30",
  },
  {
    path: "/analytics/benchmarking",
    title: "BENCHMARKING",
    desc: "Compare with peers & sector standards",
    icon: BarChart2,
    color: "#00E5FF",
    bgColor: "bg-[#00E5FF]/10",
    borderColor: "border-[#00E5FF]/30",
  },
  {
    path: "/intelligence/risk-diagnosis",
    title: "INTERVENTIONS",
    desc: "Track actions & outcomes",
    icon: TrendingUp,
    color: "#F59E0B",
    bgColor: "bg-[#F59E0B]/10",
    borderColor: "border-[#F59E0B]/30",
  },
  {
    path: "/assistant",
    title: "AI ASSISTANT",
    desc: "Ask questions. Get intelligence.",
    icon: Sparkles,
    color: "#14B8A6",
    bgColor: "bg-[#14B8A6]/10",
    borderColor: "border-[#14B8A6]/30",
    isAssistant: true,
  },
];

export default function QuickFeatureBar({ onNavigate, onOpenAssistant }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {FEATURES.map((feat) => {
        const Icon = feat.icon;

        return (
          <button
            key={feat.title}
            onClick={() => {
              if (feat.isAssistant && onOpenAssistant) {
                onOpenAssistant();
              } else if (onNavigate) {
                onNavigate(feat.path);
              }
            }}
            className="bg-[#0D1E30] hover:bg-[#11263C] border border-[#16324A] hover:border-[#1E4260] rounded-xl p-3.5 shadow-command-card text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2">
              <div
                className={`w-7 h-7 rounded-lg ${feat.bgColor} border ${feat.borderColor} flex items-center justify-center`}
                style={{ color: feat.color }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div>
              <div className="text-[11px] font-mono font-bold text-white tracking-wider uppercase truncate">
                {feat.title}
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2 leading-tight">
                {feat.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onChange, className = '' }: TabBarProps) {
  return (
    <div className={`border-b border-rumi-primary-light/20 ${className}`}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors duration-200
              ${
                activeTab === tab.key
                  ? 'text-rumi-primary'
                  : 'text-rumi-text/50 hover:text-rumi-text/70'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      activeTab === tab.key
                        ? 'bg-rumi-primary/10 text-rumi-primary'
                        : 'bg-gray-100 text-rumi-text/40'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {/* Animated underline */}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rumi-primary rounded-full animate-fade-in" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabBar;

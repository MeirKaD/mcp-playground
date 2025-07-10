'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Database, Globe, Search, ShoppingCart, Users, Camera, Map, Code } from 'lucide-react';

interface MCPStatus {
  success: boolean;
  toolCount: number;
  toolNames: string[];
  message?: string;
  error?: string;
}

export default function MCPToolsStatus() {
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/test-mcp');
        const data = await response.json();
        setStatus(data);
      } catch {
        setStatus({
          success: false,
          toolCount: 0,
          toolNames: [],
          error: 'Failed to connect to MCP server'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  const getToolIcon = (toolName: string) => {
    if (toolName.includes('search')) return <Search className="w-4 h-4" />;
    if (toolName.includes('amazon') || toolName.includes('walmart') || toolName.includes('shopping')) return <ShoppingCart className="w-4 h-4" />;
    if (toolName.includes('linkedin') || toolName.includes('facebook') || toolName.includes('instagram')) return <Users className="w-4 h-4" />;
    if (toolName.includes('maps')) return <Map className="w-4 h-4" />;
    if (toolName.includes('screenshot') || toolName.includes('image')) return <Camera className="w-4 h-4" />;
    if (toolName.includes('browser') || toolName.includes('navigate')) return <Code className="w-4 h-4" />;
    if (toolName.includes('scrape') || toolName.includes('web_data')) return <Database className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const getToolCategory = (toolName: string) => {
    if (toolName.includes('search_engine')) return 'Search';
    if (toolName.includes('scrape')) return 'Scraping';
    if (toolName.includes('web_data_amazon') || toolName.includes('web_data_walmart') || toolName.includes('web_data_ebay')) return 'E-commerce';
    if (toolName.includes('web_data_linkedin')) return 'Professional';
    if (toolName.includes('web_data_instagram') || toolName.includes('web_data_facebook') || toolName.includes('web_data_tiktok')) return 'Social Media';
    if (toolName.includes('scraping_browser')) return 'Browser Automation';
    if (toolName.includes('web_data_google')) return 'Google Services';
    if (toolName.includes('web_data_youtube')) return 'Video';
    return 'General';
  };

  const groupedTools = status?.toolNames.reduce((acc, tool) => {
    const category = getToolCategory(tool);
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, string[]>) || {};

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Connecting to MCP...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {status?.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="text-white font-medium">
                {status?.success ? 'MCP Connected' : 'MCP Error'}
              </div>
              <div className="text-xs text-gray-400">
                {status?.success ? `${status.toolCount} tools available` : status?.error}
              </div>
            </div>
          </div>
        </button>

        {isExpanded && status?.success && (
          <div className="border-t border-white/10 max-h-80 overflow-y-auto">
            <div className="p-4 space-y-4">
              {Object.entries(groupedTools).map(([category, tools]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">{category}</h4>
                  <div className="space-y-1">
                    {tools.slice(0, 3).map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded px-2 py-1"
                      >
                        {getToolIcon(tool)}
                        <span className="truncate">{tool.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    {tools.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{tools.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
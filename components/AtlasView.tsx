import React, { useState, useMemo, useEffect } from 'react';
import { Instability } from '../types';
import InstabilityCard from './InstabilityCard';
import DetailModal from './DetailModal';
import { generateInstabilityData } from '../services/geminiService';
import { loadInstabilities, loadGeneratedInstabilities, saveGeneratedInstability } from '../services/dataService';
import { useSettings } from '../contexts/SettingsContext';

const PAGE_SIZE = 9;

type SortOption = 'newest' | 'name' | 'domain';

const AtlasView: React.FC = () => {
  const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
  
  // Data State
  const [staticInstabilities, setStaticInstabilities] = useState<Instability[]>([]);
  const [selectedInstability, setSelectedInstability] = useState<Instability | null>(null);
  const [generatedInstabilities, setGeneratedInstabilities] = useState<Instability[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Generation State
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Initial Data Load
  useEffect(() => {
    let mounted = true;
    const initData = async () => {
      setIsDataLoading(true);
      
      // Load static data (async)
      const staticDataPromise = loadInstabilities();
      // Load local persisted data (sync)
      const localData = loadGeneratedInstabilities();
      
      const staticData = await staticDataPromise;

      if (mounted) {
        setStaticInstabilities(staticData);
        setGeneratedInstabilities(localData);
        setIsDataLoading(false);
      }
    };
    initData();
    return () => { mounted = false; };
  }, []);

  // Combine Data
  const allInstabilities = useMemo(() => {
    return [...generatedInstabilities, ...staticInstabilities];
  }, [generatedInstabilities, staticInstabilities]);

  // Extract Unique Domains
  const uniqueDomains = useMemo(() => {
    const domains = new Set(allInstabilities.map(i => i.domain));
    return ['All', ...Array.from(domains).sort()];
  }, [allInstabilities]);

  // Filter and Sort Logic
  const processedData = useMemo(() => {
    let data = allInstabilities.filter(item => {
      const matchesSearch = 
        item.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = selectedDomain === 'All' || item.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    });

    data.sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.canonicalName.localeCompare(b.canonicalName);
        case 'domain':
          return a.domain.localeCompare(b.domain);
        case 'newest':
        default:
          // Generated items (which are usually prepended to allInstabilities) come first in the array naturally,
          // but we want to ensure specific ordering logic if needed.
          // Here we assume generated items have 'GEN-' prefix ids.
          const aIsGen = a.id.startsWith('GEN-');
          const bIsGen = b.id.startsWith('GEN-');
          if (aIsGen && !bIsGen) return -1;
          if (!aIsGen && bIsGen) return 1;
          return 0;
      }
    });

    return data;
  }, [allInstabilities, searchQuery, selectedDomain, sortOrder]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedDomain, sortOrder]);

  const visibleData = processedData.slice(0, visibleCount);
  const hasMore = visibleCount < processedData.length;

  const handleSelect = (instability: Instability) => {
    setSelectedInstability(instability);
  };

  const handleClose = () => {
    setSelectedInstability(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!topicInput.trim()) return;

      setIsGenerating(true);
      setGenerationError(null);

      try {
          const newInstability = await generateInstabilityData(topicInput, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
          
          // Save to local storage
          saveGeneratedInstability(newInstability);
          
          setGeneratedInstabilities(prev => [newInstability, ...prev]);
          setTopicInput('');
          // Reset filters to show the new item immediately
          setSearchQuery('');
          setSelectedDomain('All');
          setSortOrder('newest');
      } catch (error) {
          setGenerationError("Failed to synthesize instability. Please check your AI connection.");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <>
      {/* --- Generation Bar --- */}
      <div className="mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleGenerate} className="relative group z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center">
                  <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="Enter a topic (e.g., 'Stock Market', 'Fusion Reactor')..."
                      className="block w-full p-4 pl-5 text-sm bg-slate-800 border border-slate-700 rounded-l-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                  />
                  <button
                      type="submit"
                      disabled={isGenerating || !topicInput.trim()}
                      className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold rounded-r-lg hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center"
                  >
                      {isGenerating ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Synthesizing
                           </>
                      ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Synthesize
                          </>
                      )}
                  </button>
              </div>
          </form>
          {generationError && (
              <p className="mt-2 text-rose-400 text-sm text-center">{generationError}</p>
          )}
      </div>

      {/* --- Filter & Sort Controls --- */}
      <div className="mb-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center backdrop-blur-sm">
        <div className="w-full md:w-auto flex-grow flex gap-4">
             {/* Search */}
             <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors"
                    placeholder="Search instabilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="w-full md:w-auto flex gap-4 overflow-x-auto pb-1 md:pb-0">
            {/* Domain Filter */}
            <div className="relative min-w-[140px]">
                <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-slate-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md bg-slate-900/50 text-slate-200"
                >
                    {uniqueDomains.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Sort Order */}
            <div className="relative min-w-[140px]">
                 <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOption)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-slate-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md bg-slate-900/50 text-slate-200"
                >
                    <option value="newest">Sort: Newest</option>
                    <option value="name">Sort: A-Z</option>
                    <option value="domain">Sort: Domain</option>
                </select>
            </div>
        </div>
      </div>

      {/* --- Results Grid --- */}
      {isDataLoading ? (
         <div className="flex flex-col items-center justify-center py-24 text-slate-500">
             <svg className="animate-spin h-12 w-12 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             <p className="text-lg font-medium text-slate-400">Loading Atlas Data...</p>
             <p className="text-sm">Fetching from external repository</p>
         </div>
      ) : processedData.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
              <p className="text-lg">No instabilities found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedDomain('All'); }}
                className="mt-4 text-cyan-400 hover:underline"
              >
                  Clear filters
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleData.map((instability) => (
            <InstabilityCard 
                key={instability.id} 
                instability={instability} 
                onSelect={handleSelect}
            />
            ))}
        </div>
      )}

      {/* --- Load More --- */}
      {!isDataLoading && hasMore && (
          <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-600"
              >
                  Load More Instabilities ({processedData.length - visibleCount} remaining)
              </button>
          </div>
      )}

      {selectedInstability && (
        <DetailModal 
          instability={selectedInstability} 
          onClose={handleClose} 
        />
      )}
    </>
  );
};

export default AtlasView;
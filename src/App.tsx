import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  School, 
  University, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check,
  RefreshCw,
  Info
} from 'lucide-react';

type EssayLevel = 'High School' | 'College' | 'University' | 'General' | null;

export default function App() {
  const [level, setLevel] = useState<EssayLevel>(null);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [wordCount, setWordCount] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [essayResult, setEssayResult] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addHumanTone, setAddHumanTone] = useState(true);
  const [history, setHistory] = useState<{title: string, content: string, date: string, level: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('essay_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('essay_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (level) {
      fetchSuggestions(level);
    }
  }, [level]);

  const fetchSuggestions = async (selectedLevel: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedLevel }),
      });
      const data = await response.json();
      setSuggestions(data.topics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerate = async () => {
    if (!level || !title) return;
    setIsGenerating(true);
    setEssayResult('');
    setErrorMessage('');
    try {
      const response = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, title, instructions, wordCount, addHumanTone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate essay');
      }

      setEssayResult(data.essay);
      
      // Save to history
      const newEntry = {
        title,
        content: data.essay,
        date: new Date().toLocaleString(),
        level: level as string
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 50));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(essayResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAF9F6] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#E2DED0] touch-pan-y">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-10 py-4 md:py-6 border-b border-[#E0DED7] bg-[#FAF9F6] sticky top-0 z-40 shrink-0">
        <div className="flex flex-col">
          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C8A82]">The Craft of Writing</span>
          <h1 className="text-xl md:text-3xl font-display italic tracking-tight cursor-pointer" onClick={() => { setEssayResult(''); setErrorMessage(''); setShowHistory(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Draftsmith</h1>
        </div>
        <nav className="flex gap-4 md:gap-8 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold">
          <button 
            onClick={() => { setShowHistory(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`${!showHistory ? 'border-b border-black' : 'text-[#8C8A82]'} pb-1 transition-colors`}
          >
            Composer
          </button>
          <button 
            onClick={() => { setShowHistory(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`${showHistory ? 'border-b border-black text-black' : 'text-[#8C8A82]'} hover:text-black transition-colors pb-1`}
          >
            History
          </button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col md:flex-row md:overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`w-full md:w-[380px] lg:w-[420px] border-b md:border-b-0 md:border-r border-[#E0DED7] flex flex-col p-6 md:p-10 bg-[#F4F2EE] shrink-0 md:overflow-y-auto scrollbar-hide ${essayResult || isGenerating || showHistory ? 'hidden md:flex' : 'flex'}`}>
          <div className="mb-8 md:mb-10">
            <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold mb-4 text-[#8C8A82]">01. Academic Level</h2>
            <div className="grid grid-cols-2 gap-2">
              {['University', 'College', 'High School', 'General'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l as EssayLevel)}
                  className={`px-3 py-3 md:px-4 md:py-3 text-[10px] md:text-[11px] uppercase tracking-widest border transition-all duration-200 active:scale-95
                    ${level === l 
                      ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                      : 'border-[#D1CFCA] bg-white hover:border-black text-[#1A1A1A]'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 md:mb-10 md:flex-1">
            <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold mb-4 text-[#8C8A82]">02. The Brief</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#8C8A82] mb-2 block font-bold">Title / Topic</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-[#D1CFCA] pb-2 text-base md:text-sm font-serif focus:outline-none focus:border-black transition-colors rounded-none"
                  placeholder="The impact of..."
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#8C8A82] mb-2 block font-bold">Contextual Notes</label>
                <textarea 
                  className="w-full h-28 md:h-32 bg-transparent border border-[#D1CFCA] p-4 text-base md:text-sm font-serif focus:outline-none focus:border-black resize-none rounded-none"
                  placeholder="Provide context, thesis points, or specific requirements..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
              
              {suggestions.length > 0 && (
                <div className="opacity-80 md:opacity-60 hover:opacity-100 transition-opacity">
                  <h3 className="text-[10px] uppercase tracking-widest text-[#8C8A82] mb-3 flex items-center justify-between font-bold">
                    Inspiration
                    <button onClick={() => fetchSuggestions(level!)} className="hover:text-black p-1">
                      <RefreshCw className={`w-3 h-3 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
                    </button>
                  </h3>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setTitle(s)}
                        className="text-[11px] md:text-[12px] font-serif italic text-[#8C8A82] hover:text-black block text-left leading-snug w-full py-1.5 border-b border-[#E0DED7]/30 last:border-0"
                      >
                        — {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold mb-4 text-[#8C8A82]">03. Constraints</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold">Word Count Target</span>
              <span className="font-serif italic text-sm">{wordCount.toLocaleString()} words</span>
            </div>
            <input 
              type="range" 
              min={250}
              max={2500}
              step={50}
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value))}
              className="w-full h-8 accent-black mb-6 cursor-pointer"
            />
            
            <button 
              onClick={() => setAddHumanTone(!addHumanTone)}
              className="flex items-center gap-3 w-full text-left group p-2 -ml-2"
            >
              <div className={`w-5 h-5 border border-black transition-colors flex shrink-0 ${addHumanTone ? 'bg-black' : 'bg-transparent'}`}>
              </div>
              <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold group-hover:text-black transition-colors">Add human tone (0% AI)</span>
            </button>
          </div>

          <button 
            disabled={isGenerating || !level || !title}
            onClick={() => { setShowHistory(false); handleGenerate(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.3em] font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98]"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : null}
            {isGenerating ? 'Intelligence Drafting...' : 'Generate Essay'}
          </button>
        </aside>

        {/* Viewport */}
        <section className={`flex-1 flex flex-col p-6 md:p-12 lg:p-16 bg-white relative md:overflow-y-auto ${!essayResult && !isGenerating && !showHistory && !errorMessage ? 'hidden md:flex' : 'flex'}`}>
          {(essayResult || errorMessage) && !showHistory && (
            <button 
              onClick={() => { setEssayResult(''); setErrorMessage(''); }}
              className="md:hidden self-start mb-6 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 text-[#8C8A82]"
            >
              ← Back to Composer
            </button>
          )}

          <AnimatePresence mode="wait">
            {showHistory ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-[720px] mx-auto w-full pt-4 md:pt-0"
              >
                <div className="mb-8 md:mb-12 border-b border-[#E0DED7] pb-6 px-2">
                  <h2 className="text-2xl md:text-3xl font-display italic">Manuscript History</h2>
                  <p className="text-[10px] text-[#8C8A82] mt-2 uppercase tracking-widest">Your previously drafted works</p>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-[#E0DED7] rounded-sm mx-2">
                    <p className="font-serif italic text-[#8C8A82]">No scripts found in the archives.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:gap-6 px-2">
                    {history.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="group bg-[#F4F2EE] p-6 md:p-8 border border-[#E0DED7] hover:border-black active:border-black transition-all cursor-pointer shadow-sm active:shadow-none"
                        onClick={() => {
                          setTitle(item.title);
                          setEssayResult(item.content);
                          setLevel(item.level as EssayLevel);
                          setShowHistory(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold text-[#8C8A82]">{item.date}</span>
                          <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold bg-white px-2 py-1 border border-[#E0DED7]">{item.level}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-serif mb-4 group-hover:italic transition-all leading-tight">{item.title}</h3>
                        <p className="text-sm text-[#8C8A82] line-clamp-2 md:line-clamp-3 font-serif italic mb-6 leading-relaxed">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold group-hover:text-black transition-colors">
                          Reload Manuscript <ArrowRight className="w-3 h-3"/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20"
              >
                <div className="w-16 md:w-24 h-[1px] bg-black animate-[pulse_2s_infinite] mb-4"></div>
                <div className="space-y-4">
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-bold text-[#1A1A1A] block">Intelligence Drafting</span>
                  <p className="font-serif italic text-xs md:text-sm text-[#8C8A82] max-w-xs mx-auto animate-pulse">
                    Synthesizing complex arguments and calibrating human nuance...
                  </p>
                </div>
              </motion.div>
            ) : errorMessage ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10 md:py-20 px-4"
              >
                <div className="w-12 h-[1px] bg-red-500 mb-4"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-500">System Interruption</span>
                <p className="font-serif italic text-sm text-[#8C8A82] max-w-sm">
                  {errorMessage}
                </p>
                <button 
                  onClick={handleGenerate}
                  className="text-[10px] uppercase tracking-widest font-bold border border-black px-10 py-4 hover:bg-black hover:text-white active:scale-95 transition-all shadow-lg bg-white"
                >
                  Retry Drafting Attempt
                </button>
              </motion.div>
            ) : essayResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[680px] mx-auto w-full pb-20"
              >
                <div className="mb-10 md:mb-16 text-center">
                  <span className="text-[10px] md:text-xs font-serif italic text-[#8C8A82]">Manuscript Draft</span>
                  <h3 className="text-2xl md:text-4xl font-serif leading-tight mt-4 md:mt-6 text-[#1A1A1A] max-w-[500px] mx-auto">{title}</h3>
                  <div className="h-[1px] w-12 bg-black mx-auto mt-6 md:mt-8 opacity-30"></div>
                </div>

                <div className="flex justify-end mb-8 sticky top-0 bg-white/80 py-2 backdrop-blur-sm z-20">
                  <button 
                    onClick={copyToClipboard}
                    className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:opacity-60 transition-opacity"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied to Clipboard' : 'Copy Text'}
                  </button>
                </div>

                <article className="font-serif text-[18px] leading-[1.9] text-[#333] selection:bg-[#E2DED0]">
                  <div className="whitespace-pre-wrap">
                    {essayResult}
                  </div>
                </article>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="p-8 border border-dashed border-[#E0DED7] rounded-sm max-w-sm">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C8A82] mb-4 block">Ready to Write</span>
                  <p className="font-serif italic text-sm text-[#8C8A82]">
                    Select your level and provide a title to begin crafting your manuscript.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestion Tooltip (only when visible) */}
          {suggestions.length > 0 && !essayResult && !isGenerating && (
            <div className="absolute bottom-10 right-10 w-72 bg-[#F4F2EE] border border-[#E0DED7] p-8 shadow-2xl hidden lg:block">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6 text-[#8C8A82]">Inspiration Archives</h4>
              <ul className="text-xs flex flex-col gap-4 font-serif italic text-[#8C8A82]">
                {suggestions.slice(3, 6).map((topic, i) => (
                  <li 
                    key={i} 
                    onClick={() => setTitle(topic)}
                    className="hover:text-black cursor-pointer transition-colors border-l border-transparent hover:border-black pl-3"
                  >
                    — {topic}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-4 border-t border-[#E0DED7]">
                <p className="text-[9px] uppercase tracking-widest text-[#8C8A82] leading-relaxed">
                  Generated based on academic trends and {level || 'general'} standards.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer bar */}
      <footer className="bg-black text-white h-10 flex items-center px-10 justify-between text-[9px] uppercase tracking-[0.2em] font-bold">
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></span>
            Status: {isGenerating ? 'Drafting' : 'System Ready'}
          </span>
          <span className="text-white/40 hidden sm:inline">User: {level || 'Unspecified'}</span>
        </div>
        <div className="flex gap-8">
          <span className="text-[#D4AF37]">Verified Plagiarism Free</span>
          <span className="hidden sm:inline">Format: Academic Standard</span>
        </div>
      </footer>
    </div>
  );
}



import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { extractTextFromFile, ACCEPTED_EXTENSIONS } from '../readFile';
import { highlightTextHtml } from '../utils/highlight';
import { runLocalAnalysis } from '../utils/analyzeLocal';
import { generatePdfReport } from '../utils/report';
import clsx from 'clsx';

const SAMPLE_TEXT = `Artificial intelligence has transformed numerous industries over the past decade. From healthcare diagnostics to autonomous vehicles, machine learning models continue to push the boundaries of what is possible. However, it is important to note that these systems still face significant challenges related to bias, interpretability, and generalization. Researchers are actively working to address these limitations through novel architectures and more diverse training datasets.`;

export default function Analyze() {
  const fileRef = useRef(null);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('highlighted'); // highlighted | original

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const sentenceCount = text.trim()
    ? text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;

  const processFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setFileError('');
    setError('');
    setLoadingFile(true);
    try {
      const { text: extracted, warning } = await extractTextFromFile(file);
      if (warning) {
        setFileError(warning);
        setText(extracted || '');
      } else {
        setText(extracted);
      }
    } catch (err) {
      setFileError(err.message || 'Failed to read this file');
      setText('');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please upload a document or paste text first.');
      return;
    }
    if (text.trim().length < 20) {
      setError('Text is too short for reliable analysis. Add more content.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      // Simulate a short delay for better UX
      await new Promise((r) => setTimeout(r, 600));
      const data = runLocalAnalysis({
        text,
        fileName: fileName || undefined,
        keywords,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAll = () => {
    setText('');
    setFileName('');
    setKeywords('');
    setResult(null);
    setError('');
    setFileError('');
  };

  const copyResults = () => {
    if (!result) return;
    const summary = `AI Detection Report
Document: ${result.fileName}
Date: ${new Date(result.createdAt).toLocaleString()}
AI Probability: ${result.aiScore}%
Human Probability: ${result.humanScore}%
Word Count: ${result.wordCount}
Source: ${result.source}
Summary: ${result.summary}
${result.modelReasoning ? `Reasoning: ${result.modelReasoning}` : ''}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    if (!result) return;
    generatePdfReport(result, text);
  };

  const classification =
    result?.aiScore >= 65 ? 'ai' : result?.humanScore >= 65 ? 'human' : 'mixed';

  const pieData = result
    ? [
        { name: 'AI', value: result.aiScore },
        { name: 'Human', value: result.humanScore },
      ]
    : [];

  return (
    <div className="h-full animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 h-full">
        {/* ========== LEFT: INPUT ========== */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="card p-5">
            <h2 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Document Input
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Upload a file or paste text · PDF, DOCX, TXT, MD, CSV, JSON, HTML
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !loadingFile && fileRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl py-8 px-4 text-center cursor-pointer transition-all duration-200',
                dragOver
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                  : 'border-[var(--border-strong)] hover:border-[var(--color-primary-400)] hover:bg-[var(--bg-muted)]'
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="hidden"
                onChange={(e) => processFile(e.target.files?.[0])}
              />
              {loadingFile ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-primary-500)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Extracting text…
                  </p>
                </div>
              ) : fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} style={{ color: 'var(--color-primary-500)' }} />
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {fileName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Click or drop another file to replace
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName('');
                      setText('');
                      setFileError('');
                    }}
                    className="p-1 rounded-lg hover:bg-[var(--bg-muted)]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Max recommended ~100k characters
                  </p>
                </>
              )}
            </div>

            {fileError && (
              <div
                className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--warning) 12%, transparent)',
                  color: 'var(--warning)',
                }}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {fileError}
              </div>
            )}
          </div>

          {/* Text area */}
          <div className="card p-5 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Text Content
              </h2>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
                <span>{sentenceCount} sentences</span>
              </div>
            </div>

            <textarea
              className="input min-h-[220px] resize-y font-mono text-[13px] leading-relaxed"
              placeholder="Paste or type your document text here…"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
                if (fileName) setFileName('');
              }}
            />

            <div className="mt-3">
              <label className="label">Keyword search (optional)</label>
              <input
                className="input"
                placeholder="e.g. furthermore, moreover, in conclusion"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                className="btn-primary flex-1 sm:flex-none"
                onClick={handleAnalyze}
                disabled={analyzing || !text.trim()}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Analyze Content
                  </>
                )}
              </button>
              <button className="btn-secondary" onClick={() => setText(SAMPLE_TEXT)} disabled={analyzing}>
                Sample
              </button>
              <button className="btn-ghost" onClick={clearAll} disabled={analyzing}>
                <Trash2 size={16} /> Clear
              </button>
            </div>

            {error && (
              <div
                className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--danger) 12%, transparent)',
                  color: 'var(--danger)',
                }}
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT: RESULTS ========== */}
        <div className="space-y-4">
          {!result && !analyzing && (
            <div className="card p-8 h-full min-h-[420px] flex flex-col items-center justify-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200))',
                }}
              >
                <Sparkles size={28} style={{ color: 'var(--color-primary-600)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Ready to Analyze
              </h3>
              <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                Upload a document or paste text, then click Analyze to get AI vs Human probability
                scores with detailed insights.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left w-full max-w-sm">
                {[
                  'Sentence structure analysis',
                  'Vocabulary diversity',
                  'Transition phrase detection',
                  'Stylometric features',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--color-primary-500)' }} />
                    {f}
                  </div>
                ))}
              </div>
              <div
                className="mt-6 flex items-start gap-2 px-3 py-2 rounded-lg text-xs max-w-sm text-left"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary-500) 10%, transparent)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary-500)' }} />
                Detection is probabilistic. Results are analytical signals, not proof of authorship.
              </div>
            </div>
          )}

          {analyzing && (
            <div className="card p-8 h-full min-h-[420px] flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin mb-4" style={{ color: 'var(--color-primary-500)' }} />
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Analyzing content…
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Running AI model + stylometric heuristics
              </p>
            </div>
          )}

          {result && !analyzing && (
            <div className="space-y-4 animate-slide-up">
              {/* Score cards */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span
                      className={clsx(
                        'badge',
                        classification === 'ai' && 'badge-ai',
                        classification === 'human' && 'badge-human',
                        classification === 'mixed' && 'badge-mixed'
                      )}
                    >
                      {classification === 'ai'
                        ? 'Likely AI-generated'
                        : classification === 'human'
                        ? 'Likely Human-written'
                        : 'Mixed / Uncertain'}
                    </span>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      {result.fileName} · {result.wordCount} words ·{' '}
                      {result.source === 'ai_model' ? 'AI + Heuristic' : 'Heuristic only'}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="btn-ghost p-2" onClick={copyResults} title="Copy summary">
                      {copied ? <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                    </button>
                    <button className="btn-ghost p-2" onClick={downloadPdf} title="Download PDF">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-36 h-36 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-3">
                    <ScoreBar label="AI Probability" value={result.aiScore} color="var(--danger)" />
                    <ScoreBar label="Human Probability" value={result.humanScore} color="var(--success)" />
                  </div>
                </div>

                <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {result.summary}
                </p>
                {result.modelReasoning && (
                  <div
                    className="mt-3 px-3 py-2.5 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
                  >
                    <span className="font-medium">Model insight: </span>
                    {result.modelReasoning}
                  </div>
                )}
              </div>

              {/* Highlighted text */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Text Analysis
                  </h3>
                  <div className="flex gap-1 p-0.5 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    {['highlighted', 'original'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        className={clsx(
                          'px-3 py-1 rounded-md text-xs font-medium transition',
                          viewMode === m
                            ? 'bg-[var(--bg-card)] shadow-sm'
                            : 'hover:opacity-80'
                        )}
                        style={{
                          color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {m === 'highlighted' ? 'Highlighted' : 'Original'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, #3b82f6 40%, transparent)', borderBottom: '2px solid #3b82f6' }} />
                    AI-like patterns
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, #10b981 35%, transparent)', borderBottom: '2px solid #10b981' }} />
                    Human-like variation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 35%, transparent)', borderBottom: '2px solid #f59e0b' }} />
                    Ambiguous
                  </span>
                </div>

                <div
                  className="max-h-72 overflow-y-auto p-4 rounded-xl text-sm leading-relaxed font-mono"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {viewMode === 'highlighted' ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: highlightTextHtml(text),
                      }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-[13px]">{text}</pre>
                  )}
                </div>
              </div>

              {/* Keywords & disclaimer */}
              {result.keywordHits?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Keyword Insights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordHits.map((kh) => (
                      <span
                        key={kh.keyword}
                        className="badge"
                        style={{
                          backgroundColor: 'var(--bg-muted)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {kh.keyword}: {kh.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--warning) 10%, transparent)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Info size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                <div>
                  <strong>Limitations:</strong> AI text detection is probabilistic and cannot reliably
                  establish authorship. Short, heavily edited, translated, or mixed-origin texts may
                  produce false positives or false negatives. Treat results as analytical signals only.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

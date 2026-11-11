/**
 * Fully client-side AI content detection.
 * Uses the stylometric heuristic only (no external API / backend).
 */

import { heuristicScore } from './heuristic';
import { saveAnalysis, getSessionUser } from './storage';
import { highlightTextHtml } from './highlight';

function buildSummary(ai) {
  if (ai >= 65) return 'This document shows strong signs of AI-generated content.';
  if (ai <= 35) return 'This document appears mostly human-written.';
  return 'Mixed signals — the text may be a blend of AI and human writing.';
}

function buildSnippet(text, max = 280) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trim() + '…';
}

/**
 * Run local analysis and optionally persist it for the logged-in user.
 * Returns a shape compatible with the existing Analyze UI.
 */
export function runLocalAnalysis({ text, fileName = '', keywords = '' }) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new Error('No text provided to analyze');
  }
  if (trimmed.length < 20) {
    throw new Error('Text is too short for reliable analysis. Add more content.');
  }

  const h = heuristicScore(trimmed);

  let aiScore = h.ai;
  if (keywords?.trim()) {
    const kws = keywords
      .toLowerCase()
      .split(/[,;\s]+/)
      .filter(Boolean);
    const lower = trimmed.toLowerCase();
    let hits = 0;
    kws.forEach((k) => {
      if (k.length > 2 && lower.includes(k)) hits++;
    });
    if (hits >= 3) aiScore = Math.min(95, aiScore + 4);
  }

  const humanScore = 100 - aiScore;
  const summary = buildSummary(aiScore);
  const highlightedHtml = highlightTextHtml(trimmed);

  const result = {
    aiScore,
    humanScore,
    aiProbability: aiScore,
    humanProbability: humanScore,
    classification:
      aiScore >= 65 ? 'ai' : humanScore >= 65 ? 'human' : 'mixed',
    wordCount: h.wordCount,
    avgSentenceLength: h.avgSentenceLength,
    source: 'heuristic',
    summary,
    modelReasoning:
      'Analysis performed entirely in your browser using stylometric signals (phrase patterns, sentence rhythm, punctuation, and structure). No data left your device.',
    snippet: buildSnippet(trimmed),
    fileName: fileName || null,
    keywords: keywords || null,
    aiHits: h.aiHits,
    humanHits: h.humanHits,
    punctuationScore: h.punctuationScore,
    structureScore: h.structureScore,
    highlightedHtml,
    textPreview: trimmed.slice(0, 4000),
    keywordHits: [],
  };

  const user = getSessionUser();
  if (user) {
    const saved = saveAnalysis(user.id, {
      aiScore: result.aiScore,
      humanScore: result.humanScore,
      aiProbability: result.aiScore,
      humanProbability: result.humanScore,
      classification: result.classification,
      wordCount: result.wordCount,
      snippet: result.snippet,
      summary: result.summary,
      fileName: result.fileName,
      source: result.source,
      avgSentenceLength: result.avgSentenceLength,
    });
    result.id = saved.id;
    result.createdAt = saved.createdAt;
  } else {
    result.createdAt = new Date().toISOString();
  }

  return result;
}

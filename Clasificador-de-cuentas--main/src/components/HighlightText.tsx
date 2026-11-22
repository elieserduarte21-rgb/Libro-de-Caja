import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
}

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, query }) => {
  const trimmed = query.trim();
  if (!trimmed) {
    return <>{text}</>;
  }

  const tokens = stripAccents(trimmed)
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2 || /^\d+$/.test(t));

  if (tokens.length === 0) {
    return <>{text}</>;
  }

  // Build accent-insensitive index mapping back to original string indices
  const origChars = Array.from(text);
  let normalized = '';
  const normToOrigIndex: number[] = [];

  origChars.forEach((char, origIdx) => {
    const stripped = stripAccents(char).toLowerCase();
    for (let i = 0; i < stripped.length; i++) {
      normalized += stripped[i];
      normToOrigIndex.push(origIdx);
    }
  });

  const ranges: Array<[number, number]> = [];
  for (const token of tokens) {
    let startIndex = 0;
    while (startIndex < normalized.length) {
      const idx = normalized.indexOf(token, startIndex);
      if (idx === -1) break;
      const origStart = normToOrigIndex[idx];
      const origEnd = normToOrigIndex[idx + token.length - 1] + 1;
      ranges.push([origStart, origEnd]);
      startIndex = idx + token.length;
    }
  }

  if (ranges.length === 0) {
    return <>{text}</>;
  }

  // Merge overlapping ranges
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = ranges[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([start, end], i) => {
    if (start > cursor) {
      parts.push(origChars.slice(cursor, start).join(''));
    }
    parts.push(
      <mark
        key={`${start}-${end}-${i}`}
        className="bg-blue-100 text-blue-900 dark:bg-white/25 dark:text-white rounded-xs px-0.5 font-medium"
      >
        {origChars.slice(start, end).join('')}
      </mark>
    );
    cursor = end;
  });

  if (cursor < origChars.length) {
    parts.push(origChars.slice(cursor).join(''));
  }

  return <>{parts}</>;
};

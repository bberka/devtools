export type ResumeAnalysis = {
  pageCount: number;
  text: string;
  wordCount: number;
  sentenceCount: number;
  bulletCount: number;
  estimatedReadingMinutes: number;
  scores: {
    overall: number;
    contact: number;
    sections: number;
    readability: number;
    ats: number;
    keywordMatch: number;
  };
  readability: {
    fleschReadingEase: number;
    averageSentenceLength: number;
    averageWordLength: number;
  };
  contactChecks: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    website: boolean;
    location: boolean;
  };
  sectionsFound: string[];
  missingSections: string[];
  topResumeKeywords: string[];
  jobKeywords: string[];
  matchedKeywords: string[];
  missingJobKeywords: string[];
  actionVerbCount: number;
  suggestions: string[];
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'in', 'is',
  'it', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were', 'with', 'will', 'this', 'your',
  'you', 'our', 'their', 'them', 'about', 'into', 'using', 'used', 'over', 'than', 'then',
  'also', 'can', 'may', 'not', 'but', 'per', 'via', 'across', 'such', 'including', 'within',
  'after', 'before', 'under', 'more', 'most', 'less', 'least', 'very', 'role', 'work', 'team',
  'teams', 'experience', 'years', 'year', 'responsible', 'resume', 'cv', 'candidate',
]);

const ACTION_VERBS = [
  'accelerated', 'achieved', 'analyzed', 'built', 'collaborated', 'created', 'delivered',
  'designed', 'developed', 'drove', 'enhanced', 'executed', 'generated', 'improved',
  'implemented', 'increased', 'launched', 'led', 'managed', 'optimized', 'owned', 'planned',
  'reduced', 'resolved', 'scaled', 'shipped', 'streamlined', 'supported',
];

const SECTION_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'Summary', pattern: /\b(summary|professional summary|profile|about me)\b/i },
  { label: 'Experience', pattern: /\b(experience|work history|employment|professional experience)\b/i },
  { label: 'Education', pattern: /\b(education|academic background|qualifications)\b/i },
  { label: 'Skills', pattern: /\b(skills|technical skills|core competencies|toolkit)\b/i },
  { label: 'Projects', pattern: /\b(projects|selected projects|project experience)\b/i },
  { label: 'Certifications', pattern: /\b(certifications|licenses|certificates)\b/i },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function countSyllables(word: string) {
  const normalized = word
    .toLowerCase()
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');

  const matches = normalized.match(/[aeiouy]{1,2}/g);
  return Math.max(matches?.length ?? 0, 1);
}

function getWords(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

function getSentences(text: string) {
  return text.match(/[^\s].*?[.!?]+(?=\s|$)|[^\s].+$/gm) ?? [];
}

function extractKeywords(text: string, maxKeywords: number) {
  const words = getWords(text.toLowerCase())
    .map((word) => word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));

  const counts = new Map<string, number>();
  words.forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

function detectSections(text: string) {
  return SECTION_PATTERNS.filter((section) => section.pattern.test(text)).map(
    (section) => section.label
  );
}

function scoreReadability(fleschReadingEase: number, averageSentenceLength: number) {
  let score = 0;

  if (fleschReadingEase >= 45 && fleschReadingEase <= 80) score += 10;
  else if (fleschReadingEase >= 30) score += 6;
  else score += 3;

  if (averageSentenceLength >= 8 && averageSentenceLength <= 24) score += 10;
  else if (averageSentenceLength >= 5 && averageSentenceLength <= 30) score += 6;
  else score += 2;

  return clamp(score, 0, 20);
}

export function analyzeResumeText(
  text: string,
  pageCount: number,
  jobDescription?: string
): ResumeAnalysis {
  const normalizedText = text.replace(/\r\n/g, '\n').trim();
  const words = getWords(normalizedText);
  const sentences = getSentences(normalizedText);
  const bulletCount = (normalizedText.match(/^[\s]*[-*•]\s+/gm) ?? []).length;
  const averageSentenceLength = words.length / Math.max(sentences.length, 1);
  const averageWordLength =
    words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const fleschReadingEase =
    words.length > 0
      ? clamp(
          206.835 -
            1.015 * averageSentenceLength -
            84.6 * (syllableCount / Math.max(words.length, 1)),
          0,
          100
        )
      : 0;

  const topResumeKeywords = extractKeywords(normalizedText, 12);
  const jobKeywords = jobDescription ? extractKeywords(jobDescription, 15) : [];
  const matchedKeywords = jobKeywords.filter((keyword) =>
    new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalizedText)
  );
  const missingJobKeywords = jobKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  const contactChecks = {
    email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalizedText),
    phone: /(?:\+?\d[\d\s().-]{7,}\d)/.test(normalizedText),
    linkedin: /linkedin\.com\/|linkedin/i.test(normalizedText),
    website: /https?:\/\/|portfolio|github\.com\/|gitlab\.com\//i.test(normalizedText),
    location: /\b(?:remote|[A-Z][a-z]+,\s?[A-Z]{2}|[A-Z][a-z]+\s[A-Z][a-z]+)\b/.test(normalizedText),
  };

  const sectionsFound = detectSections(normalizedText);
  const missingSections = SECTION_PATTERNS.map((section) => section.label).filter(
    (label) => !sectionsFound.includes(label)
  );

  const actionVerbCount = ACTION_VERBS.reduce((count, verb) => {
    const matches = normalizedText.match(new RegExp(`\\b${verb}\\b`, 'gi'));
    return count + (matches?.length ?? 0);
  }, 0);

  let contactScore = 0;
  if (contactChecks.email) contactScore += 5;
  if (contactChecks.phone) contactScore += 5;
  if (contactChecks.linkedin) contactScore += 4;
  if (contactChecks.website) contactScore += 3;
  if (contactChecks.location) contactScore += 3;

  const sectionsScore = clamp(sectionsFound.length * 4, 0, 20);
  const readabilityScore = scoreReadability(fleschReadingEase, averageSentenceLength);

  let atsScore = 0;
  if (words.length >= 250 && words.length <= 1100) atsScore += 6;
  else if (words.length >= 150) atsScore += 3;
  if (pageCount <= 2) atsScore += 4;
  else if (pageCount <= 3) atsScore += 2;
  if (bulletCount >= 4) atsScore += 4;
  else if (bulletCount >= 2) atsScore += 2;
  if (actionVerbCount >= 6) atsScore += 3;
  else if (actionVerbCount >= 3) atsScore += 2;
  if (averageWordLength <= 7) atsScore += 3;

  const keywordMatchScore = jobKeywords.length
    ? clamp(Math.round((matchedKeywords.length / jobKeywords.length) * 20), 0, 20)
    : sectionsFound.includes('Skills')
      ? 12
      : 8;

  const overall = clamp(
    Math.round(
      contactScore +
        sectionsScore +
        readabilityScore +
        atsScore +
        keywordMatchScore
    ),
    0,
    100
  );

  const suggestions: string[] = [];

  if (!contactChecks.email || !contactChecks.phone) {
    suggestions.push('Add a clearly extractable email address and phone number near the top.');
  }

  if (!sectionsFound.includes('Summary')) {
    suggestions.push('Add a short summary section to help recruiters understand your fit quickly.');
  }

  if (!sectionsFound.includes('Skills')) {
    suggestions.push('Add a dedicated skills section so ATS systems can match role keywords faster.');
  }

  if (bulletCount < 4) {
    suggestions.push('Use more bullet points for achievements instead of dense paragraphs.');
  }

  if (actionVerbCount < 4) {
    suggestions.push('Start more bullets with action verbs such as built, led, improved, or delivered.');
  }

  if (pageCount > 2) {
    suggestions.push('Consider trimming the resume to two pages or fewer for stronger ATS readability.');
  }

  if (jobKeywords.length > 0 && matchedKeywords.length < Math.ceil(jobKeywords.length * 0.4)) {
    suggestions.push('Mirror more job-description keywords naturally in your summary, skills, and experience bullets.');
  }

  if (words.length < 200) {
    suggestions.push('Add more measurable project or impact detail; the extracted text is currently quite short.');
  }

  if (normalizedText.length < 400) {
    suggestions.push('This PDF may be image-based or lightly extractable; verify the text layer is selectable.');
  }

  return {
    pageCount,
    text: normalizedText,
    wordCount: words.length,
    sentenceCount: sentences.length,
    bulletCount,
    estimatedReadingMinutes: words.length / 220,
    scores: {
      overall,
      contact: contactScore,
      sections: sectionsScore,
      readability: readabilityScore,
      ats: atsScore,
      keywordMatch: keywordMatchScore,
    },
    readability: {
      fleschReadingEase: Number(fleschReadingEase.toFixed(1)),
      averageSentenceLength: Number(averageSentenceLength.toFixed(1)),
      averageWordLength: Number(averageWordLength.toFixed(1)),
    },
    contactChecks,
    sectionsFound,
    missingSections,
    topResumeKeywords,
    jobKeywords,
    matchedKeywords,
    missingJobKeywords,
    actionVerbCount,
    suggestions,
  };
}

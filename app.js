const STORAGE_KEY = "scholar-style-workbench-profiles-v1";
const SETTINGS_KEY = "scholar-style-workbench-ai-settings-v1";
const SESSION_KEY = "scholar-style-workbench-session-api-key";
const DEFAULT_ENDPOINT = "https://api.openai.com/v1/responses";
const PDF_WORKER_SRC = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

const markerSets = {
  contrast: ["并非", "不是", "不只是", "不能只", "而是", "但是", "然而", "相反", "与其", "不如", "毋宁说"],
  causal: ["因此", "所以", "由于", "因而", "由此", "这意味着", "也正因此", "从而"],
  concession: ["虽然", "尽管", "即使", "固然", "不过"],
  hedge: ["可能", "或许", "似乎", "大致", "在某种意义上", "并不能简单地"],
  judgment: ["重要", "根本", "关键", "核心", "问题在于", "值得注意", "严格说来"],
};

const conceptSeeds = [
  "问题",
  "结构",
  "关系",
  "条件",
  "意义",
  "方法",
  "对象",
  "概念",
  "判断",
  "材料",
  "传统",
  "解释",
  "历史",
  "近代",
  "张力",
  "论证",
  "经验",
  "价值",
  "主体",
  "秩序",
  "学术",
  "思想",
  "现代",
  "宗旨",
  "义理",
  "哲学",
  "知识",
  "经学",
  "佛学",
  "佛教",
  "儒教",
  "政治",
  "国家",
  "体制",
  "主义",
  "康有为",
  "欧阳竟无",
  "生产",
  "生成",
  "规定",
  "文明",
];

const markerStopWords = new Set(Object.values(markerSets).flat());

const defaultProfile = {
  id: "zhang-zhiqiang",
  name: "张志强",
  createdAt: "2026-06-20",
  source: "6 篇 PDF 语料生成的测试 profile",
  stats: {
    documents: 6,
    tokens: 76082,
    sentences: 1888,
    paragraphs: 176,
    avgSentenceLength: 40.3,
    sentenceStdev: 24.55,
  },
  lexicon: [
    "问题域",
    "时代问题",
    "历史条件",
    "学术传统",
    "价值系统",
    "义理",
    "经史之学",
    "现代学术",
    "近代佛学",
    "思想史",
    "主体",
    "秩序",
    "宗旨",
    "方法",
    "旨趣",
    "性格",
    "导引",
    "重构",
    "收摄",
    "安顿",
    "自觉化",
  ],
  pairs: ["传统/现代", "方法/宗旨", "哲学/义理学/经史之学", "真/俗", "差异/平等", "历史/价值", "学术/政治", "主体/秩序"],
  markers: {
    contrast: ["并非", "不是", "不只是", "不能只", "而是", "并不简单是", "毋宁说", "则不然"],
    causal: ["因此", "所以", "由于", "因而", "由此", "这意味着"],
    reformulation: ["也就是说", "换言之", "严格说来", "在某种意义上", "根本上", "实质上"],
    hedge: ["可能", "或许", "似乎", "在某种意义上", "大致", "并不能简单地"],
  },
  sentenceRules: [
    "长句用于完成背景条件、概念转折、重新表述和后果说明。",
    "常用“并非/不是……而是……”完成概念区分。",
    "短句只作为长段落中的转轴，不作为主要风格。",
  ],
  paragraphRules: [
    "先放入历史或思想问题域，再提出结论。",
    "从常见理解出发，指出其不足，再引出更深层关系。",
    "段落结尾应说明这一转换意味着什么，而不是只做总结。",
  ],
  argumentPatterns: [
    "历史问题域",
    "常见观点反转",
    "概念谱系",
    "三项中介",
    "有限文明史判断",
  ],
  negative: [
    "不要从泛泛的结论句开始。",
    "不要用“很重要、影响深远、值得思考”代替概念说明。",
    "不要把概念当作词典定义。",
    "不要复制语料原文或暗示张志强本人写作。",
  ],
  sources: [
    { id: "S1", title: "方法与宗旨之间", type: "pdf", pages: null },
    { id: "S2", title: "“良知”的发现是具有文明史意义的事件", type: "pdf", pages: null },
    { id: "S3", title: "近代佛学与今文经学", type: "pdf", pages: null },
    { id: "S4", title: "中国“现代性”视野中的近现代佛教", type: "pdf", pages: null },
    { id: "S5", title: "“齐物”哲学的形成及其意趣", type: "pdf", pages: null },
    { id: "S6", title: "从“理学别派”到士人佛学", type: "pdf", pages: null },
  ],
  voiceStats: {
    authorChars: 76082,
    quotedChars: null,
    quoteSegments: null,
    note: "默认样例来自清洗后的 PDF 语料；网页端新建 profile 会重新统计长引文。",
  },
  paragraphModel: {
    avgParagraphLength: 431.16,
    openingMoves: [
      { item: "历史/思想问题域", count: 48 },
      { item: "概念界定", count: 37 },
      { item: "既有观点重述", count: 26 },
    ],
    middleMoves: [
      { item: "对比转折", count: 92 },
      { item: "因果推进", count: 75 },
      { item: "重述澄清", count: 61 },
    ],
    closingMoves: [
      { item: "意义收束", count: 58 },
      { item: "关系重分类", count: 44 },
      { item: "有限判断", count: 29 },
    ],
  },
  citationIndex: [
    { sourceId: "S1", sourceTitle: "方法与宗旨之间", page: null, terms: ["方法", "宗旨", "现代学术", "义理"], excerpt: "可用于讨论方法、宗旨与现代学术分化之间的关系。" },
    { sourceId: "S2", sourceTitle: "“良知”的发现是具有文明史意义的事件", page: null, terms: ["良知", "文明", "晚明", "主体"], excerpt: "可用于讨论良知、主体形成与文明史意义。" },
    { sourceId: "S3", sourceTitle: "近代佛学与今文经学", page: null, terms: ["近代佛学", "今文经学", "康有为", "欧阳竟无"], excerpt: "可用于讨论近代佛学、今文经学与学术转型。" },
    { sourceId: "S4", sourceTitle: "中国“现代性”视野中的近现代佛教", page: null, terms: ["现代性", "近现代佛教", "价值系统"], excerpt: "可用于讨论现代性视野中的佛教与价值秩序。" },
    { sourceId: "S5", sourceTitle: "“齐物”哲学的形成及其意趣", page: null, terms: ["齐物", "差异", "平等", "哲学"], excerpt: "可用于讨论齐物哲学、差异与平等的概念关系。" },
    { sourceId: "S6", sourceTitle: "从“理学别派”到士人佛学", page: null, terms: ["士人佛学", "唯识学", "思想史"], excerpt: "可用于讨论士人佛学、唯识学与思想史主题演进。" },
  ],
};

let profiles = loadProfiles();
let activeProfileId = profiles[0]?.id || defaultProfile.id;
let selectedCorpusFiles = [];
let aiSettings = loadAiSettings();

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

function loadProfiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) return stored.map(normalizeProfile);
  } catch {
    // Ignore malformed storage.
  }
  return [normalizeProfile(defaultProfile)];
}

function saveProfiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function normalizeProfile(profile) {
  const base = profile?.id === defaultProfile.id ? defaultProfile : {};
  return {
    ...base,
    ...profile,
    stats: { ...(base.stats || {}), ...(profile?.stats || {}) },
    markers: { ...(base.markers || {}), ...(profile?.markers || {}) },
    sources: profile?.sources || base.sources || [],
    citationIndex: profile?.citationIndex || base.citationIndex || [],
    voiceStats: profile?.voiceStats || base.voiceStats || null,
    paragraphModel: profile?.paragraphModel || base.paragraphModel || null,
  };
}

function loadAiSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      endpoint: stored.endpoint || DEFAULT_ENDPOINT,
      model: stored.model || "gpt-5.5",
      reasoning: stored.reasoning || "medium",
      rememberKey: Boolean(stored.rememberKey),
      apiKey: stored.rememberKey ? stored.apiKey || "" : sessionStorage.getItem(SESSION_KEY) || "",
    };
  } catch {
    return { endpoint: DEFAULT_ENDPOINT, model: "gpt-5.5", reasoning: "medium", rememberKey: false, apiKey: "" };
  }
}

function saveAiSettingsFromForm() {
  aiSettings = {
    endpoint: qs("#apiEndpointInput").value.trim() || DEFAULT_ENDPOINT,
    model: qs("#modelSelect").value,
    reasoning: qs("#reasoningSelect").value,
    rememberKey: qs("#rememberKeyToggle").checked,
    apiKey: qs("#apiKeyInput").value.trim(),
  };
  if (aiSettings.rememberKey) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(aiSettings));
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ endpoint: aiSettings.endpoint, model: aiSettings.model, reasoning: aiSettings.reasoning, rememberKey: false }));
    sessionStorage.setItem(SESSION_KEY, aiSettings.apiKey);
  }
}

function activeProfile() {
  return profiles.find((profile) => profile.id === activeProfileId) || profiles[0] || defaultProfile;
}

function slugify(text) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "") || `profile-${Date.now()}`
  );
}

function showToast(message) {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function render() {
  renderProfileList();
  renderActiveTitle();
  renderRulebook();
  renderSourcesView();
  renderAiSettings();
}

function renderProfileList() {
  const list = qs("#profileList");
  list.innerHTML = "";
  profiles.forEach((profile) => {
    const button = document.createElement("button");
    button.className = `profile-item${profile.id === activeProfileId ? " active" : ""}`;
    button.innerHTML = `
      <span class="profile-name">${escapeHtml(profile.name)}</span>
      <span class="profile-meta">${profile.stats?.tokens || 0} tokens · ${profile.stats?.documents || 1} sources</span>
    `;
    button.addEventListener("click", () => {
      activeProfileId = profile.id;
      render();
    });
    list.appendChild(button);
  });
}

function renderActiveTitle() {
  qs("#activeProfileTitle").textContent = activeProfile().name;
}

function renderRulebook() {
  qs("#rulebookView").textContent = profileToMarkdown(activeProfile());
}

function renderAiSettings() {
  qs("#apiEndpointInput").value = aiSettings.endpoint || DEFAULT_ENDPOINT;
  qs("#apiKeyInput").value = aiSettings.apiKey || "";
  qs("#modelSelect").value = aiSettings.model || "gpt-5.5";
  qs("#reasoningSelect").value = aiSettings.reasoning || "medium";
  qs("#rememberKeyToggle").checked = Boolean(aiSettings.rememberKey);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitSentences(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/(?<=[。！？!?；;])\s*|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 2);
}

function splitParagraphs(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 20);
}

function tokenize(text) {
  return text.match(/[A-Za-z][A-Za-z'-]*|\d+(?:\.\d+)?|[\u4e00-\u9fff]/g) || [];
}

function countMarkers(text) {
  const result = {};
  Object.entries(markerSets).forEach(([category, markers]) => {
    result[category] = markers
      .map((marker) => ({ item: marker, count: countOccurrences(text, marker) }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);
  });
  return result;
}

function countOccurrences(text, needle) {
  if (!needle) return 0;
  return text.split(needle).length - 1;
}

function ensurePdfJs() {
  const pdfjs = window.pdfjsLib;
  if (!pdfjs) throw new Error("PDF 解析库尚未加载，请刷新页面后重试。");
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  return pdfjs;
}

async function parsePdfFile(file) {
  const pdfjs = ensurePdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) pages.push({ page: pageNumber, text });
  }
  return {
    title: file.name.replace(/\.pdf$/i, ""),
    type: "pdf",
    pages: pages.length,
    text: pages.map((page) => `[[p.${page.page}]] ${page.text}`).join("\n\n"),
    pageTexts: pages,
  };
}

function assignSourceIds(docs) {
  return docs.map((doc, index) => ({ ...doc, id: `S${index + 1}` }));
}

function separateVoice(text) {
  const quotedSegments = [];
  const quotePattern = /[“「『"]([^”」』"]{18,})[”」』"]/g;
  const authorText = text.replace(quotePattern, (match, content) => {
    if (/[。！？；，,.;:：]/.test(content) || content.length > 36) {
      quotedSegments.push(content.trim());
      return " ";
    }
    return match;
  });
  const referenceStart = authorText.search(/\n\s*(参考文献|注释|主要参考书目)\s*\n/);
  const trimmedAuthorText = referenceStart >= 0 ? authorText.slice(0, referenceStart) : authorText;
  const quotedChars = quotedSegments.reduce((sum, segment) => sum + segment.length, 0);
  return {
    authorText: trimmedAuthorText,
    quotedSegments,
    stats: {
      authorChars: trimmedAuthorText.length,
      quotedChars,
      quoteSegments: quotedSegments.length,
      quoteRatio: trimmedAuthorText.length ? Number((quotedChars / (trimmedAuthorText.length + quotedChars)).toFixed(3)) : 0,
    },
  };
}

function classifyOpening(paragraph) {
  if (/^(如果说|若说|倘若)/.test(paragraph)) return "条件对举";
  if (/问题|如何理解|要理解|所谓|何以|为什么/.test(paragraph.slice(0, 80))) return "问题域提出";
  if (/现代|近代|晚清|晚明|历史|传统|时代/.test(paragraph.slice(0, 80))) return "历史定位";
  if (/认为|指出|所谓|曰|云|载/.test(paragraph.slice(0, 80))) return "文献引入";
  return "概念展开";
}

function classifyClosing(paragraph) {
  const end = paragraph.slice(-120);
  if (/意味着|在此意义上|由此可见|说明|显示|表明/.test(end)) return "意义收束";
  if (/问题|可能|仍需|有待/.test(end)) return "开放问题";
  if (/因此|所以|因而|由此/.test(end)) return "因果判断";
  return "关系澄清";
}

function analyzeParagraphStructure(paragraphs) {
  const opening = new Map();
  const middle = new Map();
  const closing = new Map();
  const add = (map, key) => map.set(key, (map.get(key) || 0) + 1);
  paragraphs.forEach((paragraph) => {
    add(opening, classifyOpening(paragraph));
    if (/(并非|不是|不只是|不能只|而是|然而|毋宁说|与其|不如)/.test(paragraph)) add(middle, "对比转折");
    if (/(因此|所以|因而|由此|这意味着|从而)/.test(paragraph)) add(middle, "因果推进");
    if (/(也就是说|换言之|严格说来|在某种意义上|实质上)/.test(paragraph)) add(middle, "重述澄清");
    if (/(认为|指出|所谓|曰|云|载|《|》)/.test(paragraph)) add(middle, "文献处理");
    add(closing, classifyClosing(paragraph));
  });
  const avg = paragraphs.length ? paragraphs.reduce((sum, paragraph) => sum + tokenize(paragraph).length, 0) / paragraphs.length : 0;
  return {
    avgParagraphLength: Number(avg.toFixed(2)),
    openingMoves: mapToSortedItems(opening),
    middleMoves: mapToSortedItems(middle),
    closingMoves: mapToSortedItems(closing),
  };
}

function mapToSortedItems(map) {
  return Array.from(map.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count);
}

function buildCitationIndex(sourceDocs, lexicon) {
  const terms = [...new Set([...(lexicon || []), ...conceptSeeds])];
  const index = [];
  sourceDocs.forEach((doc) => {
    const chunks = doc.pageTexts?.length
      ? doc.pageTexts.map((page) => ({ page: page.page, text: page.text }))
      : splitParagraphs(doc.text).map((paragraph) => ({ page: null, text: paragraph }));
    chunks.forEach((chunk) => {
      const hits = terms.filter((term) => term.length >= 2 && chunk.text.includes(term)).slice(0, 12);
      if (!hits.length || chunk.text.length < 24) return;
      index.push({
        sourceId: doc.id,
        sourceTitle: doc.title,
        page: chunk.page,
        terms: hits,
        excerpt: compactExcerpt(chunk.text, 180),
      });
    });
  });
  return index.slice(0, 240);
}

function compactExcerpt(text, limit = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function findCitationMatches(profile, text, limit = 8) {
  const pool = profile.citationIndex || [];
  const query = `${text} ${(profile.lexicon || []).slice(0, 8).join(" ")}`;
  return pool
    .map((entry) => ({
      ...entry,
      score: (entry.terms || []).reduce((sum, term) => sum + (query.includes(term) ? 2 : 0), 0) + (query.includes(entry.sourceTitle) ? 3 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function formatCitationRef(entry) {
  return `[${entry.sourceId}${entry.page ? `:p.${entry.page}` : ""}]`;
}

function sentenceStats(sentences) {
  const lengths = sentences.map((sentence) => tokenize(sentence).length).filter(Boolean);
  const mean = lengths.length ? lengths.reduce((sum, value) => sum + value, 0) / lengths.length : 0;
  const variance = lengths.length ? lengths.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / lengths.length : 0;
  return {
    count: sentences.length,
    mean: Number(mean.toFixed(2)),
    stdev: Number(Math.sqrt(variance).toFixed(2)),
    max: lengths.length ? Math.max(...lengths) : 0,
  };
}

function topCjkNgrams(text, size, limit = 18) {
  const matches = text.match(/[\u4e00-\u9fff]{2,}/g) || [];
  const stop = new Set(["一个", "一种", "这个", "这些", "以及", "但是", "因此", "所以", "我们", "他们", "自己", "没有", "不是", "成为", "进行", "具有", "而是", "就是"]);
  const counts = new Map();
  matches.forEach((chunk) => {
    for (let index = 0; index <= chunk.length - size; index += 1) {
      const gram = chunk.slice(index, index + size);
      if (!stop.has(gram) && isContentTerm(gram) && (size > 2 || conceptSeeds.includes(gram))) counts.set(gram, (counts.get(gram) || 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count }))
    .filter((entry) => entry.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function normalizeTerm(term) {
  return term.replace(/^[的一是在和与及并而则其这那之以于把被所]+/g, "").replace(/[的了和与及并而则其这那之以于把被所]+$/g, "");
}

function isContentTerm(term) {
  const clean = normalizeTerm(term);
  if (clean.length < 2 || clean.length > 8) return false;
  if (markerStopWords.has(clean)) return false;
  if (/[的了一是在和与及并而则其这那之以于把被所]/.test(clean.slice(0, 1))) return false;
  if (/[的了和与及并而则其这那之以于把被所]/.test(clean.slice(-1))) return false;
    if (/不是|而是|因此|所以|由此|换言之|如果说|那么|所谓|就是/.test(clean)) return false;
  return true;
}

function extractConceptTerms(text, ngramGroups) {
  const counts = new Map();
  conceptSeeds.forEach((seed) => {
    const count = countOccurrences(text, seed);
    if (count > 0) counts.set(seed, count + 2);
  });
  conceptSeeds.forEach((left) => {
    conceptSeeds.forEach((right) => {
      if (left === right) return;
      const compound = `${left}${right}`;
      const count = countOccurrences(text, compound);
      if (count > 0) counts.set(compound, (counts.get(compound) || 0) + count + 1);
    });
  });
  ngramGroups.flat().forEach((entry) => {
    const term = normalizeTerm(entry.item);
    if (entry.count >= 3 && isContentTerm(term) && (term.length >= 3 || conceptSeeds.includes(term))) counts.set(term, (counts.get(term) || 0) + entry.count);
  });
  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count || b.item.length - a.item.length)
    .map((entry) => entry.item)
    .slice(0, 24);
}

function analyzeText(text, name, documents = 1, sourceDocs = []) {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])/g, "")
    .trim();
  const voice = separateVoice(normalized);
  const analysisText = voice.authorText.trim() || normalized;
  const sentences = splitSentences(analysisText);
  const paragraphs = splitParagraphs(analysisText);
  const tokens = tokenize(analysisText);
  const stats = sentenceStats(sentences);
  const markers = countMarkers(analysisText);
  const n2 = topCjkNgrams(analysisText, 2);
  const n3 = topCjkNgrams(analysisText, 3);
  const n4 = topCjkNgrams(analysisText, 4);
  const lexicon = extractConceptTerms(analysisText, [n4, n3, n2]);
  const paragraphModel = analyzeParagraphStructure(paragraphs);
  const citationIndex = buildCitationIndex(sourceDocs, lexicon);

  return {
    id: `${slugify(name)}-${Date.now()}`,
    name,
    createdAt: new Date().toISOString().slice(0, 10),
    source: "浏览器端语料分析生成",
    stats: {
      documents,
      tokens: tokens.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      avgSentenceLength: stats.mean,
      sentenceStdev: stats.stdev,
    },
    sources: sourceDocs.map((doc) => ({ id: doc.id, title: doc.title, type: doc.type, pages: doc.pages || null, chars: doc.text.length })),
    voiceStats: voice.stats,
    paragraphModel,
    citationIndex,
    lexicon,
    pairs: inferPairs(lexicon),
    markers: {
      contrast: markers.contrast.map((entry) => entry.item),
      causal: markers.causal.map((entry) => entry.item),
      reformulation: ["也就是说", "换言之", "严格说来", "在某种意义上", "实质上"].filter((item) => analysisText.includes(item)),
      hedge: markers.hedge.map((entry) => entry.item),
    },
    sentenceRules: [
      `平均句长约 ${stats.mean} 个 token，句长标准差约 ${stats.stdev}。`,
      "保留语料中高频的转折和因果连接方式。",
      "用概念词组组织句子，而不是只做口语化解释。",
    ],
    paragraphRules: [
      "先提出问题域，再展开概念区分。",
      "用语料中的高频概念词形成段落中心。",
      "结尾给出有限判断或关系澄清。",
    ],
    argumentPatterns: ["问题域建构", "常见观点反转", "概念谱系", "有限判断"],
    negative: ["不要复制原文。", "不要用泛泛结论代替概念分析。", "不要强行发明作者观点。"],
    rawSignals: { markers, ngrams: { n2, n3, n4 }, quoteSamples: voice.quotedSegments.slice(0, 12) },
  };
}

function inferPairs(lexicon) {
  const pairs = [];
  for (let index = 0; index < lexicon.length - 1 && pairs.length < 6; index += 2) {
    pairs.push(`${lexicon[index]}/${lexicon[index + 1]}`);
  }
  return pairs;
}

async function readSelectedFiles(files) {
  const docs = [];
  const errors = [];
  for (const file of files) {
    try {
      if (/\.pdf$/i.test(file.name)) {
        qs("#fileStatus").textContent = `正在解析 PDF：${file.name}`;
        docs.push(await parsePdfFile(file));
        continue;
      }
      if (/\.(txt|md)$/i.test(file.name)) {
        docs.push({
          title: file.name.replace(/\.(txt|md)$/i, ""),
          type: file.name.toLowerCase().endsWith(".md") ? "md" : "txt",
          pages: null,
          text: await file.text(),
          pageTexts: null,
        });
      }
    } catch (error) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }
  const withIds = assignSourceIds(docs);
  return { text: withIds.map((doc) => `[[${doc.id} ${doc.title}]]\n${doc.text}`).join("\n\n"), docs: withIds, errors };
}

function renderAnalysisPreview(profile) {
  const markers = profile.markers || {};
  const signals = profile.rawSignals || {};
  const voice = profile.voiceStats || {};
  const paragraphModel = profile.paragraphModel || {};
  qs("#analysisPreview").innerHTML = `
    <div class="metric-grid">
      <div class="metric"><strong>${profile.stats.tokens}</strong><span>tokens</span></div>
      <div class="metric"><strong>${profile.stats.sentences}</strong><span>sentences</span></div>
      <div class="metric"><strong>${profile.stats.avgSentenceLength}</strong><span>avg sentence</span></div>
      <div class="metric"><strong>${profile.stats.sentenceStdev}</strong><span>sentence stdev</span></div>
    </div>
    <h4>作者/引文分离</h4>
    <div class="tag-list">
      <span class="tag">作者文本 ${voice.authorChars ?? "未统计"} 字符</span>
      <span class="tag">长引文 ${voice.quoteSegments ?? "未统计"} 段</span>
      <span class="tag">引文占比 ${voice.quoteRatio != null ? `${Math.round(voice.quoteRatio * 100)}%` : "未统计"}</span>
    </div>
    <h4>概念词</h4>
    <div class="tag-list">${profile.lexicon.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
    <h4>转折标记</h4>
    <div class="tag-list">${(markers.contrast || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || '<span class="tag">未检出</span>'}</div>
    <h4>段落结构</h4>
    <div class="tag-list">
      ${(paragraphModel.openingMoves || []).slice(0, 4).map((entry) => `<span class="tag">开头 ${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}
      ${(paragraphModel.middleMoves || []).slice(0, 4).map((entry) => `<span class="tag">中段 ${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}
      ${(paragraphModel.closingMoves || []).slice(0, 4).map((entry) => `<span class="tag">收束 ${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}
    </div>
    <h4>引用索引</h4>
    <div class="tag-list"><span class="tag">${profile.citationIndex?.length || 0} 条候选出处</span><span class="tag">${profile.sources?.length || 0} 个来源</span></div>
    <h4>高频四字组</h4>
    <div class="tag-list">${(signals.ngrams?.n4 || []).slice(0, 12).map((entry) => `<span class="tag">${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}</div>
  `;
}

function profileToMarkdown(profile) {
  return `# ${profile.name} 风格规则

来源：${profile.source || "本地 profile"}
语料规模：${profile.stats?.tokens || 0} tokens，${profile.stats?.sentences || 0} 句
来源数量：${profile.sources?.length || profile.stats?.documents || 0}

## 作者/引文分离
- 作者文本字符：${profile.voiceStats?.authorChars ?? "未统计"}
- 长引文段数：${profile.voiceStats?.quoteSegments ?? "未统计"}
- 长引文占比：${profile.voiceStats?.quoteRatio != null ? `${Math.round(profile.voiceStats.quoteRatio * 100)}%` : "未统计"}

## 核心词汇
${(profile.lexicon || []).map((item) => `- ${item}`).join("\n")}

## 概念对
${(profile.pairs || []).map((item) => `- ${item}`).join("\n")}

## 连接与转折
- 转折：${(profile.markers?.contrast || []).join("、") || "未记录"}
- 因果：${(profile.markers?.causal || []).join("、") || "未记录"}
- 重述：${(profile.markers?.reformulation || []).join("、") || "未记录"}
- 谨慎表达：${(profile.markers?.hedge || []).join("、") || "未记录"}

## 句式规则
${(profile.sentenceRules || []).map((item) => `- ${item}`).join("\n")}

## 段落规则
${(profile.paragraphRules || []).map((item) => `- ${item}`).join("\n")}

## 段落结构模型
- 平均段落长度：${profile.paragraphModel?.avgParagraphLength ?? "未统计"}
- 开头动作：${(profile.paragraphModel?.openingMoves || []).map((entry) => `${entry.item}(${entry.count})`).join("、") || "未记录"}
- 中段动作：${(profile.paragraphModel?.middleMoves || []).map((entry) => `${entry.item}(${entry.count})`).join("、") || "未记录"}
- 收束动作：${(profile.paragraphModel?.closingMoves || []).map((entry) => `${entry.item}(${entry.count})`).join("、") || "未记录"}

## 论证模式
${(profile.argumentPatterns || []).map((item) => `- ${item}`).join("\n")}

## 来源
${(profile.sources || []).map((source) => `- [${source.id}] ${source.title}${source.pages ? `，${source.pages} 页` : ""}`).join("\n") || "- 未记录"}

## 负面清单
${(profile.negative || []).map((item) => `- ${item}`).join("\n")}
`;
}

function citationIndexToMarkdown(profile) {
  return `# ${profile.name} 引用索引

## 来源
${(profile.sources || []).map((source) => `- [${source.id}] ${source.title}${source.pages ? `，${source.pages} 页` : ""}`).join("\n") || "- 未记录"}

## 候选出处
${(profile.citationIndex || [])
  .map((entry) => `- ${formatCitationRef(entry)} ${entry.sourceTitle}
  - 关键词：${(entry.terms || []).join("、") || "未记录"}
  - 摘要：${entry.excerpt || ""}`)
  .join("\n") || "- 未生成"}
`;
}

function renderSourcesView() {
  const profile = activeProfile();
  const sources = profile.sources || [];
  const citations = profile.citationIndex || [];
  const paragraphModel = profile.paragraphModel || {};
  const voice = profile.voiceStats || {};
  qs("#sourcesView").innerHTML = `
    <h4>来源</h4>
    <div class="source-list">
      ${sources.length ? sources.map((source) => `
        <div class="source-item">
          <strong>${escapeHtml(`[${source.id}] ${source.title}`)}</strong>
          <p>${escapeHtml(source.type || "source")}${source.pages ? ` · ${source.pages} 页` : ""}${source.chars ? ` · ${source.chars} 字符` : ""}</p>
        </div>
      `).join("") : '<p class="empty-state">当前 profile 没有记录来源。</p>'}
    </div>

    <h4>作者/引文分离</h4>
    <div class="structure-list">
      <div class="structure-item">
        <strong>作者文本</strong>
        <p>${voice.authorChars ?? "未统计"} 字符；长引文 ${voice.quoteSegments ?? "未统计"} 段；占比 ${voice.quoteRatio != null ? `${Math.round(voice.quoteRatio * 100)}%` : "未统计"}。</p>
      </div>
    </div>

    <h4>段落结构</h4>
    <div class="structure-list">
      <div class="structure-item">
        <strong>开头动作</strong>
        <p>${(paragraphModel.openingMoves || []).map((entry) => `${entry.item}(${entry.count})`).join("、") || "未记录"}</p>
      </div>
      <div class="structure-item">
        <strong>中段动作</strong>
        <p>${(paragraphModel.middleMoves || []).map((entry) => `${entry.item}(${entry.count})`).join("、") || "未记录"}</p>
      </div>
      <div class="structure-item">
        <strong>收束动作</strong>
        <p>${(paragraphModel.closingMoves || []).map((entry) => `${entry.item}(${entry.count})`).join("、") || "未记录"}</p>
      </div>
    </div>

    <h4>引用候选</h4>
    <div class="citation-list">
      ${citations.length ? citations.slice(0, 40).map((entry) => `
        <div class="citation-item">
          <strong><span class="citation-ref">${escapeHtml(formatCitationRef(entry))}</span> ${escapeHtml(entry.sourceTitle)}</strong>
          <p>${escapeHtml(entry.excerpt || "")}</p>
          <p>关键词：${escapeHtml((entry.terms || []).join("、") || "未记录")}</p>
        </div>
      `).join("") : '<p class="empty-state">导入语料后会生成候选出处。</p>'}
    </div>
  `;
}

function localDraft(profile, idea, mode) {
  const cleanIdea = idea.trim().replace(/\s+/g, " ");
  if (!cleanIdea) return "请先输入你的观点。";
  const topic = cleanIdea.replace(/[。！？!?].*$/, "").slice(0, 48);
  const keyTerms = (profile.lexicon || []).slice(0, 6).join("、");
  const styleNote = mode === "lecture" ? "在我看来，" : "";
  const citations = findCitationMatches(profile, cleanIdea, 5);
  const citationHint = citations.length ? `可参照 ${citations.map(formatCitationRef).join("、")} 的材料线索。` : "当前 profile 没有足够的引用索引，正式写作前需要补充材料。";
  return `## 改写稿

${styleNote}要理解“${topic}”，不能只把它看作一个孤立的表达问题。它之所以成为问题，恰恰在于它处在既有${keyTerms || "价值系统"}重新分化和重组的过程中。${cleanIdea} 也就是说，这里真正需要辨明的，并非只是某一工具、观念或制度的外在功能，而是它如何改变问题被提出、关系被组织以及主体理解自身位置的方式。正是在此意义上，对这一问题的讨论，才不只是经验层面的说明，而是关乎一种新的学术和价值秩序如何被安顿的问题。${citationHint}

## 使用的风格规则
- 词汇: 使用“问题、价值系统、主体、安顿”等概念化表达。
- 句式: 采用“不能只把它看作……而是……”和“也就是说”的重述结构。
- 段落: 先建构问题域，再转入概念区分，最后给出有限判断。
- 论证: 把原始观点放入历史或思想关系中，而非直接下结论。

## 出处建议
${citations.length ? citations.map((entry) => `- ${formatCitationRef(entry)} ${entry.sourceTitle}：${entry.excerpt}`).join("\n") : "- 暂无候选出处。"}

## 需要你确认的地方
- 这段本地草稿没有新增事实依据；如果要写成论文段落，需要补充具体材料、文献或案例。`;
}

function aiPrompt(profile, idea, mode, longformMode = "1200") {
  const citations = findCitationMatches(profile, idea, 10);
  return `请依据以下“${profile.name}”风格 profile，改写我的观点。

重要边界：
1. 不要冒充该学者本人。
2. 不要复制任何原文。
3. 保留我的核心观点、证据和不确定性。
4. 如需标注出处，只能使用“可引用材料”中的编号，不要虚构页码、篇名或观点。
5. 输出后说明使用了哪些风格规则，并列出需要核验的事实。

目标体裁：${mode}
生成规模：${longformMode}

风格规则：
${profileToMarkdown(profile)}

可引用材料：
${citations.length ? citations.map((entry) => `- ${formatCitationRef(entry)} ${entry.sourceTitle}：${entry.excerpt}`).join("\n") : "- 当前 profile 没有足够的引用索引；请只做无出处草稿，并提示需要补充文献。"}

我的观点：
${idea.trim()}`;
}

function buildLongformPrompt(profile, idea, mode, longformMode) {
  return `${aiPrompt(profile, idea, mode, longformMode)}

请输出：
1. 标题
2. 正文
3. 使用的风格规则
4. 出处标注说明
5. 需要核验的地方

正文要求：
- 用中文学术文体写作。
- 段落推进要体现：问题域提出、概念区分、文献线索、有限判断。
- 不要照搬 profile 或引用索引中的句子。
- 对没有出处支撑的判断，用“仍需进一步核验”标出。`;
}

async function callOpenAIResponse(prompt) {
  saveAiSettingsFromForm();
  if (!aiSettings.apiKey) throw new Error("请先填写 API Key。");
  const payload = {
    model: aiSettings.model,
    input: prompt,
    store: false,
    max_output_tokens: 4200,
  };
  if (/^gpt-5|^o\d/i.test(aiSettings.model)) {
    payload.reasoning = { effort: aiSettings.reasoning };
  }
  const response = await fetch(aiSettings.endpoint || DEFAULT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiSettings.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return extractResponseText(data) || JSON.stringify(data, null, 2);
}

function extractResponseText(data) {
  if (data.output_text) return data.output_text;
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .filter(Boolean)
    .join("\n");
}

function diagnoseText(profile, text) {
  const sentences = splitSentences(text);
  const tokens = tokenize(text);
  const stats = sentenceStats(sentences);
  const contrastHits = (profile.markers?.contrast || []).filter((item) => text.includes(item));
  const causalHits = (profile.markers?.causal || []).filter((item) => text.includes(item));
  const lexiconHits = (profile.lexicon || []).filter((item) => text.includes(item));
  const hasProblemFrame = /问题|如何理解|要理解|关乎|意味着|在此意义上/.test(text);
  let score = 0;
  score += Math.min(25, contrastHits.length * 6);
  score += Math.min(20, causalHits.length * 5);
  score += Math.min(25, lexiconHits.length * 3);
  score += hasProblemFrame ? 20 : 0;
  score += stats.mean >= 26 ? 10 : 4;
  score = Math.min(100, score);
  const findings = [
    `平均句长：${stats.mean}。`,
    `命中的转折标记：${contrastHits.join("、") || "无"}`,
    `命中的因果标记：${causalHits.join("、") || "无"}`,
    `命中的概念词：${lexiconHits.slice(0, 12).join("、") || "无"}`,
    hasProblemFrame ? "有问题域/意义转换信号。" : "缺少明显的问题域或意义转换信号。",
  ];
  return { score, findings };
}

function renderDiagnosis(result) {
  qs("#diagnoseOutput").innerHTML = `
    <div class="score" style="--score:${result.score}%"><strong>${result.score}</strong></div>
    <ul class="finding-list">${result.findings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join("")}</ul>
  `;
}

function download(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  qsa(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      qsa(".tab-button").forEach((item) => item.classList.remove("active"));
      qsa(".tab-panel").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      qs(`#${button.dataset.tab}Tab`).classList.add("active");
    });
  });

  qs("#newProfileButton").addEventListener("click", () => {
    qs("#profileNameInput").value = "新学者";
    qs("#corpusTextInput").focus();
    qsa(".tab-button").find((button) => button.dataset.tab === "build").click();
  });

  qs("#corpusFilesInput").addEventListener("change", (event) => {
    selectedCorpusFiles = Array.from(event.target.files || []);
    qs("#fileStatus").textContent = selectedCorpusFiles.length ? `已选择 ${selectedCorpusFiles.length} 个文件。` : "尚未选择文件。";
  });

  qs("#clearCorpusButton").addEventListener("click", () => {
    qs("#corpusTextInput").value = "";
    qs("#corpusFilesInput").value = "";
    selectedCorpusFiles = [];
    qs("#fileStatus").textContent = "尚未选择文件。";
  });

  qs("#analyzeCorpusButton").addEventListener("click", async () => {
    const name = qs("#profileNameInput").value.trim() || "新学者";
    const pasted = qs("#corpusTextInput").value.trim();
    qs("#analyzeCorpusButton").disabled = true;
    qs("#fileStatus").textContent = "正在读取语料...";
    const fileResult = await readSelectedFiles(selectedCorpusFiles);
    const sourceDocs = assignSourceIds([
      ...(pasted
        ? [{
            title: "粘贴语料",
            type: "paste",
            pages: null,
            text: pasted,
            pageTexts: null,
          }]
        : []),
      ...(fileResult.docs || []),
    ]);
    const combined = sourceDocs.map((doc) => `[[${doc.id} ${doc.title}]]\n${doc.text}`).join("\n\n");
    if (!combined.trim()) {
      showToast("请先导入或粘贴语料。");
      qs("#analyzeCorpusButton").disabled = false;
      qs("#fileStatus").textContent = "尚未选择文件。";
      return;
    }
    qs("#fileStatus").textContent = "正在生成 profile...";
    const documentCount = Math.max(1, sourceDocs.length);
    const profile = analyzeText(combined, name, documentCount, sourceDocs);
    profiles = [profile, ...profiles.filter((item) => item.id !== profile.id)];
    activeProfileId = profile.id;
    saveProfiles();
    render();
    renderAnalysisPreview(profile);
    qs("#analyzeCorpusButton").disabled = false;
    qs("#fileStatus").textContent = selectedCorpusFiles.length ? `已读取 ${selectedCorpusFiles.length} 个文件。` : "尚未选择文件。";
    showToast(fileResult.errors.length ? `已生成；${fileResult.errors.length} 个文件失败` : "Profile 已生成。");
  });

  qs("#draftButton").addEventListener("click", () => {
    qs("#rewriteOutput").value = localDraft(activeProfile(), qs("#ideaInput").value, qs("#rewriteMode").value);
  });

  qs("#promptButton").addEventListener("click", () => {
    qs("#rewriteOutput").value = aiPrompt(activeProfile(), qs("#ideaInput").value, qs("#rewriteMode").value, qs("#longformMode").value);
  });

  qs("#aiLongformButton").addEventListener("click", async () => {
    const idea = qs("#ideaInput").value.trim();
    if (!idea) {
      showToast("请先输入你的观点。");
      return;
    }
    qs("#aiLongformButton").disabled = true;
    qs("#aiStatus").textContent = "正在调用模型...";
    try {
      const prompt = buildLongformPrompt(activeProfile(), idea, qs("#rewriteMode").value, qs("#longformMode").value);
      qs("#rewriteOutput").value = await callOpenAIResponse(prompt);
      qs("#aiStatus").textContent = "模型生成完成。";
    } catch (error) {
      qs("#aiStatus").textContent = `调用失败：${error.message}`;
      showToast("模型调用失败。");
    } finally {
      qs("#aiLongformButton").disabled = false;
    }
  });

  qs("#copyRewriteButton").addEventListener("click", async () => {
    await copyText(qs("#rewriteOutput").value);
    showToast("已复制。");
  });

  qs("#diagnoseButton").addEventListener("click", () => {
    const text = qs("#diagnoseInput").value.trim();
    if (!text) {
      showToast("请先粘贴诊断文本。");
      return;
    }
    renderDiagnosis(diagnoseText(activeProfile(), text));
  });

  qs("#exportProfileButton").addEventListener("click", () => {
    const profile = activeProfile();
    download(`${profile.name}-profile.json`, JSON.stringify(profile, null, 2), "application/json;charset=utf-8");
  });

  qs("#exportRulebookButton").addEventListener("click", () => {
    const profile = activeProfile();
    download(`${profile.name}-rules.md`, profileToMarkdown(profile));
  });

  qs("#exportCitationIndexButton").addEventListener("click", () => {
    const profile = activeProfile();
    download(`${profile.name}-citations.md`, citationIndexToMarkdown(profile));
  });

  qs("#saveAiSettingsButton").addEventListener("click", () => {
    saveAiSettingsFromForm();
    showToast(aiSettings.rememberKey ? "AI 设置已保存到本机。" : "AI 设置已保存到当前会话。");
  });

  qs("#deleteProfileButton").addEventListener("click", () => {
    const current = activeProfile();
    if (!window.confirm(`删除「${current.name}」这个本地 profile？`)) return;
    profiles = profiles.filter((profile) => profile.id !== current.id);
    if (!profiles.length) profiles = [normalizeProfile(defaultProfile)];
    activeProfileId = profiles[0].id;
    saveProfiles();
    render();
    showToast("已删除当前 profile。");
  });

  qs("#resetProfilesButton").addEventListener("click", () => {
    if (!window.confirm("清空本地 profile，并恢复张志强测试样例？")) return;
    profiles = [normalizeProfile(defaultProfile)];
    activeProfileId = defaultProfile.id;
    saveProfiles();
    render();
    showToast("已恢复样例。");
  });

  qs("#importProfileInput").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const profile = JSON.parse(await file.text());
      profile.id = profile.id || `${slugify(profile.name || "imported")}-${Date.now()}`;
      const normalized = normalizeProfile(profile);
      profiles = [normalized, ...profiles.filter((item) => item.id !== normalized.id)];
      activeProfileId = normalized.id;
      saveProfiles();
      render();
      showToast("Profile 已导入。");
    } catch {
      showToast("JSON 解析失败。");
    }
    event.target.value = "";
  });
}

bindEvents();
render();

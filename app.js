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

const genericAiPatterns = [
  "首先",
  "其次",
  "最后",
  "综上所述",
  "总而言之",
  "值得我们思考",
  "具有重要意义",
  "影响深远",
  "在当今社会",
  "随着时代的发展",
  "不可忽视",
  "毫无疑问",
  "显而易见",
  "提供了新的视角",
  "推动了发展",
];

const zhangStyleHints = {
  framing: ["问题域", "时代问题", "历史条件", "价值系统", "现代学术", "思想史", "义理", "经史之学", "现代转型", "内在理路", "学术形态", "思想资源"],
  verbs: ["重构", "收摄", "安顿", "导引", "自觉化", "成立", "开出"],
  relation: ["并非", "而是", "不只是", "不能只", "正是在此意义上", "也就是说", "这意味着"],
  bounded: ["在某种意义上", "可能", "似乎", "并不能简单地", "大致可以说"],
};

const zhangProseFrames = ["现代学术", "思想史", "历史条件", "义理", "经史之学", "现代转型", "价值系统", "内在理路"];

const genericProseFrames = ["问题域", "概念关系", "材料线索", "历史条件", "解释边界", "论证层次", "思想位置", "文本脉络"];

const broadCitationTerms = new Set([
  "哲学",
  "主体",
  "思想",
  "价值",
  "问题",
  "意义",
  "历史",
  "现代",
  "学术",
  "政治",
  "关系",
  "传统",
  "方法",
  "文明",
  "差异",
  "平等",
  "中国",
  "国家",
  "经学",
  "佛学",
  "现代学术",
]);

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

function deleteProfile(profileId) {
  if (profiles.length <= 1) {
    showToast("至少保留一个档案。");
    return;
  }
  const targetIndex = profiles.findIndex((profile) => profile.id === profileId);
  if (targetIndex < 0) return;
  const deleted = profiles[targetIndex];
  profiles = profiles.filter((profile) => profile.id !== profileId);
  if (activeProfileId === profileId) {
    const nextProfile = profiles[Math.min(targetIndex, profiles.length - 1)] || profiles[0] || normalizeProfile(defaultProfile);
    activeProfileId = nextProfile.id;
  }
  saveProfiles();
  render();
  showToast(`已删除「${deleted.name}」。`);
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
  renderBuildState();
  renderSelectedFiles();
  renderBlendControls();
  renderRulebook();
  renderSourcesView();
  renderAiSettings();
}

function renderProfileList() {
  const list = qs("#profileList");
  list.innerHTML = "";
  profiles.forEach((profile) => {
    const item = document.createElement("div");
    item.className = `profile-item${profile.id === activeProfileId ? " active" : ""}`;
    item.dataset.profileId = profile.id;
    item.innerHTML = `
      <button class="profile-select" type="button">
        <span class="profile-name">${escapeHtml(profile.name)}</span>
        <span class="profile-meta">${profile.stats?.tokens || 0} tokens · ${profile.stats?.documents || 1} sources</span>
      </button>
      <button class="profile-delete" type="button" title="删除这个档案" aria-label="删除 ${escapeHtml(profile.name)}">×</button>
    `;
    item.querySelector(".profile-select").addEventListener("click", () => {
      activeProfileId = profile.id;
      render();
    });
    item.querySelector(".profile-delete").addEventListener("click", (event) => {
      event.stopPropagation();
      deleteProfile(profile.id);
    });
    list.appendChild(item);
  });
}

function renderActiveTitle() {
  qs("#activeProfileTitle").textContent = activeProfile().name;
}

function renderBuildState() {
  const profile = activeProfile();
  const nameInput = qs("#profileNameInput");
  if (nameInput && document.activeElement !== nameInput) nameInput.value = profile.name;
  if (qs("#analysisPreview")) renderAnalysisPreview(profile);
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

function renderBlendControls() {
  const selectA = qs("#blendProfileASelect");
  const selectB = qs("#blendProfileBSelect");
  if (!selectA || !selectB) return;
  const previousA = selectA.value || activeProfileId;
  const previousB = selectB.value || profiles.find((profile) => profile.id !== previousA)?.id || previousA;
  const options = profiles.map((profile) => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`).join("");
  selectA.innerHTML = options;
  selectB.innerHTML = options;
  selectA.value = profiles.some((profile) => profile.id === previousA) ? previousA : activeProfileId;
  const fallbackB = profiles.find((profile) => profile.id !== selectA.value)?.id || selectA.value;
  selectB.value = profiles.some((profile) => profile.id === previousB) ? previousB : fallbackB;
  updateBlendWeightLabel();
}

function updateBlendWeightLabel() {
  const weightInput = qs("#blendWeightInput");
  const label = qs("#blendWeightLabel");
  if (!weightInput || !label) return;
  const weightA = Number(weightInput.value || 50);
  label.textContent = `${weightA}% / ${100 - weightA}%`;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "未知大小";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function fileIdentity(file) {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

function mergeSelectedFiles(files) {
  const seen = new Set(selectedCorpusFiles.map(fileIdentity));
  Array.from(files || []).forEach((file) => {
    const key = fileIdentity(file);
    if (!seen.has(key)) {
      selectedCorpusFiles.push(file);
      seen.add(key);
    }
  });
}

function renderSelectedFiles(statusOverride = "") {
  const status = qs("#fileStatus");
  const list = qs("#selectedFilesList");
  if (!status || !list) return;
  const count = selectedCorpusFiles.length;
  status.textContent = statusOverride || (count ? `已选择 ${count} 个文件。` : "尚未选择文件。");
  list.innerHTML = selectedCorpusFiles.map((file, index) => `
    <div class="selected-file-item">
      <span class="selected-file-info">
        <span class="selected-file-name">${escapeHtml(file.name)}</span>
        <span class="selected-file-meta">${formatFileSize(file.size)}</span>
      </span>
      <button class="selected-file-remove" type="button" data-file-index="${index}" title="删除这个文件" aria-label="删除 ${escapeHtml(file.name)}">×</button>
    </div>
  `).join("");
  qsa(".selected-file-remove").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.fileIndex);
      selectedCorpusFiles.splice(index, 1);
      qs("#corpusFilesInput").value = "";
      renderSelectedFiles();
    });
  });
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

function ensureJsZip() {
  const JSZip = window.JSZip;
  if (!JSZip) throw new Error("DOCX 解析库尚未加载，请刷新页面后重试。");
  return JSZip;
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

function parseDocxParagraphs(xmlText) {
  if (!xmlText) return [];
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  if (xml.getElementsByTagName("parsererror").length) {
    throw new Error("DOCX XML 解析失败。");
  }

  function collectText(node, pieces) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const localName = node.localName;
    if (localName === "t") {
      pieces.push(node.textContent || "");
      return;
    }
    if (localName === "tab") {
      pieces.push("\t");
      return;
    }
    if (localName === "br" || localName === "cr") {
      pieces.push("\n");
      return;
    }
    Array.from(node.childNodes).forEach((child) => collectText(child, pieces));
  }

  return Array.from(xml.getElementsByTagNameNS("*", "p"))
    .map((paragraph) => {
      const pieces = [];
      collectText(paragraph, pieces);
      return pieces.join("").replace(/\u00a0/g, " ").trim();
    })
    .filter(Boolean);
}

async function readZipText(zip, path) {
  const entry = zip.file(path);
  return entry ? entry.async("text") : "";
}

async function parseDocxFile(file) {
  const JSZip = ensureJsZip();
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const bodyXml = await readZipText(zip, "word/document.xml");
  if (!bodyXml) throw new Error("未找到 DOCX 正文。");

  const body = parseDocxParagraphs(bodyXml);
  const footnotes = parseDocxParagraphs(await readZipText(zip, "word/footnotes.xml"));
  const endnotes = parseDocxParagraphs(await readZipText(zip, "word/endnotes.xml"));
  const notes = [...footnotes, ...endnotes]
    .map((note) => note.replace(/\s+/g, " ").trim())
    .filter((note) => note && !/^(separator|continuationSeparator)$/i.test(note));
  const noteText = notes.length
    ? `\n\n[[notes 脚注/尾注]]\n${notes.map((note, index) => `[注${index + 1}] ${note}`).join("\n")}`
    : "";

  return {
    title: file.name.replace(/\.docx$/i, ""),
    type: "docx",
    pages: null,
    text: `${body.join("\n\n")}${noteText}`.trim(),
    pageTexts: null,
    notes: notes.length,
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
  const directTerms = (profile.lexicon || []).filter((term) => term.length >= 2 && text.includes(term));
  const query = `${text} ${directTerms.join(" ")}`;
  return pool
    .map((entry) => {
      const hits = (entry.terms || []).filter((term) => query.includes(term));
      const directHits = hits.filter((term) => text.includes(term));
      const specificHits = directHits.filter((term) => !broadCitationTerms.has(term));
      const titleHit = query.includes(entry.sourceTitle);
      return {
        ...entry,
        score: directHits.length * 2 + specificHits.length * 3 + (titleHit ? 4 : 0),
        _directHits: directHits,
        _specificHits: specificHits,
        _titleHit: titleHit,
      };
    })
    .filter((entry) => entry._titleHit || entry._specificHits.length > 0 || entry._directHits.length >= 2)
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
  if (/^(.)\1{2,}$/.test(clean) || /(.)\1{3,}/.test(clean)) return false;
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
      if (/\.docx$/i.test(file.name)) {
        qs("#fileStatus").textContent = `正在解析 DOCX：${file.name}`;
        docs.push(await parseDocxFile(file));
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
        continue;
      }
      errors.push(`${file.name}: 暂不支持该文件类型。`);
    } catch (error) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }
  const withIds = assignSourceIds(docs);
  return { text: withIds.map((doc) => `[[${doc.id} ${doc.title}]]\n${doc.text}`).join("\n\n"), docs: withIds, errors };
}

function inferMarkdownTitle(text) {
  const heading = text.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
  if (heading) return compactClause(cleanMarkdownInline(heading[1]), 36) || "粘贴 Markdown 语料";
  return "粘贴 Markdown 语料";
}

function cleanMarkdownInline(text) {
  return String(text)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function cleanMarkdownText(text) {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?|```/g, ""))
    .replace(/^\s{0,3}#{1,6}\s+(.+)$/gm, (_, heading) => `\n${cleanMarkdownInline(heading)}\n`)
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*\|(.+)\|\s*$/gm, (_, row) => row.split("|").map((cell) => cleanMarkdownInline(cell)).filter(Boolean).join("；"))
    .replace(/^\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+$/gm, "")
    .split("\n")
    .map((line) => cleanMarkdownInline(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parsePastedCorpus(text, format) {
  if (format === "markdown") {
    return {
      title: inferMarkdownTitle(text),
      type: "md-paste",
      pages: null,
      text: cleanMarkdownText(text),
      pageTexts: null,
    };
  }
  return {
    title: "粘贴语料",
    type: "paste",
    pages: null,
    text,
    pageTexts: null,
  };
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

function formatBriefList(items, limit = 8, empty = "暂无记录") {
  const rows = (items || [])
    .filter(Boolean)
    .slice(0, limit)
    .map((item) => (typeof item === "string" ? item : item.item || item.title || ""));
  return rows.length ? rows.map((item) => `- ${item}`).join("\n") : `- ${empty}`;
}

function formatMoveList(moves, limit = 4) {
  const rows = (moves || []).slice(0, limit).map((entry) => `${entry.item}${entry.count ? `（${entry.count}）` : ""}`);
  return rows.length ? rows.join("、") : "暂无记录";
}

function profileToHumanBrief(profile) {
  const sources = profile.sources || [];
  const paragraphModel = profile.paragraphModel || {};
  const quoteRatio = profile.voiceStats?.quoteRatio != null ? `${Math.round(profile.voiceStats.quoteRatio * 100)}%` : "未统计";
  return `${profile.name} 写作档案说明

这是什么
这是一个由网页根据语料自动生成的“写作风格档案”。它用来帮助使用者分析和改写中文学术文本，例如把自己的观点改写成更接近某位学者的论述结构、遣词方式和段落推进方式。

它不是该学者本人，也不代表该学者观点；正式论文仍然需要自己核验文献、页码和原文。

适合用来做什么
- 把自己的观点改写成更像学术论文段落的表达。
- 检查一段文字是否太像普通 AI 润色腔。
- 根据已导入语料，提示可能相关的出处线索。
- 为一个学者或一组文章整理“写作规则说明”。

不适合直接做什么
- 不适合把生成结果当作最终论文直接提交。
- 不适合冒充某位学者本人发言。
- 不适合在没有核验的情况下直接使用出处。

语料概况
- 来源数量：${sources.length || profile.stats?.documents || 0}
- 语料规模：约 ${profile.stats?.tokens || 0} tokens，${profile.stats?.sentences || 0} 句
- 平均句长：${profile.stats?.avgSentenceLength ?? "未统计"}
- 作者文本/长引文分离：长引文约占 ${quoteRatio}

语料来源
${sources.length ? sources.map((source) => `- [${source.id}] ${source.title}${source.type ? `（${source.type}）` : ""}`).join("\n") : "- 暂无记录"}

主要风格特点
1. 高频概念词
${formatBriefList(profile.lexicon, 12)}

2. 常见连接方式
- 转折/区分：${(profile.markers?.contrast || []).slice(0, 10).join("、") || "暂无记录"}
- 因果/推进：${(profile.markers?.causal || []).slice(0, 8).join("、") || "暂无记录"}
- 谨慎判断：${(profile.markers?.hedge || []).slice(0, 8).join("、") || "暂无记录"}

3. 段落推进习惯
- 开头常见动作：${formatMoveList(paragraphModel.openingMoves)}
- 中段常见动作：${formatMoveList(paragraphModel.middleMoves)}
- 收束常见动作：${formatMoveList(paragraphModel.closingMoves)}

推荐使用流程
1. 在左侧选择这个档案。
2. 打开“改写”，粘贴自己的原始观点或段落。
3. 点击“Codex 风格重构”，先得到本地改写稿。
4. 如果填写了 API Key，可以再点击“调用模型生成长文”。
5. 打开“诊断”，把生成结果贴进去，看它是否接近当前档案。
6. 打开“文献”，核对建议出处是否真的支持你的论断。

给使用者的提醒
- 好的用法是“借它改写结构和表达”，不是让它替你想完所有论证。
- 引用别人原文时，必须自己回到原文核页码。
- 如果要分享给别人导入网站，请导出“完整档案”；如果只是让别人理解这个档案，就发这份说明。`;
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

function extractArgument(text) {
  const clean = text.trim().replace(/\s+/g, " ");
  const sentences = splitSentences(clean);
  const fallback = clean.slice(0, 96);
  const thesis =
    sentences.find((sentence) => /(不是|不只是|并非|而是|在于|认为|应当|需要|关乎|意味着)/.test(sentence)) ||
    sentences[0] ||
    fallback;
  const problem =
    sentences.find((sentence) => /(问题|如何|为什么|何以|要理解|关乎)/.test(sentence)) ||
    thesis;
  const evidence = sentences
    .filter((sentence) => /(因为|由于|例如|材料|文献|表明|显示|说明|根据|一方面|另一方面)/.test(sentence))
    .slice(0, 3);
  const uncertainty = sentences
    .filter((sentence) => /(可能|或许|似乎|尚需|仍需|不能简单|有待)/.test(sentence))
    .slice(0, 2);
  return {
    topic: thesis.replace(/[。！？!?].*$/, "").slice(0, 54) || "这个问题",
    problem,
    thesis,
    evidence,
    uncertainty,
    sentenceCount: sentences.length,
  };
}

function clipText(text, limit = 160) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}...` : clean;
}

function chunkIdeaText(text, maxChars = 1600) {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const units = paragraphs.length ? paragraphs : splitSentences(text);
  const chunks = [];
  let current = "";
  units.forEach((unit) => {
    if (unit.length > maxChars) {
      splitSentences(unit).forEach((sentence) => {
        if ((current + sentence).length > maxChars && current) {
          chunks.push(current.trim());
          current = "";
        }
        current += `${sentence} `;
      });
      return;
    }
    if ((current + unit).length > maxChars && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += `${unit}\n\n`;
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.trim()];
}

function collectSentences(sentences, pattern, limit) {
  return uniqueItems(sentences.filter((sentence) => pattern.test(sentence)).map((sentence) => clipText(sentence, 180))).slice(0, limit);
}

function buildIdeaEvidencePack(text) {
  const clean = text.trim().replace(/\r\n?/g, "\n");
  const sentences = splitSentences(clean);
  const chunks = chunkIdeaText(clean);
  const claims = collectSentences(sentences, /(并非|不是|不只是|而是|认为|应当|需要|关键|核心|意味着|可以说|显示出|说明)/, 10);
  const evidence = collectSentences(sentences, /(因为|由于|例如|比如|材料|文本|文献|显示|说明|一方面|另一方面|首先|其次|其一|其二|可见|由此)/, 12);
  const uncertainty = collectSentences(sentences, /(可能|或许|似乎|大致|仍需|有待|不能简单|尚需|待核验|需要进一步)/, 8);
  const terms = mineIdeaTerms(clean).slice(0, 12);
  const chunkSummaries = chunks.map((chunk, index) => {
    const arg = extractArgument(chunk);
    return {
      id: `C${index + 1}`,
      chars: chunk.length,
      thesis: clipText(arg.thesis, 130),
      evidence: arg.evidence.map((item) => clipText(item, 130)).slice(0, 2),
    };
  });
  return {
    chars: clean.length,
    sentences: sentences.length,
    chunks: chunks.length,
    terms,
    claims: claims.length ? claims : sentences.slice(0, 3).map((sentence) => clipText(sentence, 180)),
    evidence,
    uncertainty,
    chunkSummaries,
  };
}

function numberedLines(items, prefix, emptyText, limit = 12) {
  const selected = (items || []).slice(0, limit);
  if (!selected.length) return `- ${emptyText}`;
  return selected.map((item, index) => `- [${prefix}${index + 1}] ${item}`).join("\n");
}

function formatIdeaPackMarkdown(pack) {
  return `## 原始观点吸收包

- 输入规模: ${pack.chars} 字符；${pack.sentences} 个句子；已分为 ${pack.chunks} 个材料块。
- 关键词: ${pack.terms.join("、") || "未抽出稳定关键词"}

### 分块理解
${pack.chunkSummaries.map((chunk) => `- [${chunk.id}] ${chunk.chars} 字符：${chunk.thesis}`).join("\n")}

### 证据锁定句
${numberedLines(pack.evidence, "E", "原文没有明显证据句；改写时只能保留为观点，不得补成事实。")}

### 核心判断句
${numberedLines(pack.claims, "P", "原文没有明显判断句；请先补充核心观点。", 10)}

### 不确定/待核验
${numberedLines(pack.uncertainty, "U", "原文没有显式不确定句；凡超出原文的外部事实仍需核验。", 8)}`;
}

function formatIdeaPackForPrompt(pack) {
  return `【原始观点吸收包】
输入规模：${pack.chars} 字符；${pack.sentences} 个句子；${pack.chunks} 个材料块。
关键词：${pack.terms.join("、") || "未抽出稳定关键词"}

分块理解：
${pack.chunkSummaries.map((chunk) => `[${chunk.id}] ${chunk.thesis}`).join("\n")}

证据锁定句：
${numberedLines(pack.evidence, "E", "无明显证据句；不得补写成事实。")}

核心判断句：
${numberedLines(pack.claims, "P", "无明显判断句；不得代替用户立论。", 10)}

不确定/待核验：
${numberedLines(pack.uncertainty, "U", "无显式不确定句；超出原文的事实判断都要标为仍需核验。", 8)}`;
}

function isZhangProfile(profile) {
  return profile.id === "zhang-zhiqiang" || profile.name === "张志强";
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function compactClause(text, limit = 34) {
  const clean = text
    .replace(/^[，,；;。！？\s]+|[，,；;。！？\s]+$/g, "")
    .replace(/^(把|将|对|关于|围绕)/, "")
    .replace(/\s+/g, "");
  return clean.length > limit ? `${clean.slice(0, limit)}…` : clean;
}

function mineIdeaTerms(text) {
  const quoted = Array.from(text.matchAll(/[《“"]([^》”"]{2,20})[》”"]/g)).map((match) => match[1]);
  const conceptual = Array.from(text.matchAll(/[\u4e00-\u9fffA-Za-z0-9·]{2,14}(?:思想|义理|危机|进化论|齐物论|经世|问题|资源|处境|转型|现代性|佛教|儒学|庄学|西学|佛学|唯识学|阿赖耶识|本体论|主体|传统|学术)/g))
    .map((match) => match[0].replace(/^的/, ""));
  const named = Array.from(text.matchAll(/(?:章太炎|康有为|欧阳竟无|王阳明|熊十力|梁启超|严复|佛教|唯识学|今文经学|理学|庄学|儒学|西学|现代性|阿赖耶识|真如|良知)/g))
    .map((match) => match[0]);
  return uniqueItems([...named, ...quoted, ...conceptual]).slice(0, 12);
}

function buildProblemTopic(argument, terms) {
  const core = terms
    .filter((term) => term.length >= 2 && !/^(问题|思想|历史|概念|价值|主体|传统|现代)$/.test(term))
    .slice(0, 3);
  if (core.length >= 2) return `${core.join("、")}之间的关系`;
  if (core.length === 1) return `${core[0]}所展开的问题`;
  return compactClause(argument.topic, 28) || "这个问题";
}

function extractContrastFrame(text) {
  const match = text.match(/(?:并不是|不只是|并非|不是)([^。；;，,]{2,80})[，,；;]?(?:而是|而在于)([^。；;]{2,100})/);
  if (!match) return null;
  return {
    rejected: compactClause(match[1], 28),
    affirmed: compactClause(match[2], 40),
  };
}

function pickProfileTerms(profile, idea, count = 8) {
  const lexicon = profile.lexicon || [];
  const ideaTerms = mineIdeaTerms(idea);
  const hits = lexicon.filter((term) => idea.includes(term));
  const fallback = isZhangProfile(profile)
    ? uniqueItems([...ideaTerms, ...zhangStyleHints.framing, ...hits, ...lexicon, ...zhangStyleHints.verbs])
    : uniqueItems([...ideaTerms, ...hits, ...lexicon, ...profileMoveItems(profile), ...genericProseFrames]);
  return fallback.filter((item) => item && isContentTerm(item)).slice(0, count);
}

function profileStyleLexicon(profile) {
  return isZhangProfile(profile)
    ? uniqueItems([...(profile.lexicon || []), ...zhangStyleHints.framing, ...zhangStyleHints.verbs])
    : (profile.lexicon || []);
}

function profileMoveItems(profile) {
  const model = profile.paragraphModel || {};
  return [
    ...(model.openingMoves || []),
    ...(model.middleMoves || []),
    ...(model.closingMoves || []),
  ].map((entry) => entry.item).filter(Boolean);
}

function pickFrameTerms(profile, idea) {
  const lexiconHits = (profile.lexicon || []).filter((term) => idea.includes(term));
  const pool = isZhangProfile(profile)
    ? uniqueItems([...zhangProseFrames, ...lexiconHits, ...(profile.lexicon || []), ...zhangStyleHints.framing])
    : uniqueItems([...lexiconHits, ...(profile.lexicon || []), ...profileMoveItems(profile), ...genericProseFrames]);
  return pool.filter((item) => item && isContentTerm(item)).slice(0, 5);
}

function uniqueCitationRefs(citations, limit = 3) {
  const seen = new Set();
  const refs = [];
  citations.forEach((entry) => {
    const ref = formatCitationRef(entry);
    if (seen.has(ref)) return;
    seen.add(ref);
    refs.push(ref);
  });
  return refs.slice(0, limit);
}

function weightedAverage(valueA, valueB, weightA) {
  const a = Number(valueA || 0);
  const b = Number(valueB || 0);
  return Number(((a * weightA + b * (100 - weightA)) / 100).toFixed(2));
}

function blendWeightedList(itemsA = [], itemsB = [], weightA = 50, limit = 24) {
  const quotaA = Math.max(0, Math.min(limit, Math.round((limit * weightA) / 100)));
  const quotaB = Math.max(0, limit - quotaA);
  return uniqueItems([
    ...itemsA.slice(0, quotaA),
    ...itemsB.slice(0, quotaB),
    ...itemsA,
    ...itemsB,
  ]).filter((item) => item && (typeof item !== "string" || isContentTerm(item))).slice(0, limit);
}

function blendMoveList(movesA = [], movesB = [], weightA = 50, limit = 5) {
  const counts = new Map();
  movesA.forEach((entry) => counts.set(entry.item, (counts.get(entry.item) || 0) + (entry.count || 1) * weightA));
  movesB.forEach((entry) => counts.set(entry.item, (counts.get(entry.item) || 0) + (entry.count || 1) * (100 - weightA)));
  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count: Number((count / 100).toFixed(2)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function createBlendedProfile(profileA, profileB, weightA = 50) {
  const weight = Math.max(0, Math.min(100, Number(weightA) || 50));
  const weightB = 100 - weight;
  const lexicon = blendWeightedList(profileA.lexicon || [], profileB.lexicon || [], weight, 32);
  return {
    id: `blend-${profileA.id}-${profileB.id}-${weight}`,
    name: `${profileA.name} ${weight}% × ${profileB.name} ${weightB}%`,
    createdAt: new Date().toISOString().slice(0, 10),
    source: `交叉风格临时 profile：${profileA.name} ${weight}% / ${profileB.name} ${weightB}%`,
    stats: {
      documents: (profileA.stats?.documents || 0) + (profileB.stats?.documents || 0),
      tokens: (profileA.stats?.tokens || 0) + (profileB.stats?.tokens || 0),
      sentences: (profileA.stats?.sentences || 0) + (profileB.stats?.sentences || 0),
      paragraphs: (profileA.stats?.paragraphs || 0) + (profileB.stats?.paragraphs || 0),
      avgSentenceLength: weightedAverage(profileA.stats?.avgSentenceLength, profileB.stats?.avgSentenceLength, weight),
      sentenceStdev: weightedAverage(profileA.stats?.sentenceStdev, profileB.stats?.sentenceStdev, weight),
    },
    lexicon,
    pairs: blendWeightedList(profileA.pairs || [], profileB.pairs || [], weight, 10),
    markers: {
      contrast: blendWeightedList(profileA.markers?.contrast || [], profileB.markers?.contrast || [], weight, 8),
      causal: blendWeightedList(profileA.markers?.causal || [], profileB.markers?.causal || [], weight, 8),
      reformulation: blendWeightedList(profileA.markers?.reformulation || [], profileB.markers?.reformulation || [], weight, 8),
      hedge: blendWeightedList(profileA.markers?.hedge || [], profileB.markers?.hedge || [], weight, 8),
    },
    sentenceRules: [
      `句长目标按比例融合：${profileA.name} ${weight}% / ${profileB.name} ${weightB}%。`,
      "优先使用两个 profile 的共有学术动作，其次保留各自有辨识度的连接和限定方式。",
      "避免任何一方的标志性句式过度集中出现。",
    ],
    paragraphRules: [
      "开头建立复合问题域，不直接显露单一作者框架。",
      "中段混合两方的段落动作：一方提供结构推进，另一方提供概念或材料线索。",
      "结尾做有限判断和证据边界标注，不冒充任一学者。",
    ],
    argumentPatterns: blendWeightedList(profileA.argumentPatterns || [], profileB.argumentPatterns || [], weight, 10),
    negative: [
      "不要冒充任一学者本人。",
      "不要复制任一 profile 的原文句子。",
      "不要把融合稿写成单一作者可辨识的口吻。",
      "不要为了弱化风格痕迹而牺牲论证和证据边界。",
    ],
    sources: [...(profileA.sources || []), ...(profileB.sources || [])],
    citationIndex: [...(profileA.citationIndex || []), ...(profileB.citationIndex || [])].slice(0, 360),
    voiceStats: {
      authorChars: (profileA.voiceStats?.authorChars || 0) + (profileB.voiceStats?.authorChars || 0),
      quotedChars: (profileA.voiceStats?.quotedChars || 0) + (profileB.voiceStats?.quotedChars || 0),
      quoteSegments: (profileA.voiceStats?.quoteSegments || 0) + (profileB.voiceStats?.quoteSegments || 0),
      note: "交叉风格临时 profile 的统计只用于本次调度。",
    },
    paragraphModel: {
      avgParagraphLength: weightedAverage(profileA.paragraphModel?.avgParagraphLength, profileB.paragraphModel?.avgParagraphLength, weight),
      openingMoves: blendMoveList(profileA.paragraphModel?.openingMoves || [], profileB.paragraphModel?.openingMoves || [], weight),
      middleMoves: blendMoveList(profileA.paragraphModel?.middleMoves || [], profileB.paragraphModel?.middleMoves || [], weight),
      closingMoves: blendMoveList(profileA.paragraphModel?.closingMoves || [], profileB.paragraphModel?.closingMoves || [], weight),
    },
    blendMeta: {
      profileA: profileA.name,
      profileB: profileB.name,
      weightA: weight,
      weightB,
    },
  };
}

function antiGenericAudit(text) {
  const hits = genericAiPatterns.filter((pattern) => text.includes(pattern));
  const sentenceLengths = splitSentences(text).map((sentence) => tokenize(sentence).length);
  const shortSentenceRatio = sentenceLengths.length
    ? sentenceLengths.filter((length) => length > 0 && length < 18).length / sentenceLengths.length
    : 0;
  return {
    hits,
    shortSentenceRatio: Number(shortSentenceRatio.toFixed(2)),
    penalty: Math.min(28, hits.length * 5 + (shortSentenceRatio > 0.6 ? 8 : 0)),
  };
}

function styleAudit(profile, text) {
  const sentences = splitSentences(text);
  const stats = sentenceStats(sentences);
  const contrastHits = (profile.markers?.contrast || []).filter((item) => text.includes(item));
  const causalHits = (profile.markers?.causal || []).filter((item) => text.includes(item));
  const reformulationHits = (profile.markers?.reformulation || []).filter((item) => text.includes(item));
  const lexiconHits = profileStyleLexicon(profile).filter((item) => text.includes(item));
  const hasProblemFrame = /问题域|时代问题|历史条件|要理解|如何理解|关乎|意味着|在此意义上/.test(text);
  const hasBoundedClaim = /在某种意义上|可能|或许|似乎|并不能简单地|大致可以说|暂时只能说/.test(text);
  const generic = antiGenericAudit(text);
  let score = 0;
  score += Math.min(22, contrastHits.length * 6);
  score += Math.min(16, causalHits.length * 4);
  score += Math.min(14, reformulationHits.length * 5);
  score += Math.min(20, lexiconHits.length * 3);
  score += hasProblemFrame ? 14 : 0;
  score += hasBoundedClaim ? 8 : 0;
  score += stats.mean >= 28 ? 10 : stats.mean >= 20 ? 6 : 2;
  score = Math.max(0, Math.min(100, score - generic.penalty));
  return {
    score,
    stats,
    contrastHits,
    causalHits,
    reformulationHits,
    lexiconHits,
    hasProblemFrame,
    hasBoundedClaim,
    generic,
    suggestions: buildAuditSuggestions({ contrastHits, causalHits, reformulationHits, lexiconHits, hasProblemFrame, hasBoundedClaim, stats, generic }),
  };
}

function buildAuditSuggestions(audit) {
  const suggestions = [];
  if (!audit.hasProblemFrame) suggestions.push("开头需要先建立问题域，而不是直接宣布结论。");
  if (!audit.contrastHits.length) suggestions.push("加入“并非/不是……而是……”一类概念区分。");
  if (!audit.reformulationHits.length) suggestions.push("加入“也就是说/换言之/正是在此意义上”的重述推进。");
  if (audit.lexiconHits.length < 3) suggestions.push("增加当前 profile 的核心概念词，避免只保留用户原句。");
  if (!audit.hasBoundedClaim) suggestions.push("结尾应给出有限判断，用“在某种意义上/暂时只能说”校准强度。");
  if (audit.stats.mean < 24) suggestions.push("句子偏短，适当增加限定、转折和因果层次。");
  if (audit.generic.hits.length) suggestions.push(`删除通用 AI 腔：${audit.generic.hits.join("、")}。`);
  return suggestions.length ? suggestions : ["风格结构基本通过；下一步主要补充文献证据和更具体的问题域。"];
}

function scoreSentenceRhythm(profile, stats) {
  const target = profile.stats?.avgSentenceLength || 30;
  const distance = Math.abs((stats.mean || 0) - target);
  if (distance <= 8) return 12;
  if (distance <= 16) return 9;
  if (stats.mean >= 24) return 7;
  if (stats.mean >= 18) return 4;
  return 2;
}

function markerHits(profile, key, text, fallback = []) {
  const pool = uniqueItems([...(profile.markers?.[key] || []), ...fallback]).filter(Boolean);
  return pool.filter((item) => text.includes(item));
}

function styleAudit(profile, text) {
  const sentences = splitSentences(text);
  const stats = sentenceStats(sentences);
  const isZhang = isZhangProfile(profile);
  const contrastHits = markerHits(profile, "contrast", text, isZhang ? zhangStyleHints.relation : markerSets.contrast.slice(0, 6));
  const causalHits = markerHits(profile, "causal", text, markerSets.causal.slice(0, 5));
  const reformulationHits = markerHits(profile, "reformulation", text, isZhang ? zhangStyleHints.relation : ["也就是说", "换言之", "在此意义上", "严格说来"]);
  const lexiconPool = profileStyleLexicon(profile).filter((item) => item && isContentTerm(item));
  const lexiconHits = uniqueItems(lexiconPool.filter((item) => text.includes(item)));
  const frameHits = uniqueItems(pickFrameTerms(profile, text).filter((item) => text.includes(item)));
  const hasProblemFrame = /问题域|问题性|如何理解|意味着|关乎|历史条件|文本脉络|材料线索|解释边界|在此意义上|理论重心/.test(text);
  const hasBoundedClaim = /在某种意义上|可能|或许|似乎|并不能简单地|大致可以说|暂时只能|仍需|还需要|可以说/.test(text);
  const hasProfileStructure = profileMoveItems(profile).some((item) => text.includes(item)) || /开端|中段|结尾|段落|论证|铺陈|推进/.test(text);
  const generic = antiGenericAudit(text);
  let score = 0;
  score += Math.min(18, contrastHits.length * 5);
  score += Math.min(12, causalHits.length * 4);
  score += Math.min(14, reformulationHits.length * 5);
  score += Math.min(30, lexiconHits.length * 5);
  score += Math.min(10, frameHits.length * 3);
  score += hasProblemFrame ? 8 : 0;
  score += hasBoundedClaim ? 8 : 0;
  score += hasProfileStructure ? 8 : 0;
  score += scoreSentenceRhythm(profile, stats);
  score = Math.max(0, Math.min(100, Math.round(score - generic.penalty)));
  return {
    score,
    stats,
    contrastHits,
    causalHits,
    reformulationHits,
    lexiconHits,
    frameHits,
    hasProblemFrame,
    hasBoundedClaim,
    hasProfileStructure,
    generic,
    suggestions: buildAuditSuggestions({ contrastHits, causalHits, reformulationHits, lexiconHits, frameHits, hasProblemFrame, hasBoundedClaim, hasProfileStructure, stats, generic }),
  };
}

function buildAuditSuggestions(audit) {
  const suggestions = [];
  if (!audit.hasProblemFrame) suggestions.push("开头先建立具体问题域，不要直接把原句润色成结论。");
  if (!audit.contrastHits.length) suggestions.push("补入当前 profile 常用的转折或辨析连接词。");
  if (!audit.reformulationHits.length) suggestions.push("加入重述推进，把概念关系再转一层。");
  if (audit.lexiconHits.length < 5) suggestions.push("增加当前 profile 的独有概念词，避免两个作者写成同一种口吻。");
  if (!audit.hasProfileStructure) suggestions.push("把当前 profile 的段落动作写进文本，比如历史定位、文献引入、概念展开或关系澄清。");
  if (!audit.hasBoundedClaim) suggestions.push("结尾用有限判断收束，保留可核验范围。");
  if (audit.generic.hits.length) suggestions.push(`删除通用 AI 腔：${audit.generic.hits.join("、")}。`);
  return suggestions.length ? suggestions : ["规则命中度较高；下一步主要补充具体文献、页码和原文证据。"];
}

function buildCodexStyleDraft(profile, idea, mode) {
  const cleanIdea = idea.trim().replace(/\s+/g, " ");
  const argument = extractArgument(cleanIdea);
  const terms = pickProfileTerms(profile, cleanIdea, 8);
  const frameTerms = pickFrameTerms(profile, cleanIdea);
  const subject = cleanIdea.match(/(章太炎|康有为|欧阳竟无|王阳明|熊十力|梁启超|严复)/)?.[0] || terms[0] || "主体";
  const focusTerms = terms.filter((term) => term !== subject && !term.includes(subject)).slice(0, 4);
  const termA = focusTerms[0] || terms[0] || "问题域";
  const termB = focusTerms[1] || terms[1] || "价值系统";
  const termC = frameTerms[0] || terms[2] || "历史条件";
  const termD = frameTerms[1] || terms[3] || "主体";
  const termE = frameTerms[2] || "思想史";
  const citations = findCitationMatches(profile, cleanIdea, 6);
  const refs = uniqueCitationRefs(citations, 3);
  const topic = buildProblemTopic(argument, terms);
  const contrast = extractContrastFrame(cleanIdea);
  const rejected = contrast?.rejected || `把${termA}还原为单一来源`;
  const affirmed = contrast?.affirmed || `${termA}在${termC}中的重新组织`;
  const sourceClause = citations.length
    ? `从现有材料看，${refs.join("、")} 可以作为进一步核验的文本入口；`
    : "在尚未补入更具体文献之前，这一判断只能作为问题意识的初步展开；";
  const voicePrefix = mode === "lecture" ? "在我看来，" : "";
  const intro =
    mode === "intro"
      ? `要把${topic}处理为一个真正的学术问题，首先不能从一个已经完成的判断开始，而要追问它是在怎样的${termC}中被提出、又在怎样的${termB}中获得其问题性的。`
      : `${voicePrefix}要理解${topic}，不能只把它看作一个可以直接下判断的对象。它之所以成为问题，正在于它牵涉到${termA}如何在${termC}、${termD}与${termE}之间获得重新配置。`;
  const middle =
    `如果说通常的表述容易把这一问题理解为${rejected}，那么更需要辨明的是，${affirmed}才显示出它的理论重心。也就是说，${termA}在这里并非一个孤立的义理来源，而是使${termB}、${termC}与${termD}发生重新联结的枢纽；${subject}所完成的，也不是把某种外来的概念简单移入中国思想，而是在既有知识传统、现实危机和新的解释需求之间，重新安排可以被论证的思想关系。`;
  const close =
    `${sourceClause}正是在此意义上，这一论述的重心并不在于给出一个外在的价值判断，而在于通过“并非……而是……”的区分，把原先较为平面的说法转化为一个关于${uniqueItems([subject, termA, termB, termC]).join("、") || "概念关系"}的有限解释。暂时只能说，这一解释为后续论证开出了方向，但它还需要回到具体文本，进一步标明其历史位置、概念边界和可成立的范围。`;
  return {
    argument,
    citations,
    draft: `${intro}${middle}${close}`,
  };
}

function dominantMove(profile, key, fallback) {
  return profile.paragraphModel?.[key]?.[0]?.item || fallback;
}

function firstMarker(profile, key, fallback) {
  return profile.markers?.[key]?.find(Boolean) || fallback;
}

function citationSourceClause(citations, refs) {
  return citations.length
    ? `从已建档材料看，${refs.join("、")} 可以作为进一步核验的文本入口；`
    : "在尚未补入更具体文献之前，这一判断只能作为问题意识的初步展开；";
}

function buildZhangDraft(context) {
  const { cleanIdea, ideaPack, argument, terms, frameTerms, subject, focusTerms, citations, refs, topic, contrast, mode } = context;
  const termA = focusTerms[0] || terms[0] || "问题意识";
  const termB = focusTerms[1] || terms[1] || "价值系统";
  const termC = frameTerms[0] || terms[2] || "历史条件";
  const termD = frameTerms[1] || terms[3] || "主体";
  const termE = frameTerms[2] || "思想史";
  const rejected = contrast?.rejected || `把${termA}还原为单一来源`;
  const affirmed = contrast?.affirmed || `${termA}在${termC}中的重新组织`;
  const sourceClause = citationSourceClause(citations, refs);
  const voicePrefix = mode === "lecture" ? "在我看来，" : "";
  const intro =
    mode === "intro"
      ? `要把${topic}处理为一个真正的学术问题，首先不能从一个已经完成的判断开始，而要追问它是在怎样的${termC}中被提出、又在怎样的${termB}中获得其问题性的。`
      : `${voicePrefix}要理解${topic}，不能只把它看作一个可以直接下判断的对象。它之所以成为问题，正在于它牵涉${termA}如何在${termC}、${termD}与${termE}之间获得重新配置。`;
  const middle =
    `如果说通常的表述容易把这一问题理解为${rejected}，那么更需要辨明的是，${affirmed}才显示出它的理论重心。也就是说，${termA}在这里并非一个孤立的义理来源，而是在${termB}、${termC}与${termD}之间发生重新联结的枢纽；${subject}所完成的，也不是把某种外来的概念简单移入中国思想，而是在既有知识传统、现实危机和新的解释需求之间，重新安排可以被论证的思想关系。`;
  const close =
    `${sourceClause}正是在此意义上，这一论述的重心并不在于给出一个外在的价值判断，而在于通过“并非……而是……”的区分，把原先较为平面的说法转化为一个关于${uniqueItems([subject, termA, termB, termC]).join("、") || "概念关系"}的有限解释。暂时只能说，这一解释为后续论证开出了方向，但它还需要回到具体文本，进一步标明其历史位置、概念边界和可成立的范围。`;
  return { argument, ideaPack, citations, draft: `${intro}${middle}${close}` };
}

function buildProfileDraft(profile, context) {
  const { argument, ideaPack, terms, frameTerms, subject, focusTerms, citations, refs, topic, contrast, mode } = context;
  const openingMove = dominantMove(profile, "openingMoves", "问题域铺陈");
  const middleMove = dominantMove(profile, "middleMoves", "关系澄清");
  const closingMove = dominantMove(profile, "closingMoves", "有限判断");
  const contrastMarker = firstMarker(profile, "contrast", "但是");
  const causalMarker = firstMarker(profile, "causal", "因此");
  const reformMarker = firstMarker(profile, "reformulation", "换言之");
  const hedgeMarker = firstMarker(profile, "hedge", "大致可以说");
  const termA = focusTerms[0] || terms[0] || frameTerms[0] || "问题意识";
  const termB = focusTerms[1] || terms[1] || frameTerms[1] || "解释线索";
  const termC = frameTerms[0] || terms[2] || "文本脉络";
  const termD = frameTerms[1] || terms[3] || "思想位置";
  const rejected = contrast?.rejected || `把${termA}处理成现成结论`;
  const affirmed = contrast?.affirmed || `从${termC}中重新说明${termA}与${termB}的关系`;
  const sourceClause = citationSourceClause(citations, refs);
  const anchorTerms = uniqueItems([subject, termA, termB, termC, termD, ...frameTerms]).slice(0, 6).join("、");
  const lead =
    openingMove.includes("历史")
      ? `若把${topic}放回${termC}的展开过程之中，问题的重心就不只是判断${subject}“是什么”，而是说明${termA}如何在特定历史位置上被重新组织。`
      : openingMove.includes("文献")
        ? `从材料线索进入${topic}，先要把${subject}、${termA}与${termB}之间的文本关系交代清楚，而不是先给出一个抽象判断。`
        : `所谓${topic}，并不是一个可以直接套用定义的对象；它更像是围绕${anchorTerms || termA}展开的问题域。`;
  const intro = mode === "lecture" ? `在我看来，${lead}` : lead;
  const middle =
    `若依照“${openingMove}—${middleMove}”的推进方式，这里需要先承认一般说法的有效范围，${contrastMarker}不能停留在${rejected}这一层。更关键的是，${affirmed}，这使${termA}不再只是一个名词，而成为连接${termB}、${termC}与${termD}的论证枢纽。${reformMarker}，真正需要展开的是这些概念在文本、历史处境和解释需求之间怎样相互牵动，${causalMarker}才能避免把这一问题化约为单一的解释套路。`;
  const close =
    `${sourceClause}从“${closingMove}”的收束方式看，${hedgeMarker}，这段论述目前能够成立的只是一个有边界的解释：它把${anchorTerms || termA}重新放进同一组关系中，而不是把它们处理为彼此孤立的标签。后续若要进入正式论文，还需要把关键判断逐条回到原文和页码中核验。`;
  return { argument, ideaPack, citations, draft: `${intro}${middle}${close}` };
}

function buildCodexStyleDraft(profile, idea, mode) {
  const cleanIdea = idea.trim().replace(/\s+/g, " ");
  const ideaPack = buildIdeaEvidencePack(cleanIdea);
  const argument = extractArgument(cleanIdea);
  const terms = pickProfileTerms(profile, cleanIdea, 10);
  const frameTerms = pickFrameTerms(profile, cleanIdea);
  const subject = cleanIdea.match(/(章太炎|康有为|欧阳竟无|王阳明|熊十力|梁启超|严复|周展安|张志强)/)?.[0] || terms[0] || "主体";
  const focusTerms = terms.filter((term) => term !== subject && !term.includes(subject)).slice(0, 5);
  const citations = findCitationMatches(profile, cleanIdea, 6);
  const refs = uniqueCitationRefs(citations, 3);
  const topic = buildProblemTopic(argument, terms);
  const contrast = extractContrastFrame(cleanIdea);
  const context = { cleanIdea, ideaPack, argument, terms, frameTerms, subject, focusTerms, citations, refs, topic, contrast, mode };
  return isZhangProfile(profile) ? buildZhangDraft(context) : buildProfileDraft(profile, context);
}

function localDraft(profile, idea, mode) {
  const cleanIdea = idea.trim().replace(/\s+/g, " ");
  if (!cleanIdea) return "请先输入你的观点。";
  const result = buildCodexStyleDraft(profile, cleanIdea, mode);
  const audit = styleAudit(profile, result.draft);
  const pack = result.ideaPack || buildIdeaEvidencePack(cleanIdea);
  const sourceNotes = result.citations.length
    ? result.citations.map((entry) => `- ${formatCitationRef(entry)} ${entry.sourceTitle}：${entry.excerpt}`).join("\n")
    : "- 暂无候选出处；请先在“建模”页导入目标学者或主题文献。";
  return `## 论点抽取

- 问题域: ${result.argument.problem}
- 核心判断: ${result.argument.thesis}
- 证据线索: ${result.argument.evidence.length ? result.argument.evidence.join("；") : "原文暂未给出明确证据。"}

${formatIdeaPackMarkdown(pack)}

## 风格化改写稿

${result.draft}

## Codex 风格自检
- 风格贴近度: ${audit.score}/100
- 平均句长: ${audit.stats.mean}
- 命中转折: ${audit.contrastHits.join("、") || "无"}
- 命中重述: ${audit.reformulationHits.join("、") || "无"}
- 命中概念词: ${audit.lexiconHits.slice(0, 10).join("、") || "无"}
- 反 ChatGPT 腔: ${audit.generic.hits.length ? `需删除 ${audit.generic.hits.join("、")}` : "未命中常见平滑套话"}

## 下一轮修改建议
${audit.suggestions.map((item) => `- ${item}`).join("\n")}

## 出处建议
${sourceNotes}

## 需要你确认的地方
- 这段改写没有冒充作者，也没有复制来源原文。
- 本地重构只使用“原始观点吸收包”和当前 profile 的风格规则；凡未在原文或引用索引中出现的事实，都应视为仍需核验。
- 如果要进入正式论文写作，需要补充具体文献、页码和原文证据。`;
}

function blendHeader(blended) {
  const meta = blended.blendMeta || {};
  return `## 交叉风格设置

- 风格 A: ${meta.profileA || "Profile A"} ${meta.weightA ?? 50}%
- 风格 B: ${meta.profileB || "Profile B"} ${meta.weightB ?? 50}%
- 使用原则: 百分比只表示结构调度，不复制原句，不冒充任一学者；目标是形成复合学术声线，降低单一作者痕迹。
`;
}

function blendLocalDraft(profileA, profileB, weightA, idea, mode) {
  const cleanIdea = idea.trim();
  if (!cleanIdea) return "请先输入你的观点。";
  const blended = createBlendedProfile(profileA, profileB, weightA);
  return `${blendHeader(blended)}

${localDraft(blended, cleanIdea, mode)}`;
}

function aiPrompt(profile, idea, mode, longformMode = "1200") {
  const citations = findCitationMatches(profile, idea, 10);
  const pack = buildIdeaEvidencePack(idea);
  return `你不是普通润色器。你要作为“文本特征分析器 + 学术风格转换器”工作，依据以下“${profile.name}”风格 profile，把我的观点改写为风格化学术文本。

重要边界：
1. 不要冒充该学者本人。
2. 不要复制任何原文。
3. 保留我的核心观点、证据和不确定性。
4. 如需标注出处，只能使用“可引用材料”中的编号，不要虚构页码、篇名或观点。
5. 不要输出普通 ChatGPT 式平滑总结，尤其避免“首先/其次/最后”“综上所述”“值得我们思考”“影响深远”“具有重要意义”等套话。
6. 输出后必须做风格自检，并列出需要核验的事实。
7. 必须优先使用当前 profile 的独有概念词、连接词、段落动作和句长节奏；不要把不同作者都写成“要理解……不能只……”这一套模板。
8. 如果当前 profile 不是张志强，不得自动套入张志强的“现代学术/思想史/义理”框架，除非我的原文或 profile 明确出现这些词。
9. 原始观点无字数上限；必须先完整吸收，再分块改写。不得因为原文很长而只处理开头或结尾。
10. 严禁语言幻觉：任何事实、人物关系、文献判断、历史判断，必须能在“原始观点全文”“原始观点吸收包”“可引用材料”中找到依据。找不到依据时，写成“仍需进一步核验”，不要补写成确定事实。

目标体裁：${mode}
生成规模：${longformMode}

${formatIdeaPackForPrompt(pack)}

风格规则：
${profileToMarkdown(profile)}

可引用材料：
${citations.length ? citations.map((entry) => `- ${formatCitationRef(entry)} ${entry.sourceTitle}：${entry.excerpt}`).join("\n") : "- 当前 profile 没有足够的引用索引；请只做无出处草稿，并提示需要补充文献。"}

我的观点：
${idea.trim()}

必须按以下流程输出：

## 论点抽取
- 问题域:
- 核心判断:
- 已有证据:
- 仍缺证据:

## 风格化改写稿
要求：
- 开头先建立历史/思想/概念问题域，不要直接宣布结论。
- 至少使用一次“并非/不是……而是……”或“不能只……还要……”的概念区分。
- 至少使用一次“也就是说/换言之/正是在此意义上”的重述推进。
- 结尾给出有限判断，不要做空泛总结。
- 如果没有材料支持，必须标注“仍需进一步核验”。

## 风格自检
- 词汇:
- 句式:
- 段落:
- 论证:
- 反 ChatGPT 腔检查:
- 证据边界检查: 逐条说明核心判断分别来自 [P]/[E]/[S] 哪个编号；没有编号支撑的，必须列入“仍需进一步核验”。

## 需要核验的地方
- `;
}

function blendAiPrompt(profileA, profileB, weightA, idea, mode, longformMode = "1200") {
  const blended = createBlendedProfile(profileA, profileB, weightA);
  return `${aiPrompt(blended, idea, mode, longformMode)}

交叉风格特别规则：
1. 这是复合学术声线，不是模仿或冒充 ${profileA.name} 或 ${profileB.name}。
2. 调度比例为 ${profileA.name} ${blended.blendMeta.weightA}% / ${profileB.name} ${blended.blendMeta.weightB}%；比例越高，只表示概念词、段落动作和句长节奏权重越高。
3. 不要在正文中写“像某某”“某某式”等暴露风格来源的表达。
4. 不要连续使用任何一方高度标志性的固定句式；优先把两方规则改造成原创表达。
5. 保持证据边界：无法由原始观点或引用索引支撑的判断，必须标为“仍需进一步核验”。`;
}

function buildLongformPrompt(profile, idea, mode, longformMode) {
  return `${aiPrompt(profile, idea, mode, longformMode)}

请输出：
1. 标题
2. 论点抽取
3. 风格化正文
4. 风格自检
5. 出处标注说明
6. 材料使用表
7. 需要核验的地方

正文要求：
- 用中文学术文体写作。
- 段落推进要体现：问题域提出、概念区分、文献线索、有限判断。
- 不要照搬 profile 或引用索引中的句子。
- 不要使用普通 AI 润色腔，如“首先/其次/最后”“综上所述”“影响深远”“值得我们思考”。
- 对没有出处支撑的判断，用“仍需进一步核验”标出。
- 如果原始观点很长，先按材料块重组论证，不要遗漏后半部分。
- 材料使用表必须列出：改写后的关键判断 -> 原始观点编号 [P/E/U] 或文献编号 [S] -> 是否需要进一步核验。`;
}

function buildBlendLongformPrompt(profileA, profileB, weightA, idea, mode, longformMode) {
  const blended = createBlendedProfile(profileA, profileB, weightA);
  return `${buildLongformPrompt(blended, idea, mode, longformMode)}

交叉风格长文要求：
- 全文按 ${profileA.name} ${blended.blendMeta.weightA}% / ${profileB.name} ${blended.blendMeta.weightB}% 做风格调度。
- 不要在任何标题或正文中暴露“仿某某”的意图。
- 让融合后的文本呈现为作者自己的原创学术声线，而不是两种风格拼贴。`;
}

async function callOpenAIResponse(prompt) {
  saveAiSettingsFromForm();
  if (!aiSettings.apiKey) throw new Error("请先填写 API Key。");
  const payload = {
    model: aiSettings.model,
    input: prompt,
    store: false,
    max_output_tokens: 6500,
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
  const audit = styleAudit(profile, text);
  const findings = [
    `平均句长：${audit.stats.mean}。`,
    `命中的转折标记：${audit.contrastHits.join("、") || "无"}`,
    `命中的因果标记：${audit.causalHits.join("、") || "无"}`,
    `命中的重述标记：${audit.reformulationHits.join("、") || "无"}`,
    `命中的概念词：${audit.lexiconHits.slice(0, 12).join("、") || "无"}`,
    audit.hasProblemFrame ? "有问题域/意义转换信号。" : "缺少明显的问题域或意义转换信号。",
    audit.hasBoundedClaim ? "有有限判断或强度校准。" : "结尾判断偏平，需要加边界意识。",
    audit.generic.hits.length ? `通用 AI 腔命中：${audit.generic.hits.join("、")}。` : "未命中常见通用 AI 套话。",
    ...audit.suggestions,
  ];
  return { score: audit.score, findings };
}

function renderDiagnosis(result) {
  qs("#diagnoseOutput").innerHTML = `
    <div class="score" style="--score:${result.score}%"><strong>${result.score}</strong></div>
    <ul class="finding-list">${result.findings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join("")}</ul>
  `;
}

function runStyleRegression() {
  const profile = activeProfile();
  const genericText = "AI 工具对学术写作具有重要意义。首先，它提高了写作效率。其次，它能够帮助研究者整理材料。最后，它为学术研究提供了新的视角，值得我们进一步思考。";
  const sourceText = "AI 工具改变学术写作，不只是提高效率，也改变了知识生产方式。它迫使研究者重新理解材料、论证与作者主体之间的关系。";
  const transformed = buildCodexStyleDraft(profile, sourceText, "article").draft;
  return {
    generic: styleAudit(profile, genericText),
    transformed: styleAudit(profile, transformed),
    transformedText: transformed,
  };
}

window.runStyleRegression = runStyleRegression;

function download(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function selectedBlendConfig() {
  const profileA = profiles.find((profile) => profile.id === qs("#blendProfileASelect").value) || activeProfile();
  const profileB = profiles.find((profile) => profile.id === qs("#blendProfileBSelect").value) || profiles.find((profile) => profile.id !== profileA.id) || profileA;
  const weightA = Number(qs("#blendWeightInput").value || 50);
  return { profileA, profileB, weightA };
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
    qs("#analysisPreview").innerHTML = `<p class="empty-state">正在创建新档案。导入语料后，这里会显示新的句长、连接词、概念词和论证结构信号。</p>`;
    qs("#corpusTextInput").focus();
    qsa(".tab-button").find((button) => button.dataset.tab === "build").click();
  });

  qs("#corpusFilesInput").addEventListener("change", (event) => {
    mergeSelectedFiles(event.target.files || []);
    event.target.value = "";
    renderSelectedFiles();
  });

  qs("#clearCorpusButton").addEventListener("click", () => {
    qs("#corpusTextInput").value = "";
    qs("#corpusFilesInput").value = "";
    selectedCorpusFiles = [];
    renderSelectedFiles();
  });

  qs("#analyzeCorpusButton").addEventListener("click", async () => {
    const name = qs("#profileNameInput").value.trim() || "新学者";
    const pasted = qs("#corpusTextInput").value.trim();
    const pasteFormat = qs("#pasteFormatSelect").value;
    qs("#analyzeCorpusButton").disabled = true;
    renderSelectedFiles("正在读取语料...");
    const fileResult = await readSelectedFiles(selectedCorpusFiles);
    const sourceDocs = assignSourceIds([
      ...(pasted ? [parsePastedCorpus(pasted, pasteFormat)] : []),
      ...(fileResult.docs || []),
    ]);
    const combined = sourceDocs.map((doc) => `[[${doc.id} ${doc.title}]]\n${doc.text}`).join("\n\n");
    if (!combined.trim()) {
      showToast("请先导入或粘贴语料。");
      qs("#analyzeCorpusButton").disabled = false;
      renderSelectedFiles();
      return;
    }
    renderSelectedFiles("正在生成 profile...");
    const documentCount = Math.max(1, sourceDocs.length);
    const profile = analyzeText(combined, name, documentCount, sourceDocs);
    profiles = [profile, ...profiles.filter((item) => item.id !== profile.id)];
    activeProfileId = profile.id;
    saveProfiles();
    render();
    renderAnalysisPreview(profile);
    qs("#analyzeCorpusButton").disabled = false;
    renderSelectedFiles(selectedCorpusFiles.length ? `已读取 ${selectedCorpusFiles.length} 个文件。` : "");
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

  qs("#blendWeightInput").addEventListener("input", updateBlendWeightLabel);
  qs("#blendProfileASelect").addEventListener("change", updateBlendWeightLabel);
  qs("#blendProfileBSelect").addEventListener("change", updateBlendWeightLabel);

  qs("#blendDraftButton").addEventListener("click", () => {
    const { profileA, profileB, weightA } = selectedBlendConfig();
    qs("#blendOutput").value = blendLocalDraft(profileA, profileB, weightA, qs("#blendIdeaInput").value, qs("#blendModeSelect").value);
  });

  qs("#blendPromptButton").addEventListener("click", () => {
    const { profileA, profileB, weightA } = selectedBlendConfig();
    qs("#blendOutput").value = blendAiPrompt(profileA, profileB, weightA, qs("#blendIdeaInput").value, qs("#blendModeSelect").value, qs("#blendLongformMode").value);
  });

  qs("#blendAiLongformButton").addEventListener("click", async () => {
    const idea = qs("#blendIdeaInput").value.trim();
    if (!idea) {
      showToast("请先输入你的观点。");
      return;
    }
    const { profileA, profileB, weightA } = selectedBlendConfig();
    qs("#blendAiLongformButton").disabled = true;
    qs("#blendStatus").textContent = "正在调用模型...";
    try {
      const prompt = buildBlendLongformPrompt(profileA, profileB, weightA, idea, qs("#blendModeSelect").value, qs("#blendLongformMode").value);
      qs("#blendOutput").value = await callOpenAIResponse(prompt);
      qs("#blendStatus").textContent = "模型生成完成。";
    } catch (error) {
      qs("#blendStatus").textContent = `调用失败：${error.message}`;
      showToast("模型调用失败。");
    } finally {
      qs("#blendAiLongformButton").disabled = false;
    }
  });

  qs("#copyBlendButton").addEventListener("click", async () => {
    await copyText(qs("#blendOutput").value);
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
    download(`${profile.name}-完整档案.json`, JSON.stringify(profile, null, 2), "application/json;charset=utf-8");
  });

  qs("#exportBriefButton").addEventListener("click", () => {
    const profile = activeProfile();
    download(`${profile.name}-给人看的说明.txt`, profileToHumanBrief(profile));
  });

  qs("#exportRulebookButton").addEventListener("click", () => {
    const profile = activeProfile();
    download(`${profile.name}-给AI的提示词.md`, profileToMarkdown(profile));
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
    deleteProfile(activeProfile().id);
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

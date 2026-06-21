const STORAGE_KEY = "scholar-style-workbench-profiles-v1";
const SETTINGS_KEY = "scholar-style-workbench-ai-settings-v1";
const SESSION_KEY = "scholar-style-workbench-session-api-key";
const DEFAULT_PROVIDER = "openai";
const AI_PROVIDERS = {
  openai: {
    label: "OpenAI Responses",
    endpoint: "https://api.openai.com/v1/responses",
    format: "responses",
    models: ["gpt-5.5", "gpt-5.4", "gpt-5.4-mini", "gpt-4.1"],
    defaultModel: "gpt-5.5",
    hint: "OpenAI 使用 Responses API；不勾选保存时 key 只保留到当前会话。",
  },
  deepseek: {
    label: "DeepSeek Chat Completions",
    endpoint: "https://api.deepseek.com/chat/completions",
    format: "chat",
    models: ["deepseek-v4-pro", "deepseek-v4-flash", "deepseek-chat", "deepseek-reasoner"],
    defaultModel: "deepseek-v4-pro",
    hint: "DeepSeek 使用 Chat Completions；如果浏览器提示 Failed to fetch，可能是 CORS/网络拦截，需要后端代理。",
  },
};
const DEFAULT_ENDPOINT = AI_PROVIDERS[DEFAULT_PROVIDER].endpoint;
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
    if (Array.isArray(stored) && stored.length) {
      const normalized = stored.map(normalizeProfile);
      if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
    }
  } catch {
    // Ignore malformed storage.
  }
  return [normalizeProfile(defaultProfile)];
}

function saveProfiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function hasGarbageShape(text) {
  const clean = String(text || "").trim();
  if (!clean) return true;
  if (/[\uFFFD\uE000-\uF8FF□■◆◇�]/.test(clean)) return true;
  if (/(.)\1{2,}/u.test(clean)) return true;
  if (/(.{2})\1{1,}/u.test(clean)) return true;
  const chars = Array.from(clean.replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, ""));
  if (chars.length >= 4 && new Set(chars).size <= 2) return true;
  return false;
}

function cleanDisplayTerm(term) {
  return normalizeTerm(String(term || "").trim().replace(/\s+/g, ""));
}

function sanitizeTermList(items, limit = 32) {
  return uniqueItems((items || []).map(cleanDisplayTerm))
    .filter((item) => item && !hasGarbageShape(item) && isContentTerm(item))
    .slice(0, limit);
}

function sanitizeMarkerList(items, limit = 12) {
  return uniqueItems((items || []).map((item) => String(item || "").trim()).filter(Boolean))
    .filter((item) => item.length <= 12 && !hasGarbageShape(item))
    .slice(0, limit);
}

function sanitizePairList(items, limit = 10) {
  return uniqueItems((items || []).map((item) => String(item || "").trim()).filter(Boolean))
    .filter((item) => !hasGarbageShape(item) && item.split("/").every((part) => {
      const clean = cleanDisplayTerm(part);
      return clean.length >= 2 && clean.length <= 8 && !hasGarbageShape(clean);
    }))
    .slice(0, limit);
}

function sanitizeMoveList(items, limit = 8) {
  return (items || [])
    .map((entry) => ({ item: String(entry?.item || "").trim(), count: Number(entry?.count || 0) }))
    .filter((entry) => entry.item && !hasGarbageShape(entry.item) && entry.item.length <= 12)
    .slice(0, limit);
}

function sanitizeParagraphModel(model) {
  if (!model) return null;
  return {
    ...model,
    openingMoves: sanitizeMoveList(model.openingMoves),
    middleMoves: sanitizeMoveList(model.middleMoves),
    closingMoves: sanitizeMoveList(model.closingMoves),
  };
}

function sanitizeNgramEntries(items, limit = 18) {
  return (items || [])
    .map((entry) => ({
      item: cleanDisplayTerm(entry?.item || ""),
      count: Number(entry?.count || 0),
    }))
    .filter((entry) => entry.count > 0 && entry.item && !hasGarbageShape(entry.item) && isContentTerm(entry.item))
    .slice(0, limit);
}

function sanitizeRawSignals(signals) {
  if (!signals) return null;
  return {
    ...signals,
    ngrams: {
      n2: sanitizeNgramEntries(signals.ngrams?.n2),
      n3: sanitizeNgramEntries(signals.ngrams?.n3),
      n4: sanitizeNgramEntries(signals.ngrams?.n4),
    },
  };
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStats(stats = {}) {
  return {
    documents: safeNumber(stats.documents, 1),
    tokens: safeNumber(stats.tokens, 0),
    sentences: safeNumber(stats.sentences, 0),
    paragraphs: safeNumber(stats.paragraphs, 0),
    avgSentenceLength: safeNumber(stats.avgSentenceLength, 0),
    sentenceStdev: safeNumber(stats.sentenceStdev, 0),
  };
}

function normalizeProfile(profile) {
  const base = profile?.id === defaultProfile.id ? defaultProfile : {};
  const mergedMarkers = { ...(base.markers || {}), ...(profile?.markers || {}) };
  const paragraphModel = profile?.paragraphModel || base.paragraphModel || null;
  return {
    ...base,
    ...profile,
    stats: normalizeStats({ ...(base.stats || {}), ...(profile?.stats || {}) }),
    lexicon: sanitizeTermList(profile?.lexicon || base.lexicon || [], 32),
    pairs: sanitizePairList(profile?.pairs || base.pairs || [], 12),
    markers: {
      contrast: sanitizeMarkerList(mergedMarkers.contrast || [], 12),
      causal: sanitizeMarkerList(mergedMarkers.causal || [], 12),
      reformulation: sanitizeMarkerList(mergedMarkers.reformulation || [], 12),
      hedge: sanitizeMarkerList(mergedMarkers.hedge || [], 12),
    },
    sources: profile?.sources || base.sources || [],
    citationIndex: profile?.citationIndex || base.citationIndex || [],
    voiceStats: profile?.voiceStats || base.voiceStats || null,
    paragraphModel: sanitizeParagraphModel(paragraphModel),
    rawSignals: sanitizeRawSignals(profile?.rawSignals || base.rawSignals || null),
  };
}

function normalizeProvider(provider, endpoint = "") {
  if (provider && AI_PROVIDERS[provider]) return provider;
  if (/deepseek/i.test(endpoint || "")) return "deepseek";
  return DEFAULT_PROVIDER;
}

function providerConfig(provider) {
  return AI_PROVIDERS[normalizeProvider(provider)] || AI_PROVIDERS[DEFAULT_PROVIDER];
}

function normalizeEndpointForProvider(provider, endpoint = "") {
  const config = providerConfig(provider);
  const clean = String(endpoint || "").trim();
  if (!clean) return config.endpoint;
  if (provider === "deepseek") {
    if (/\/chat\/completions\/?$/i.test(clean)) return clean.replace(/\/$/, "");
    if (/^https:\/\/api\.deepseek\.com\/?$/i.test(clean)) return "https://api.deepseek.com/chat/completions";
  }
  return clean;
}

function loadAiSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const provider = normalizeProvider(stored.provider, stored.endpoint);
    const config = providerConfig(provider);
    return {
      provider,
      endpoint: normalizeEndpointForProvider(provider, stored.endpoint || config.endpoint),
      model: stored.model || config.defaultModel,
      reasoning: stored.reasoning || "medium",
      rememberKey: Boolean(stored.rememberKey),
      apiKey: stored.rememberKey ? stored.apiKey || "" : sessionStorage.getItem(SESSION_KEY) || "",
    };
  } catch {
    const config = providerConfig(DEFAULT_PROVIDER);
    return { provider: DEFAULT_PROVIDER, endpoint: config.endpoint, model: config.defaultModel, reasoning: "medium", rememberKey: false, apiKey: "" };
  }
}

function saveAiSettingsFromForm() {
  const provider = normalizeProvider(qs("#providerSelect")?.value, qs("#apiEndpointInput").value.trim());
  aiSettings = {
    provider,
    endpoint: normalizeEndpointForProvider(provider, qs("#apiEndpointInput").value.trim()),
    model: qs("#modelSelect").value,
    reasoning: qs("#reasoningSelect").value,
    rememberKey: qs("#rememberKeyToggle").checked,
    apiKey: qs("#apiKeyInput").value.trim(),
  };
  if (aiSettings.rememberKey) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(aiSettings));
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ provider: aiSettings.provider, endpoint: aiSettings.endpoint, model: aiSettings.model, reasoning: aiSettings.reasoning, rememberKey: false }));
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

function renderModelOptions(provider, selectedModel) {
  const select = qs("#modelSelect");
  if (!select) return;
  const config = providerConfig(provider);
  const models = config.models.includes(selectedModel)
    ? config.models
    : uniqueItems([selectedModel, ...config.models]).filter(Boolean);
  select.innerHTML = models.map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`).join("");
  select.value = selectedModel || config.defaultModel;
}

function renderAiSettings() {
  const provider = normalizeProvider(aiSettings.provider, aiSettings.endpoint);
  const config = providerConfig(provider);
  qs("#providerSelect").value = provider;
  qs("#apiEndpointInput").value = normalizeEndpointForProvider(provider, aiSettings.endpoint || config.endpoint);
  qs("#apiKeyInput").value = aiSettings.apiKey || "";
  renderModelOptions(provider, aiSettings.model || config.defaultModel);
  qs("#reasoningSelect").value = aiSettings.reasoning || "medium";
  qs("#rememberKeyToggle").checked = Boolean(aiSettings.rememberKey);
  if (qs("#providerHint")) qs("#providerHint").textContent = config.hint;
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

function topMarkerItems(markers, key, limit = 6) {
  return (markers?.[key] || [])
    .map((entry) => entry.item || entry)
    .filter(Boolean)
    .slice(0, limit);
}

function styleProgressionPattern(paragraphModel) {
  const openings = (paragraphModel.openingMoves || []).map((entry) => entry.item).join("、");
  const middles = (paragraphModel.middleMoves || []).map((entry) => entry.item).join("、");
  const closings = (paragraphModel.closingMoves || []).map((entry) => entry.item).join("、");
  if (/历史|思想/.test(openings) && /对比|重述/.test(middles)) return "历史定位后，通过概念区分和重述澄清推进论证。";
  if (/文献/.test(openings)) return "先引入材料或文献，再逐步澄清概念关系。";
  if (/问题/.test(openings)) return "先提出问题域，再用转折、因果和有限判断收束。";
  if (/意义|有限|开放/.test(closings)) return "段落末端偏向意义收束或边界判断。";
  return "以概念展开为起点，通过关系澄清组织段落。";
}

function inferStyleLogic({ name, stats, markers, paragraphModel, lexicon, pairs }) {
  const contrast = topMarkerItems(markers, "contrast");
  const causal = topMarkerItems(markers, "causal");
  const reformulation = topMarkerItems(markers, "reformulation");
  const hedge = topMarkerItems(markers, "hedge");
  const opening = (paragraphModel.openingMoves || [])[0]?.item || "概念展开";
  const middle = (paragraphModel.middleMoves || [])[0]?.item || "关系澄清";
  const closing = (paragraphModel.closingMoves || [])[0]?.item || "有限判断";
  const avgSentence = stats?.avgSentenceLength || 0;
  return {
    corePattern: `${name || "该作者"}通常不是直接给出结论，而是先建立${opening}，再通过${middle}把概念关系重新安排，最后以${closing}控制判断强度。`,
    lexical: {
      signatureConcepts: (lexicon || []).slice(0, 14),
      conceptPairs: (pairs || []).slice(0, 8),
      connectors: uniqueItems([...contrast, ...causal, ...reformulation]).slice(0, 14),
      stanceMarkers: hedge,
    },
    sentence: {
      rhythm: `平均句长约 ${avgSentence}，句子通常承担限定、转折、因果和重述的复合功能。`,
      contrast,
      causal,
      reformulation,
      claimPlacement: "主判断多在问题铺陈和概念区分之后出现，不宜一开头就平铺结论。",
    },
    paragraph: {
      opening,
      middle,
      closing,
      progression: styleProgressionPattern(paragraphModel || {}),
    },
    argument: {
      problemFraming: `${opening}优先，先说明为什么这个问题值得被重新理解。`,
      opponentConstruction: "常把通行理解、单一来源说或过于平面的判断作为需要被改写的对象。",
      evidenceSequence: "先定问题域，再引入概念、文献或历史处境，最后给出有限解释。",
      counterHandling: "通过“并非/不是……而是……”和“也就是说/换言之”吸收并重排反面理解。",
      conclusionStyle: `${closing}，避免直接大而化之地下结论。`,
    },
  };
}

function profileStyleLogic(profile) {
  return profile.styleLogic || inferStyleLogic({
    name: profile.name,
    stats: profile.stats || {},
    markers: profile.markers || {},
    paragraphModel: profile.paragraphModel || {},
    lexicon: profile.lexicon || [],
    pairs: profile.pairs || [],
  });
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
  if (hasGarbageShape(clean)) return false;
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
  const pairs = inferPairs(lexicon);
  const styleLogic = inferStyleLogic({ name, stats, markers, paragraphModel, lexicon, pairs });

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
    styleLogic,
    citationIndex,
    lexicon,
    pairs,
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
  const lexicon = sanitizeTermList(profile.lexicon || [], 32);
  const contrastMarkers = sanitizeMarkerList(markers.contrast || [], 12);
  const n4Signals = sanitizeNgramEntries(signals.ngrams?.n4 || [], 12);
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
    <div class="tag-list">${lexicon.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || '<span class="tag">未提取</span>'}</div>
    <h4>转折标记</h4>
    <div class="tag-list">${contrastMarkers.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || '<span class="tag">未检出</span>'}</div>
    <h4>段落结构</h4>
    <div class="tag-list">
      ${(paragraphModel.openingMoves || []).slice(0, 4).map((entry) => `<span class="tag">开头 ${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}
      ${(paragraphModel.middleMoves || []).slice(0, 4).map((entry) => `<span class="tag">中段 ${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}
      ${(paragraphModel.closingMoves || []).slice(0, 4).map((entry) => `<span class="tag">收束 ${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}
    </div>
    <h4>引用索引</h4>
    <div class="tag-list"><span class="tag">${profile.citationIndex?.length || 0} 条候选出处</span><span class="tag">${profile.sources?.length || 0} 个来源</span></div>
    <h4>高频四字组</h4>
    <div class="tag-list">${n4Signals.map((entry) => `<span class="tag">${escapeHtml(entry.item)} · ${entry.count}</span>`).join("") || '<span class="tag">未检出</span>'}</div>
  `;
}

function profileToMarkdown(profile) {
  const logic = profileStyleLogic(profile);
  return `# ${profile.name} 风格规则

来源：${profile.source || "本地 profile"}
语料规模：${profile.stats?.tokens || 0} tokens，${profile.stats?.sentences || 0} 句
来源数量：${profile.sources?.length || profile.stats?.documents || 0}

## 四层风格逻辑
- 核心运行方式：${logic.corePattern}
- 词汇层：${(logic.lexical.signatureConcepts || []).slice(0, 12).join("、") || "未记录"}
- 句子层：${logic.sentence.rhythm}
- 段落层：${logic.paragraph.progression}
- 论证层：${logic.argument.problemFraming}${logic.argument.counterHandling}

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
3. 点击“生成语义锁定包”，先固定原文判断、证据和待核验边界。
4. 填写 API Key 后点击“调用模型严格改写”，让模型按当前 profile 做风格迁移。
5. 查看输出末尾的“本地保真复核”，确认没有漏掉关键材料或新增可疑概念。
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
          <p>${escapeHtml(source.type || "source")}${source.pages ? ` · ${escapeHtml(source.pages)} 页` : ""}${source.chars ? ` · ${escapeHtml(source.chars)} 字符` : ""}</p>
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
        <p>${(paragraphModel.openingMoves || []).map((entry) => escapeHtml(`${entry.item}(${entry.count})`)).join("、") || "未记录"}</p>
      </div>
      <div class="structure-item">
        <strong>中段动作</strong>
        <p>${(paragraphModel.middleMoves || []).map((entry) => escapeHtml(`${entry.item}(${entry.count})`)).join("、") || "未记录"}</p>
      </div>
      <div class="structure-item">
        <strong>收束动作</strong>
        <p>${(paragraphModel.closingMoves || []).map((entry) => escapeHtml(`${entry.item}(${entry.count})`)).join("、") || "未记录"}</p>
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

function sourceLockTerms(text, profile = null, limit = 36) {
  const quoted = Array.from(text.matchAll(/[《“"]([^》”"]{2,24})[》”"]/g)).map((match) => match[1]);
  const explicit = Array.from(text.matchAll(/(?:章太炎|康有为|欧阳竟无|王阳明|熊十力|梁启超|严复|周展安|张志强|佛教|佛学|唯识学|今文经学|理学|庄学|儒学|西学|西方进化论|社会达尔文主义|俱分进化论|现代性|现代化|近代科学|阿赖耶识|八识|三籁|乾坤|真如|真如本体|良知|齐物论|国故论衡|建立宗教论|出世性|清末民初|晚清|太炎|乾|坤|不住生死|不住涅槃)/g)).map((match) => match[0]);
  const conceptual = Array.from(text.matchAll(/[\u4e00-\u9fffA-Za-z0-9·]{2,18}(?:思想|义理|危机|进化论|齐物论|经世|问题|资源|处境|转型|现代性|佛教|儒学|庄学|西学|佛学|唯识学|阿赖耶识|本体论|主体|传统|学术|谱系|文本|文献|关系|论证|结构|解释|近代|现代|政治|哲学)/g)).map((match) => match[0].replace(/^的/, ""));
  const profileHits = profile ? (profile.lexicon || []).filter((term) => text.includes(term)) : [];
  const synthetic = [];
  if (/乾/.test(text) && /坤/.test(text)) synthetic.push("乾坤");
  return uniqueItems([...explicit, ...quoted, ...synthetic, ...conceptual, ...profileHits])
    .filter((term) => term && isContentTerm(term))
    .filter((term) => !/^(思想|关系|问题|价值|主体|传统|现代|佛教|学术|文本|文献|解释|结构|论证)$/.test(term))
    .slice(0, limit);
}

function buildSemanticLock(text, profile, mode = "article", longformMode = "1200") {
  const clean = normalizeIdeaText(text);
  const units = buildRewriteUnits(clean, rewriteUnitLimit(mode, longformMode));
  const pack = buildIdeaEvidencePack(clean);
  const argument = extractArgument(clean.replace(/\s+/g, " "));
  const globalTerms = sourceLockTerms(clean, profile, 36);
  const chunks = units.map((unit, index) => {
    const arg = extractArgument(unit);
    const terms = sourceLockTerms(unit, profile, 12);
    return {
      id: `C${index + 1}`,
      role: classifySourceUnit(unit, index, units.length),
      claim: clipText(arg.thesis || arg.problem || unit, 180),
      evidence: arg.evidence.map((item) => clipText(item, 150)).slice(0, 3),
      uncertainty: arg.uncertainty.map((item) => clipText(item, 150)).slice(0, 2),
      terms,
    };
  });
  return {
    chars: clean.length,
    sentences: splitSentences(clean).length,
    globalClaim: clipText(argument.thesis, 180),
    globalProblem: clipText(argument.problem, 180),
    requiredTerms: globalTerms,
    claims: pack.claims,
    evidence: pack.evidence,
    uncertainty: pack.uncertainty,
    chunks,
  };
}

function formatSemanticLockMarkdown(lock) {
  return `## 本地语义锁定包

> 这不是正式改写稿。它只负责锁定原文事实、判断、证据和待核验边界；正式风格迁移请使用“调用模型严格改写”。

- 输入规模: ${lock.chars} 字符；${lock.sentences} 个句子；${lock.chunks.length} 个材料块。
- 核心问题: ${lock.globalProblem}
- 核心判断: ${lock.globalClaim}
- 必须保留的关键词/专名: ${lock.requiredTerms.join("、") || "未抽取到稳定专名"}

### 分块语义
${lock.chunks.map((chunk) => `- [${chunk.id}] ${chunk.role}｜判断：${chunk.claim}｜关键词：${chunk.terms.join("、") || "无"}`).join("\n")}

### 证据边界
${numberedLines(lock.evidence, "E", "原文没有明显证据句；改写时只能保留为观点，不得补成事实。")}

### 待核验项
${numberedLines(lock.uncertainty, "U", "原文没有显式不确定句；超出原文的事实判断仍需核验。", 8)}

## 下一步
- 点击“调用模型严格改写”，让大模型在这个语义锁定包内进行学者风格迁移。
- 本地不会再直接生成正式改写稿，因为规则拼装容易造成内容漂移。`;
}

function formatSemanticLockForPrompt(lock) {
  return `【语义锁定包：必须逐条保留，不得改写成相反或更强判断】
输入规模：${lock.chars} 字符；${lock.sentences} 个句子；${lock.chunks.length} 个材料块。
核心问题：${lock.globalProblem}
核心判断：${lock.globalClaim}
必须保留的关键词/专名：${lock.requiredTerms.join("、") || "未抽取到稳定专名"}

分块语义：
${lock.chunks.map((chunk) => `[${chunk.id}] ${chunk.role}
- 原文判断：${chunk.claim}
- 必保关键词：${chunk.terms.join("、") || "无"}
- 证据句：${chunk.evidence.join("；") || "无显式证据句"}
- 不确定/待核验：${chunk.uncertainty.join("；") || "无显式不确定句"}`).join("\n\n")}

证据边界：
${numberedLines(lock.evidence, "E", "无明显证据句；不得补写成事实。")}

待核验：
${numberedLines(lock.uncertainty, "U", "无显式不确定句；超出原文的事实判断都要标为仍需核验。", 8)}`;
}

function normalizeIdeaText(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function rewriteUnitLimit(mode, longformMode = "1200") {
  const scale = Number(longformMode || 1200);
  if (scale >= 3500) return 7;
  if (scale >= 2000) return 5;
  if (mode === "intro") return 3;
  return 4;
}

function buildRewriteUnits(text, maxUnits = 4) {
  const paragraphs = splitParagraphs(text);
  const sourceUnits = paragraphs.length >= 2 ? paragraphs : splitSentences(text);
  const units = sourceUnits.length ? sourceUnits : [text];
  if (units.length <= maxUnits) return units.map((unit) => unit.trim()).filter(Boolean);
  const groupSize = Math.ceil(units.length / maxUnits);
  const grouped = [];
  for (let index = 0; index < units.length; index += groupSize) {
    grouped.push(units.slice(index, index + groupSize).join(" "));
  }
  return grouped.map((unit) => unit.trim()).filter(Boolean);
}

function termsForRewriteUnit(profile, unitText, fallbackTerms = [], limit = 6) {
  const profileHits = (profile.lexicon || []).filter((term) => unitText.includes(term));
  return uniqueItems([...mineIdeaTerms(unitText), ...profileHits, ...fallbackTerms])
    .filter((item) => item && isContentTerm(item))
    .slice(0, limit);
}

function rewriteClaimBody(text, limit = 88) {
  return compactClause(text || "", limit)
    .replace(/并不是/g, "不宜被简单看作")
    .replace(/不只是/g, "不能只被理解为")
    .replace(/不是/g, "不能被简单归入")
    .replace(/而是/g, "更应放在")
    .replace(/认为/g, "所提出的判断是")
    .replace(/因此/g, "由此看")
    .replace(/所以/g, "由此")
    .replace(/具有重要的研究价值/g, "需要在具体论证中重新说明其价值")
    .replace(/具有重要价值/g, "需要在具体论证中说明其价值");
}

function unitClaim(arg, fallback = "这一判断", limit = 72) {
  const claimBody = rewriteClaimBody(arg.thesis || arg.problem || "", limit);
  if (claimBody && claimBody.length >= 8) return `“${claimBody}”这一判断`;
  const fallbackText = String(fallback || "").trim();
  const termLike = fallbackText
    .split("、")
    .map((item) => compactClause(item, 16))
    .filter((item) => item && isContentTerm(item))
    .slice(0, 4);
  if (termLike.length >= 2) return `${termLike.join("、")}之间的关系`;
  const claim = compactClause(arg.thesis || arg.problem || fallbackText, limit);
  return claim ? `关于${claim}的判断` : "这一判断";
}

function unitDetailTerms(unitText, existingTerms = [], limit = 5) {
  const explicit = Array.from(unitText.matchAll(/(?:三籁|乾坤|现代化|近代科学|出世性|清末民初|八识|真如本体|俱分进化论|阿赖耶识|齐物论|社会达尔文主义|不住生死|不住涅槃)/g)).map((match) => match[0]);
  const quoted = Array.from(unitText.matchAll(/[《“"]([^》”"]{2,20})[》”"]/g)).map((match) => match[1]);
  return uniqueItems([...explicit, ...quoted, ...mineIdeaTerms(unitText)])
    .filter((term) => term && isContentTerm(term) && !existingTerms.includes(term))
    .filter((term) => !/^(思想|关系|问题|价值|主体|传统|现代|佛教|学术)$/.test(term))
    .slice(0, limit);
}

function unitDetailClause(unitText, existingTerms = []) {
  const details = unitDetailTerms(unitText, existingTerms);
  return details.length ? `其中${details.join("、")}等线索不能被压缩为背景说明，` : "";
}

function unitSourceClause(profile, unitText, fallbackCitations = [], limit = 2) {
  const unitCitations = findCitationMatches(profile, unitText, limit);
  const selected = unitCitations.length ? unitCitations : fallbackCitations.slice(0, limit);
  if (!selected.length) return "";
  return `从已建档材料看，${uniqueCitationRefs(selected, limit).join("、")} 可以作为进一步核验的文本入口；`;
}

function allUnitCitations(profile, units, fallbackCitations = []) {
  const seen = new Set();
  return [...fallbackCitations, ...units.flatMap((unit) => findCitationMatches(profile, unit, 3))]
    .filter((entry) => {
      const key = `${entry.sourceId}:${entry.page || ""}:${entry.excerpt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

function classifySourceUnit(unitText, index, total) {
  if (index === 0 && /(问题|如何|为什么|何以|要理解|不能只|并非|不是)/.test(unitText)) return "问题域/反面对象";
  if (/(因为|由于|例如|材料|文献|表现|说明|显示|一方面|另一方面|通过|以.*为)/.test(unitText)) return "证据与材料展开";
  if (/(但是|然而|并非|不是|而是|不只是|另一方面|反而|却)/.test(unitText)) return "转折与概念区分";
  if (index === total - 1 || /(因此|所以|由此|这意味着|可见|实现了|形成了|价值|意义)/.test(unitText)) return "收束与意义判断";
  return "关系推进";
}

function analyzeSourceLogic(profile, text, units) {
  const argument = extractArgument(text);
  const unitAnalyses = units.map((unit, index) => {
    const unitArgument = extractArgument(unit);
    const terms = termsForRewriteUnit(profile, unit, mineIdeaTerms(text), 7);
    return {
      id: `C${index + 1}`,
      role: classifySourceUnit(unit, index, units.length),
      terms,
      claim: unitClaim(unitArgument, terms.join("、") || argument.topic),
      evidence: unitArgument.evidence.map((item) => clipText(item, 110)).slice(0, 2),
    };
  });
  return {
    problem: argument.problem,
    thesis: argument.thesis,
    terms: mineIdeaTerms(text),
    units: unitAnalyses,
  };
}

function formatStyleLogicMarkdown(logic) {
  return `## 作者底层风格模型

- 核心运行方式: ${logic.corePattern}
- 词汇层: ${(logic.lexical.signatureConcepts || []).slice(0, 10).join("、") || "未形成稳定概念词"}。
- 句子层: ${logic.sentence.rhythm} 常用转折：${(logic.sentence.contrast || []).join("、") || "未检出"}；常用重述：${(logic.sentence.reformulation || []).join("、") || "未检出"}。
- 段落层: 开头多为“${logic.paragraph.opening}”，中段多为“${logic.paragraph.middle}”，收束多为“${logic.paragraph.closing}”。${logic.paragraph.progression}
- 论证层: ${logic.argument.problemFraming}${logic.argument.counterHandling}`;
}

function formatSourceLogicMarkdown(sourceLogic) {
  return `## 原文论证理解

- 原文问题域: ${clipText(sourceLogic.problem, 140)}
- 原文核心判断: ${clipText(sourceLogic.thesis, 140)}
- 原文关键概念: ${(sourceLogic.terms || []).slice(0, 12).join("、") || "未抽取到稳定概念"}

${sourceLogic.units.map((unit) => `- [${unit.id}] ${unit.role}: ${unit.claim}；关键词：${unit.terms.join("、") || "无"}`).join("\n")}`;
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
  const named = Array.from(text.matchAll(/(?:章太炎|康有为|欧阳竟无|王阳明|熊十力|梁启超|严复|佛教|唯识学|今文经学|理学|庄学|儒学|西学|西方进化论|俱分进化论|现代性|现代化|近代科学|阿赖耶识|真如|良知|三籁|乾坤|真如本体|自我知识体系|文化自信|出世性|清末民初|太炎)/g))
    .map((match) => match[0]);
  const synthetic = [];
  if (/乾/.test(text) && /坤/.test(text)) synthetic.push("乾坤");
  return uniqueItems([...named, ...quoted, ...synthetic, ...conceptual]).slice(0, 12);
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
  const reformulationHits = markerHits(profile, "reformulation", text, isZhang
    ? [...zhangStyleHints.relation, "在这个意义上", "从这一点看", "由此看", "这样一来", "换言之"]
    : ["也就是说", "换言之", "在此意义上", "在这个意义上", "从这一点看", "严格说来"]);
  const lexiconPool = profileStyleLexicon(profile).filter((item) => item && isContentTerm(item));
  const lexiconHits = uniqueItems(lexiconPool.filter((item) => text.includes(item)));
  const frameHits = uniqueItems(pickFrameTerms(profile, text).filter((item) => text.includes(item)));
  const hasProblemFrame = /问题域|问题性|如何理解|意味着|关乎|历史条件|文本脉络|材料线索|解释边界|在此意义上|在这个意义上|从这一点看|解释位置|解释范围|概念支点|关系重组|重新打开|重新安置|理论重心/.test(text);
  const hasBoundedClaim = /在某种意义上|可能|或许|似乎|并不能简单地|大致可以说|暂时只能|仍需|还需要|可以说/.test(text);
  const hasProfileStructure = profileMoveItems(profile).some((item) => text.includes(item)) || /开端|中段|结尾|段落|论证|铺陈|推进/.test(text);
  const deepLogicHits = uniqueItems((text.match(/解释位置|解释范围|概念支点|关系重组|重新打开|重新安置|重新安排|理论重心|义理位置|中介|互相支撑|问题域|概念辨析|关系先行铺开/g) || []));
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
  score += Math.min(18, deepLogicHits.length * 5);
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
    deepLogicHits,
    generic,
    suggestions: buildAuditSuggestions({ contrastHits, causalHits, reformulationHits, lexiconHits, frameHits, hasProblemFrame, hasBoundedClaim, hasProfileStructure, deepLogicHits, stats, generic }),
  };
}

function contentIntegrityAudit(sourceText, outputText, profile = null) {
  const source = normalizeIdeaText(sourceText);
  const output = normalizeIdeaText(outputText);
  const lock = buildSemanticLock(source, profile || activeProfile());
  const requiredTerms = lock.requiredTerms.filter((term) => term.length >= 2).slice(0, 28);
  const hasTerm = (text, term) => {
    if (term === "乾坤") return text.includes("乾坤") || (text.includes("乾") && text.includes("坤"));
    return text.includes(term);
  };
  const missingTerms = requiredTerms.filter((term) => !hasTerm(output, term));
  const sourceTerms = new Set(sourceLockTerms(source, profile || activeProfile(), 60));
  const styleTerms = new Set([
    ...profileStyleLexicon(profile || activeProfile()).slice(0, 80),
    ...genericProseFrames,
    ...zhangProseFrames,
    "问题域",
    "解释位置",
    "概念边界",
    "关系",
    "论证",
    "文本",
    "文献",
    "学术",
  ]);
  const outputTerms = sourceLockTerms(output, profile || activeProfile(), 60);
  const riskyAdditions = outputTerms
    .filter((term) => !sourceTerms.has(term) && !styleTerms.has(term))
    .filter((term) => !/^(问题|关系|解释|文本|文献|思想|学术|传统|现代|主体|价值|结构|论证)$/.test(term))
    .slice(0, 12);
  const chunkCoverage = lock.chunks.map((chunk) => {
    const terms = chunk.terms.filter((term) => term.length >= 2).slice(0, 8);
    const missing = terms.filter((term) => !hasTerm(output, term));
    return {
      id: chunk.id,
      ok: !missing.length,
      missing,
    };
  });
  const coveredChunks = chunkCoverage.filter((chunk) => chunk.ok).length;
  const termScore = requiredTerms.length ? Math.round(((requiredTerms.length - missingTerms.length) / requiredTerms.length) * 100) : 100;
  const chunkScore = chunkCoverage.length ? Math.round((coveredChunks / chunkCoverage.length) * 100) : 100;
  const hallucinationPenalty = riskyAdditions.length ? Math.min(35, riskyAdditions.length * 5) : 0;
  const score = Math.max(0, Math.min(100, Math.round((termScore * 0.55) + (chunkScore * 0.45) - hallucinationPenalty)));
  return {
    score,
    status: score >= 90 && !riskyAdditions.length ? "通过" : score >= 75 ? "需人工复核" : "不建议使用",
    requiredTerms,
    missingTerms,
    riskyAdditions,
    chunkCoverage,
    termScore,
    chunkScore,
  };
}

function formatIntegrityAuditMarkdown(audit) {
  const missing = audit.missingTerms.length ? audit.missingTerms.join("、") : "无";
  const risky = audit.riskyAdditions.length ? audit.riskyAdditions.join("、") : "无";
  const chunkWarnings = audit.chunkCoverage
    .filter((chunk) => !chunk.ok)
    .map((chunk) => `- ${chunk.id} 缺少：${chunk.missing.join("、")}`)
    .join("\n") || "- 分块关键词覆盖通过。";
  return `## 本地保真复核

- 结论: ${audit.status}
- 内容保真分: ${audit.score}/100
- 必保关键词缺失: ${missing}
- 疑似新增专名/概念: ${risky}

### 分块覆盖
${chunkWarnings}

> 如果这里显示“不建议使用”或出现疑似新增专名，不要直接采用正文；应回到原文补证据或重新生成。`;
}

function buildAuditSuggestions(audit) {
  const suggestions = [];
  if (!audit.hasProblemFrame) suggestions.push("开头先建立具体问题域，不要直接把原句润色成结论。");
  if (!audit.contrastHits.length) suggestions.push("补入当前 profile 常用的转折或辨析连接词。");
  if (!audit.reformulationHits.length) suggestions.push("加入重述推进，把概念关系再转一层。");
  if (audit.lexiconHits.length < 5) suggestions.push("增加当前 profile 的独有概念词，避免两个作者写成同一种口吻。");
  if ((audit.deepLogicHits || []).length < 2) suggestions.push("增加概念编排动作，例如解释位置、关系重组或中介功能，而不是套固定句式。");
  if (!audit.hasProfileStructure) suggestions.push("把当前 profile 的段落动作写进文本，比如历史定位、文献引入、概念展开或关系澄清。");
  if (!audit.hasBoundedClaim) suggestions.push("结尾用有限判断收束，保留可核验范围。");
  if (audit.generic.hits.length) suggestions.push(`删除通用 AI 腔：${audit.generic.hits.join("、")}。`);
  return suggestions.length ? suggestions : ["规则命中度较高；下一步主要补充具体文献、页码和原文证据。"];
}

function diagnosticRhythmScore(profile, stats) {
  const target = profile.stats?.avgSentenceLength || 30;
  const distance = Math.abs((stats.mean || 0) - target);
  if (distance <= 3) return 34;
  if (distance <= 8) return 30;
  if (distance <= 14) return 24;
  if (distance <= 22) return 16;
  if (stats.mean >= 24) return 10;
  return 4;
}

function diagnosticParagraphScore(profile, text) {
  const paragraphs = splitParagraphs(text);
  const target = profile.paragraphModel?.avgParagraphLength || 320;
  if (!paragraphs.length) return { score: 4, avg: 0 };
  const avg = paragraphs.reduce((sum, paragraph) => sum + tokenize(paragraph).length, 0) / paragraphs.length;
  const ratio = target ? Math.abs(avg - target) / target : 1;
  let score = 4;
  if (ratio <= 0.25) score = 12;
  else if (ratio <= 0.45) score = 9;
  else if (avg >= 120) score = 7;
  return { score, avg: Number(avg.toFixed(2)) };
}

function diagnosticPatternHits(text) {
  const patterns = [
    "如果说",
    "那么",
    "所以",
    "也就是说",
    "换言之",
    "正是在此意义上",
    "不是",
    "而是",
    "并非",
    "一方面",
    "另一方面",
    "可以说",
    "完全不一样",
    "不能够",
    "理解",
    "关系",
    "界限",
    "原理",
  ];
  return patterns.filter((pattern) => text.includes(pattern));
}

function diagnosticDomainHits(profile, text) {
  const domainTerms = [
    ...conceptSeeds,
    ...(profile.lexicon || []),
    ...(profile.pairs || []).flatMap((pair) => String(pair).split("/")),
    "原理",
    "界限",
    "世界",
    "民族",
    "民族主义",
    "中心",
    "价值观",
    "共同体",
    "平等",
    "自我",
    "一体",
    "政治原理",
  ];
  return uniqueItems(domainTerms.filter((term) => term && text.includes(term))).slice(0, 18);
}

function diagnosticAudit(profile, text) {
  const sentences = splitSentences(text);
  const stats = sentenceStats(sentences);
  const rhythmScore = diagnosticRhythmScore(profile, stats);
  const paragraph = diagnosticParagraphScore(profile, text);
  const broadMarkers = uniqueItems([
    ...Object.values(markerSets).flat(),
    ...(profile.markers?.reformulation || []),
    ...zhangStyleHints.relation,
    ...zhangStyleHints.bounded,
  ]).filter((item) => text.includes(item));
  const patternHits = diagnosticPatternHits(text);
  const domainHits = diagnosticDomainHits(profile, text);
  const citations = findCitationMatches(profile, text, 8);
  const hasBoundedClaim = /在某种意义上|可能|或许|似乎|并不能简单地|大致可以说|暂时只能|可以说|不能够完全|不一样/.test(text);
  const hasProblemFrame = /问题域|问题性|如何理解|意味着|关乎|历史条件|原理|界限|关系|形成|理解/.test(text);
  const generic = antiGenericAudit(text);
  let score = 0;
  score += rhythmScore;
  score += paragraph.score;
  score += Math.min(18, broadMarkers.length * 4);
  score += Math.min(16, patternHits.length * 3);
  score += Math.min(16, domainHits.length * 2);
  score += Math.min(10, citations.length * 3);
  score += hasProblemFrame ? 7 : 0;
  score += hasBoundedClaim ? 5 : 0;
  const genericPenalty = generic.hits.length >= 3 && rhythmScore < 20 ? Math.min(8, generic.hits.length * 2) : 0;
  if (sentences.length <= 1) score = Math.min(score, 72);
  score = Math.max(0, Math.min(100, Math.round(score - genericPenalty)));
  return {
    score,
    stats,
    paragraph,
    rhythmScore,
    broadMarkers,
    patternHits,
    domainHits,
    citations,
    hasProblemFrame,
    hasBoundedClaim,
    generic,
    genericPenalty,
  };
}

function buildDiagnosticFindings(audit) {
  const findings = [
    `平均句长：${audit.stats.mean}；句长节奏得分 ${audit.rhythmScore}/34。`,
    `平均段落长度：${audit.paragraph.avg || "未形成段落"}；段落密度得分 ${audit.paragraph.score}/12。`,
    `命中的论证/连接标记：${audit.broadMarkers.slice(0, 12).join("、") || "无"}`,
    `命中的结构动作：${audit.patternHits.slice(0, 12).join("、") || "无"}`,
    `命中的领域概念：${audit.domainHits.slice(0, 12).join("、") || "无"}`,
    audit.citations.length ? `命中引用索引候选：${audit.citations.slice(0, 4).map(formatCitationRef).join("、")}` : "未命中引用索引候选；如果这是原文，建议把该篇加入建模语料以增强来源识别。",
    audit.hasProblemFrame ? "有问题域/原理/关系类的展开信号。" : "缺少明显的问题域或关系展开信号。",
    audit.hasBoundedClaim ? "有边界意识或有限判断信号。" : "边界意识不明显；短截段可能会低估。",
  ];
  if (audit.generic.hits.length) findings.push(`出现通用词：${audit.generic.hits.join("、")}；诊断页只作弱扣分，不再把作者原文误判为 AI 套话。`);
  if (audit.score >= 75) findings.push("整体与当前 profile 的句法节奏和学术动作较接近；如果这是作者原文，分数应作为高相似处理。");
  return findings;
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

function hashText(text) {
  return Array.from(String(text || "")).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
}

function chooseVariant(items, seed) {
  return items[Math.abs(hashText(seed)) % items.length];
}

function zhangOpening({ mode, topic, termA, termB, termC, termD, termE, subject, localA, localB, localC, unit }) {
  const baseSeed = `${mode}:${topic}:${unit.slice(0, 80)}`;
  const articleOpenings = [
    `若把${topic}放回${termC}与${termD}交错的脉络中，首先显出的并不是一个可以立即裁断的结论，而是${termA}何以被重新安置的问题。`,
    `从${localA}与${localB}的关系入手，重点并不是单纯追认某一概念的既定含义，而是在${termC}中重新打开${topic}。`,
    `所谓${topic}，在这里首先表现为一种解释位置的移动：${termA}不再只是某个孤立的义理事项，而被放入${termB}、${termC}与${termE}之间加以衡量。`,
    `若把这一论述的层次拆开来看，其起点并非给${subject}贴上一个现成标签，而是通过${localA}、${localB}与${localC}之间的牵连，重建可以讨论${topic}的范围。`,
    `真正需要处理的，并不是${localA}这个词本身，而是它在${localB}、${localC}以及${termC}之间如何承担解释功能。`,
  ];
  const introOpenings = [
    `要把${topic}处理为一个真正的学术问题，首先不能从一个已经完成的判断开始，而要追问它是在怎样的${termC}中被提出、又在怎样的${termB}中获得其问题性的。`,
    `导论若从${topic}进入，较稳妥的方式不是先给出结论，而是先说明${localA}、${localB}与${termC}之间为什么会构成一个需要辨析的问题。`,
    `本文的问题意识，可以从${localA}在${termC}中的位置变化说起：它所牵动的并非单一概念解释，而是${termB}、${termD}与${termE}之间的重新配置。`,
  ];
  const lectureOpenings = [
    `在我看来，${topic}之所以值得展开，并不在于它已经有了一个清楚的结论，而在于${localA}与${localB}之间还存在需要重新说明的环节。`,
    `如果换成讲授的方式说，${topic}的关键并不是先判定${subject}如何，而是看${termA}怎样在${termC}和${termD}之间被重新组织。`,
  ];
  if (mode === "intro") return chooseVariant(introOpenings, baseSeed);
  if (mode === "lecture") return chooseVariant(lectureOpenings, baseSeed);
  return chooseVariant(articleOpenings, baseSeed);
}

function zhangOpeningBridge({ localClaim, localA, localB, localC, unit }) {
  return chooseVariant([
    `${localClaim}因而不是孤立判断，而是把${uniqueItems([localA, localB, localC]).join("、")}放入同一问题域中加以说明。`,
    `在这个意义上，${localClaim}所承担的功能，不是补充一个材料细节，而是把${uniqueItems([localA, localB, localC]).join("、")}之间的关系先行铺开。`,
    `由此看，${localClaim}并不只是一个判断句，而是后续论证得以展开的概念支点。`,
  ], `${unit}:${localClaim}`);
}

function zhangMiddleMove({ rejected, affirmed, localA, localB, localC, localD, localClaim, unit, detailClause = "" }) {
  return chooseVariant([
    `如果说${rejected}只是这一问题的表层理解，那么${affirmed}才更能显示它的理论重心。${detailClause}${localA}在这里并非一个可以被单独抽出的名词，而是在${localB}、${localC}与${localD}之间发生重新联结的枢纽；${localClaim}也正是在这一联结中获得了可以展开的意义。`,
    `这里需要区分的，是${localA}作为既有概念时的含义，与它进入${localB}、${localC}之后所承担的解释功能。换言之，${detailClause}${affirmed}并不是外在附会，而是把${localClaim}转化为可论证关系的关键一步。`,
    `从这一点看，${localA}并未停留在${localB}内部的义理位置上。它一旦进入${localC}与${localD}之间，${detailClause}${localClaim}便不再只是单向度的判断，而成为重新安排思想关系的中介。`,
    `问题的推进并不在于反复确认${localA}的重要性，而在于说明${localA}何以通过${localB}、${localC}和${localD}之间的牵连，改变${localClaim}的解释位置。`,
  ], `${unit}:${localA}:${localB}`);
}

function zhangClosingMove({ unitSource, sourceClause, subject, localA, localB, localC, localD, localClaim, unit, detailClause = "" }) {
  return chooseVariant([
    `${detailClause}${localClaim}由此把问题从单纯的概念辨析推进到${uniqueItems([subject, localA, localB, localC, localD]).join("、")}之间的关系重组。正是在此意义上，这一论述不宜被写成外在的价值判断，而应当被处理为一个有边界的解释。`,
    `${detailClause}在${uniqueItems([localA, localB, localC, localD]).join("、")}之间形成的这一组关系，使结论只能以有限判断的方式出现：它打开了后续论证的方向，但仍需要回到具体文本，标明历史位置、概念边界和可成立的范围。`,
    `${detailClause}这样一来，${localA}所牵动的就不只是${localClaim}本身，而是${uniqueItems([localB, localC, localD]).join("、")}之间如何相互支撑的问题。暂时只能说，这一解释具有方向性，却仍需进一步核验其文本依据。`,
  ], `${unit}:${localClaim}`);
}

function profileOpeningBridge({ localClaim, localA, localB, localC, unit }) {
  return chooseVariant([
    `${localClaim}应当被理解为${localA}、${localB}与${localC}之间关系的开启，而不是一个已经自足的结论。`,
    `由此形成的，并不是一个单点判断，而是围绕${uniqueItems([localA, localB, localC]).join("、")}展开的解释范围。`,
    `这一判断的意义，正在于它把${localA}与${localB}之间的关系推进到${localC}的层面。`,
  ], `${unit}:${localClaim}`);
}

function profileMiddleMove({ openingMove, middleMove, contrastMarker, causalMarker, reformMarker, localRejected, localAffirmed, localA, localB, localC, localD, localClaim, unit, detailClause = "" }) {
  return chooseVariant([
    `按照“${openingMove}—${middleMove}”的推进方式，这里需要先承认一般说法的有效范围，${contrastMarker}不能停留在${localRejected}这一层。更关键的是，${detailClause}${localAffirmed}，这使${localA}成为连接${localB}、${localC}与${localD}的论证枢纽。`,
    `${reformMarker}，${localClaim}的关键并不在于增加一个概念标签，而在于让${localA}、${localB}和${localC}之间的关系获得新的排列。${detailClause}${causalMarker}，这一路径可以避免把全文压缩成单句判断。`,
    `若从${middleMove}进入，${localRejected}只是需要被重新处理的出发点；真正推动论证的，是${detailClause}${localAffirmed}如何把${localA}与${localD}连接起来。`,
  ], `${unit}:${localA}:${localB}`);
}

function profileClosingMove({ unitSource, sourceClause, closingMove, hedgeMarker, localA, localB, localC, localD, localClaim, unit, detailClause = "" }) {
  return chooseVariant([
    `从“${closingMove}”的收束方式看，${hedgeMarker}，${detailClause}${localClaim}把前面的概念线索推向${uniqueItems([localA, localB, localC, localD]).join("、")}之间的关系。后续若要进入正式论文，还需要逐条回到原文和页码中核验。`,
    `${hedgeMarker}，${detailClause}这一判断目前能够成立的只是一个有边界的解释：它把${uniqueItems([localA, localB, localC]).join("、")}重新放进同一组关系中，而不是把它们处理为彼此孤立的标签。`,
    `若以${closingMove}作收束，${detailClause}${localClaim}并不适合被写成终局结论，而应当保留为仍需材料支撑的解释方向。`,
  ], `${unit}:${localClaim}`);
}

function buildZhangDraft(context) {
  const { units, ideaPack, argument, terms, frameTerms, subject, focusTerms, citations, refs, topic, contrast, mode, profile } = context;
  const termA = focusTerms[0] || terms[0] || "问题意识";
  const termB = focusTerms[1] || terms[1] || "价值系统";
  const termC = frameTerms[0] || terms[2] || "历史条件";
  const termD = frameTerms[1] || terms[3] || "主体";
  const termE = frameTerms[2] || "思想史";
  const sourceClause = citationSourceClause(citations, refs);
  const voicePrefix = mode === "lecture" ? "在我看来，" : "";
  const paragraphs = units.map((unit, index) => {
    const unitArg = extractArgument(unit);
    const unitTerms = termsForRewriteUnit(profile, unit, focusTerms, 6);
    const localContrast = extractContrastFrame(unit) || contrast || {};
    const localA = unitTerms[0] || termA;
    const localB = unitTerms[1] || termB;
    const localC = unitTerms[2] || termC;
    const localD = unitTerms[3] || termD;
    const localClaim = unitClaim(unitArg, unitTerms.join("、") || topic);
    const rejected = localContrast.rejected || `把${localA}还原为单一来源`;
    const affirmed = localContrast.affirmed || `${localA}在${localB}、${localC}之间的重新组织`;
    const unitSource = unitSourceClause(profile, unit, citations);
    const detailClause = unitDetailClause(unit, [localA, localB, localC, localD]);
    if (index === 0) {
      const lead = zhangOpening({ mode, topic, termA, termB, termC, termD, termE, subject, localA, localB, localC, unit });
      const bridge = zhangOpeningBridge({ localClaim, localA, localB, localC, unit });
      return `${voicePrefix && !lead.startsWith("在我看来") ? voicePrefix : ""}${lead}${bridge}`;
    }
    if (index === units.length - 1) {
      return zhangClosingMove({ unitSource, sourceClause, subject, localA, localB, localC, localD, localClaim, unit, detailClause });
    }
    return zhangMiddleMove({ rejected, affirmed, localA, localB, localC, localD, localClaim, unit, detailClause });
  });
  return { argument, ideaPack, citations, units, styleLogic: context.styleLogic, sourceLogic: context.sourceLogic, draft: paragraphs.join("\n\n") };
}

function buildProfileDraft(profile, context) {
  const { units, argument, ideaPack, terms, frameTerms, subject, focusTerms, citations, refs, topic, contrast, mode } = context;
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
  const paragraphs = units.map((unit, index) => {
    const unitArg = extractArgument(unit);
    const unitTerms = termsForRewriteUnit(profile, unit, focusTerms, 6);
    const localContrast = extractContrastFrame(unit) || contrast || {};
    const localA = unitTerms[0] || termA;
    const localB = unitTerms[1] || termB;
    const localC = unitTerms[2] || termC;
    const localD = unitTerms[3] || termD;
    const localClaim = unitClaim(unitArg, unitTerms.join("、") || topic);
    const localRejected = localContrast.rejected || rejected;
    const localAffirmed = localContrast.affirmed || `从${localC}中重新说明${localA}与${localB}的关系`;
    const unitSource = unitSourceClause(profile, unit, citations);
    const detailClause = unitDetailClause(unit, [localA, localB, localC, localD]);
    if (index === 0) {
      const lead =
        openingMove.includes("历史")
          ? `若把${topic}放回${termC}的展开过程之中，问题的重心就不只是判断${subject}“是什么”，而是说明${termA}如何在特定历史位置上被重新组织。`
          : openingMove.includes("文献")
            ? `从材料线索进入${topic}，先要把${subject}、${termA}与${termB}之间的文本关系交代清楚，而不是先给出一个抽象判断。`
            : `所谓${topic}，并不是一个可以直接套用定义的对象；它更像是围绕${anchorTerms || termA}展开的问题域。`;
      return `${mode === "lecture" ? `在我看来，${lead}` : lead}${profileOpeningBridge({ localClaim, localA, localB, localC, unit })}`;
    }
    if (index === units.length - 1) {
      return profileClosingMove({ unitSource, sourceClause, closingMove, hedgeMarker, localA, localB, localC, localD, localClaim, unit, detailClause });
    }
    return profileMiddleMove({ openingMove, middleMove, contrastMarker, causalMarker, reformMarker, localRejected, localAffirmed, localA, localB, localC, localD, localClaim, unit, detailClause });
  });
  return { argument, ideaPack, citations, units, styleLogic: context.styleLogic, sourceLogic: context.sourceLogic, draft: paragraphs.join("\n\n") };
}

function buildCodexStyleDraft(profile, idea, mode, longformMode = "1200") {
  const cleanIdea = normalizeIdeaText(idea);
  const flatIdea = cleanIdea.replace(/\s+/g, " ");
  const ideaPack = buildIdeaEvidencePack(cleanIdea);
  const argument = extractArgument(flatIdea);
  const terms = pickProfileTerms(profile, flatIdea, 10);
  const frameTerms = pickFrameTerms(profile, flatIdea);
  const subject = flatIdea.match(/(章太炎|康有为|欧阳竟无|王阳明|熊十力|梁启超|严复|周展安|张志强)/)?.[0] || terms[0] || "主体";
  const focusTerms = terms.filter((term) => term !== subject && !term.includes(subject)).slice(0, 5);
  const units = buildRewriteUnits(cleanIdea, rewriteUnitLimit(mode, longformMode));
  const baseCitations = findCitationMatches(profile, flatIdea, 6);
  const citations = allUnitCitations(profile, units, baseCitations);
  const refs = uniqueCitationRefs(citations, 3);
  const topic = buildProblemTopic(argument, terms);
  const contrast = extractContrastFrame(flatIdea);
  const styleLogic = profileStyleLogic(profile);
  const sourceLogic = analyzeSourceLogic(profile, cleanIdea, units);
  const context = { profile, cleanIdea, flatIdea, units, ideaPack, argument, terms, frameTerms, subject, focusTerms, citations, refs, topic, contrast, mode, longformMode, styleLogic, sourceLogic };
  return isZhangProfile(profile) ? buildZhangDraft(context) : buildProfileDraft(profile, context);
}

function localDraft(profile, idea, mode, longformMode = "1200") {
  const cleanIdea = normalizeIdeaText(idea);
  if (!cleanIdea) return "请先输入你的观点。";
  const lock = buildSemanticLock(cleanIdea, profile, mode, longformMode);
  return `${formatSemanticLockMarkdown(lock)}

## 当前 profile 的风格规律
- 词汇层: ${(profileStyleLogic(profile).lexical.signatureConcepts || []).slice(0, 10).join("、") || "未形成稳定概念词"}。
- 句子层: ${profileStyleLogic(profile).sentence.rhythm}
- 段落层: 开头多为“${profileStyleLogic(profile).paragraph.opening}”，中段多为“${profileStyleLogic(profile).paragraph.middle}”，收束多为“${profileStyleLogic(profile).paragraph.closing}”。
- 论证层: ${profileStyleLogic(profile).argument.problemFraming}

## 使用方式
- 如果只是检查原文有没有被完整吸收，看上面的“分块语义”和“必保关键词”。
- 如果要正式改写，点击“调用模型严格改写”。
- 如果要复制到 ChatGPT/Claude/Codex，点击“生成严格 Prompt”。`;
}

function blendHeader(blended) {
  const meta = blended.blendMeta || {};
  return `## 交叉风格设置

- 风格 A: ${meta.profileA || "Profile A"} ${meta.weightA ?? 50}%
- 风格 B: ${meta.profileB || "Profile B"} ${meta.weightB ?? 50}%
- 使用原则: 百分比只表示结构调度，不复制原句，不冒充任一学者；目标是形成复合学术声线，降低单一作者痕迹。
`;
}

function blendLocalDraft(profileA, profileB, weightA, idea, mode, longformMode = "1200") {
  const cleanIdea = idea.trim();
  if (!cleanIdea) return "请先输入你的观点。";
  const blended = createBlendedProfile(profileA, profileB, weightA);
  return `${blendHeader(blended)}

${localDraft(blended, cleanIdea, mode, longformMode)}`;
}

function aiPrompt(profile, idea, mode, longformMode = "1200") {
  const citations = findCitationMatches(profile, idea, 10);
  const normalizedIdea = normalizeIdeaText(idea);
  const units = buildRewriteUnits(normalizedIdea, rewriteUnitLimit(mode, longformMode));
  const lock = buildSemanticLock(normalizedIdea, profile, mode, longformMode);
  const styleLogic = profileStyleLogic(profile);
  const sourceLogic = analyzeSourceLogic(profile, normalizedIdea, units);
  return `你不是普通润色器。你要作为“语义保真器 + 学者文本风格迁移器”工作，依据以下“${profile.name}”风格 profile，把我的观点改写为风格化学术文本。

重要边界：
1. 不要冒充该学者本人。
2. 不要复制任何原文。
3. 保留我的核心观点、证据和不确定性。
4. 如需标注出处，只能使用“可引用材料”中的编号，不要虚构页码、篇名或观点。
5. 不要输出普通 ChatGPT 式平滑总结，尤其避免“首先/其次/最后”“综上所述”“值得我们思考”“影响深远”“具有重要意义”等套话。
6. 输出后只做简短核验，并列出需要核验的事实；不要展开内部分析过程。
7. 必须优先使用当前 profile 的独有概念词、连接词、段落动作和句长节奏；不要把不同作者都写成“要理解……不能只……”这一套模板。
8. 如果当前 profile 不是张志强，不得自动套入张志强的“现代学术/思想史/义理”框架，除非我的原文或 profile 明确出现这些词。
9. 原始观点无字数上限；必须先完整吸收，再分块改写。不得因为原文很长而只处理开头或结尾。
10. 严禁语言幻觉：任何事实、人物关系、文献判断、历史判断，必须能在“原始观点全文”“语义锁定包”“可引用材料”中找到依据。找不到依据时，写成“仍需进一步核验”，不要补写成确定事实。
11. 必须先做底层理解，再写正文：先锁定原文每一块的判断、证据、必保关键词和不确定边界；再抽取当前 profile 的四层风格逻辑；最后才进行风格迁移。不要只改写第一句，不要跳过后半段。
12. 开头必须多样化：可以用历史定位、材料引入、概念位置移动、问题拆解、文献脉络进入等方式，不得默认用“要理解X，不能只……”作为固定起手。
13. “论点抽取 / 作者底层风格模型 / 原文论证理解 / 语义锁定包 / 全文覆盖检查”只允许作为内部分析步骤，禁止在最终回答中作为标题或正文输出。
14. 改写不是重新写一篇新文章：不得新增原文没有的事实关系、价值判断或文献判断；风格迁移只能改变论证组织和措辞节奏。
15. 风格迁移的本质是模仿文本规律：概念如何排布、句子如何转折、段落如何推进、判断如何收束；不是套用几个固定句式。

目标体裁：${mode}
生成规模：${longformMode}

内部参考材料：下面信息只用于你在心里完成理解与调度，最终回答不得出现这些标题，不得把分析过程暴露给用户。

${formatSemanticLockForPrompt(lock)}

${formatStyleLogicMarkdown(styleLogic)}

${formatSourceLogicMarkdown(sourceLogic)}

风格规则：
${profileToMarkdown(profile)}

可引用材料：
${citations.length ? citations.map((entry) => `- ${formatCitationRef(entry)} ${entry.sourceTitle}：${entry.excerpt}`).join("\n") : "- 当前 profile 没有足够的引用索引；请只做无出处草稿，并提示需要补充文献。"}

我的观点：
${idea.trim()}

最终只允许按以下格式输出，不要输出内部分析标题：

## 风格化改写稿
要求：
- 开头先建立历史/思想/概念问题域，不要直接宣布结论。
- 开头句式必须根据原文和 profile 变化，不要机械使用“要理解……不能只……”。
- 必须逐块覆盖语义锁定包里的 [C1] [C2] [C3]...，不得只改第一句。
- 语义锁定包里的“必保关键词/专名”必须尽量保留；如果为了文体需要替换，必须在简短核验里说明替换关系。
- 风格化表达必须服务于原文内容；凡原文没有的事实，不要补写成确定判断。
- 至少使用一次当前 profile 支持的概念区分或重述推进，但不要为了凑规则而硬塞固定句式。
- 结尾给出有限判断，不要做空泛总结。

## 简短核验
- 内容覆盖: 用一句话说明是否覆盖全文。
- 证据边界检查: 只列出需要补文献或页码核验的点；不要展示你的内部推理过程。
- 反模板检查: 用一句话说明是否避免固定起手和普通 AI 套话。`;
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
1. 标题（如不需要标题可以省略）
2. 风格化正文
3. 简短核验

正文要求：
- 用中文学术文体写作。
- 段落推进要体现：问题域提出、概念区分、文献线索、有限判断。
- 不要照搬 profile 或引用索引中的句子。
- 不要使用普通 AI 润色腔，如“首先/其次/最后”“综上所述”“影响深远”“值得我们思考”。
- 对没有出处支撑的判断，用“仍需进一步核验”标出。
- 如果原始观点很长，先按材料块重组论证，不要遗漏后半部分。
- 不要输出论点抽取、作者底层风格模型、原文论证理解、语义锁定包、全文覆盖检查、材料使用表等后台分析内容。
- 简短核验只保留：内容是否覆盖全文、哪些事实需要补出处、是否避免固定模板。`;
}

function buildBlendLongformPrompt(profileA, profileB, weightA, idea, mode, longformMode) {
  const blended = createBlendedProfile(profileA, profileB, weightA);
  return `${buildLongformPrompt(blended, idea, mode, longformMode)}

交叉风格长文要求：
- 全文按 ${profileA.name} ${blended.blendMeta.weightA}% / ${profileB.name} ${blended.blendMeta.weightB}% 做风格调度。
- 不要在任何标题或正文中暴露“仿某某”的意图。
- 让融合后的文本呈现为作者自己的原创学术声线，而不是两种风格拼贴。`;
}

function buildModelRequest(prompt) {
  const provider = normalizeProvider(aiSettings.provider, aiSettings.endpoint);
  const config = providerConfig(provider);
  const model = aiSettings.model || config.defaultModel;
  if (config.format === "chat") {
    const payload = {
      model,
      messages: [
        {
          role: "system",
          content: "你是一个严谨的中文学术写作助手。必须保持用户原文事实与证据边界，不得臆造。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      max_tokens: 6500,
    };
    if (/^deepseek-v4-pro$|reasoner/i.test(model)) {
      payload.reasoning_effort = aiSettings.reasoning || "medium";
      payload.thinking = { type: "enabled" };
    }
    if (/^deepseek-v4-flash$|chat/i.test(model)) {
      payload.thinking = { type: "disabled" };
    }
    return payload;
  }
  const payload = {
    model,
    input: prompt,
    store: false,
    max_output_tokens: 6500,
  };
  if (/^gpt-5|^o\d/i.test(model)) {
    payload.reasoning = { effort: aiSettings.reasoning };
  }
  return payload;
}

function extractModelResponseText(data) {
  if (data.output_text) return data.output_text;
  const chatText = (data.choices || [])
    .map((choice) => choice.message?.content || choice.delta?.content || "")
    .filter(Boolean)
    .join("\n");
  if (chatText) return chatText;
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || content.output_text || "")
    .filter(Boolean)
    .join("\n");
}

function friendlyFetchError(error) {
  const endpoint = aiSettings.endpoint || "";
  const provider = normalizeProvider(aiSettings.provider, endpoint);
  if (/Failed to fetch|NetworkError|Load failed|fetch/i.test(error.message || "")) {
    if (provider === "deepseek") {
      return "连接失败：DeepSeek 可能被浏览器 CORS/网络策略拦截，或接口地址不对。请确认地址为 https://api.deepseek.com/chat/completions；如果仍失败，需要用后端代理，GitHub Pages 纯前端可能无法直连。";
    }
    return "连接失败：浏览器没有拿到接口响应。请检查网络、接口地址、浏览器插件/CORS 拦截，或换用后端代理。";
  }
  return error.message || String(error);
}

async function callOpenAIResponse(prompt) {
  saveAiSettingsFromForm();
  if (!aiSettings.apiKey) throw new Error("请先填写 API Key。");
  const endpoint = normalizeEndpointForProvider(aiSettings.provider, aiSettings.endpoint);
  const payload = buildModelRequest(prompt);
  let response;
  try {
    response = await fetch(endpoint || DEFAULT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiSettings.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(friendlyFetchError(error));
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return extractModelResponseText(data) || JSON.stringify(data, null, 2);
}

async function generateStrictModelDraft(profile, idea, mode, longformMode = "1200") {
  const prompt = buildLongformPrompt(profile, idea, mode, longformMode);
  const draft = await callOpenAIResponse(prompt);
  const audit = contentIntegrityAudit(idea, draft, profile);
  return `${draft.trim()}

${formatIntegrityAuditMarkdown(audit)}`;
}

function diagnoseText(profile, text) {
  const audit = diagnosticAudit(profile, text);
  return { score: audit.score, findings: buildDiagnosticFindings(audit) };
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
    const analyzeButton = qs("#analyzeCorpusButton");
    analyzeButton.disabled = true;
    renderSelectedFiles("正在读取语料...");
    try {
      const name = qs("#profileNameInput").value.trim() || "新学者";
      const pasted = qs("#corpusTextInput").value.trim();
      const pasteFormat = qs("#pasteFormatSelect").value;
      const fileResult = await readSelectedFiles(selectedCorpusFiles);
      const sourceDocs = assignSourceIds([
        ...(pasted ? [parsePastedCorpus(pasted, pasteFormat)] : []),
        ...(fileResult.docs || []),
      ]);
      const combined = sourceDocs.map((doc) => `[[${doc.id} ${doc.title}]]\n${doc.text}`).join("\n\n");
      if (!combined.trim()) {
        showToast("请先导入或粘贴语料。");
        renderSelectedFiles();
        return;
      }
      renderSelectedFiles("正在生成 profile...");
      const documentCount = Math.max(1, sourceDocs.length);
      const profile = normalizeProfile(analyzeText(combined, name, documentCount, sourceDocs));
      profiles = [profile, ...profiles.filter((item) => item.id !== profile.id)];
      activeProfileId = profile.id;
      saveProfiles();
      render();
      renderAnalysisPreview(profile);
      renderSelectedFiles(selectedCorpusFiles.length ? `已读取 ${selectedCorpusFiles.length} 个文件。` : "");
      showToast(fileResult.errors.length ? `已生成；${fileResult.errors.length} 个文件失败` : "Profile 已生成。");
    } catch (error) {
      renderSelectedFiles("生成失败，请检查文件后重试。");
      showToast(`生成失败：${error.message}`);
    } finally {
      analyzeButton.disabled = false;
    }
  });

  qs("#draftButton").addEventListener("click", () => {
    qs("#rewriteOutput").value = localDraft(activeProfile(), qs("#ideaInput").value, qs("#rewriteMode").value, qs("#longformMode").value);
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
    qs("#aiStatus").textContent = "正在调用模型严格改写...";
    try {
      qs("#rewriteOutput").value = await generateStrictModelDraft(activeProfile(), idea, qs("#rewriteMode").value, qs("#longformMode").value);
      qs("#aiStatus").textContent = "模型生成完成，并已完成本地保真复核。";
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
    qs("#blendOutput").value = blendLocalDraft(profileA, profileB, weightA, qs("#blendIdeaInput").value, qs("#blendModeSelect").value, qs("#blendLongformMode").value);
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
      const draft = await callOpenAIResponse(prompt);
      const blended = createBlendedProfile(profileA, profileB, weightA);
      const audit = contentIntegrityAudit(idea, draft, blended);
      qs("#blendOutput").value = `${draft.trim()}

${formatIntegrityAuditMarkdown(audit)}`;
      qs("#blendStatus").textContent = "模型生成完成，并已完成本地保真复核。";
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

  qs("#providerSelect").addEventListener("change", () => {
    const provider = normalizeProvider(qs("#providerSelect").value);
    const config = providerConfig(provider);
    qs("#apiEndpointInput").value = config.endpoint;
    renderModelOptions(provider, config.defaultModel);
    if (qs("#providerHint")) qs("#providerHint").textContent = config.hint;
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

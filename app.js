const STORAGE_KEY = "scholar-style-workbench-profiles-v1";

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
};

let profiles = loadProfiles();
let activeProfileId = profiles[0]?.id || defaultProfile.id;
let selectedCorpusFiles = [];

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

function loadProfiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    // Ignore malformed storage.
  }
  return [defaultProfile];
}

function saveProfiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
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
  const stop = new Set(["一个", "一种", "这个", "这些", "以及", "但是", "因此", "所以", "我们", "他们", "自己", "没有", "不是", "成为", "进行", "具有", "而是"]);
  const counts = new Map();
  matches.forEach((chunk) => {
    for (let index = 0; index <= chunk.length - size; index += 1) {
      const gram = chunk.slice(index, index + size);
      if (!stop.has(gram) && isContentTerm(gram)) counts.set(gram, (counts.get(gram) || 0) + 1);
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
  if (/不是|而是|因此|所以|由此|换言之|如果说|那么|所谓/.test(clean)) return false;
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
    if (entry.count >= 3 && isContentTerm(term)) counts.set(term, (counts.get(term) || 0) + entry.count);
  });
  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count || b.item.length - a.item.length)
    .map((entry) => entry.item)
    .slice(0, 24);
}

function analyzeText(text, name, documents = 1) {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])/g, "")
    .trim();
  const sentences = splitSentences(normalized);
  const paragraphs = splitParagraphs(normalized);
  const tokens = tokenize(normalized);
  const stats = sentenceStats(sentences);
  const markers = countMarkers(normalized);
  const n2 = topCjkNgrams(normalized, 2);
  const n3 = topCjkNgrams(normalized, 3);
  const n4 = topCjkNgrams(normalized, 4);
  const lexicon = extractConceptTerms(normalized, [n4, n3, n2]);

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
    lexicon,
    pairs: inferPairs(lexicon),
    markers: {
      contrast: markers.contrast.map((entry) => entry.item),
      causal: markers.causal.map((entry) => entry.item),
      reformulation: ["也就是说", "换言之", "严格说来", "在某种意义上", "实质上"].filter((item) => normalized.includes(item)),
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
    rawSignals: { markers, ngrams: { n2, n3, n4 } },
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
  const texts = [];
  const skipped = [];
  for (const file of files) {
    if (/\.pdf$/i.test(file.name)) {
      skipped.push(file.name);
      continue;
    }
    texts.push(await file.text());
  }
  return { text: texts.join("\n\n"), skipped };
}

function renderAnalysisPreview(profile) {
  const markers = profile.markers || {};
  const signals = profile.rawSignals || {};
  qs("#analysisPreview").innerHTML = `
    <div class="metric-grid">
      <div class="metric"><strong>${profile.stats.tokens}</strong><span>tokens</span></div>
      <div class="metric"><strong>${profile.stats.sentences}</strong><span>sentences</span></div>
      <div class="metric"><strong>${profile.stats.avgSentenceLength}</strong><span>avg sentence</span></div>
      <div class="metric"><strong>${profile.stats.sentenceStdev}</strong><span>sentence stdev</span></div>
    </div>
    <h4>概念词</h4>
    <div class="tag-list">${profile.lexicon.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
    <h4>转折标记</h4>
    <div class="tag-list">${(markers.contrast || []).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || '<span class="tag">未检出</span>'}</div>
    <h4>高频四字组</h4>
    <div class="tag-list">${(signals.ngrams?.n4 || []).slice(0, 12).map((entry) => `<span class="tag">${escapeHtml(entry.item)} · ${entry.count}</span>`).join("")}</div>
  `;
}

function profileToMarkdown(profile) {
  return `# ${profile.name} 风格规则

来源：${profile.source || "本地 profile"}
语料规模：${profile.stats?.tokens || 0} tokens，${profile.stats?.sentences || 0} 句

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

## 论证模式
${(profile.argumentPatterns || []).map((item) => `- ${item}`).join("\n")}

## 负面清单
${(profile.negative || []).map((item) => `- ${item}`).join("\n")}
`;
}

function localDraft(profile, idea, mode) {
  const cleanIdea = idea.trim().replace(/\s+/g, " ");
  if (!cleanIdea) return "请先输入你的观点。";
  const topic = cleanIdea.replace(/[。！？!?].*$/, "").slice(0, 48);
  const keyTerms = (profile.lexicon || []).slice(0, 6).join("、");
  const styleNote = mode === "lecture" ? "在我看来，" : "";
  return `## 改写稿

${styleNote}要理解“${topic}”，不能只把它看作一个孤立的表达问题。它之所以成为问题，恰恰在于它处在既有${keyTerms || "价值系统"}重新分化和重组的过程中。${cleanIdea} 也就是说，这里真正需要辨明的，并非只是某一工具、观念或制度的外在功能，而是它如何改变问题被提出、关系被组织以及主体理解自身位置的方式。正是在此意义上，对这一问题的讨论，才不只是经验层面的说明，而是关乎一种新的学术和价值秩序如何被安顿的问题。

## 使用的风格规则
- 词汇: 使用“问题、价值系统、主体、安顿”等概念化表达。
- 句式: 采用“不能只把它看作……而是……”和“也就是说”的重述结构。
- 段落: 先建构问题域，再转入概念区分，最后给出有限判断。
- 论证: 把原始观点放入历史或思想关系中，而非直接下结论。

## 需要你确认的地方
- 这段本地草稿没有新增事实依据；如果要写成论文段落，需要补充具体材料、文献或案例。`;
}

function aiPrompt(profile, idea, mode) {
  return `请依据以下“${profile.name}”风格 profile，改写我的观点。

重要边界：
1. 不要冒充该学者本人。
2. 不要复制任何原文。
3. 保留我的核心观点、证据和不确定性。
4. 输出后说明使用了哪些风格规则。

目标体裁：${mode}

风格规则：
${profileToMarkdown(profile)}

我的观点：
${idea.trim()}`;
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
    const fileResult = await readSelectedFiles(selectedCorpusFiles);
    const combined = [pasted, fileResult.text].filter(Boolean).join("\n\n");
    if (!combined.trim()) {
      showToast("请先导入或粘贴语料。");
      return;
    }
    const readableFiles = selectedCorpusFiles.filter((file) => !/\.pdf$/i.test(file.name)).length;
    const documentCount = Math.max(1, readableFiles + (pasted ? 1 : 0));
    const profile = analyzeText(combined, name, documentCount);
    profiles = [profile, ...profiles.filter((item) => item.id !== profile.id)];
    activeProfileId = profile.id;
    saveProfiles();
    render();
    renderAnalysisPreview(profile);
    showToast(fileResult.skipped.length ? `已生成；跳过 PDF：${fileResult.skipped.length} 个` : "Profile 已生成。");
  });

  qs("#draftButton").addEventListener("click", () => {
    qs("#rewriteOutput").value = localDraft(activeProfile(), qs("#ideaInput").value, qs("#rewriteMode").value);
  });

  qs("#promptButton").addEventListener("click", () => {
    qs("#rewriteOutput").value = aiPrompt(activeProfile(), qs("#ideaInput").value, qs("#rewriteMode").value);
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

  qs("#deleteProfileButton").addEventListener("click", () => {
    const current = activeProfile();
    if (!window.confirm(`删除「${current.name}」这个本地 profile？`)) return;
    profiles = profiles.filter((profile) => profile.id !== current.id);
    if (!profiles.length) profiles = [defaultProfile];
    activeProfileId = profiles[0].id;
    saveProfiles();
    render();
    showToast("已删除当前 profile。");
  });

  qs("#resetProfilesButton").addEventListener("click", () => {
    if (!window.confirm("清空本地 profile，并恢复张志强测试样例？")) return;
    profiles = [defaultProfile];
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
      profiles = [profile, ...profiles.filter((item) => item.id !== profile.id)];
      activeProfileId = profile.id;
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

"use strict";

const CATEGORIES = Object.freeze([
  "一般生物",
  "人類",
  "黑暗生物",
  "光明生物",
  "不死生物",
  "虛體",
  "靈體",
  "構裝體",
  "幻想魔法生物",
  "元素生物",
  "泥型生物",
  "植物生物",
  "集群生物",
]);

const TIERS = new Set(["無", "D", "C", "B", "A", "S", "SS", "SSS", "待確認"]);
const FALLBACK_SOURCE = "https://inf-boop.github.io/INF/2.34/2.34.html";

const elements = {
  categoryList: document.querySelector("#category-list"),
  status: document.querySelector("#catalog-status"),
  search: document.querySelector("#search"),
  tier: document.querySelector("#tier-filter"),
  expandAll: document.querySelector("#expand-all"),
  collapseAll: document.querySelector("#collapse-all"),
};

let monsters = [];

function cleanText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeUrl(value, fallback = "") {
  const candidate = cleanText(value, fallback);
  if (!candidate) return "";

  try {
    const url = new URL(candidate, window.location.href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function normalizeMonster(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const category = CATEGORIES.includes(value.category) ? value.category : "一般生物";
  const tier = TIERS.has(value.tier) ? value.tier : "待確認";
  const name = cleanText(value.name);
  const card = cleanText(value.card);
  const slug = cleanText(value.slug)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!name || !card || !slug) return null;

  // Only these seven public fields leave the data layer. Any additional keys are ignored.
  return Object.freeze({
    category,
    tier,
    name,
    card,
    image: normalizeUrl(value.image),
    slug,
    sourceUrl: normalizeUrl(value.sourceUrl, FALLBACK_SOURCE),
  });
}

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createMonsterCard(monster) {
  const details = createElement("details", "monster-card");
  details.dataset.slug = monster.slug;
  const summary = createElement("summary", "monster-summary");

  if (monster.image) {
    const image = createElement("img", "monster-image");
    image.src = monster.image;
    image.alt = `${monster.name} 圖像`;
    image.width = 300;
    image.height = 60;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.replaceWith(createElement("div", "monster-image--placeholder", "圖像尚未提供"));
    });
    summary.append(image);
  } else {
    summary.append(createElement("div", "monster-image--placeholder", "圖像尚未提供"));
  }

  const identity = createElement("div", "monster-summary__identity");
  const tierBadge = createElement("span", "tier-badge", monster.tier);
  tierBadge.dataset.tier = monster.tier;
  tierBadge.setAttribute("aria-label", `等級：${monster.tier}`);
  identity.append(tierBadge, createElement("h2", "monster-name", monster.name));
  summary.append(identity);
  details.append(summary);

  const body = createElement("div", "monster-card__body");
  const heading = createElement("div", "monster-heading");
  heading.append(createElement("p", "monster-card__category", monster.category));

  body.append(heading);
  const cardText = createElement("pre", "monster-card__text");
  const hpPattern = /(?<=\d)（[−+\d][\d＋+／/−.\-]*）/gu;
  let hpCursor = 0;
  for (const match of monster.card.matchAll(hpPattern)) {
    const value = match[0];
    const start = match.index;
    const annotation = createElement("span", "hp-adjusted", value);
    annotation.title = "四人基準採用值，非額外加值；前方為原始值";
    annotation.setAttribute("aria-label", `四人基準調整數值 ${value}`);
    cardText.append(monster.card.slice(hpCursor, start), annotation);
    hpCursor = start + value.length;
  }
  cardText.append(monster.card.slice(hpCursor));
  body.append(cardText);

  if (monster.sourceUrl) {
    const source = createElement("a", "monster-card__source", "資料來源");
    source.href = monster.sourceUrl;
    source.target = "_blank";
    source.rel = "noreferrer";
    body.append(source);
  }

  details.append(body);
  return details;
}

function getFilteredMonsters() {
  const query = elements.search.value.trim().toLocaleLowerCase("zh-Hant");
  const tier = elements.tier.value;

  return monsters.filter((monster) => {
    const matchesTier = tier === "all" || monster.tier === tier;
    const haystack = `${monster.name}\n${monster.card}`.toLocaleLowerCase("zh-Hant");
    return matchesTier && (!query || haystack.includes(query));
  });
}

function render() {
  const filtered = getFilteredMonsters();
  const fragment = document.createDocumentFragment();

  for (const category of CATEGORIES) {
    const categoryMonsters = filtered.filter((monster) => monster.category === category);
    const details = createElement("details", "category-group");
    details.open = filtered.length > 0 && categoryMonsters.length > 0;

    const summary = createElement("summary", "category-summary");
    summary.append(createElement("span", "category-name", category));
    summary.append(createElement("span", "category-count", String(categoryMonsters.length)));
    details.append(summary);

    const content = createElement("div", "category-content");
    if (categoryMonsters.length === 0) {
      content.append(
        createElement(
          "p",
          "category-empty",
          monsters.length === 0 ? "尚未收錄怪物。" : "目前篩選條件下沒有怪物。",
        ),
      );
    } else {
      const grid = createElement("div", "monster-grid");
      for (const monster of categoryMonsters) grid.append(createMonsterCard(monster));
      content.append(grid);
    }

    details.append(content);
    fragment.append(details);
  }

  elements.categoryList.replaceChildren(fragment);
  elements.status.dataset.error = "false";
  elements.status.textContent =
    monsters.length === 0
      ? "圖鑑骨架已就緒，目前尚未收錄任何怪物。"
      : `顯示 ${filtered.length}／${monsters.length} 個怪物。`;
}

function setAllDetails(open) {
  document.querySelectorAll(".category-group").forEach((group) => {
    group.open = open;
  });
  document.querySelectorAll(".monster-card").forEach((card) => {
    card.open = open;
  });
}

async function loadCatalog() {
  try {
    const response = await fetch("./data/monsters.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    if (!Array.isArray(payload)) throw new TypeError("monsters.json 必須是陣列");

    monsters = payload.map(normalizeMonster).filter(Boolean);
    render();
  } catch (error) {
    console.error("無法載入怪物圖鑑", error);
    elements.status.dataset.error = "true";
    elements.status.textContent = "無法載入怪物資料，請確認 data/monsters.json 格式正確。";
    monsters = [];
    render();
    elements.status.dataset.error = "true";
    elements.status.textContent = "無法載入怪物資料，請確認 data/monsters.json 格式正確。";
  }
}

elements.search.addEventListener("input", render);
elements.tier.addEventListener("change", render);
elements.expandAll.addEventListener("click", () => setAllDetails(true));
elements.collapseAll.addEventListener("click", () => setAllDetails(false));

loadCatalog();

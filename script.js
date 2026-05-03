const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzKEVSPRUVTEPVwHy7Jqs1NkzOLXnVC100fM4aEyk4oAP5CeqxGRdZk6qL5WnltTImIkw/exec";

const POSTER_FILES = [
  "WSL-11.jpg",
  "WSL-12.png",
  "WSL-13.png",
  "WSL-14.png",
  "WSL-15.png",
  "WSL-16.png",
  "WSL-17.png",
  "WSL-18.png",
  "WSL-19.png",
  "WSL-20.png",
  "WSL-21.png",
  "WSL-22.png",
  "WSL-23.jpg",
  "WSL-24.png",
  "WSL-25.png",
  "WSL-26.png",
  "WSL-27.png",
  "WSL-28.png",
  "WSL-29.png",
  "WSL-30.png",
  "WSL-31.png",
  "WSL-32.png",
  "WSL-33.png",
  "WSL-34.png",
  "WSL-35.png",
  "WSL-36.png",
  "WSL-37.png",
  "WSL-38.png",
  "WSL-39.png",
  "WSL-40.png",
  "WSL-41.png",
  "WSL-42.png",
  "WSL-43.png",
  "WSL-44.png",
  "WSL-45.png",
  "WSL-46.png",
  "WSL-47.png",
  "WSL-48.png",
  "WSL-49.png",
  "WSL-50.png",
  "WSL-51.png",
  "WSL-52.jpeg",
  "WSL-53.png",
  "WSL-54.png",
  "WSL-55.jpeg",
  "WSL-56.png",
  "WSL-57.png",
  "WSL-58.png",
  "WSL-59.png",
  "WSL-60.png",
  "WSL-61.png",
  "WSL-62.png",
  "WSL-63.png",
  "WSL-64.png",
  "WSL-65.png",
  "WSL-66.png",
  "WSL-67.png",
  "WSL-68.png",
  "WSL-69.png",
  "WSL-70.png",
  "WSL-71.png",
  "WSL-72.png",
  "WSL-73.png",
  "WSL-74.png",
  "WSL-75.jpg",
  "WSL-76.png",
  "WSL-77.png",
  "WSL-78.png",
  "WSL-79.jfif",
  "WSL-80.png",
  "WSL-81.png",
  "WSL-82.png",
  "WSL-83.png",
  "WSL-84.png",
  "WSL-85.png"
];

const posters = POSTER_FILES.map((file) => {
  const id = file.replace(/\.[^.]+$/, "");
  const number = id.match(/\d+/)?.[0] ?? id;
  return {
    id,
    file,
    number,
    src: `images/${file}`
  };
});

const state = {
  user: "",
  selected: {
    1: "",
    2: "",
    3: ""
  },
  filter: "",
  dialogPosterId: ""
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  loginView: $("#loginView"),
  galleryView: $("#galleryView"),
  loginForm: $("#loginForm"),
  userInput: $("#userInput"),
  loginButton: $("#loginButton"),
  loginMessage: $("#loginMessage"),
  currentUser: $("#currentUser"),
  logoutButton: $("#logoutButton"),
  searchInput: $("#searchInput"),
  posterGrid: $("#posterGrid"),
  posterCount: $("#posterCount"),
  filterCount: $("#filterCount"),
  selectionSummary: $("#selectionSummary"),
  rankList: $("#rankList"),
  submitButton: $("#submitButton"),
  submitMessage: $("#submitMessage"),
  posterDialog: $("#posterDialog"),
  closeDialogButton: $("#closeDialogButton"),
  dialogImage: $("#dialogImage"),
  dialogTitle: $("#dialogTitle")
};

function callGas(params) {
  return new Promise((resolve, reject) => {
    const callbackName = `gasCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const url = new URL(GAS_ENDPOINT);

    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set("callback", callbackName);

    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("連線逾時，請稍後再試。"));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("無法連線到 Google Apps Script。"));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function setMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `message ${type}`.trim();
}

function normalizeSelection(votes = {}) {
  state.selected = {
    1: votes.no1 || "",
    2: votes.no2 || "",
    3: votes.no3 || ""
  };
}

function showGallery() {
  elements.currentUser.textContent = state.user;
  elements.loginView.hidden = true;
  elements.galleryView.hidden = false;
  renderAll();
}

async function handleLogin(event) {
  event.preventDefault();
  const user = elements.userInput.value.trim().toLowerCase();

  if (!user) {
    setMessage(elements.loginMessage, "請輸入登入帳號。", "error");
    return;
  }

  elements.loginButton.disabled = true;
  setMessage(elements.loginMessage, "登入確認中...");

  try {
    const result = await callGas({ action: "login", user });

    if (!result.ok) {
      setMessage(elements.loginMessage, result.message || "帳號不在評選名單內。", "error");
      return;
    }

    state.user = result.user || user;
    normalizeSelection(result.votes);
    window.sessionStorage.setItem("posterAwardUser", state.user);
    setMessage(elements.loginMessage, "");
    showGallery();
  } catch (error) {
    setMessage(elements.loginMessage, error.message, "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

function getPoster(id) {
  return posters.find((poster) => poster.id === id);
}

function getRankByPoster(posterId) {
  return Object.keys(state.selected).find((rank) => state.selected[rank] === posterId) || "";
}

function selectPoster(rank, posterId) {
  const currentRank = getRankByPoster(posterId);

  if (currentRank && currentRank !== String(rank)) {
    state.selected[currentRank] = "";
  }

  state.selected[rank] = state.selected[rank] === posterId ? "" : posterId;
  renderAll();
}

function clearRank(rank) {
  state.selected[rank] = "";
  renderAll();
}

function getFilteredPosters() {
  const keyword = state.filter.trim().toLowerCase();
  if (!keyword) {
    return posters;
  }

  return posters.filter((poster) => {
    return poster.id.toLowerCase().includes(keyword) || poster.number.includes(keyword);
  });
}

function renderPosters() {
  const filtered = getFilteredPosters();
  elements.posterGrid.innerHTML = "";
  elements.posterCount.textContent = `共 ${posters.length} 件作品`;
  elements.filterCount.textContent = state.filter ? `顯示 ${filtered.length} 件` : "";

  const fragment = document.createDocumentFragment();

  filtered.forEach((poster) => {
    const rank = getRankByPoster(poster.id);
    const card = document.createElement("article");
    card.className = `poster-card ${rank ? "selected" : ""}`;

    card.innerHTML = `
      <button class="open-poster" type="button" data-open="${poster.id}" aria-label="檢視 ${poster.id}"></button>
      <div class="poster-thumb">
        <img src="${poster.src}" alt="作品 ${poster.id}" loading="lazy">
      </div>
      <div class="poster-info">
        <div class="poster-title-row">
          <strong class="poster-number">${poster.id}</strong>
          ${rank ? `<span class="rank-badge">第 ${rank} 名</span>` : ""}
        </div>
        <div class="poster-actions" aria-label="${poster.id} 名次選擇">
          ${[1, 2, 3].map((item) => `
            <button class="rank-button ${rank === String(item) ? "active" : ""}" type="button" data-rank="${item}" data-poster="${poster.id}">
              ${item}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  elements.posterGrid.appendChild(fragment);
}

function renderRankList() {
  elements.rankList.innerHTML = "";

  [1, 2, 3].forEach((rank) => {
    const poster = getPoster(state.selected[rank]);
    const li = document.createElement("li");

    if (poster) {
      li.innerHTML = `
        <strong>${poster.id}</strong>
        <button class="clear-rank" type="button" data-clear-rank="${rank}" aria-label="清除第 ${rank} 名">×</button>
      `;
    } else {
      li.innerHTML = `
        <strong>尚未選擇</strong>
        <span></span>
      `;
    }

    elements.rankList.appendChild(li);
  });
}

function renderSummary() {
  const selectedCount = Object.values(state.selected).filter(Boolean).length;
  elements.selectionSummary.textContent = `已選 ${selectedCount} / 3`;
  elements.submitButton.disabled = selectedCount !== 3;
}

function renderDialogActions() {
  const posterId = state.dialogPosterId;
  const rank = getRankByPoster(posterId);

  elements.posterDialog.querySelectorAll("[data-dialog-rank]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dialogRank === rank);
  });
}

function renderAll() {
  renderPosters();
  renderRankList();
  renderSummary();
  renderDialogActions();
}

function openPoster(posterId) {
  const poster = getPoster(posterId);
  if (!poster) {
    return;
  }

  state.dialogPosterId = poster.id;
  elements.dialogImage.src = poster.src;
  elements.dialogImage.alt = `作品 ${poster.id}`;
  elements.dialogTitle.textContent = poster.id;
  renderDialogActions();
  elements.posterDialog.showModal();
}

async function submitVotes() {
  const no1 = state.selected[1];
  const no2 = state.selected[2];
  const no3 = state.selected[3];

  if (!no1 || !no2 || !no3) {
    setMessage(elements.submitMessage, "請完成第 1、2、3 名後再送出。", "error");
    return;
  }

  elements.submitButton.disabled = true;
  setMessage(elements.submitMessage, "送出中...");

  try {
    const result = await callGas({
      action: "submit",
      user: state.user,
      no1,
      no2,
      no3
    });

    if (!result.ok) {
      setMessage(elements.submitMessage, result.message || "送出失敗，請稍後再試。", "error");
      return;
    }

    setMessage(elements.submitMessage, "評選已送出，可再次修改後重送。", "success");
  } catch (error) {
    setMessage(elements.submitMessage, error.message, "error");
  } finally {
    renderSummary();
  }
}

function logout() {
  window.sessionStorage.removeItem("posterAwardUser");
  state.user = "";
  normalizeSelection();
  elements.galleryView.hidden = true;
  elements.loginView.hidden = false;
  elements.userInput.focus();
}

elements.loginForm.addEventListener("submit", handleLogin);

elements.logoutButton.addEventListener("click", logout);

elements.searchInput.addEventListener("input", (event) => {
  state.filter = event.target.value;
  renderPosters();
});

elements.posterGrid.addEventListener("click", (event) => {
  const rankButton = event.target.closest("[data-rank]");
  const openButton = event.target.closest("[data-open]");

  if (rankButton) {
    selectPoster(rankButton.dataset.rank, rankButton.dataset.poster);
    return;
  }

  if (openButton) {
    openPoster(openButton.dataset.open);
  }
});

elements.rankList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-clear-rank]");
  if (button) {
    clearRank(button.dataset.clearRank);
  }
});

elements.submitButton.addEventListener("click", submitVotes);

elements.closeDialogButton.addEventListener("click", () => {
  elements.posterDialog.close();
});

elements.posterDialog.addEventListener("click", (event) => {
  if (event.target === elements.posterDialog) {
    elements.posterDialog.close();
  }
});

elements.posterDialog.querySelectorAll("[data-dialog-rank]").forEach((button) => {
  button.addEventListener("click", () => {
    selectPoster(button.dataset.dialogRank, state.dialogPosterId);
  });
});

renderAll();

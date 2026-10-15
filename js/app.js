/**
 * CodeQuest - Core Frontend Logic (js/app.js)
 * Beginner-friendly interactions, progress tracking via localStorage,
 * and educational test-runner simulation.
 */

// Local Storage Key
const STORAGE_KEY = "codequest_student_v1";

// -----------------------------------------------------------------------------
// Storage & Progress State Management
// -----------------------------------------------------------------------------
function getStudentData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading localStorage:", err);
  }
  return {
    completed: {}, // problemId -> { completedAt, language, xp }
    drafts: {},    // `${problemId}_${lang}` -> codeString
    activeLanguage: "python"
  };
}

function saveStudentData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

function isProblemCompleted(problemId) {
  const data = getStudentData();
  return Boolean(data.completed && data.completed[problemId]);
}

function markProblemCompleted(problemId, language, xp) {
  const data = getStudentData();
  if (!data.completed) data.completed = {};
  
  const wasAlreadyCompleted = Boolean(data.completed[problemId]);
  data.completed[problemId] = {
    completedAt: new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    language: language || "python",
    xp: xp || 50
  };
  
  saveStudentData(data);
  updateNavXPBadge();
  return !wasAlreadyCompleted;
}

function getCompletedCount() {
  const data = getStudentData();
  return Object.keys(data.completed || {}).length;
}

function getTotalXP() {
  const data = getStudentData();
  let total = 0;
  for (const id in data.completed || {}) {
    total += data.completed[id].xp || 0;
  }
  return total;
}

function getStudentRank(xp) {
  if (xp >= 500) return { title: "Grandmaster Adventurer", icon: "👑" };
  if (xp >= 300) return { title: "Code Sage", icon: "🧙‍♂️" };
  if (xp >= 150) return { title: "Skilled Navigator", icon: "🧭" };
  if (xp >= 60) return { title: "Apprentice Coder", icon: "⚔️" };
  return { title: "Novice Explorer", icon: "🌱" };
}

function saveDraft(problemId, lang, code) {
  const data = getStudentData();
  if (!data.drafts) data.drafts = {};
  data.drafts[`${problemId}_${lang}`] = code;
  saveStudentData(data);
}

function getDraft(problemId, lang) {
  const data = getStudentData();
  return (data.drafts && data.drafts[`${problemId}_${lang}`]) || null;
}

function resetAllStudentData() {
  localStorage.removeItem(STORAGE_KEY);
  updateNavXPBadge();
}

// -----------------------------------------------------------------------------
// UI Utilities: Toast Notifications & XP Badges
// -----------------------------------------------------------------------------
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "🎉" : "💡"}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function updateNavXPBadge() {
  const badge = document.getElementById("nav-xp-counter");
  if (badge) {
    const xp = getTotalXP();
    badge.textContent = `${xp} XP`;
  }
}

// -----------------------------------------------------------------------------
// Home Page Controller (index.html)
// -----------------------------------------------------------------------------
function initHomePage() {
  const grid = document.getElementById("problems-grid");
  const searchInput = document.getElementById("search-input");
  const difficultyFilter = document.getElementById("difficulty-filter");
  const langTabsContainer = document.getElementById("lang-filter-tabs");
  const statTotal = document.getElementById("stat-total-problems");
  const statCompleted = document.getElementById("stat-completed-problems");
  const statXP = document.getElementById("stat-total-xp");

  let currentLang = "all";
  let currentDifficulty = "all";
  let searchQuery = "";

  const allProblems = getAllProblems();

  // Update hero stats
  if (statTotal) statTotal.textContent = allProblems.length;
  if (statCompleted) statCompleted.textContent = getCompletedCount();
  if (statXP) statXP.textContent = getTotalXP();

  function renderCards() {
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = allProblems.filter(problem => {
      // Language filter
      if (currentLang !== "all" && !problem.languages.includes(currentLang)) {
        return false;
      }
      // Difficulty filter
      if (currentDifficulty !== "all" && problem.difficulty.toLowerCase() !== currentDifficulty.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = problem.title.toLowerCase().includes(query);
        const matchesDesc = problem.summary.toLowerCase().includes(query);
        const matchesCategory = problem.category.toLowerCase().includes(query);
        const matchesConcepts = problem.concepts && problem.concepts.some(c => c.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesConcepts) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No quests found</h3>
          <p>Try adjusting your search query or filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(prob => {
      const isDone = isProblemCompleted(prob.id);
      const card = document.createElement("div");
      card.className = "problem-card";
      
      const difficultyClass = prob.difficulty.toLowerCase() === "easy" ? "easy" : "medium";
      const targetLang = currentLang === "all" ? "python" : currentLang;

      card.innerHTML = `
        <div class="problem-card-top">
          <span class="category-tag">${prob.category}</span>
          <span class="badge-difficulty ${difficultyClass}">${prob.difficulty}</span>
        </div>
        <h3 class="problem-card-title">${prob.title}</h3>
        <p class="problem-card-desc">${prob.summary}</p>
        
        <div class="languages-supported">
          <span class="lang-icon-badge" title="Python">🐍 Python</span>
          <span class="lang-icon-badge" title="JavaScript">⚡ JS</span>
          <span class="lang-icon-badge" title="Java">☕ Java</span>
          <span class="lang-icon-badge" title="C++">⚙️ C++</span>
        </div>

        <div class="problem-card-footer">
          <span class="xp-indicator">⚡ +${prob.xp} XP</span>
          ${isDone ? `<span class="card-status-badge">✓ Solved</span>` : ''}
          <a href="problem.html?id=${prob.id}&lang=${targetLang}" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.45rem 0.9rem;">
            ${isDone ? 'Practice Again →' : 'Solve Quest →'}
          </a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Set up language tabs event listeners
  if (langTabsContainer) {
    langTabsContainer.querySelectorAll(".lang-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        langTabsContainer.querySelectorAll(".lang-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentLang = tab.getAttribute("data-lang");
        renderCards();
      });
    });
  }

  // Set up search and filter listeners
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCards();
    });
  }

  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", (e) => {
      currentDifficulty = e.target.value;
      renderCards();
    });
  }

  renderCards();
}

// -----------------------------------------------------------------------------
// Problem Solver Page Controller (problem.html)
// -----------------------------------------------------------------------------
function initProblemPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const problemId = urlParams.get("id") || "hello-world";
  let activeLang = urlParams.get("lang") || "python";

  const problem = getProblemById(problemId);
  const allProblems = getAllProblems();

  // Populate Dropdown selector
  const selector = document.getElementById("problem-select-dropdown");
  if (selector) {
    selector.innerHTML = "";
    allProblems.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.title} (${p.difficulty})`;
      if (p.id === problem.id) opt.selected = true;
      selector.appendChild(opt);
    });
    selector.addEventListener("change", (e) => {
      window.location.href = `problem.html?id=${e.target.value}&lang=${activeLang}`;
    });
  }

  // Render Left Column Specs
  const titleEl = document.getElementById("problem-title");
  const diffBadge = document.getElementById("problem-diff-badge");
  const xpBadge = document.getElementById("problem-xp-badge");
  const categoryBadge = document.getElementById("problem-category-badge");
  const descEl = document.getElementById("problem-description");
  const sampleInputEl = document.getElementById("sample-input-code");
  const sampleOutputEl = document.getElementById("sample-output-code");
  const hintsContainer = document.getElementById("hints-accordion-group");
  const conceptsContainer = document.getElementById("concepts-tag-cloud");

  if (titleEl) titleEl.textContent = problem.title;
  if (diffBadge) {
    diffBadge.textContent = problem.difficulty;
    diffBadge.className = `badge-difficulty ${problem.difficulty.toLowerCase()}`;
  }
  if (xpBadge) xpBadge.textContent = `⚡ +${problem.xp} XP`;
  if (categoryBadge) categoryBadge.textContent = problem.category;

  // Convert basic markdown-like description lines to readable HTML
  if (descEl) {
    descEl.innerHTML = problem.description
      .replace(/### (.*?)\n/g, '<h3 style="margin-top: 1rem; margin-bottom: 0.4rem; color: #f8fafc; font-size: 1.05rem;">$1</h3>')
      .replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); background: rgba(255,255,255,0.08); padding: 0.15rem 0.35rem; border-radius: 4px; color: #38bdf8;">$1</code>')
      .replace(/\n\n/g, '<br><br>');
  }

  if (sampleInputEl) sampleInputEl.textContent = problem.sampleInput;
  if (sampleOutputEl) sampleOutputEl.textContent = problem.sampleOutput;

  // Render Hints Accordion
  if (hintsContainer) {
    hintsContainer.innerHTML = "";
    problem.hints.forEach((hint, index) => {
      const accordion = document.createElement("div");
      accordion.className = "hint-accordion";
      accordion.innerHTML = `
        <div class="hint-summary" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          <span>💡 Hint ${index + 1}</span>
          <span style="font-size: 0.8rem; color: var(--text-dim);">Click to reveal</span>
        </div>
        <div class="hint-content" style="display: none;">
          ${hint}
        </div>
      `;
      hintsContainer.appendChild(accordion);
    });
  }

  // Render Concepts Cloud
  if (conceptsContainer && problem.concepts) {
    conceptsContainer.innerHTML = "";
    problem.concepts.forEach(concept => {
      const span = document.createElement("span");
      span.className = "concept-pill";
      span.textContent = concept;
      conceptsContainer.appendChild(span);
    });
  }

  // Code Editor Elements
  const codeEditor = document.getElementById("code-editor-textarea");
  const langTabs = document.querySelectorAll(".editor-lang-btn");
  const resetBtn = document.getElementById("reset-code-btn");
  const copyBtn = document.getElementById("copy-code-btn");
  const fontIncBtn = document.getElementById("font-increase-btn");
  const fontDecBtn = document.getElementById("font-decrease-btn");
  const runBtn = document.getElementById("run-tests-btn");
  const submitBtn = document.getElementById("submit-solution-btn");
  const consoleTabs = document.querySelectorAll(".console-tab");
  const testCasesView = document.getElementById("test-cases-view");
  const consoleLogsView = document.getElementById("console-logs-view");
  const explanationView = document.getElementById("explanation-view");

  let currentFontSize = 14;

  function loadCodeForLanguage(lang) {
    activeLang = lang;
    // Check if there is an existing draft, otherwise use starterCode
    const savedDraft = getDraft(problem.id, lang);
    const starter = (problem.starterCode && problem.starterCode[lang]) || `// Write your ${lang} code here\n`;
    if (codeEditor) {
      codeEditor.value = savedDraft || starter;
    }

    // Update active tab buttons
    langTabs.forEach(btn => {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update URL parameter without reload
    const newUrl = `${window.location.pathname}?id=${problem.id}&lang=${lang}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }

  // Handle Tab Switching
  langTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      // Save draft of current lang before switching
      if (codeEditor) {
        saveDraft(problem.id, activeLang, codeEditor.value);
      }
      const lang = btn.getAttribute("data-lang");
      loadCodeForLanguage(lang);
    });
  });

  // Enable Tab Key Indentation in Textarea
  if (codeEditor) {
    codeEditor.addEventListener("keydown", function(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        // Insert 4 spaces
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
      }
    });

    // Auto save draft on change
    codeEditor.addEventListener("input", function() {
      saveDraft(problem.id, activeLang, this.value);
    });
  }

  // Reset Code Button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset code back to original starter template?")) {
        const starter = (problem.starterCode && problem.starterCode[activeLang]) || "";
        if (codeEditor) codeEditor.value = starter;
        saveDraft(problem.id, activeLang, starter);
        showToast("Code reset to starter template.", "info");
      }
    });
  }

  // Copy Code Button
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (codeEditor) {
        navigator.clipboard.writeText(codeEditor.value).then(() => {
          showToast("Code copied to clipboard!", "info");
        });
      }
    });
  }

  // Font Size Adjusters
  if (fontIncBtn) {
    fontIncBtn.addEventListener("click", () => {
      if (currentFontSize < 22) {
        currentFontSize += 2;
        if (codeEditor) codeEditor.style.fontSize = `${currentFontSize}px`;
      }
    });
  }

  if (fontDecBtn) {
    fontDecBtn.addEventListener("click", () => {
      if (currentFontSize > 12) {
        currentFontSize -= 2;
        if (codeEditor) codeEditor.style.fontSize = `${currentFontSize}px`;
      }
    });
  }

  // Console Tabs Switcher
  consoleTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      consoleTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");

      if (testCasesView) testCasesView.style.display = target === "cases" ? "block" : "none";
      if (consoleLogsView) consoleLogsView.style.display = target === "logs" ? "block" : "none";
      if (explanationView) explanationView.style.display = target === "explanation" ? "block" : "none";
    });
  });

  // Render Initial Test Cases
  function renderTestCases(statusList = []) {
    if (!testCasesView) return;
    testCasesView.innerHTML = `
      <div class="test-cases-list">
        ${problem.testCases.map((tc, idx) => {
          const status = statusList[idx] || "pending";
          const statusPill = status === "passed"
            ? `<span class="test-status-pill status-passed">✓ Passed</span>`
            : status === "running"
            ? `<span class="test-status-pill status-pending">⏳ Testing...</span>`
            : `<span class="test-status-pill status-pending">Pending</span>`;

          return `
            <div class="test-case-row">
              <div class="test-case-info">
                <span class="test-case-title">Test ${idx + 1}: ${tc.description}</span>
                <span class="test-case-io">Input: <code>${tc.input}</code> | Expected: <code>${tc.expected}</code></span>
              </div>
              <div>${statusPill}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderTestCases();

  // Populate Explanation Tab
  if (explanationView) {
    explanationView.innerHTML = `
      <div style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6;">
        <h4 style="color: #f8fafc; margin-bottom: 0.5rem;">Approach & Concept Walkthrough</h4>
        <p>This challenge exercises <strong>${problem.category}</strong>.</p>
        <p style="margin-top: 0.5rem;">Key steps to solve:</p>
        <ol style="margin-left: 1.25rem; margin-top: 0.25rem;">
          <li>Review the input data types and return requirements.</li>
          <li>Handle standard base conditions or empty boundary cases first.</li>
          <li>Apply the core transformation logic using clean, readable language syntax.</li>
          <li>Return the final result as expected by the test cases.</li>
        </ol>
      </div>
    `;
  }

  // Run Test Cases Action (Simulated Educational Evaluation)
  if (runBtn) {
    runBtn.addEventListener("click", () => {
      // Switch to test cases tab
      consoleTabs.forEach(t => t.classList.remove("active"));
      const testTab = document.querySelector('[data-tab="cases"]');
      if (testTab) testTab.classList.add("active");
      if (testCasesView) testCasesView.style.display = "block";
      if (consoleLogsView) consoleLogsView.style.display = "none";
      if (explanationView) explanationView.style.display = "none";

      // Show running state
      renderTestCases(problem.testCases.map(() => "running"));

      setTimeout(() => {
        // Mark simulated success
        renderTestCases(problem.testCases.map(() => "passed"));

        // Log output to console tab
        if (consoleLogsView) {
          const now = new Date().toLocaleTimeString();
          consoleLogsView.innerHTML = `
[${now}] Target Environment: ${activeLang.toUpperCase()}
[${now}] Compiling test suite for "${problem.title}"...
[${now}] Running Test 1: ${problem.testCases[0].description} -> PASSED (4ms)
[${now}] Running Test 2: ${problem.testCases[1] ? problem.testCases[1].description : 'Check'} -> PASSED (2ms)
[${now}] Running Test 3: ${problem.testCases[2] ? problem.testCases[2].description : 'Check'} -> PASSED (3ms)
[${now}] ----------------------------------------------------
[${now}] Status: All ${problem.testCases.length} sample test cases passed!
[${now}] Note: Click "Submit Solution" to complete the quest and claim your XP!
          `.trim();
        }

        showToast("All sample test cases passed! Ready to submit.", "success");
      }, 400);
    });
  }

  // Submit Solution Action
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const isNew = markProblemCompleted(problem.id, activeLang, problem.xp);
      renderTestCases(problem.testCases.map(() => "passed"));

      if (isNew) {
        showToast(`🎉 Quest Completed! You earned +${problem.xp} XP!`, "success");
      } else {
        showToast(`⭐ Quest updated in your learning record!`, "info");
      }

      // Automatically check next problem
      const currentIndex = allProblems.findIndex(p => p.id === problem.id);
      const nextProblem = allProblems[currentIndex + 1];

      // Update button text or show completion state
      submitBtn.innerHTML = `<span>✓ Completed</span>`;
      submitBtn.classList.remove("btn-primary");
      submitBtn.classList.add("btn-success");

      if (nextProblem) {
        setTimeout(() => {
          if (confirm(`Great job solving "${problem.title}"! Would you like to advance to the next quest: "${nextProblem.title}"?`)) {
            window.location.href = `problem.html?id=${nextProblem.id}&lang=${activeLang}`;
          }
        }, 1200);
      }
    });
  }

  // Initialize with current language
  loadCodeForLanguage(activeLang);
}

// -----------------------------------------------------------------------------
// Progress Page Controller (progress.html)
// -----------------------------------------------------------------------------
function initProgressPage() {
  const studentData = getStudentData();
  const allProblems = getAllProblems();

  const totalXP = getTotalXP();
  const solvedCount = getCompletedCount();
  const totalCount = allProblems.length;
  const completionPct = Math.round((solvedCount / totalCount) * 100);
  const rank = getStudentRank(totalXP);

  // Update Hero Metrics
  const heroRankTitle = document.getElementById("profile-rank-title");
  const heroRankIcon = document.getElementById("profile-avatar-icon");
  const statXPVal = document.getElementById("metric-total-xp");
  const statSolvedVal = document.getElementById("metric-solved-count");
  const statRateVal = document.getElementById("metric-completion-rate");

  if (heroRankTitle) heroRankTitle.textContent = rank.title;
  if (heroRankIcon) heroRankIcon.textContent = rank.icon;
  if (statXPVal) statXPVal.textContent = totalXP;
  if (statSolvedVal) statSolvedVal.textContent = `${solvedCount} / ${totalCount}`;
  if (statRateVal) statRateVal.textContent = `${completionPct}%`;

  // Language Breakdown Progress
  const langGrid = document.getElementById("languages-progress-grid");
  if (langGrid) {
    langGrid.innerHTML = "";
    const languages = getAvailableLanguages();

    languages.forEach(lang => {
      // Count problems solved in this language
      let count = 0;
      for (const id in studentData.completed || {}) {
        if (studentData.completed[id].language === lang.key) {
          count++;
        }
      }

      const langPct = Math.min(100, Math.round((count / totalCount) * 100));

      const card = document.createElement("div");
      card.className = "lang-progress-card";
      card.innerHTML = `
        <div class="lang-progress-header">
          <span class="lang-name-icon">${lang.icon} ${lang.label}</span>
          <span style="font-weight: 700; color: #38bdf8;">${count} Solved</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${langPct}%"></div>
        </div>
        <div class="progress-stats-txt">
          <span>${langPct}% mastered</span>
          <a href="problem.html?lang=${lang.key}" style="color: #818cf8; font-weight: 600;">Practice →</a>
        </div>
      `;
      langGrid.appendChild(card);
    });
  }

  // Render Achievements
  const achievementsGrid = document.getElementById("achievements-grid");
  if (achievementsGrid) {
    const achievements = [
      {
        id: "first-step",
        title: "First Code Quest",
        desc: "Solve your very first programming challenge",
        icon: "🌱",
        unlocked: solvedCount >= 1
      },
      {
        id: "three-quests",
        title: "Problem Solver",
        desc: "Successfully complete 3 coding quests",
        icon: "⚡",
        unlocked: solvedCount >= 3
      },
      {
        id: "century-xp",
        title: "Century Club",
        desc: "Accumulate 100 or more total XP",
        icon: "💯",
        unlocked: totalXP >= 100
      },
      {
        id: "polyglot",
        title: "Language Explorer",
        desc: "Practice with multiple languages",
        icon: "🌐",
        unlocked: Object.values(studentData.completed || {}).some(c => c.language !== "python") && solvedCount >= 2
      },
      {
        id: "perfectionist",
        title: "Master Adventurer",
        desc: "Complete 6 or more coding quests",
        icon: "🏆",
        unlocked: solvedCount >= 6
      }
    ];

    achievementsGrid.innerHTML = achievements.map(ach => `
      <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-title">${ach.title}</div>
        <div class="achievement-desc">${ach.desc}</div>
        <div style="font-size: 0.72rem; font-weight: 700; color: ${ach.unlocked ? '#34d399' : 'var(--text-dim)'}; margin-top: 0.3rem;">
          ${ach.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
        </div>
      </div>
    `).join('');
  }

  // Render History Table
  const historyTableBody = document.getElementById("history-table-body");
  const emptyState = document.getElementById("history-empty-state");

  if (historyTableBody) {
    const completedList = Object.entries(studentData.completed || {});
    if (completedList.length === 0) {
      if (emptyState) emptyState.style.display = "block";
    } else {
      if (emptyState) emptyState.style.display = "none";
      historyTableBody.innerHTML = completedList.map(([id, info]) => {
        const prob = getProblemById(id);
        const langObj = getAvailableLanguages().find(l => l.key === info.language) || { label: info.language, icon: "💻" };
        return `
          <tr>
            <td style="font-weight: 600; color: #ffffff;">
              <a href="problem.html?id=${prob.id}&lang=${info.language}" style="color: #38bdf8;">${prob.title}</a>
            </td>
            <td>
              <span class="category-tag">${prob.category}</span>
            </td>
            <td>
              <span class="lang-icon-badge">${langObj.icon} ${langObj.label}</span>
            </td>
            <td style="color: #fbbf24; font-weight: 700;">+${info.xp} XP</td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${info.completedAt}</td>
            <td>
              <a href="problem.html?id=${prob.id}&lang=${info.language}" class="btn btn-secondary" style="font-size: 0.78rem; padding: 0.25rem 0.6rem;">Review →</a>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Reset Progress Button
  const resetBtn = document.getElementById("reset-all-progress-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all your progress, XP, and solved quests? This action cannot be undone.")) {
        resetAllStudentData();
        showToast("Progress has been reset.", "info");
        setTimeout(() => window.location.reload(), 400);
      }
    });
  }
}

// -----------------------------------------------------------------------------
// Global Page Bootstrap
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateNavXPBadge();

  // Page detection
  const path = window.location.pathname.toLowerCase();
  if (path.includes("problem.html")) {
    initProblemPage();
  } else if (path.includes("progress.html")) {
    initProgressPage();
  } else {
    // Defaults to home page
    initHomePage();
  }
});

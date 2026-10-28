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
// JavaScript Sandbox Test Runner (Isolated Web Worker)
// -----------------------------------------------------------------------------
function formatValueForDisplay(val) {
  if (val === undefined) return "undefined";
  if (val === null) return "null";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch (_) {
      return String(val);
    }
  }
  return String(val);
}

function escapeHtml(str) {
  if (typeof str !== "string") str = String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Safely executes JavaScript code inside an isolated Web Worker sandbox.
 * Returns a Promise that resolves to:
 * {
 *   workerStarted: boolean,
 *   success: boolean,
 *   allPassed: boolean,
 *   results: Array<{ status, expected, actual, error, duration }>,
 *   logs: string[],
 *   error?: string
 * }
 */
function runJavaScriptInWorker(code, entryPoint, testCases, timeoutMs = 2500) {
  return new Promise((resolve) => {
    // Check Web Worker support
    if (typeof Worker === "undefined" || typeof Blob === "undefined" || typeof URL === "undefined") {
      resolve({
        workerStarted: false,
        success: false,
        allPassed: false,
        error: "Web Workers are not supported in this browser environment.",
        logs: [],
        results: testCases.map(tc => ({
          status: "error",
          error: "Web Workers unsupported"
        }))
      });
      return;
    }

    const workerScript = `
      self.onmessage = function(e) {
      const { code, entryPoint, testCases } = e.data;
        const logs = [];

        // Intercept console.log inside the isolated worker thread
        console.log = function(...args) {
          logs.push(args.map(a => {
            if (typeof a === 'object') {
              try { return JSON.stringify(a); } catch (_) { return String(a); }
            }
            return String(a);
          }).join(' '));
        };

        try {
          // Validate compilation and entry point existence before running the test suite
          const factorySrc = code + '\\n return (typeof ' + entryPoint + ' === "function" ? ' + entryPoint + ' : null);';
          let initialCheckFn;
          try {
            initialCheckFn = new Function(factorySrc)();
          } catch (compErr) {
            self.postMessage({
              success: false,
              allPassed: false,
              error: compErr && compErr.message ? compErr.message : String(compErr),
              logs: logs,
              results: testCases.map(tc => ({
                status: "error",
                error: compErr && compErr.message ? compErr.message : String(compErr)
              }))
            });
            return;
          }

          if (!initialCheckFn) {
            self.postMessage({
              success: false,
              allPassed: false,
              error: "Function '" + entryPoint + "' was not found or is not defined.",
              logs: logs,
              results: testCases.map(tc => ({
                status: "failed",
                error: "Function '" + entryPoint + "' is not defined in your code."
              }))
            });
            return;
          }

          const results = [];
          let allPassed = true;

          for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const startTime = performance.now();
            try {
              // Create a fresh student-code execution instance for each test case
              // so top-level variables and closure state cannot leak between tests
              const freshFactory = new Function(factorySrc);
              const fn = freshFactory();

              if (!fn) {
                throw new Error("Function '" + entryPoint + "' is not defined.");
              }

              // Deep clone arguments so student code in-place mutations cannot alter test definitions
              const clonedArgs = typeof structuredClone === "function"
                ? structuredClone(tc.args || [])
                : JSON.parse(JSON.stringify(tc.args || []));

              const actual = fn.apply(null, clonedArgs);
              const duration = (performance.now() - startTime).toFixed(1);
              const passed = deepEqual(actual, tc.expectedValue);
              if (!passed) allPassed = false;
              results.push({
                status: passed ? "passed" : "failed",
                actual: actual,
                expected: tc.expectedValue,
                duration: duration
              });
            } catch (err) {
              allPassed = false;
              results.push({
                status: "error",
                error: err && err.message ? err.message : String(err),
                duration: (performance.now() - startTime).toFixed(1)
              });
            }
          }

          self.postMessage({
            success: true,
            allPassed: allPassed,
            results: results,
            logs: logs
          });
        } catch (err) {
          self.postMessage({
            success: false,
            allPassed: false,
            error: err && err.message ? err.message : String(err),
            logs: logs,
            results: testCases.map(tc => ({
              status: "error",
              error: err && err.message ? err.message : String(err)
            }))
          });
        }
      };

      function deepEqual(a, b) {
        if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) return true;
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (a === null || b === null) return a === b;
        if (typeof a !== 'object') return false;
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        if (Array.isArray(a)) {
          if (a.length !== b.length) return false;
          for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
          }
          return true;
        }
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (let k of keysA) {
          if (!keysB.includes(k) || !deepEqual(a[k], b[k])) return false;
        }
        return true;
      }
    `;

    let blob;
    let workerUrl;
    let worker;

    try {
      blob = new Blob([workerScript], { type: "application/javascript" });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
    } catch (err) {
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      resolve({
        workerStarted: false,
        success: false,
        allPassed: false,
        error: "Secure Web Worker Sandbox could not start (" + (err.message || err) + "). Note: Some browsers restrict Web Workers over file:// URLs. Please run CodeQuest via a local web server (e.g. VS Code Live Server or 'npx serve') for secure execution.",
        logs: [],
        results: testCases.map(tc => ({
          status: "error",
          error: "Sandbox initialization error: Worker could not be started."
        }))
      });
      return;
    }

    let settled = false;
    const cleanup = () => {
      if (worker) {
        try { worker.terminate(); } catch (_) { }
      }
      if (workerUrl) {
        try { URL.revokeObjectURL(workerUrl); } catch (_) { }
      }
    };

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve({
          workerStarted: true,
          success: false,
          allPassed: false,
          error: `Execution timed out (${timeoutMs}ms). Check for infinite loops or heavy operations.`,
          logs: [],
          results: testCases.map(tc => ({
            status: "error",
            error: `Execution timed out (${timeoutMs}ms)`
          }))
        });
      }
    }, timeoutMs);

    worker.onmessage = function (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve({
          workerStarted: true,
          ...e.data
        });
      }
    };

    worker.onerror = function (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve({
          workerStarted: true,
          success: false,
          allPassed: false,
          error: e.message || "An uncaught runtime error occurred in the sandbox.",
          logs: [],
          results: testCases.map(tc => ({
            status: "error",
            error: e.message || "Sandbox runtime error"
          }))
        });
      }
    };

    // Send payload to worker
    worker.postMessage({
      code: code,
      entryPoint: entryPoint,
      testCases: testCases
    });
  });
}

// -----------------------------------------------------------------------------
// Python Sandbox Test Runner (Isolated Pyodide Web Worker)
// -----------------------------------------------------------------------------
let pythonWorkerInstance = null;
let pythonWorkerActiveRequest = null;

/**
 * Retrieves or lazily creates the singleton Python Web Worker instance.
 */
function getOrCreatePythonWorker() {
  if (pythonWorkerInstance) {
    return pythonWorkerInstance;
  }

  try {
    pythonWorkerInstance = new Worker("js/python-worker.js");
  } catch (err) {
    console.error("Failed to create Python Web Worker:", err);
    return null;
  }

  pythonWorkerInstance.onmessage = function (e) {
    const data = e.data || {};
    // Ignore standalone readiness probe messages
    if (data.type === "init_complete") {
      return;
    }
    // Route matching request
    if (pythonWorkerActiveRequest && data.id === pythonWorkerActiveRequest.id) {
      const { resolve, timer } = pythonWorkerActiveRequest;
      clearTimeout(timer);
      pythonWorkerActiveRequest = null;
      resolve(data);
    }
  };

  pythonWorkerInstance.onerror = function (e) {
    console.error("Python worker error event:", e);
    if (pythonWorkerActiveRequest) {
      const { resolve, timer, testCases } = pythonWorkerActiveRequest;
      clearTimeout(timer);
      pythonWorkerActiveRequest = null;
      terminatePythonWorker();
      resolve({
        workerStarted: true,
        success: false,
        allPassed: false,
        error: e.message || "An uncaught runtime error occurred in the Python sandbox worker.",
        logs: [],
        duration: "0.0",
        results: (testCases || []).map(tc => ({
          status: "error",
          error: e.message || "Python worker runtime error",
          expected: tc.expectedValue
        }))
      });
    } else {
      terminatePythonWorker();
    }
  };

  return pythonWorkerInstance;
}

/**
 * Terminates the active Python Web Worker and clears its state.
 */
function terminatePythonWorker() {
  if (pythonWorkerInstance) {
    try {
      pythonWorkerInstance.terminate();
    } catch (_) { }
    pythonWorkerInstance = null;
  }
}

// Ensure worker cleanup on page teardown
window.addEventListener("beforeunload", terminatePythonWorker);

/**
 * Triggers background pre-warming of the Pyodide runtime to reduce cold-start latency.
 */
function prewarmPythonWorker() {
  const worker = getOrCreatePythonWorker();
  if (worker && !pythonWorkerActiveRequest) {
    try {
      worker.postMessage({ type: "init" });
    } catch (_) { }
  }
}

/**
 * Safely executes Python 3 code inside the isolated Pyodide Web Worker sandbox.
 */
function runPythonInWorker(code, entryPoint, testCases, timeoutMs = 15000) {
  return new Promise((resolve) => {
    // Check Web Worker support
    if (typeof Worker === "undefined") {
      resolve({
        workerStarted: false,
        success: false,
        allPassed: false,
        error: "Web Workers are not supported in this browser environment.",
        logs: [],
        duration: "0.0",
        results: (testCases || []).map(tc => ({
          status: "error",
          error: "Web Workers unsupported",
          expected: tc.expectedValue
        }))
      });
      return;
    }

    // Abort and recreate if a request was already in flight
    if (pythonWorkerActiveRequest) {
      clearTimeout(pythonWorkerActiveRequest.timer);
      pythonWorkerActiveRequest.resolve({
        workerStarted: true,
        success: false,
        allPassed: false,
        error: "Execution superseded by a new test run.",
        logs: [],
        duration: "0.0",
        results: (pythonWorkerActiveRequest.testCases || []).map(tc => ({
          status: "error",
          error: "Superseded",
          expected: tc.expectedValue
        }))
      });
      pythonWorkerActiveRequest = null;
      terminatePythonWorker();
    }

    const worker = getOrCreatePythonWorker();
    if (!worker) {
      resolve({
        workerStarted: false,
        success: false,
        allPassed: false,
        error: "Python Web Worker Sandbox could not start. Note: Some browsers restrict Web Workers over file:// URLs. Please run CodeQuest via a local web server (e.g. VS Code Live Server or 'npx serve') for secure execution.",
        logs: [],
        duration: "0.0",
        results: (testCases || []).map(tc => ({
          status: "error",
          error: "Sandbox initialization error: Worker could not be started.",
          expected: tc.expectedValue
        }))
      });
      return;
    }

    const requestId = "py_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    const timer = setTimeout(() => {
      if (pythonWorkerActiveRequest && pythonWorkerActiveRequest.id === requestId) {
        pythonWorkerActiveRequest = null;
        terminatePythonWorker();
        resolve({
          workerStarted: true,
          success: false,
          allPassed: false,
          error: `Execution timed out (${timeoutMs}ms). Check for infinite loops or heavy operations.`,
          logs: [],
          duration: (timeoutMs / 1000).toFixed(1),
          results: (testCases || []).map(tc => ({
            status: "error",
            error: `Execution timed out (${timeoutMs}ms)`,
            expected: tc.expectedValue
          }))
        });
      }
    }, timeoutMs);

    pythonWorkerActiveRequest = {
      id: requestId,
      resolve: resolve,
      timer: timer,
      testCases: testCases
    };

    try {
      worker.postMessage({
        id: requestId,
        code: code,
        entryPoint: entryPoint,
        testCases: testCases
      });
    } catch (postErr) {
      clearTimeout(timer);
      pythonWorkerActiveRequest = null;
      terminatePythonWorker();
      resolve({
        workerStarted: false,
        success: false,
        allPassed: false,
        error: "Failed to dispatch payload to Python worker: " + (postErr.message || postErr),
        logs: [],
        duration: "0.0",
        results: (testCases || []).map(tc => ({
          status: "error",
          error: "PostMessage error",
          expected: tc.expectedValue
        }))
      });
    }
  });
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

    // Pre-warm Python Web Worker in background when Python is active
    if (lang === "python") {
      prewarmPythonWorker();
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

    // Sync Submit button state
    if (submitBtn) {
      if (isProblemCompleted(problem.id)) {
        submitBtn.innerHTML = `<span>✓ Completed</span>`;
        submitBtn.classList.remove("btn-primary");
        submitBtn.classList.add("btn-success");
      } else {
        submitBtn.innerHTML = `<span>🚀</span> Submit Solution`;
        submitBtn.classList.add("btn-primary");
        submitBtn.classList.remove("btn-success");
      }
    }
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
    codeEditor.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        // Insert 4 spaces
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
      }
    });

    // Auto save draft on change and reset submit button if previously completed
    codeEditor.addEventListener("input", function () {
      saveDraft(problem.id, activeLang, this.value);
      if (submitBtn && submitBtn.classList.contains("btn-success")) {
        submitBtn.innerHTML = `<span>🚀</span> Submit Solution`;
        submitBtn.classList.add("btn-primary");
        submitBtn.classList.remove("btn-success");
      }
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
      const item = statusList[idx];
      const status = (typeof item === "object" && item !== null) ? item.status : (item || "pending");

      let statusPill = "";
      let errorDetails = "";

      if (status === "passed") {
        const dur = item && item.duration ? ` (${item.duration}ms)` : "";
        statusPill = `<span class="test-status-pill status-passed">✓ Passed${dur}</span>`;
      } else if (status === "failed") {
        statusPill = `<span class="test-status-pill status-failed">✗ Failed</span>`;
        if (item && item.expected !== undefined && item.actual !== undefined) {
          errorDetails = `
                <div class="test-case-error-msg">
                  <strong>Expected:</strong> <code>${escapeHtml(formatValueForDisplay(item.expected))}</code><br>
                  <strong>Received:</strong> <code>${escapeHtml(formatValueForDisplay(item.actual))}</code>
                </div>
              `;
        } else if (item && item.error) {
          errorDetails = `<div class="test-case-error-msg"><strong>Detail:</strong> ${escapeHtml(item.error)}</div>`;
        }
      } else if (status === "error") {
        statusPill = `<span class="test-status-pill status-error">⚠ Error</span>`;
        const errMsg = item && item.error ? item.error : "Runtime Error";
        errorDetails = `<div class="test-case-error-msg"><strong>Error:</strong> ${escapeHtml(errMsg)}</div>`;
      } else if (status === "running") {
        statusPill = `<span class="test-status-pill status-pending">⏳ Testing...</span>`;
      } else {
        statusPill = `<span class="test-status-pill status-pending">Pending</span>`;
      }

      return `
            <div class="test-case-row">
              <div class="test-case-info" style="flex: 1; padding-right: 1rem;">
                <span class="test-case-title">Test ${idx + 1}: ${tc.description}</span>
                <span class="test-case-io">Input: <code>${tc.input}</code> | Expected: <code>${tc.expected}</code></span>
                ${errorDetails}
              </div>
              <div style="flex-shrink: 0;">${statusPill}</div>
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

  // Real Test Suite Runner for JavaScript
  async function runJavaScriptTestSuite() {
    const code = codeEditor ? codeEditor.value : "";
    const entryPoint = problem.jsEntry || "sayHello";

    // Switch to test cases view
    consoleTabs.forEach(t => t.classList.remove("active"));
    const testTab = document.querySelector('[data-tab="cases"]');
    if (testTab) testTab.classList.add("active");
    if (testCasesView) testCasesView.style.display = "block";
    if (consoleLogsView) consoleLogsView.style.display = "none";
    if (explanationView) explanationView.style.display = "none";

    renderTestCases(problem.testCases.map(() => "running"));

    const evaluation = await runJavaScriptInWorker(code, entryPoint, problem.testCases);
    renderTestCases(evaluation.results);

    // Update Console Logs Output
    if (consoleLogsView) {
      const now = new Date().toLocaleTimeString();
      let logLines = [];
      logLines.push(`[${now}] Target Environment: JAVASCRIPT (Isolated Web Worker Sandbox)`);
      logLines.push(`[${now}] Target Entry Function: ${entryPoint}()`);
      logLines.push(`[${now}] ----------------------------------------------------`);

      if (evaluation.logs && evaluation.logs.length > 0) {
        logLines.push(`[${now}] Student Console Output:`);
        evaluation.logs.forEach(l => logLines.push(`  > ${l}`));
        logLines.push(`[${now}] ----------------------------------------------------`);
      }

      if (evaluation.error && (!evaluation.results || evaluation.results.length === 0 || !evaluation.workerStarted)) {
        logLines.push(`[${now}] Sandbox Notice: ${evaluation.error}`);
      } else {
        evaluation.results.forEach((res, i) => {
          const desc = problem.testCases[i] ? problem.testCases[i].description : `Test ${i + 1}`;
          if (res.status === "passed") {
            logLines.push(`[${now}] Test ${i + 1} (${desc}): PASSED (${res.duration}ms)`);
          } else if (res.status === "failed") {
            logLines.push(`[${now}] Test ${i + 1} (${desc}): FAILED - Expected ${formatValueForDisplay(res.expected)}, Received ${formatValueForDisplay(res.actual)}`);
          } else {
            logLines.push(`[${now}] Test ${i + 1} (${desc}): ERROR - ${res.error || 'Execution failed'}`);
          }
        });
      }

      logLines.push(`[${now}] ----------------------------------------------------`);
      const passedCount = evaluation.results ? evaluation.results.filter(r => r.status === "passed").length : 0;
      const totalCount = problem.testCases.length;
      logLines.push(`[${now}] Status: ${passedCount}/${totalCount} test cases passed.`);

      if (evaluation.allPassed) {
        logLines.push(`[${now}] Success! Click "Submit Solution" to complete the quest and claim +${problem.xp} XP!`);
      } else {
        logLines.push(`[${now}] Keep going! Fix any failing tests or syntax issues and run tests again.`);
      }

      consoleLogsView.innerHTML = `<div class="console-logs-output">${escapeHtml(logLines.join('\n'))}</div>`;
    }

    return evaluation;
  }

  // Real Test Suite Runner for Python 3 (Pyodide Web Worker)
  async function runPythonTestSuite() {
    const code = codeEditor ? codeEditor.value : "";
    const entryPoint = problem.pythonEntry || "say_hello";

    // Switch to test cases view
    consoleTabs.forEach(t => t.classList.remove("active"));
    const testTab = document.querySelector('[data-tab="cases"]');
    if (testTab) testTab.classList.add("active");
    if (testCasesView) testCasesView.style.display = "block";
    if (consoleLogsView) consoleLogsView.style.display = "none";
    if (explanationView) explanationView.style.display = "none";

    renderTestCases((problem.testCases || []).map(() => "running"));

    const evaluation = await runPythonInWorker(code, entryPoint, problem.testCases || []);
    renderTestCases(evaluation.results);

    // Update Console Logs Output
    if (consoleLogsView) {
      const now = new Date().toLocaleTimeString();
      let logLines = [];
      logLines.push(`[${now}] Target Environment: PYTHON 3 (Pyodide WebAssembly Sandbox)`);
      logLines.push(`[${now}] Target Entry Function: ${entryPoint}()`);
      logLines.push(`[${now}] ----------------------------------------------------`);

      if (evaluation.logs && evaluation.logs.length > 0) {
        logLines.push(`[${now}] Student Console Output:`);
        evaluation.logs.forEach(l => logLines.push(`  > ${l}`));
        logLines.push(`[${now}] ----------------------------------------------------`);
      }

      if (evaluation.error && (!evaluation.results || evaluation.results.length === 0 || !evaluation.workerStarted || !evaluation.success)) {
        logLines.push(`[${now}] Python Diagnostic / Error:`);
        const errLines = String(evaluation.error).split('\n');
        errLines.forEach(el => logLines.push(`  ${el}`));
        logLines.push(`[${now}] ----------------------------------------------------`);
      }

      if (evaluation.results && evaluation.results.length > 0) {
        evaluation.results.forEach((res, i) => {
          const desc = problem.testCases[i] ? problem.testCases[i].description : `Test ${i + 1}`;
          if (res.status === "passed") {
            logLines.push(`[${now}] Test ${i + 1} (${desc}): PASSED (${res.duration}ms)`);
          } else if (res.status === "failed") {
            logLines.push(`[${now}] Test ${i + 1} (${desc}): FAILED - Expected ${formatValueForDisplay(res.expected)}, Received ${formatValueForDisplay(res.actual)}`);
          } else {
            logLines.push(`[${now}] Test ${i + 1} (${desc}): ERROR - ${res.error || 'Execution failed'}`);
          }
        });
      }

      logLines.push(`[${now}] ----------------------------------------------------`);
      const passedCount = evaluation.results ? evaluation.results.filter(r => r.status === "passed").length : 0;
      const totalCount = (problem.testCases || []).length;
      logLines.push(`[${now}] Status: ${passedCount}/${totalCount} test cases passed.`);

      if (evaluation.allPassed && totalCount > 0) {
        logLines.push(`[${now}] Success! Click "Submit Solution" to complete the quest and claim +${problem.xp} XP!`);
      } else {
        logLines.push(`[${now}] Keep going! Fix any failing tests or syntax issues and run tests again.`);
      }

      consoleLogsView.innerHTML = `<div class="console-logs-output">${escapeHtml(logLines.join('\n'))}</div>`;
    }

    return evaluation;
  }

  // Run Test Cases Action
  if (runBtn) {
    runBtn.addEventListener("click", async () => {
      if (activeLang === "javascript") {
        runBtn.disabled = true;
        const originalText = runBtn.innerHTML;
        runBtn.innerHTML = `<span>⏳</span> Running...`;

        try {
          const evaluation = await runJavaScriptTestSuite();
          if (evaluation.allPassed) {
            showToast("All test cases passed! Ready to submit.", "success");
          } else if (evaluation.workerStarted === false) {
            showToast(evaluation.error || "Sandbox could not be started.", "info");
          } else {
            showToast("Some test cases failed. Review the results below.", "info");
          }
        } finally {
          runBtn.disabled = false;
          runBtn.innerHTML = originalText;
        }
      } else if (activeLang === "python") {
        runBtn.disabled = true;
        const originalText = runBtn.innerHTML;
        runBtn.innerHTML = `<span>⏳</span> Running...`;

        try {
          const evaluation = await runPythonTestSuite();
          if (evaluation.allPassed) {
            showToast("All test cases passed! Ready to submit.", "success");
          } else if (evaluation.workerStarted === false) {
            showToast(evaluation.error || "Python runtime could not be started.", "info");
          } else {
            showToast("Some test cases failed. Review the results below.", "info");
          }
        } finally {
          runBtn.disabled = false;
          runBtn.innerHTML = originalText;
        }
      } else {
        // Java and C++ (Untouched simulation behavior)
        consoleTabs.forEach(t => t.classList.remove("active"));
        const testTab = document.querySelector('[data-tab="cases"]');
        if (testTab) testTab.classList.add("active");
        if (testCasesView) testCasesView.style.display = "block";
        if (consoleLogsView) consoleLogsView.style.display = "none";
        if (explanationView) explanationView.style.display = "none";

        renderTestCases(problem.testCases.map(() => "running"));

        setTimeout(() => {
          renderTestCases(problem.testCases.map(() => "passed"));

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
      }
    });
  }

  // Submit Solution Action
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      if (activeLang === "javascript") {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>⏳</span> Verifying...`;

        let evaluation;
        try {
          evaluation = await runJavaScriptTestSuite();
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        // Strictly enforce: ONLY award XP and complete when ALL genuine tests pass!
        if (!evaluation || !evaluation.allPassed) {
          showToast("❌ All test cases must pass before submitting!", "info");
          return;
        }

        const isNew = markProblemCompleted(problem.id, "javascript", problem.xp);

        if (isNew) {
          showToast(`🎉 Quest Completed! You earned +${problem.xp} XP!`, "success");
        } else {
          showToast(`⭐ Quest updated in your learning record!`, "info");
        }

        submitBtn.innerHTML = `<span>✓ Completed</span>`;
        submitBtn.classList.remove("btn-primary");
        submitBtn.classList.add("btn-success");

        const currentIndex = allProblems.findIndex(p => p.id === problem.id);
        const nextProblem = allProblems[currentIndex + 1];

        if (nextProblem) {
          setTimeout(() => {
            if (confirm(`Great job solving "${problem.title}"! Would you like to advance to the next quest: "${nextProblem.title}"?`)) {
              window.location.href = `problem.html?id=${nextProblem.id}&lang=${activeLang}`;
            }
          }, 1200);
        }
      } else if (activeLang === "python") {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>⏳</span> Verifying...`;

        let evaluation;
        try {
          evaluation = await runPythonTestSuite();
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        // Strictly enforce: ONLY award XP and complete when ALL genuine tests pass!
        if (!evaluation || !evaluation.allPassed || !problem.testCases || problem.testCases.length === 0) {
          if (!problem.testCases || problem.testCases.length === 0) {
            showToast("❌ No test cases found to evaluate this quest.", "info");
          } else {
            showToast("❌ All test cases must pass before submitting!", "info");
          }
          return;
        }

        const isNew = markProblemCompleted(problem.id, "python", problem.xp);

        if (isNew) {
          showToast(`🎉 Quest Completed! You earned +${problem.xp} XP!`, "success");
        } else {
          showToast(`⭐ Quest updated in your learning record!`, "info");
        }

        submitBtn.innerHTML = `<span>✓ Completed</span>`;
        submitBtn.classList.remove("btn-primary");
        submitBtn.classList.add("btn-success");

        const currentIndex = allProblems.findIndex(p => p.id === problem.id);
        const nextProblem = allProblems[currentIndex + 1];

        if (nextProblem) {
          setTimeout(() => {
            if (confirm(`Great job solving "${problem.title}"! Would you like to advance to the next quest: "${nextProblem.title}"?`)) {
              window.location.href = `problem.html?id=${nextProblem.id}&lang=${activeLang}`;
            }
          }, 1200);
        }
      } else {
        // Java, C++ existing untouched behavior
        const isNew = markProblemCompleted(problem.id, activeLang, problem.xp);
        renderTestCases(problem.testCases.map(() => "passed"));

        if (isNew) {
          showToast(`🎉 Quest Completed! You earned +${problem.xp} XP!`, "success");
        } else {
          showToast(`⭐ Quest updated in your learning record!`, "info");
        }

        const currentIndex = allProblems.findIndex(p => p.id === problem.id);
        const nextProblem = allProblems[currentIndex + 1];

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

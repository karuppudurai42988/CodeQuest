/**
 * CodeQuest - Python Isolated Web Worker (js/python-worker.js)
 * Executes Python 3 solutions client-side via Pyodide WebAssembly.
 * 
 * Note: While executing inside an isolated browser Web Worker prevents main thread
 * freezing and isolates memory from the DOM and window context, this client-side
 * WebAssembly environment is intended for educational test runner purposes and is
 * not a cryptographically hardened server sandbox.
 */

/* global loadPyodide, importScripts */

const PYODIDE_CDN_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodideInstance = null;
let pyodideLoadingPromise = null;

/**
 * Initializes and caches the Pyodide WebAssembly runtime.
 */
async function getPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }
  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    if (typeof loadPyodide === "undefined") {
      importScripts(PYODIDE_CDN_URL);
    }
    const pyodide = await loadPyodide({
      indexURL: PYODIDE_INDEX_URL
    });
    pyodideInstance = pyodide;
    return pyodide;
  })();

  return pyodideLoadingPromise;
}

/**
 * Embedded Python Test Runner Harness.
 * Executes user code against test cases in an isolated namespace,
 * intercepts stdout, and serializes return values to JSON.
 */
const PYTHON_HARNESS_CODE = `
import sys
import io
import json
import copy

class _CodeQuestJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (set, tuple)):
            return list(obj)
        try:
            return super().default(obj)
        except Exception:
            return repr(obj)

def _extract_line_number(err, target_filename="<student_code>"):
    tb = err.__traceback__
    line_no = None
    while tb:
        if tb.tb_frame.f_code.co_filename == target_filename:
            line_no = tb.tb_lineno
        tb = tb.tb_next
    return line_no

def _run_test_suite_internal(user_code, entry_point, test_cases_json):
    log_buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = log_buffer
    
    try:
        # 1. Compile student code to capture syntax errors with exact line numbers
        try:
            compiled = compile(user_code, "<student_code>", "exec")
        except SyntaxError as syn_err:
            line = syn_err.lineno
            text = (syn_err.text or "").strip()
            caret = (" " * (syn_err.offset - 1) + "^") if syn_err.offset else ""
            err_details = f"SyntaxError on line {line}: {syn_err.msg}"
            if text:
                err_details += f"\\n  {text}\\n  {caret}".rstrip()
            return {
                "compilationSuccess": False,
                "errorType": "syntax",
                "error": err_details,
                "logs": log_buffer.getvalue().splitlines()[:200],
                "results": []
            }

        # 2. Execute top-level student code once to capture startup logs and verify runtime validity
        initial_scope = {}
        try:
            exec(compiled, initial_scope)
        except Exception as exec_err:
            line_no = _extract_line_number(exec_err)
            prefix = f"Line {line_no}: " if line_no else ""
            return {
                "compilationSuccess": False,
                "errorType": "runtime",
                "error": f"{prefix}{type(exec_err).__name__}: {str(exec_err)}",
                "logs": log_buffer.getvalue().splitlines()[:200],
                "results": []
            }

        # 3. Locate entry function
        fn_initial = initial_scope.get(entry_point)
        if not fn_initial or not callable(fn_initial):
            return {
                "compilationSuccess": False,
                "errorType": "missing_entry",
                "error": f"Function '{entry_point}' was not found or is not defined in your Python code.",
                "logs": log_buffer.getvalue().splitlines()[:200],
                "results": []
            }

        test_cases = json.loads(test_cases_json)
        results = []

        # 4. Execute each test case in a clean execution environment to prevent cross-test contamination
        for tc in test_cases:
            args = tc.get("args", [])
            test_scope = {}
            devnull = io.StringIO()
            sys.stdout = devnull
            try:
                # Re-exec compiled bytecode into fresh test_scope to isolate global state mutations
                exec(compiled, test_scope)
            finally:
                sys.stdout = log_buffer

            fn = test_scope.get(entry_point)
            try:
                # Deep copy arguments so in-place mutations in student code do not taint other tests
                cloned_args = copy.deepcopy(args)
                actual_val = fn(*cloned_args)
                actual_json = json.dumps(actual_val, cls=_CodeQuestJsonEncoder)
                results.append({
                    "status": "ok",
                    "actualJson": actual_json,
                    "error": None
                })
            except Exception as test_err:
                line_no = _extract_line_number(test_err)
                prefix = f"Line {line_no}: " if line_no else ""
                results.append({
                    "status": "error",
                    "actualJson": None,
                    "error": f"{prefix}{type(test_err).__name__}: {str(test_err)}"
                })

        return {
            "compilationSuccess": True,
            "errorType": None,
            "error": None,
            "logs": log_buffer.getvalue().splitlines()[:200],
            "results": results
        }
    finally:
        sys.stdout = old_stdout
`;

/**
 * Deep equality comparator for test results.
 */
function deepEqual(a, b) {
  if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) return true;
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== "object") return false;
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

/**
 * Web Worker Message Handler
 */
self.onmessage = async function (e) {
  const data = e.data || {};
  const startTime = performance.now();

  // Handle optional pre-warming / readiness check
  if (data.type === "init") {
    try {
      await getPyodide();
      self.postMessage({
        type: "init_complete",
        success: true,
        workerStarted: true
      });
    } catch (err) {
      self.postMessage({
        type: "init_complete",
        success: false,
        workerStarted: false,
        error: "Failed to initialize Pyodide runtime: " + (err && err.message ? err.message : String(err))
      });
    }
    return;
  }

  const { code, entryPoint, testCases, id } = data;

  if (typeof code !== "string" || !entryPoint || !Array.isArray(testCases)) {
    self.postMessage({
      id: id,
      workerStarted: true,
      success: false,
      allPassed: false,
      error: "Invalid request payload: code, entryPoint, and testCases are required.",
      logs: [],
      results: [],
      duration: "0.0"
    });
    return;
  }

  let pyodide;
  try {
    pyodide = await getPyodide();
  } catch (loadErr) {
    const errorMsg = "Could not load Python runtime (Pyodide): " + (loadErr && loadErr.message ? loadErr.message : String(loadErr));
    self.postMessage({
      id: id,
      workerStarted: false,
      success: false,
      allPassed: false,
      error: errorMsg,
      logs: [],
      duration: "0.0",
      results: testCases.map(tc => ({
        status: "error",
        error: errorMsg,
        expected: tc.expectedValue
      }))
    });
    return;
  }

  try {
    // Inject and execute test harness
    pyodide.runPython(PYTHON_HARNESS_CODE);

    let rawEvaluationJson;
    try {
      // Pass data into Python scope safely via globals
      pyodide.globals.set("_temp_user_code", code);
      pyodide.globals.set("_temp_entry_point", entryPoint);
      pyodide.globals.set("_temp_test_cases", JSON.stringify(testCases));

      rawEvaluationJson = pyodide.runPython(`
import json
json.dumps(_run_test_suite_internal(_temp_user_code, _temp_entry_point, _temp_test_cases))
      `);
    } finally {
      // Always guarantee temporary globals are removed even on exceptions
      try { pyodide.globals.delete("_temp_user_code"); } catch (_) { }
      try { pyodide.globals.delete("_temp_entry_point"); } catch (_) { }
      try { pyodide.globals.delete("_temp_test_cases"); } catch (_) { }
    }

    const evaluation = JSON.parse(rawEvaluationJson);
    const duration = (performance.now() - startTime).toFixed(1);

    // Handle empty test cases array cleanly
    if (testCases.length === 0) {
      self.postMessage({
        id: id,
        workerStarted: true,
        success: evaluation.compilationSuccess,
        allPassed: evaluation.compilationSuccess,
        error: evaluation.error || null,
        results: [],
        logs: evaluation.logs || [],
        duration: duration
      });
      return;
    }

    // Handle syntax error, top-level runtime crash, or missing entry function
    if (!evaluation.compilationSuccess) {
      const isMissingEntry = evaluation.errorType === "missing_entry";
      self.postMessage({
        id: id,
        workerStarted: true,
        success: false,
        allPassed: false,
        error: evaluation.error,
        logs: evaluation.logs || [],
        duration: duration,
        results: testCases.map(tc => ({
          status: isMissingEntry ? "failed" : "error",
          error: isMissingEntry
            ? `Function '${entryPoint}' is not defined in your code.`
            : evaluation.error,
          expected: tc.expectedValue
        }))
      });
      return;
    }

    const testResults = [];
    let allPassed = true;
    const perCaseDuration = (duration / testCases.length).toFixed(1);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const rawRes = evaluation.results[i];

      if (!rawRes || rawRes.status === "error") {
        allPassed = false;
        testResults.push({
          status: "error",
          error: (rawRes && rawRes.error) ? rawRes.error : "Test execution failed",
          expected: tc.expectedValue,
          duration: perCaseDuration
        });
        continue;
      }

      let actualVal = undefined;
      try {
        actualVal = JSON.parse(rawRes.actualJson);
      } catch (_) {
        actualVal = rawRes.actualJson;
      }

      const passed = deepEqual(actualVal, tc.expectedValue);
      if (!passed) {
        allPassed = false;
      }

      testResults.push({
        status: passed ? "passed" : "failed",
        actual: actualVal,
        expected: tc.expectedValue,
        duration: perCaseDuration
      });
    }

    self.postMessage({
      id: id,
      workerStarted: true,
      success: true,
      allPassed: allPassed,
      results: testResults,
      logs: evaluation.logs || [],
      duration: duration
    });
  } catch (err) {
    const errMsg = err && err.message ? err.message : String(err);
    const duration = (performance.now() - startTime).toFixed(1);
    self.postMessage({
      id: id,
      workerStarted: true,
      success: false,
      allPassed: false,
      error: "Runtime error inside Python test runner: " + errMsg,
      logs: [],
      duration: duration,
      results: testCases.map(tc => ({
        status: "error",
        error: errMsg,
        expected: tc.expectedValue
      }))
    });
  }
};

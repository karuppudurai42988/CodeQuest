/**
 * CodeQuest - Sample Coding Problems Dataset
 * 
 * Beginner-friendly problems tailored for students learning:
 * - Python
 * - JavaScript
 * - Java
 * - C++
 * 
 * Note: Test cases and sample outputs are simulated for educational demonstration.
 */

const SAMPLE_PROBLEMS = [
  {
    id: "hello-world",
    title: "Say Hello to the World",
    difficulty: "Easy",
    category: "Basics",
    xp: 50,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Create your very first program that returns a warm greeting to start your coding journey.",
    description: `
Welcome to your first quest! In computer programming tradition, every coder begins by producing a friendly greeting.

### The Objective
Write a function \`sayHello(name)\` that accepts a student's name as a string and returns a greeting in the exact format:
\`"Hello, <name>! Welcome to CodeQuest."\`

If no name is passed (or if the string is empty), it should return:
\`"Hello, Adventurer! Welcome to CodeQuest."\`
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def say_hello(name=""):
    """
    Returns a personalized greeting message.
    """
    if not name:
        return "Hello, Adventurer! Welcome to CodeQuest."
    return f"Hello, {name}! Welcome to CodeQuest."

# Example check
print(say_hello("Alex"))
`,
      javascript: `// JavaScript (ES6) Starter Code
function sayHello(name = "") {
  // Your code here
  if (!name || name.trim() === "") {
    return "Hello, Adventurer! Welcome to CodeQuest.";
  }
  return \`Hello, \${name}! Welcome to CodeQuest.\`;
}

// Example check
console.log(sayHello("Alex"));
`,
      java: `// Java Starter Code
public class Solution {
    public static String sayHello(String name) {
        // Your code here
        if (name == null || name.trim().isEmpty()) {
            return "Hello, Adventurer! Welcome to CodeQuest.";
        }
        return "Hello, " + name + "! Welcome to CodeQuest.";
    }

    public static void main(String[] args) {
        System.out.println(sayHello("Alex"));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <string>

std::string sayHello(const std::string& name) {
    // Your code here
    if (name.empty()) {
        return "Hello, Adventurer! Welcome to CodeQuest.";
    }
    return "Hello, " + name + "! Welcome to CodeQuest.";
}

int main() {
    std::cout << sayHello("Alex") << std::endl;
    return 0;
}
`
    },
    sampleInput: 'name = "Alex"',
    sampleOutput: '"Hello, Alex! Welcome to CodeQuest."',
    hints: [
      "Check if the string is empty before constructing the response.",
      "String interpolation or simple concatenation works wonders.",
      "Pay close attention to spaces and punctuation: don't forget the exclamation mark and period!"
    ],
    concepts: ["Variables", "Functions", "String Concatenation", "Conditional Logic"],
    testCases: [
      { input: 'name = "Alex"', expected: '"Hello, Alex! Welcome to CodeQuest."', description: "Standard name input" },
      { input: 'name = ""', expected: '"Hello, Adventurer! Welcome to CodeQuest."', description: "Empty string fallback" },
      { input: 'name = "Maya"', expected: '"Hello, Maya! Welcome to CodeQuest."', description: "Alternate student name" }
    ]
  },
  {
    id: "sum-two-numbers",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    category: "Math & Arithmetic",
    xp: 60,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Add two integers together to calculate their total sum.",
    description: `
Computers excel at high-speed calculation. Let's build a foundation for arithmetic calculations.

### The Objective
Write a function \`addNumbers(a, b)\` that takes two numbers, adds them together, and returns the result.
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def add_numbers(a: int, b: int) -> int:
    # Return the sum of a and b
    return a + b

print(add_numbers(5, 7))
`,
      javascript: `// JavaScript Starter Code
function addNumbers(a, b) {
  // Return the sum of a and b
  return a + b;
}

console.log(addNumbers(5, 7));
`,
      java: `// Java Starter Code
public class Solution {
    public static int addNumbers(int a, int b) {
        // Return the sum of a and b
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(addNumbers(5, 7));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>

int addNumbers(int a, int b) {
    // Return the sum of a and b
    return a + b;
}

int main() {
    std::cout << addNumbers(5, 7) << std::endl;
    return 0;
}
`
    },
    sampleInput: "a = 5, b = 7",
    sampleOutput: "12",
    hints: [
      "Use the standard addition operator (+).",
      "Ensure you return the result rather than just printing it."
    ],
    concepts: ["Numbers", "Return Types", "Arithmetic Operators"],
    testCases: [
      { input: "a = 5, b = 7", expected: "12", description: "Positive numbers" },
      { input: "a = -3, b = 10", expected: "7", description: "Negative and positive numbers" },
      { input: "a = 0, b = 0", expected: "0", description: "Zero values" }
    ]
  },
  {
    id: "even-or-odd",
    title: "Even or Odd Detector",
    difficulty: "Easy",
    category: "Conditionals",
    xp: 75,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Determine whether a given number is Even or Odd using the modulus operator.",
    description: `
In this quest, you will help our system sort numbers into two fundamental categories: Even or Odd.

### The Objective
Write a function \`checkEvenOrOdd(n)\` that returns the string \`"Even"\` if the integer \`n\` is divisible by 2, and \`"Odd"\` otherwise.
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def check_even_or_odd(n: int) -> str:
    # Use the modulus operator %
    if n % 2 == 0:
        return "Even"
    return "Odd"

print(check_even_or_odd(8))
`,
      javascript: `// JavaScript Starter Code
function checkEvenOrOdd(n) {
  // Use remainder operator %
  if (n % 2 === 0) {
    return "Even";
  }
  return "Odd";
}

console.log(checkEvenOrOdd(8));
`,
      java: `// Java Starter Code
public class Solution {
    public static String checkEvenOrOdd(int n) {
        if (n % 2 == 0) {
            return "Even";
        }
        return "Odd";
    }

    public static void main(String[] args) {
        System.out.println(checkEvenOrOdd(8));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <string>

std::string checkEvenOrOdd(int n) {
    if (n % 2 == 0) {
        return "Even";
    }
    return "Odd";
}

int main() {
    std::cout << checkEvenOrOdd(8) << std::endl;
    return 0;
}
`
    },
    sampleInput: "n = 8",
    sampleOutput: '"Even"',
    hints: [
      "The modulo operator (%) yields the remainder of division by 2.",
      "If n % 2 equals 0, the number divides evenly."
    ],
    concepts: ["Modulo Operator", "If/Else Statements", "Boolean Logic"],
    testCases: [
      { input: "n = 8", expected: '"Even"', description: "Positive even number" },
      { input: "n = 13", expected: '"Odd"', description: "Positive odd number" },
      { input: "n = 0", expected: '"Even"', description: "Zero is even" }
    ]
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    category: "Strings",
    xp: 80,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Flip a word or sentence backwards without losing any characters.",
    description: `
A classic interview question made easy for beginners! 

### The Objective
Write a function \`reverseString(text)\` that accepts a string and returns it backwards.
For example, \`"quest"\` becomes \`"tseuq"\`.
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def reverse_string(text: str) -> str:
    # Tip: Python supports slice notation [::-1] or a reversed loop
    return text[::-1]

print(reverse_string("quest"))
`,
      javascript: `// JavaScript Starter Code
function reverseString(text) {
  // Tip: Can split into characters, reverse array, and join back
  return text.split('').reverse().join('');
}

console.log(reverseString("quest"));
`,
      java: `// Java Starter Code
public class Solution {
    public static String reverseString(String text) {
        // Tip: StringBuilder has a built-in reverse() method
        return new StringBuilder(text).reverse().toString();
    }

    public static void main(String[] args) {
        System.out.println(reverseString("quest"));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <string>
#include <algorithm>

std::string reverseString(std::string text) {
    // Tip: std::reverse from <algorithm>
    std::reverse(text.begin(), text.end());
    return text;
}

int main() {
    std::cout << reverseString("quest") << std::endl;
    return 0;
}
`
    },
    sampleInput: 'text = "quest"',
    sampleOutput: '"tseuq"',
    hints: [
      "You can iterate from the last character back to the first.",
      "Most languages provide built-in string or array reverse helpers.",
      "Watch out for spaces and capitalization—preserve them as they are."
    ],
    concepts: ["String Manipulation", "Loops", "Indexing"],
    testCases: [
      { input: 'text = "quest"', expected: '"tseuq"', description: "Standard single word" },
      { input: 'text = "Code"', expected: '"edoC"', description: "Word with uppercase character" },
      { input: 'text = "12345"', expected: '"54321"', description: "Numeric characters string" }
    ]
  },
  {
    id: "find-maximum",
    title: "Find the Maximum Element",
    difficulty: "Medium",
    category: "Arrays & Lists",
    xp: 90,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Traverse a list or array of numbers and locate the largest value.",
    description: `
When handling datasets, you frequently need to identify peaks, high scores, or highest temperatures.

### The Objective
Write a function \`findMax(numbers)\` that takes a list of integers and returns the highest number in that list.
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def find_max(numbers: list[int]) -> int:
    # Initialize maximum with the first item or -infinity
    current_max = numbers[0]
    for num in numbers:
        if num > current_max:
            current_max = num
    return current_max

print(find_max([3, 14, 7, 2, 9]))
`,
      javascript: `// JavaScript Starter Code
function findMax(numbers) {
  if (numbers.length === 0) return null;
  let max = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}

console.log(findMax([3, 14, 7, 2, 9]));
`,
      java: `// Java Starter Code
public class Solution {
    public static int findMax(int[] numbers) {
        int max = numbers[0];
        for (int num : numbers) {
            if (num > max) {
                max = num;
            }
        }
        return max;
    }

    public static void main(String[] args) {
        int[] arr = {3, 14, 7, 2, 9};
        System.out.println(findMax(arr));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <vector>

int findMax(const std::vector<int>& numbers) {
    int maxVal = numbers[0];
    for (int num : numbers) {
        if (num > maxVal) {
            maxVal = num;
        }
    }
    return maxVal;
}

int main() {
    std::vector<int> nums = {3, 14, 7, 2, 9};
    std::cout << findMax(nums) << std::endl;
    return 0;
}
`
    },
    sampleInput: "numbers = [3, 14, 7, 2, 9]",
    sampleOutput: "14",
    hints: [
      "Start by assuming the first element is the largest.",
      "Iterate through the rest of the array and update your max whenever you find a larger number.",
      "Be careful when handling negative numbers!"
    ],
    concepts: ["Arrays", "Loops", "Variables", "Comparison"],
    testCases: [
      { input: "[3, 14, 7, 2, 9]", expected: "14", description: "Mixed positive numbers" },
      { input: "[-5, -12, -2, -8]", expected: "-2", description: "All negative numbers" },
      { input: "[42]", expected: "42", description: "Single-item array" }
    ]
  },
  {
    id: "fizz-buzz",
    title: "The Classic FizzBuzz",
    difficulty: "Medium",
    category: "Conditionals & Loops",
    xp: 100,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "The legendary developer screening problem: substitute multiples of 3 and 5 with fun words.",
    description: `
FizzBuzz is one of the most famous coding exercises in history!

### The Objective
Write a function \`fizzBuzz(n)\` that generates an array/list of strings from 1 to \`n\` with the following rules:
- For multiples of 3, use \`"Fizz"\` instead of the number.
- For multiples of 5, use \`"Buzz"\` instead of the number.
- For numbers which are multiples of BOTH 3 and 5, use \`"FizzBuzz"\`.
- Otherwise, use the number as a string.
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def fizz_buzz(n: int) -> list[str]:
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

print(fizz_buzz(5))
`,
      javascript: `// JavaScript Starter Code
function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(i.toString());
    }
  }
  return result;
}

console.log(fizzBuzz(5));
`,
      java: `// Java Starter Code
import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<String> fizzBuzz(int n) {
        List<String> result = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) {
                result.add("FizzBuzz");
            } else if (i % 3 == 0) {
                result.add("Fizz");
            } else if (i % 5 == 0) {
                result.add("Buzz");
            } else {
                result.add(String.valueOf(i));
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(fizzBuzz(5));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <vector>
#include <string>

std::vector<std::string> fizzBuzz(int n) {
    std::vector<std::string> result;
    for (int i = 1; i <= n; ++i) {
        if (i % 15 == 0) {
            result.push_back("FizzBuzz");
        } else if (i % 3 == 0) {
            result.push_back("Fizz");
        } else if (i % 5 == 0) {
            result.push_back("Buzz");
        } else {
            result.push_back(std::to_string(i));
        }
    }
    return result;
}

int main() {
    auto res = fizzBuzz(5);
    for (const auto& s : res) std::cout << s << " ";
    std::cout << std::endl;
    return 0;
}
`
    },
    sampleInput: "n = 5",
    sampleOutput: '["1", "2", "Fizz", "4", "Buzz"]',
    hints: [
      "Check for the combined condition (divisible by 15 or both 3 and 5) first!",
      "If you check 3 or 5 first, numbers like 15 will match before FizzBuzz has a chance to execute."
    ],
    concepts: ["Modulus", "Order of Precedence", "Array Accumulation", "Type Casting"],
    testCases: [
      { input: "n = 5", expected: '["1", "2", "Fizz", "4", "Buzz"]', description: "First 5 numbers" },
      { input: "n = 15", expected: '... ends with "FizzBuzz"', description: "Includes multiple of 3 and 5" },
      { input: "n = 1", expected: '["1"]', description: "Base edge case" }
    ]
  },
  {
    id: "palindrome-checker",
    title: "Palindrome Checker",
    difficulty: "Easy",
    category: "Strings",
    xp: 75,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Check if a word reads identically forwards and backwards (like racecar or madam).",
    description: `
A palindrome is a word, phrase, or number that reads the same backward as forward.

### The Objective
Write a function \`isPalindrome(word)\` that returns \`true\` (or \`True\` in Python) if the given string is a palindrome, and \`false\` otherwise. Ignore case sensitivity (e.g. \`"Racecar"\` is a valid palindrome).
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def is_palindrome(word: str) -> bool:
    clean = word.lower()
    return clean == clean[::-1]

print(is_palindrome("Racecar"))
`,
      javascript: `// JavaScript Starter Code
function isPalindrome(word) {
  const clean = word.toLowerCase();
  const reversed = clean.split('').reverse().join('');
  return clean === reversed;
}

console.log(isPalindrome("Racecar"));
`,
      java: `// Java Starter Code
public class Solution {
    public static boolean isPalindrome(String word) {
        String clean = word.toLowerCase();
        String reversed = new StringBuilder(clean).reverse().toString();
        return clean.equals(reversed);
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("Racecar"));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <string>
#include <algorithm>

bool isPalindrome(std::string word) {
    std::string clean = word;
    std::transform(clean.begin(), clean.end(), clean.begin(), ::tolower);
    std::string rev = clean;
    std::reverse(rev.begin(), rev.end());
    return clean == rev;
}

int main() {
    std::cout << std::boolalpha << isPalindrome("Racecar") << std::endl;
    return 0;
}
`
    },
    sampleInput: 'word = "Racecar"',
    sampleOutput: "true",
    hints: [
      "Convert the word to lowercase first to ensure comparison is case-insensitive.",
      "Compare the original cleaned string to its reversed version."
    ],
    concepts: ["Case Conversion", "String Slicing", "Boolean Evaluation"],
    testCases: [
      { input: 'word = "Racecar"', expected: "true", description: "Mixed case palindrome" },
      { input: 'word = "hello"', expected: "false", description: "Non-palindrome word" },
      { input: 'word = "madam"', expected: "true", description: "Lowercase palindrome" }
    ]
  },
  {
    id: "count-vowels",
    title: "Count the Vowels",
    difficulty: "Easy",
    category: "Strings & Loops",
    xp: 70,
    languages: ["python", "javascript", "java", "cpp"],
    summary: "Scan a text passage and count how many vowels (a, e, i, o, u) it contains.",
    description: `
Vowels are the musical notes of language. Let's create an efficient vowel counter!

### The Objective
Write a function \`countVowels(sentence)\` that returns the total count of vowels (\`a, e, i, o, u\`) present in the input string. The check should be case-insensitive.
    `,
    starterCode: {
      python: `# Python 3 Starter Code
def count_vowels(sentence: str) -> int:
    vowels = "aeiouAEIOU"
    count = 0
    for char in sentence:
        if char in vowels:
            count += 1
    return count

print(count_vowels("CodeQuest is awesome"))
`,
      javascript: `// JavaScript Starter Code
function countVowels(sentence) {
  const vowels = "aeiouAEIOU";
  let count = 0;
  for (const char of sentence) {
    if (vowels.includes(char)) {
      count++;
    }
  }
  return count;
}

console.log(countVowels("CodeQuest is awesome"));
`,
      java: `// Java Starter Code
public class Solution {
    public static int countVowels(String sentence) {
        String vowels = "aeiouAEIOU";
        int count = 0;
        for (int i = 0; i < sentence.length(); i++) {
            if (vowels.indexOf(sentence.charAt(i)) != -1) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countVowels("CodeQuest is awesome"));
    }
}
`,
      cpp: `// C++ Starter Code
#include <iostream>
#include <string>

int countVowels(const std::string& sentence) {
    std::string vowels = "aeiouAEIOU";
    int count = 0;
    for (char c : sentence) {
        if (vowels.find(c) != std::string::npos) {
            count++;
        }
    }
    return count;
}

int main() {
    std::cout << countVowels("CodeQuest is awesome") << std::endl;
    return 0;
}
`
    },
    sampleInput: 'sentence = "CodeQuest is awesome"',
    sampleOutput: "8",
    hints: [
      "Store all vowels in a reference string or set: 'aeiouAEIOU'.",
      "Loop through each character and check if it belongs to your vowels set."
    ],
    concepts: ["Iteration", "Membership Testing", "Accumulators"],
    testCases: [
      { input: 'sentence = "CodeQuest is awesome"', expected: "8", description: "Multi-word phrase" },
      { input: 'sentence = "rhythm"', expected: "0", description: "Word with no vowels" },
      { input: 'sentence = "AEIOU"', expected: "5", description: "All uppercase vowels" }
    ]
  }
];

// Helper methods for problem exploration
function getAllProblems() {
  return SAMPLE_PROBLEMS;
}

function getProblemById(id) {
  return SAMPLE_PROBLEMS.find(p => p.id === id) || SAMPLE_PROBLEMS[0];
}

function getAvailableLanguages() {
  return [
    { key: "python", label: "Python", icon: "🐍", extension: ".py" },
    { key: "javascript", label: "JavaScript", icon: "⚡", extension: ".js" },
    { key: "java", label: "Java", icon: "☕", extension: ".java" },
    { key: "cpp", label: "C++", icon: "⚙️", extension: ".cpp" }
  ];
}

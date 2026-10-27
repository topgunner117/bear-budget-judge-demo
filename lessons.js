// Short lessons with pretend examples. No account or online service is needed.
var units = window.bearBudgetHighSchoolUnits || [
  {
    title: "Where money goes",
    description: "Income, expenses, and a simple budget",
    reading: [
      "Income is money you receive. An expense is money you spend. A budget is a plan for both.",
      "If you receive $20 and spend $5, you have $15 left to spend or save. A budget helps you see this before the money is gone."
    ],
    questions: [
      { text: "You receive $20 and spend $5. How much is left?", choices: ["$5", "$15", "$25"], answer: 1 },
      { text: "Which one is income?", choices: ["Money earned from a job", "Money spent on lunch", "Money paid for a bus ride"], answer: 0 },
      { text: "What does a budget help you do?", choices: ["Plan how to use money", "Make every item free", "Guess how much you spent"], answer: 0 }
    ]
  },
  {
    title: "Needs, wants, and savings",
    description: "Decide what matters most",
    reading: [
      "A need is something important for daily life, like food or a place to live. A want is something you would enjoy, like a new game.",
      "Saving means keeping some money for later. You can choose a goal, then set aside a small amount whenever you have money to spare."
    ],
    questions: [
      { text: "Which item is usually a need?", choices: ["Groceries", "A new game", "A toy"], answer: 0 },
      { text: "Which item is usually a want?", choices: ["Rent", "Water", "A new game"], answer: 2 },
      { text: "You have $12 and save $3. How much can you spend now?", choices: ["$9", "$12", "$15"], answer: 0 }
    ]
  },
  {
    title: "Make a plan",
    description: "Compare choices and stay on track",
    reading: [
      "Before buying something, look at its price and your budget. If two things are the same size and quality, the lower price can leave more money for another goal.",
      "Plans can change. If an unexpected expense comes up, check how much is left and decide what can wait."
    ],
    questions: [
      { text: "Two notebooks are the same size and quality. One costs $4 and one costs $6. Which costs less?", choices: ["The $4 notebook", "The $6 notebook", "They cost the same"], answer: 0 },
      { text: "Your spending limit is $20 and you have spent $15. How much is left in the limit?", choices: ["$5", "$15", "$35"], answer: 0 },
      { text: "An unexpected expense appears. What is a good first step?", choices: ["Check your plan and what can wait", "Pretend it did not happen", "Spend without checking"], answer: 0 }
    ]
  }
];

var isDemo = new URLSearchParams(location.search).get("example") === "1";
var isHighSchool = document.body.dataset.course === "high-school";
var storageKey = isHighSchool ? (isDemo ? "bear-budget-example-high-school-lessons-v1" : "bear-budget-high-school-lessons-v1") : (isDemo ? "bear-budget-example-lessons-v1" : "bear-budget-lessons-v1");
var finished = units.map(function (_, index) { return isDemo && index === 0; });
var currentUnit = 0;
var currentQuestion = 0;

try {
  var stored = localStorage.getItem(storageKey);
  if (isDemo && stored === null) {
    stored = JSON.stringify(finished);
    localStorage.setItem(storageKey, stored);
  }
  var saved = JSON.parse(stored);
  if (Array.isArray(saved) && saved.length === units.length) {
    for (var i = 0; i < saved.length; i++) finished[i] = saved[i] === true;
  }
} catch (error) { /* Lessons still work when local storage is unavailable. */ }
if (isDemo) {
  el("lessons-back").href = "demo.html#home";
  el("other-course").href += "?example=1";
}

function el(id) { return document.getElementById(id); }
function clear(element) { element.replaceChildren(); }
function addText(parent, tag, words) {
  var child = document.createElement(tag);
  child.textContent = words;
  parent.appendChild(child);
  return child;
}
function saveProgress() {
  try { localStorage.setItem(storageKey, JSON.stringify(finished)); }
  catch (error) { /* The lesson can still be finished in this session. */ }
}
function showPath() {
  el("path-page").hidden = false;
  el("lesson-page").hidden = true;
  var count = 0;
  var path = el("unit-path");
  clear(path);
  for (var i = 0; i < units.length; i++) {
    if (finished[i]) count++;
    var row = addText(path, "div", "");
    row.className = "unit-row" + (finished[i] ? " done" : "");
    var button = addText(row, "button", finished[i] ? "✓" : "📖");
    button.className = "unit-circle";
    button.type = "button";
    button.setAttribute("aria-label", "Open unit " + (i + 1) + ": " + units[i].title);
    button.onclick = openUnit(i);
    var words = addText(row, "div", "");
    addText(words, "div", "Unit " + (i + 1) + ": " + units[i].title).className = "unit-name";
  }
  el("progress").textContent = count + " of " + units.length + " units finished";
}
function openUnit(index) {
  return function () {
    currentUnit = index;
    currentQuestion = 0;
    el("path-page").hidden = true;
    el("lesson-page").hidden = false;
    el("reading-box").hidden = false;
    el("practice-box").hidden = true;
    el("finish-box").hidden = true;
    el("unit-label").textContent = "Unit " + (index + 1) + " of " + units.length;
    el("lesson-title").textContent = units[index].title;
    var reading = el("reading-text");
    clear(reading);
    for (var i = 0; i < units[index].reading.length; i++) addText(reading, "p", units[index].reading[i]);
    if (units[index].sources) {
      var sources = addText(reading, "p", "Sources: ");
      sources.className = "lesson-sources";
      for (var j = 0; j < units[index].sources.length; j++) {
        if (j > 0) sources.appendChild(document.createTextNode(" · "));
        var link = addText(sources, "a", units[index].sources[j].name);
        link.href = units[index].sources[j].url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    }
    window.scrollTo(0, 0);
  };
}
function showQuestion() {
  var question = units[currentUnit].questions[currentQuestion];
  el("question-count").textContent = "Question " + (currentQuestion + 1) + " of " + units[currentUnit].questions.length;
  el("question-text").textContent = question.text;
  el("answer-message").textContent = "";
  el("next-button").hidden = true;
  var answers = el("answers");
  clear(answers);
  for (var i = 0; i < question.choices.length; i++) {
    var button = addText(answers, "button", question.choices[i]);
    button.type = "button";
    button.onclick = checkAnswer(i);
  }
}
function checkAnswer(index) {
  return function () {
    var question = units[currentUnit].questions[currentQuestion];
    if (index !== question.answer) {
      el("answer-message").textContent = "Try again.";
      return;
    }
    el("answer-message").textContent = "Correct.";
    var buttons = el("answers").querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) buttons[i].disabled = true;
    buttons[index].className = "correct";
    el("next-button").textContent = currentQuestion === units[currentUnit].questions.length - 1 ? "Finish unit" : "Next question";
    el("next-button").hidden = false;
  };
}

el("back-button").onclick = showPath;
el("finish-button").onclick = showPath;
el("reset-button").onclick = function () {
  finished = units.map(function () { return false; });
  saveProgress();
  showPath();
};
el("start-button").onclick = function () {
  el("reading-box").hidden = true;
  el("practice-box").hidden = false;
  showQuestion();
};
el("next-button").onclick = function () {
  currentQuestion++;
  if (currentQuestion < units[currentUnit].questions.length) {
    showQuestion();
  } else {
    finished[currentUnit] = true;
    saveProgress();
    el("practice-box").hidden = true;
    el("finish-box").hidden = false;
  }
};
showPath();

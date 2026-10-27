// Budget tips use plain JavaScript rules. Only the optional chat calls an AI service.
var expenseCategories = ["Housing", "Groceries", "Utilities", "Childcare", "Transportation", "Health", "Debt", "Fun", "Other"];
var savingPlaces = ["Savings account", "Retirement account", "Investment account", "Other savings"];
var isDemo = document.body.dataset.mode === "demo";
var storageKey = isDemo ? "bear-budget-example-v1" : "bear-budget-simple-v2";
var lessonStorageKey = isDemo ? "bear-budget-example-lessons-v1" : "bear-budget-lessons-v1";
var highSchoolLessonStorageKey = isDemo ? "bear-budget-example-high-school-lessons-v1" : "bear-budget-high-school-lessons-v1";
var emergencySource = "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/";
var budgetSource = "https://www.consumerfinance.gov/owning-a-home/prepare/assess-your-spending/";
var investingSource = "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-4";
var investingBasicsSource = "https://www.investor.gov/introduction-investing";
var debtSource = "https://www.investor.gov/build-wealth-over-time-through-saving-and-investing";
var planCategories = ["Fun", "Other", "Groceries", "Transportation", "Utilities", "Housing", "Childcare", "Health", "Debt"];
var data = {
  entries: [], limits: {}, savingsGoal: 0, savingsPlan: null,
  profile: { people: "", grossMonthly: "", njGross2025: "", njTaxable2025: "", childrenUnder6: "", housing: "", njHome2025: false }
};
try {
  var stored = localStorage.getItem(storageKey);
  if (stored) data = JSON.parse(stored);
} catch (error) { /* The page still works if storage is unavailable. */ }
if (isDemo && (!data || data.exampleMonth !== monthNow())) {
  data = bearBudgetExampleData();
  try { localStorage.setItem(storageKey, JSON.stringify(data)); }
  catch (error) { /* The example still works in this session. */ }
}
if (!Number.isFinite(Number(data.savingsGoal)) || Number(data.savingsGoal) < 0) data.savingsGoal = 0;

function el(id) { return document.getElementById(id); }
function money(number) {
  number = Number(number);
  return number.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function addText(parent, tag, words) {
  var child = document.createElement(tag);
  child.textContent = words;
  parent.appendChild(child);
  return child;
}
function clear(parent) { parent.replaceChildren(); }
function monthNow() {
  var now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}
function dateNow() { return monthNow() + "-" + String(new Date().getDate()).padStart(2, "0"); }
function say(words) { el("message").textContent = words; }
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(data)); }
  catch (error) { say("Your browser could not save the data."); }
  render();
}
function fillOptions(select, options) {
  for (var i = 0; i < options.length; i++) {
    var option = addText(select, "option", options[i]);
    option.value = options[i];
  }
}
function validAmount(amount) { return Number.isFinite(amount) && amount > 0 && amount <= 100000000; }

function monthTotals(month) {
  var result = { income: 0, expenses: 0, savings: 0, byCategory: {} };
  for (var i = 0; i < data.entries.length; i++) {
    var item = data.entries[i];
    if (item.date.slice(0, 7) !== month) continue;
    if (item.type === "income") result.income += Number(item.amount);
    if (item.type === "expense") {
      result.expenses += Number(item.amount);
      result.byCategory[item.category] = (result.byCategory[item.category] || 0) + Number(item.amount);
    }
    if (item.type === "saving") result.savings += Number(item.amount);
  }
  return result;
}
function totals() { return monthTotals(monthNow()); }
function tip(kind, title, words, url, linkText) {
  return { kind: kind, title: title, words: words, url: url, linkText: linkText || "Read official guidance" };
}
function showTips(id, tips, max) {
  var list = el(id);
  clear(list);
  var count = max ? Math.min(max, tips.length) : tips.length;
  for (var i = 0; i < count; i++) {
    var item = tips[i];
    var box = addText(list, "div", "");
    box.className = "tip-card tip-" + item.kind;
    var icon = item.kind === "idea" ? "💡 " : item.kind === "urgent" ? "🚨 " : "⚠️ ";
    addText(box, "h4", icon + item.title);
    addText(box, "p", item.words);
    if (item.url) {
      var link = addText(box, "a", item.linkText);
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  }
}
function budgetTips(total) {
  var tips = [];
  if (total.income === 0) {
    return tips;
  }
  var left = total.income - total.expenses - total.savings;
  if (left < 0) tips.push(tip("urgent", "Short by " + money(-left), "Review entries and essential bills.", budgetSource, "CFPB budget guide"));
  for (var i = 0; i < expenseCategories.length; i++) {
    var category = expenseCategories[i];
    var limit = Number(data.limits[category]) || 0;
    var spent = total.byCategory[category] || 0;
    if (limit > 0 && spent > limit) tips.push(tip("warning", category + " is over its limit", money(spent - limit) + " over your " + money(limit) + " limit. Review this category.", budgetSource, "CFPB budget guide"));
  }
  if (Number(data.savingsGoal) > 0 && total.savings < Number(data.savingsGoal)) {
    var goalGap = money(Number(data.savingsGoal) - total.savings);
    var goalText = goalGap + " short this month. " + (left < 0 ? "Cover essentials first." : "Transfer more if you can, or adjust the goal.");
    tips.push(tip("warning", "Below your savings goal", goalText, emergencySource, "CFPB emergency savings guide"));
  } else if (total.savings === 0 && left > 0) {
    tips.push(tip("idea", "Start small with savings", "If essentials are covered, consider an emergency savings transfer.", emergencySource, "CFPB emergency savings guide"));
  }
  for (var j = 0; j < data.entries.length; j++) {
    var entry = data.entries[j];
    if (entry.type === "expense" && entry.date.slice(0, 7) === monthNow() && Number(entry.amount) >= 500 && Number(entry.amount) > total.income / 4) {
      tips.push(tip("idea", "Check a large expense", entry.name + " is large compared with income. If it repeats, consider a " + entry.category + " limit.", budgetSource, "CFPB spending guide"));
      break;
    }
  }
  if (total.byCategory.Debt > 0) tips.push(tip("idea", "Check high-interest debt", "Review the rate before putting extra money into investments.", debtSource, "SEC saving and investing guide"));
  return tips;
}
function mainAlert(total) {
  var tips = budgetTips(total);
  for (var i = 0; i < tips.length; i++) {
    if (tips[i].kind !== "idea") return tips[i].title + ". " + tips[i].words;
  }
  return "No budget warnings right now.";
}
function showSavingsTips(total) {
  var tips = [];
  var left = total.income - total.expenses - total.savings;
  if (left < 0 && total.income > 0) {
    tips.push(tip("warning", "Cover essentials first", "Entered expenses and savings exceed income."));
  } else if (total.savings > 0) {
    tips.push(tip("idea", "Match the money to its purpose", "Keep emergency savings accessible. Long-term investments can lose value.", investingBasicsSource, "SEC saving and investing basics"));
    tips.push(tip("idea", "Learn about index funds", "They can track indexes such as the S&P 500. Compare fees and risks. Returns are not guaranteed.", investingSource, "SEC index fund guide"));
  } else {
    tips.push(tip("idea", "Build an emergency cushion", "If your budget allows, set aside an amount you can repeat.", emergencySource, "CFPB emergency savings guide"));
  }
  var retirement = false;
  for (var i = 0; i < data.entries.length; i++) {
    if (data.entries[i].type === "saving" && data.entries[i].category === "Retirement account" && data.entries[i].date.slice(0, 7) === monthNow()) retirement = true;
  }
  if (!retirement && total.income > 0 && left > 0) tips.push(tip("idea", "Consider retirement saving", "Check whether your employer offers a plan and match.", debtSource, "SEC long-term saving guide"));
  showTips("savings-tips", tips);
  el("savings-goal-status").textContent = Number(data.savingsGoal) > 0 ? "Goal " + money(data.savingsGoal) + " · Saved " + money(total.savings) : "";
}
function planChangeText(plan) {
  var changes = [];
  for (var i = 0; i < planCategories.length; i++) {
    var category = planCategories[i];
    if (Number(plan.cuts[category]) > 0) changes.push(category + " " + money(plan.cuts[category]) + " less");
  }
  return changes.length ? changes.join(", ") : "No category changes needed";
}
function showHomePlan(total) {
  var box = el("home-plan");
  clear(box);
  if (!data.savingsPlan) return;
  var plan = data.savingsPlan;
  addText(box, "p", "Goal " + money(plan.goal) + " · Saved " + money(total.savings));
  addText(box, "p", "Plan: " + planChangeText(plan) + " (" + plan.month + ")");
}
function showSavedPlan() {
  var box = el("saved-plan");
  clear(box);
  el("plan-remove").hidden = !data.savingsPlan;
  el("saved-plan-section").hidden = !data.savingsPlan;
  if (!data.savingsPlan) {
    return;
  }
  var plan = data.savingsPlan;
  addText(box, "p", "Goal " + money(plan.goal) + " · Based on " + plan.month);
  var list = addText(box, "ul", "");
  for (var i = 0; i < planCategories.length; i++) {
    var category = planCategories[i];
    if (Number(plan.cuts[category]) > 0) addText(list, "li", category + ": " + money(plan.spending[category]) + " → " + money(plan.spending[category] - plan.cuts[category]));
  }
}
function showHome() {
  var total = totals();
  el("month").textContent = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  el("income").textContent = money(total.income);
  el("expenses").textContent = money(total.expenses);
  el("savings").textContent = money(total.savings);
  el("left").textContent = money(total.income - total.expenses - total.savings);
  var starter = el("getting-started");
  var starterLink = el("getting-started-link");
  starter.hidden = total.income > 0 && total.expenses > 0;
  if (total.income === 0) {
    starterLink.textContent = "Add income →";
    starterLink.href = "#budget";
  } else if (total.expenses === 0) {
    starterLink.textContent = "Add an expense ↓";
    starterLink.href = "#quick-expense";
  }
  var tips = budgetTips(total);
  el("home-tips-section").hidden = tips.length === 0;
  if (tips.length) showTips("home-tips", tips, 4);
  else clear(el("home-tips"));
  showHomePlan(total);
  el("try-result").textContent = "";
  clear(el("try-tip"));
}
function suggestLimit(category) {
  if (Number(data.limits[category]) > 0) return;
  el("suggestion-link").textContent = "Set a limit for " + category;
  el("suggestion-link").onclick = function () {
    el("limit-category").value = category;
    updateLimitEditor();
    setTimeout(function () { jumpTo("limits"); el("limit-form").elements.namedItem("amount").focus(); }, 0);
  };
  el("limit-suggestion").hidden = false;
}
function initHome() {
  fillOptions(el("expense-category"), expenseCategories);
  var form = el("expense-form");
  form.elements.namedItem("date").value = dateNow();
  form.onsubmit = function (event) {
    event.preventDefault();
    var values = new FormData(form);
    var amount = Number(values.get("amount"));
    var category = values.get("category");
    var name = String(values.get("name")).trim() || category;
    if (!validAmount(amount)) return say("Enter a positive amount.");
    data.entries.push({ type: "expense", name: name, amount: amount, date: values.get("date"), category: category });
    form.reset();
    form.elements.namedItem("date").value = dateNow();
    form.elements.namedItem("category").value = category;
    say("Expense added.");
    save();
    el("limit-suggestion").hidden = true;
    suggestLimit(category);
  };
  el("dismiss-suggestion").onclick = function () { el("limit-suggestion").hidden = true; };
  el("try-button").onclick = function () { el("try-panel").hidden = !el("try-panel").hidden; };
  el("try-form").onsubmit = function (event) {
    event.preventDefault();
    var amount = Number(new FormData(event.currentTarget).get("amount"));
    if (!validAmount(amount)) return;
    var total = totals();
    if (total.income === 0) {
      el("try-result").textContent = "Add income first.";
      return;
    }
    if (amount > total.expenses) {
      el("try-result").textContent = "Amount exceeds this month's expenses.";
      return;
    }
    var left = total.income - total.expenses - total.savings;
    el("try-result").textContent = "Estimated amount left: " + money(left + amount) + " (up " + money(amount) + ").";
    if (left + amount > 0 && total.savings === 0) showTips("try-tip", [tip("idea", "A possible next step", "If essentials are covered, consider moving some to emergency savings.", emergencySource, "CFPB emergency savings guide")]);
    else clear(el("try-tip"));
  };
}

function deleteEntry(index) {
  return function () {
    data.entries.splice(index, 1);
    say("Entry deleted.");
    save();
  };
}
function showEntries() {
  var list = el("entries");
  clear(list);
  for (var i = data.entries.length - 1; i >= 0; i--) {
    var item = data.entries[i];
    var row = addText(list, "tr", "");
    addText(row, "td", item.date);
    addText(row, "td", item.type === "saving" ? "Savings" : item.type === "income" ? "Income" : "Expense");
    addText(row, "td", item.name);
    addText(row, "td", item.category);
    var amountCell = addText(row, "td", money(item.amount));
    amountCell.className = "amount-cell";
    var button = addText(addText(row, "td", ""), "button", "Delete");
    button.type = "button";
    button.className = "table-action";
    button.setAttribute("aria-label", "Delete " + item.type + " entry " + item.name + " for " + money(item.amount));
    button.onclick = deleteEntry(i);
  }
  if (!data.entries.length) {
    var cell = addText(addText(list, "tr", ""), "td", "No entries yet.");
    cell.colSpan = 6;
    cell.className = "empty-cell";
  }
}
function jumpTo(id) {
  el(id).scrollIntoView({ block: "start" });
}
function updateLimitEditor() {
  var category = el("limit-category").value;
  var amount = Number(data.limits[category]) || 0;
  el("limit-form").elements.namedItem("amount").value = amount > 0 ? amount : "";
  el("remove-limit").hidden = amount === 0;
}
function updateSavingsGoalEditor() {
  var amount = Number(data.savingsGoal) || 0;
  el("savings-goal-form").elements.namedItem("amount").value = amount > 0 ? amount : "";
  el("remove-savings-goal").hidden = amount === 0;
}
function showLimits() {
  var list = el("limit-list");
  clear(list);
  var total = totals();
  for (var i = 0; i < expenseCategories.length; i++) {
    var category = expenseCategories[i];
    var limit = Number(data.limits[category]) || 0;
    var spent = total.byCategory[category] || 0;
    var row = addText(list, "tr", "");
    addText(row, "td", category);
    var spentCell = addText(row, "td", money(spent));
    spentCell.className = "amount-cell";
    var limitCell = addText(row, "td", limit > 0 ? money(limit) : "Not set");
    limitCell.className = "amount-cell";
    var status = addText(addText(row, "td", ""), "span", limit === 0 ? "" : spent > limit ? "Over by " + money(spent - limit) : "Within limit");
    status.className = "status-tag " + (limit === 0 ? "status-neutral" : spent > limit ? "status-over" : "status-ok");
    var action = addText(addText(row, "td", ""), "button", limit > 0 ? "Edit" : "Set limit");
    action.type = "button";
    action.className = "table-action";
    action.setAttribute("aria-label", (limit > 0 ? "Edit " : "Set ") + category + " limit");
    action.onclick = (function (chosen) { return function () { el("limit-category").value = chosen; updateLimitEditor(); jumpTo("limits"); el("limit-form").elements.namedItem("amount").focus(); }; })(category);
  }
}
function initBudget() {
  fillOptions(el("saving-place"), savingPlaces);
  fillOptions(el("limit-category"), expenseCategories);
  el("limit-category").onchange = updateLimitEditor;
  updateLimitEditor();
  var jumps = document.querySelectorAll("[data-jump]");
  for (var i = 0; i < jumps.length; i++) jumps[i].onclick = function () { jumpTo(this.getAttribute("data-jump")); };
  var form = el("other-entry-form");
  form.elements.namedItem("date").value = dateNow();
  form.elements.namedItem("type").onchange = function () {
    el("saving-place-label").hidden = this.value !== "saving";
  };
  form.onsubmit = function (event) {
    event.preventDefault();
    var values = new FormData(form);
    var type = values.get("type");
    var amount = Number(values.get("amount"));
    if (!validAmount(amount)) return say("Enter a positive amount.");
    var name = String(values.get("name")).trim() || (type === "income" ? "Income" : "Savings transfer");
    data.entries.push({ type: type, name: name, amount: amount, date: values.get("date"), category: type === "saving" ? values.get("category") : "" });
    form.reset();
    form.elements.namedItem("date").value = dateNow();
    el("saving-place-label").hidden = true;
    say("Entry added.");
    save();
  };
  el("limit-form").onsubmit = function (event) {
    event.preventDefault();
    var values = new FormData(event.currentTarget);
    var category = values.get("category");
    var amount = Number(values.get("amount"));
    if (!expenseCategories.includes(category) || !validAmount(amount)) return say("Enter a positive monthly limit.");
    data.limits[category] = amount;
    say(category + " limit saved.");
    save();
    updateLimitEditor();
  };
  el("remove-limit").onclick = function () {
    var category = el("limit-category").value;
    delete data.limits[category];
    say(category + " limit removed.");
    save();
    updateLimitEditor();
  };
  var goalForm = el("savings-goal-form");
  updateSavingsGoalEditor();
  goalForm.onsubmit = function (event) {
    event.preventDefault();
    var amount = Number(new FormData(goalForm).get("amount"));
    if (!validAmount(amount)) return say("Enter a positive savings goal.");
    if (data.savingsPlan && amount !== Number(data.savingsPlan.goal)) data.savingsPlan = null;
    data.savingsGoal = amount;
    say("Savings goal saved.");
    save();
    updateSavingsGoalEditor();
  };
  el("remove-savings-goal").onclick = function () {
    data.savingsGoal = 0;
    data.savingsPlan = null;
    say("Savings goal removed.");
    save();
    updateSavingsGoalEditor();
  };
}
function showBudgetPage() {
  var total = totals();
  showEntries();
  showLimits();
  showSavingsTips(total);
}

var currentProposal = null;
function planBaseline() {
  var months = [];
  for (var i = 0; i < data.entries.length; i++) {
    var month = data.entries[i].date.slice(0, 7);
    if (month < monthNow() && !months.includes(month)) months.push(month);
  }
  months.sort().reverse();
  for (var j = 0; j < months.length; j++) {
    var past = monthTotals(months[j]);
    if (past.income > 0 && past.expenses > 0) return { month: months[j], total: past, current: false };
  }
  var now = totals();
  if (now.income > 0 && now.expenses > 0) return { month: monthNow(), total: now, current: true };
  return null;
}
function preparePlanPage() {
  currentProposal = null;
  el("plan-result").hidden = true;
  var form = el("plan-form");
  form.elements.namedItem("goal").value = Number(data.savingsGoal) > 0 ? data.savingsGoal : "";
  var box = el("plan-categories");
  clear(box);
  var base = planBaseline();
  form.hidden = !base;
  if (!base) {
    el("plan-status").textContent = "Add income and an expense before making a plan.";
    return;
  }
  el("plan-status").textContent = "";
  for (var i = 0; i < planCategories.length; i++) {
    var category = planCategories[i];
    var spent = base.total.byCategory[category] || 0;
    if (spent <= 0) continue;
    var label = addText(box, "label", "");
    var checkbox = addText(label, "input", "");
    checkbox.type = "checkbox";
    checkbox.name = "category";
    checkbox.value = category;
    checkbox.checked = data.savingsPlan && data.savingsPlan.month === base.month ? data.savingsPlan.selected.includes(category) : category === "Fun";
    label.appendChild(document.createTextNode(" " + category + " (" + money(spent) + ")"));
  }
  if (!box.children.length) addText(box, "p", "No spending categories yet.");
}
function readPlanCuts() {
  var cuts = {};
  var values = new FormData(el("plan-cuts-form"));
  for (var i = 0; i < currentProposal.selected.length; i++) {
    var category = currentProposal.selected[i];
    var raw = values.get(category);
    var amount = Number(raw);
    if (raw === "" || !Number.isFinite(amount) || amount < 0 || amount > currentProposal.base.total.byCategory[category]) return null;
    cuts[category] = Math.round(amount * 100) / 100;
  }
  return cuts;
}
function updatePlanEstimate() {
  if (!currentProposal) return false;
  var cuts = readPlanCuts();
  if (!cuts) {
    el("plan-estimate").textContent = "Amount exceeds spending in that category.";
    el("plan-save").disabled = true;
    return false;
  }
  currentProposal.cuts = cuts;
  var totalCut = 0;
  for (var category in cuts) totalCut += cuts[category];
  var available = Math.round((currentProposal.base.total.income - currentProposal.base.total.expenses + totalCut) * 100) / 100;
  var shortBy = Math.round((currentProposal.goal - available) * 100) / 100;
  if (shortBy > 0) {
    el("plan-estimate").textContent = money(shortBy) + " short. Adjust categories or goal.";
    el("plan-save").disabled = true;
    return false;
  }
  el("plan-estimate").textContent = "Estimated savings available: " + money(available) + ". Goal met.";
  el("plan-save").disabled = false;
  return true;
}
function showProposal() {
  var proposal = currentProposal;
  var total = proposal.base.total;
  el("plan-result").hidden = false;
  el("plan-baseline").textContent = proposal.base.month + ": " + money(total.income) + " income, " + money(total.expenses) + " expenses.";
  var needed = Math.max(0, Math.round((proposal.goal - (total.income - total.expenses)) * 100) / 100);
  el("plan-needed").textContent = needed > 0 ? "Find " + money(needed) + " in spending changes." : "Your goal already fits these entries.";
  var fields = el("plan-cut-fields");
  clear(fields);
  for (var i = 0; i < proposal.selected.length; i++) {
    var category = proposal.selected[i];
    var label = addText(fields, "label", category + " (spent " + money(total.byCategory[category]) + ")");
    var input = addText(label, "input", "");
    input.type = "number";
    input.name = category;
    input.min = "0";
    input.max = String(total.byCategory[category]);
    input.step = "0.01";
    input.required = true;
    input.value = proposal.cuts[category].toFixed(2);
  }
  el("plan-cuts-form").hidden = proposal.selected.length === 0;
  updatePlanEstimate();
}
function initPlan() {
  el("plan-form").onsubmit = function (event) {
    event.preventDefault();
    var base = planBaseline();
    if (!base) return preparePlanPage();
    var values = new FormData(event.currentTarget);
    var goal = Number(values.get("goal"));
    if (!validAmount(goal)) return el("plan-status").textContent = "Enter a positive savings goal.";
    var selected = values.getAll("category");
    var needed = Math.max(0, Math.round((goal - (base.total.income - base.total.expenses)) * 100) / 100);
    var remaining = needed;
    var cuts = {};
    for (var i = 0; i < selected.length; i++) {
      var category = selected[i];
      var gentleCut = Math.floor(base.total.byCategory[category] * 50) / 100;
      cuts[category] = Math.min(remaining, gentleCut);
      remaining = Math.round((remaining - cuts[category]) * 100) / 100;
    }
    currentProposal = { goal: goal, base: base, selected: selected, cuts: cuts };
    showProposal();
    el("plan-status").textContent = "";
  };
  el("plan-cuts-form").onsubmit = function (event) {
    event.preventDefault();
    updatePlanEstimate();
  };
  el("plan-save").onclick = function () {
    if (!updatePlanEstimate()) return;
    var spending = {};
    for (var i = 0; i < currentProposal.selected.length; i++) {
      var category = currentProposal.selected[i];
      spending[category] = currentProposal.base.total.byCategory[category];
    }
    data.savingsGoal = currentProposal.goal;
    data.savingsPlan = { goal: currentProposal.goal, month: currentProposal.base.month, selected: currentProposal.selected, cuts: currentProposal.cuts, spending: spending };
    updateSavingsGoalEditor();
    say("Savings plan saved.");
    save();
  };
  el("plan-retry").onclick = function () {
    var goal = currentProposal ? currentProposal.goal : "";
    preparePlanPage();
    el("plan-form").elements.namedItem("goal").value = goal;
    el("plan-form").elements.namedItem("goal").focus();
  };
  el("plan-remove").onclick = function () {
    data.savingsPlan = null;
    say("Savings plan removed.");
    save();
  };
}

function benefit(name, reason, next, url) {
  var box = addText(el("benefit-list"), "div", "");
  box.className = "benefit";
  addText(box, "h4", name);
  addText(box, "p", reason);
  if (next) addText(box, "p", next);
  var link = addText(box, "a", "Official details");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}
function showBenefits() {
  var list = el("benefit-list");
  clear(list);
  var p = data.profile;
  var hasAnswers = p.people !== "" || p.grossMonthly !== "" || p.njGross2025 !== "" || p.njTaxable2025 !== "" || p.childrenUnder6 !== "" || p.housing !== "" || p.njHome2025;
  el("benefit-results").hidden = !hasAnswers;
  if (!hasAnswers) return;
  var people = Number(p.people);
  var snapLimits = [0, 2461, 3337, 4212, 5088, 5964, 6839, 7715, 8591];
  if (people >= 1 && p.grossMonthly !== "") {
    var snapLimit = people <= 8 ? snapLimits[people] : snapLimits[8] + (people - 8) * 876;
    if (Number(p.grossMonthly) <= snapLimit) benefit("NJ SNAP", "Entered income is within the published limit for this household size.", "", "https://nj.gov/humanservices/njsnap/apply/eligibility/");
  }
  if (p.njHome2025 && p.njGross2025 !== "" && (p.housing === "own" || p.housing === "rent")) {
    var anchorLimit = p.housing === "own" ? 250000 : 150000;
    if (Number(p.njGross2025) <= anchorLimit) benefit("ANCHOR property tax relief", "Entered 2025 income is within the published limit for your housing type.", "Check whether the state already filed for you.", "https://www.nj.gov/treasury/taxation/anchor/eligibility.shtml");
  }
  if (p.njHome2025 && Number(p.childrenUnder6) > 0 && p.njTaxable2025 !== "" && Number(p.njTaxable2025) <= 80000) {
    benefit("NJ Child Tax Credit", "Entered age and 2025 NJ taxable income match the screening rules.", "Claim through an NJ tax return.", "https://www.nj.gov/treasury/taxation/individuals/childtaxcredit.shtml");
  }
  if (!list.children.length) addText(list, "p", "No possible matches from these answers.");
}
function initBenefits() {
  var form = el("profile-form");
  for (var field in data.profile) {
    var input = form.elements.namedItem(field);
    if (field === "njHome2025") input.checked = data.profile[field];
    else input.value = data.profile[field];
  }
  form.onsubmit = function (event) {
    event.preventDefault();
    var values = new FormData(form);
    var names = ["people", "grossMonthly", "njGross2025", "njTaxable2025", "childrenUnder6"];
    for (var i = 0; i < names.length; i++) {
      var value = values.get(names[i]);
      if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) return say("Enter valid nonnegative numbers.");
      data.profile[names[i]] = value;
    }
    data.profile.housing = values.get("housing");
    data.profile.njHome2025 = values.has("njHome2025");
    say("Possible matches updated.");
    save();
  };
}
function render() {
  showHome();
  showBudgetPage();
  showSavedPlan();
  showBenefits();
}
function showPage() {
  var page = location.hash;
  el("home-page").hidden = page === "#budget" || page === "#benefits" || page === "#plan";
  el("budget-page").hidden = page !== "#budget";
  el("benefits-page").hidden = page !== "#benefits";
  el("plan-page").hidden = page !== "#plan";
  var links = document.querySelectorAll("nav a[href^='#']");
  for (var i = 0; i < links.length; i++) {
    var active = links[i].getAttribute("href") === (page === "#budget" || page === "#benefits" || page === "#plan" ? page : "#home");
    links[i].classList.toggle("active", active);
    if (active) links[i].setAttribute("aria-current", "page");
    else links[i].removeAttribute("aria-current");
  }
  if (page === "#plan") preparePlanPage();
}

var chatHistory = [];
function chatContext() {
  var lessonProgress = isDemo ? [true, false, false] : [];
  var highSchoolLessonProgress = isDemo ? [true, false, false, false] : [];
  try { lessonProgress = JSON.parse(localStorage.getItem(lessonStorageKey)) || lessonProgress; }
  catch (error) { /* Lessons can still be discussed without saved progress. */ }
  try { highSchoolLessonProgress = JSON.parse(localStorage.getItem(highSchoolLessonStorageKey)) || highSchoolLessonProgress; }
  catch (error) { /* Lessons can still be discussed without saved progress. */ }
  var total = totals();
  return {
    appInfo: {
      name: "Bear Budget",
      exampleData: isDemo,
      pages: ["Home budget summary and quick expense", "Savings plan with an optional category change example", "Budget details for income, savings, limits, and entries", "Optional NJ help check", "Three kids' money lessons with practice questions", "Four high school money lessons with practice questions"],
      expenseCategories: expenseCategories,
      savingPlaces: savingPlaces,
      njHelpPrograms: ["NJ SNAP", "ANCHOR", "NJ Child Tax Credit"]
    },
    today: dateNow(),
    entries: data.entries,
    monthlyLimits: data.limits,
    monthlySavingsGoal: Number(data.savingsGoal) || 0,
    savedSavingsPlan: data.savingsPlan,
    njHelpAnswers: data.profile,
    thisMonth: {
      month: monthNow(),
      income: total.income,
      expenses: total.expenses,
      movedToSavings: total.savings,
      amountLeft: total.income - total.expenses - total.savings,
      spendingByCategory: total.byCategory,
      alert: mainAlert(total),
      tips: budgetTips(total)
    },
    possibleNJHelpHints: el("benefit-list").textContent,
    finishedMoneyLessons: lessonProgress,
    finishedHighSchoolLessons: highSchoolLessonProgress
  };
}
function addChatLine(name, words, className) {
  var line = addText(el("chat-messages"), "p", name + ": " + words);
  line.className = className;
}
function initChat() {
  var form = el("chat-form");
  el("chat-toggle").onclick = function () {
    el("chat-panel").hidden = !el("chat-panel").hidden;
    el("chat-toggle").setAttribute("aria-expanded", String(!el("chat-panel").hidden));
    if (!el("chat-panel").hidden) el("chat-question").focus();
  };
  el("chat-close").onclick = function () {
    el("chat-panel").hidden = true;
    el("chat-toggle").setAttribute("aria-expanded", "false");
    el("chat-toggle").focus();
  };
  if (location.protocol === "file:") {
    el("chat-status").textContent = "Chat is unavailable when the app is opened as a file.";
  }
  form.onsubmit = async function (event) {
    event.preventDefault();
    var question = el("chat-question").value.trim();
    if (!question) return;
    if (location.protocol === "file:") {
      el("chat-status").textContent = "Chat is unavailable here.";
      return;
    }
    addChatLine("You", question, "your-question");
    el("chat-question").value = "";
    el("chat-send").disabled = true;
    el("chat-status").textContent = "Bear is thinking...";
    try {
      var response = await fetch("api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, appData: chatContext(), history: chatHistory.slice(-6) })
      });
      var result = await response.json();
      if (!response.ok) throw new Error(result.error || "Chat could not answer right now.");
      addChatLine("Bear", result.answer, "bear-reply");
      chatHistory.push({ role: "user", content: question });
      chatHistory.push({ role: "assistant", content: result.answer });
      el("chat-status").textContent = "";
    } catch (error) {
      el("chat-status").textContent = error.message === "Failed to fetch" ? "Chat is unavailable right now." : error.message;
      el("chat-question").value = question;
    }
    el("chat-send").disabled = false;
  };
}
initHome();
initBudget();
initPlan();
initBenefits();
render();
showPage();
initChat();
if (isDemo) {
  el("demo-reset").onclick = function () {
    data = bearBudgetExampleData();
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      localStorage.setItem(lessonStorageKey, JSON.stringify([true, false, false]));
      localStorage.setItem(highSchoolLessonStorageKey, JSON.stringify([true, false, false, false]));
    } catch (error) { /* The example still works in this session. */ }
    location.href = "demo.html#home";
    location.reload();
  };
  el("try-form").elements.namedItem("amount").value = "100";
}
window.addEventListener("hashchange", function () {
  showPage();
  say("");
  if (location.hash === "#quick-expense") jumpTo("quick-expense");
  else window.scrollTo(0, 0);
});

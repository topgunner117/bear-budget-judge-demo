// Fictional household data for demo.html. The regular app never loads this file.
function bearBudgetExampleData() {
  var now = new Date();
  var month = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  function date(day) { return month + "-" + String(Math.min(day, now.getDate())).padStart(2, "0"); }
  function entry(type, name, amount, category, day) {
    return { type: type, name: name, amount: amount, category: category, date: date(day) };
  }
  return {
    exampleMonth: month,
    entries: [
      entry("income", "Paycheck", 2100, "", 1),
      entry("income", "Paycheck", 2100, "", 15),
      entry("expense", "Rent", 1400, "Housing", 2),
      entry("expense", "Groceries", 650, "Groceries", 5),
      entry("expense", "Electric and water", 250, "Utilities", 7),
      entry("expense", "Childcare", 600, "Childcare", 8),
      entry("expense", "Transit and gas", 400, "Transportation", 10),
      entry("expense", "Doctor visit", 140, "Health", 12),
      entry("expense", "Credit card payment", 200, "Debt", 14),
      entry("expense", "Family outings", 260, "Fun", 17),
      entry("expense", "School supplies", 150, "Other", 19),
      entry("saving", "Emergency fund", 50, "Savings account", 20),
      entry("saving", "Long-term savings", 25, "Investment account", 21)
    ],
    limits: { Housing: 1450, Groceries: 550, Utilities: 300, Transportation: 450, Fun: 200 },
    savingsGoal: 300,
    savingsPlan: {
      goal: 300,
      month: month,
      selected: ["Fun", "Groceries"],
      cuts: { Fun: 100, Groceries: 50 },
      spending: { Fun: 260, Groceries: 650 }
    },
    profile: {
      people: "4",
      grossMonthly: "4200",
      njGross2025: "50400",
      njTaxable2025: "40000",
      childrenUnder6: "1",
      housing: "rent",
      njHome2025: true
    }
  };
}

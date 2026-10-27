// High school lessons use the same simple reading and quiz page as the kids' lessons.
window.bearBudgetHighSchoolUnits = [
  {
    title: "Read a paycheck",
    description: "Gross pay, deductions, and take-home pay",
    reading: [
      "Gross pay is what you earn before deductions. A pay stub shows taxes and other amounts taken out. Net pay is the amount you actually take home, so it is the better number for a spending plan.",
      "Suppose you work 10 hours at $18 an hour. Your gross pay is $180. If your pay stub shows $27 in total deductions, your net pay is $153. Actual deductions depend on the job and your situation."
    ],
    questions: [
      { text: "You work 10 hours at $18 an hour. What is your gross pay?", choices: ["$153", "$180", "$270"], answer: 1 },
      { text: "Your gross pay is $180 and deductions total $27. What is your net pay?", choices: ["$153", "$180", "$207"], answer: 0 },
      { text: "Which amount is most useful when deciding how much of this paycheck you can spend?", choices: ["Gross pay", "Net pay", "Last month's gross pay"], answer: 1 }
    ],
    sources: [
      { name: "CFPB pay stub activity", url: "https://www.consumerfinance.gov/consumer-tools/educator-tool/youth-financial-education/teach/activities/examining-elements-paycheck/" }
    ]
  },
  {
    title: "Plan beyond this month",
    description: "Irregular bills and emergency savings",
    reading: [
      "Some costs do not arrive every month. If you know a $240 bill is due in six months and have not saved for it yet, setting aside $40 each month can prepare you for it. Include these less frequent costs when you plan your spending.",
      "An emergency fund is different. It is money set aside for costs you did not plan, such as an urgent repair or a loss of income. Keep it somewhere safe and accessible. Also notice when bills are due, since timing matters even if monthly income exceeds monthly expenses."
    ],
    questions: [
      { text: "A $240 bill is due in six months. How much could you set aside each month?", choices: ["$20", "$40", "$60"], answer: 1 },
      { text: "Which expense is a better use of an emergency fund?", choices: ["A planned subscription", "An urgent repair", "A regular monthly bill"], answer: 1 },
      { text: "Rent is due before your next paycheck. What is the strongest plan?", choices: ["Set aside money from an earlier paycheck", "Ignore the due date", "Assume next month's income will arrive early"], answer: 0 }
    ],
    sources: [
      { name: "CFPB spending guide", url: "https://www.consumerfinance.gov/owning-a-home/prepare/assess-your-spending/" },
      { name: "CFPB emergency fund guide", url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/" }
    ]
  },
  {
    title: "Understand credit cards",
    description: "APR, minimum payments, and interest",
    reading: [
      "A credit card lets you borrow for purchases. APR describes an annual interest rate, though card interest is often calculated daily. Paying only the minimum can keep a payment from being late, but the remaining balance may keep growing with interest.",
      "If a card has a purchase grace period and you are not already carrying a balance, paying the full statement balance by the due date can avoid interest on those purchases. Read the card's terms, including fees and the rules for cash advances."
    ],
    questions: [
      { text: "What can happen if you pay only the minimum on a credit card?", choices: ["The remaining debt can cost more in interest", "The rest of the balance disappears", "The APR becomes zero"], answer: 0 },
      { text: "With a purchase grace period and no carried balance, what can avoid interest on new purchases?", choices: ["Paying only the minimum", "Paying the full statement balance by the due date", "Opening another card"], answer: 1 },
      { text: "Two cards have the same fees and terms. If you expect to carry a balance, which APR generally costs less interest?", choices: ["18% APR", "25% APR", "They always cost the same"], answer: 0 }
    ],
    sources: [
      { name: "CFPB credit card interest", url: "https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/" },
      { name: "CFPB minimum payments", url: "https://www.consumerfinance.gov/ask-cfpb/a-box-on-my-credit-card-bill-says-that-i-will-pay-off-the-balance-in-three-years-if-i-pay-a-certain-amount-what-does-that-mean-do-i-have-to-pay-that-much-if-i-pay-that-much-and-make-new-purchases-will-i-still-owe-nothing-after-three-years-en-36/" }
    ]
  },
  {
    title: "Growth and investment risk",
    description: "Compounding, index funds, and diversification",
    reading: [
      "Compounding means earning a return on earlier returns. In a simple example, $100 earning a fixed 5% once a year becomes $105 after one year and $110.25 after two years. This example ignores fees and taxes. Stock-market returns are not fixed or guaranteed.",
      "An index fund aims to track a market index. It can spread money across many holdings, but it can still lose value, and fees reduce returns. Diversification can reduce some risk, not remove it. Money needed soon, especially emergency savings, should be easy to access instead of depending on market performance."
    ],
    questions: [
      { text: "At a fixed 5% annual rate, what does $100 become after two years with annual compounding?", choices: ["$105.00", "$110.00", "$110.25"], answer: 2 },
      { text: "Which statement about an index fund is accurate?", choices: ["It cannot lose money", "It tracks an index but still has risk and fees", "It guarantees the index's return"], answer: 1 },
      { text: "Where is money for an urgent expense generally better kept?", choices: ["In accessible emergency savings", "Only in a stock fund", "In an investment that cannot be sold soon"], answer: 0 }
    ],
    sources: [
      { name: "Investor.gov compounding", url: "https://www.investor.gov/additional-resources/information/youth/teachers-classroom-resources/what-compound-interest" },
      { name: "Investor.gov index funds", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-4" },
      { name: "Investor.gov diversification", url: "https://www.investor.gov/introduction-investing/getting-started/asset-allocation" }
    ]
  }
];

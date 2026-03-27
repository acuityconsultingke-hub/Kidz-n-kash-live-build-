/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { MapPin, Search, Navigation, ExternalLink, Info, Loader2, Trophy, Star, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─────────────────────────────────────────────
//  DATA  –  Curriculum drawn from CFP handbook
//           and localized for Kenya / CBC / IGCSE
// ─────────────────────────────────────────────
const COUNTIES = [
  { id: "nairobi",   name: "Nairobi",    emoji: "🏙️", color: "#E63946", x: 52, y: 58 },
  { id: "mombasa",   name: "Mombasa",    emoji: "⛵", color: "#2196F3", x: 75, y: 72 },
  { id: "kisumu",    name: "Kisumu",     emoji: "🐟", color: "#FF9800", x: 28, y: 52 },
  { id: "nakuru",    name: "Nakuru",     emoji: "🦩", color: "#9C27B0", x: 38, y: 50 },
  { id: "eldoret",   name: "Eldoret",    emoji: "🏃", color: "#4CAF50", x: 30, y: 40 },
  { id: "garissa",   name: "Garissa",    emoji: "🐪", color: "#FF5722", x: 68, y: 40 },
];

const MODULES = [
  {
    id: 1,
    title: "Money Safari Basics",
    icon: "🦁",
    level: "Cub (10–13)",
    color: "#F5A623",
    badge: "🥉 Cub Scout",
    county: "nairobi",
    ageGroup: "junior",
    difficulties: {
      easy: {
        xp: 100,
        lessons: [
          {
            title: "What is Money?",
            content: "Money is anything people agree to use to exchange for goods and services. In Kenya, we use the Kenyan Shilling (KES). Before money, people used barter — swapping goats for grain! M-Pesa lets us move money with just a phone.",
            quiz: {
              q: "Which of the following is Kenya's official currency?",
              options: ["Dollar", "Kenyan Shilling", "Euro", "Rand"],
              answer: 1,
              explanation: "The Kenyan Shilling (KES) is Kenya's official currency, used for all official transactions."
            }
          },
          {
            title: "Needs vs. Wants",
            content: "A NEED is something you must have to survive — food, water, shelter, school fees. A WANT is something nice to have but not essential — new trainers, a video game. Great money managers always cover needs first!",
            quiz: {
              q: "School fees are best classified as a…",
              options: ["Want", "Need", "Luxury", "Investment"],
              answer: 1,
              explanation: "Education is a need — it builds your future earning power and is required in Kenya's CBC system."
            }
          },
          {
            title: "Your First Budget",
            content: "A budget is a plan for your money. Use the 50-30-20 rule: 50% on Needs, 30% on Wants, 20% on Savings. If your pocket money is KES 500/week: KES 250 for needs, KES 150 for wants, KES 100 to save!",
            quiz: {
              q: "You receive KES 1,000. Using 50-30-20, how much should you save?",
              options: ["KES 100", "KES 200", "KES 500", "KES 300"],
              answer: 1,
              explanation: "20% of 1,000 = KES 200. Saving consistently — even small amounts — builds wealth over time."
            }
          }
        ]
      },
      medium: {
        xp: 150,
        lessons: [
          {
            title: "The History of Money",
            content: "Before coins, people used the 'Barter System'—trading things like goats for grain. Later, cowrie shells were used as money in East Africa!",
            quiz: {
              q: "What was the system of trading goods directly called?",
              options: ["M-Pesa", "Banking", "Barter System", "Credit"],
              answer: 2,
              explanation: "Barter is trading goods or services directly without using money."
            }
          },
          {
            title: "Functions of Money",
            content: "Money serves three main roles: a way to pay (medium of exchange), a way to measure value (unit of account), and a way to keep wealth (store of value).",
            quiz: {
              q: "When you save money in a piggy bank, which function are you using?",
              options: ["Medium of Exchange", "Store of Value", "Unit of Account", "Barter"],
              answer: 1,
              explanation: "Store of value means money holds its worth over time so you can use it later."
            }
          }
        ]
      },
      hard: {
        xp: 250,
        lessons: [
          {
            title: "Inflation: The Money Eater",
            content: "Inflation is when prices of things go up over time. If inflation is high, your 100 shillings buys fewer mandazis than it did last year!",
            quiz: {
              q: "If inflation is 10%, what happens to the value of your savings?",
              options: ["It increases", "It stays the same", "It decreases", "It doubles"],
              answer: 2,
              explanation: "Inflation reduces the purchasing power of your money."
            }
          },
          {
            title: "The Central Bank of Kenya (CBK)",
            content: "The CBK is the 'Banker's Bank'. It prints our money and tries to keep inflation low so that our economy stays healthy.",
            quiz: {
              q: "Who is responsible for printing Kenya Shilling notes?",
              options: ["KRA", "Equity Bank", "Central Bank of Kenya", "The President"],
              answer: 2,
              explanation: "The CBK has the sole authority to issue currency in Kenya."
            }
          }
        ]
      }
    }
  },
  {
    id: 2,
    title: "Savings & Goal Setting",
    icon: "🐘",
    level: "Explorer (13–16)",
    color: "#4CAF50",
    badge: "🥈 Trail Finder",
    county: "nakuru",
    ageGroup: "teen",
    difficulties: {
      easy: {
        xp: 150,
        lessons: [
          {
            title: "The Power of Saving",
            content: "Saving means keeping some money aside for the future. Kenyan banks, SACCOs (co-operatives), and M-Shwari offer savings accounts. Even saving KES 20/day = KES 7,300/year — enough for school supplies or a small business start!",
            quiz: {
              q: "Which Kenyan mobile savings tool lets you save directly from M-Pesa?",
              options: ["Equity Bank", "M-Shwari", "KCB", "Co-op Bank"],
              answer: 1,
              explanation: "M-Shwari by Safaricom/NCBA lets you save and borrow directly from your M-Pesa wallet — great for young savers!"
            }
          },
          {
            title: "SMART Financial Goals",
            content: "Set SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound. Instead of 'I want money', say: 'I will save KES 5,000 for a laptop by December by putting aside KES 500/month.' That's a SMART goal!",
            quiz: {
              q: "Which is the BEST example of a SMART savings goal?",
              options: [
                "I want to save money someday",
                "I'll save KES 3,000 in 6 months for a textbook",
                "I want to be rich",
                "I'll save a lot this year"
              ],
              answer: 1,
              explanation: "Option B is SMART — it's specific (KES 3,000), measurable, achievable, relevant (textbook), and time-bound (6 months)."
            }
          },
          {
            title: "Compound Interest Magic",
            content: "Compound interest means you earn interest on your interest — money making money! If you save KES 10,000 at 8% annual interest: Year 1 = KES 10,800. Year 5 = KES 14,693. Year 10 = KES 21,589. Start early — time is your biggest asset!",
            quiz: {
              q: "You save KES 10,000 at 10% interest per year. After 2 years with compound interest, you have approximately:",
              options: ["KES 12,000", "KES 12,100", "KES 11,000", "KES 10,200"],
              answer: 1,
              explanation: "Year 1: 10,000 × 1.1 = 11,000. Year 2: 11,000 × 1.1 = 12,100. Compound interest adds interest on interest!"
            }
          }
        ]
      },
      medium: {
        xp: 200,
        lessons: [
          {
            title: "Emergency Funds",
            content: "An emergency fund is 3-6 months of expenses saved for unexpected events like sickness or job loss. It's your financial safety net.",
            quiz: {
              q: "How much should be in a full emergency fund?",
              options: ["1 month of pay", "3-6 months of expenses", "1,000 shillings", "Whatever is left"],
              answer: 1,
              explanation: "This provides enough cushion to survive major life disruptions."
            }
          }
        ]
      },
      hard: {
        xp: 350,
        lessons: [
          {
            title: "Opportunity Cost",
            content: "Every time you spend money on one thing, you lose the chance to spend it on something else. This 'lost chance' is called Opportunity Cost.",
            quiz: {
              q: "If you spend 500/- on a movie instead of saving it for a bike, what is the opportunity cost?",
              options: ["The 500/-", "The movie", "The progress toward the bike", "The cinema seat"],
              answer: 2,
              explanation: "Opportunity cost is the value of the next best alternative you gave up."
            }
          }
        ]
      }
    }
  },
  {
    id: 3,
    title: "Banking & Digital Money",
    icon: "📱",
    level: "Explorer (13–16)",
    color: "#2196F3",
    badge: "💳 Digital Ranger",
    county: "mombasa",
    ageGroup: "teen",
    difficulties: {
      easy: {
        xp: 150,
        lessons: [
          {
            title: "How Banks Work",
            content: "Banks keep your money safe AND lend it to others at a higher interest rate — that's how they make money. In Kenya: Commercial Banks (KCB, Equity), SACCOs, Microfinance Institutions, and Mobile Money (M-Pesa, Airtel Money) all serve different needs.",
            quiz: {
              q: "What is a SACCO?",
              options: [
                "A type of M-Pesa transaction",
                "A savings and credit co-operative owned by members",
                "A government bank",
                "A mobile app"
              ],
              answer: 1,
              explanation: "SACCOs (Savings & Credit Co-operatives) let members pool savings and access low-interest loans — popular in Kenya for teachers, farmers, and workers."
            }
          },
          {
            title: "M-Pesa & Mobile Money",
            content: "Kenya leads the world in mobile money! M-Pesa launched in 2007 and now handles over KES 300 billion monthly. You can: Send money, Pay bills (Lipa na M-Pesa), Save (M-Shwari), Borrow (Fuliza), Buy insurance. Always protect your PIN!",
            quiz: {
              q: "Which year did M-Pesa launch in Kenya?",
              options: ["2003", "2007", "2010", "2015"],
              answer: 1,
              explanation: "M-Pesa launched in 2007 by Safaricom and revolutionized financial inclusion across Africa and the world!"
            }
          },
          {
            title: "Financial Safety Online",
            content: "Digital money needs digital safety! Never share: your M-Pesa PIN, bank passwords, OTP codes. Beware: job scams (send KES 500 to get KES 5,000 — it's fake!), phishing texts, fake loan apps. If in doubt, call the official helpline.",
            quiz: {
              q: "Someone texts you: 'You've won KES 50,000! Send KES 200 to claim.' What should you do?",
              options: [
                "Send the KES 200 immediately",
                "Ignore it — it's a scam",
                "Share it with friends",
                "Call them back"
              ],
              answer: 1,
              explanation: "This is a classic advance-fee scam. Legitimate prizes never require upfront payment. Delete and report!"
            }
          }
        ]
      },
      medium: {
        xp: 200,
        lessons: [
          {
            title: "M-Shwari & Fuliza",
            content: "M-Shwari lets you save and earn interest. Fuliza is an 'overdraft' that lets you complete a transaction even if you don't have enough balance.",
            quiz: {
              q: "Which service is for SAVING money?",
              options: ["Fuliza", "M-Shwari", "KCB M-Pesa", "Okoa Jahazi"],
              answer: 1,
              explanation: "M-Shwari is a paperless banking service for saving and borrowing."
            }
          }
        ]
      },
      hard: {
        xp: 300,
        lessons: [
          {
            title: "Digital Security Deep Dive",
            content: "Never share your M-Pesa PIN! Scammers might call you pretending to be from Safaricom. Always verify before sending money.",
            quiz: {
              q: "A stranger calls saying they sent you money by mistake and asks for your PIN. What do you do?",
              options: ["Give them the PIN", "Hang up and report to 333", "Send them half", "Tell them your name"],
              answer: 1,
              explanation: "Safaricom will never ask for your PIN. Report fraud to 333."
            }
          }
        ]
      }
    }
  },
  {
    id: 4,
    title: "Entrepreneurship & Income",
    icon: "🦒",
    level: "Pioneer (16–19)",
    color: "#FF9800",
    badge: "🏅 Hustle Pioneer",
    county: "kisumu",
    ageGroup: "youth",
    difficulties: {
      easy: {
        xp: 200,
        lessons: [
          {
            title: "Types of Income",
            content: "Income comes in 3 types: 1) EARNED income — wages from work (most common). 2) PASSIVE income — rent, royalties, business profit while you sleep. 3) PORTFOLIO income — dividends and interest from investments. True wealth builders combine all three!",
            quiz: {
              q: "A student earns KES 500/month from a YouTube channel even when not posting. This is:",
              options: ["Earned income", "Passive income", "Portfolio income", "Donation"],
              answer: 1,
              explanation: "Passive income keeps flowing without active work. Once content is created, it generates ongoing revenue — a key wealth-building strategy!"
            }
          },
          {
            title: "Starting a Small Business",
            content: "Kenya's Youth Enterprise Development Fund and Uwezo Fund support young entrepreneurs. To start: 1) Find a problem to solve. 2) Research your market. 3) Create a simple business plan. 4) Start small, test, iterate. 5) Register with KRA and county government.",
            quiz: {
              q: "What is the FIRST step in starting a business?",
              options: [
                "Register with the government",
                "Identify a problem your business will solve",
                "Open a business bank account",
                "Hire employees"
              ],
              answer: 1,
              explanation: "Every successful business solves a real problem. Without a clear problem-solution fit, other steps don't matter!"
            }
          },
          {
            title: "Cash Flow & Profit",
            content: "Revenue − Costs = Profit. Cash flow is different — it's the timing of money in and out. A profitable business can still fail if customers don't pay on time! Track: Daily sales, weekly expenses, monthly profit. Use a simple spreadsheet or an app like Wave.",
            quiz: {
              q: "Your business earns KES 20,000 in sales but has KES 25,000 in expenses. Your profit/loss is:",
              options: [
                "Profit of KES 5,000",
                "Loss of KES 5,000",
                "Break even",
                "Revenue of KES 45,000"
              ],
              answer: 1,
              explanation: "20,000 − 25,000 = −5,000. A loss! You must either increase sales or cut costs. Monitoring cash flow prevents business failure."
            }
          }
        ]
      },
      medium: {
        xp: 300,
        lessons: [
          {
            title: "Business Scaling",
            content: "Scaling means growing your business without increasing costs at the same rate. This often involves automation or better systems.",
            quiz: {
              q: "What is scaling?",
              options: ["Shrinking", "Growing efficiently", "Closing down", "Hiring more"],
              answer: 1,
              explanation: "Scaling is about increasing capacity and revenue while maintaining or improving efficiency."
            }
          }
        ]
      },
      hard: {
        xp: 500,
        lessons: [
          {
            title: "Venture Capital & Equity",
            content: "Venture capital is money provided by investors to startups and small businesses that are thought to have long-term growth potential.",
            quiz: {
              q: "What do VC investors usually get in return for their money?",
              options: ["Interest", "Equity (Ownership)", "A thank you note", "A loan"],
              answer: 1,
              explanation: "VCs typically take an equity stake in the company in exchange for their investment."
            }
          }
        ]
      }
    }
  },
  {
    id: 5,
    title: "Investing for the Future",
    icon: "🦅",
    level: "Trailblazer (19–24)",
    color: "#9C27B0",
    badge: "🏆 Market Eagle",
    county: "eldoret",
    ageGroup: "young-adult",
    difficulties: {
      easy: {
        xp: 250,
        lessons: [
          {
            title: "Introduction to Investing",
            content: "Investing means putting money to work to grow over time. Key options in Kenya: NSE (Nairobi Securities Exchange) stocks, government bonds (T-Bills), unit trusts (CIC, Britam), real estate. The golden rule: diversify — don't put all eggs in one basket!",
            quiz: {
              q: "What does NSE stand for in Kenya's financial markets?",
              options: [
                "National Savings Exchange",
                "Nairobi Securities Exchange",
                "National Stock Enterprise",
                "New Savings Economy"
              ],
              answer: 1,
              explanation: "The Nairobi Securities Exchange (NSE) is Kenya's main stock market where you can buy shares in Kenyan companies like Safaricom, KCB, and Equity Bank."
            }
          },
          {
            title: "Risk vs. Return",
            content: "Higher potential return = higher risk. Low risk: savings accounts, T-Bills (3–10% p.a.). Medium risk: unit trusts, bonds (10–15% p.a.). High risk: stocks, real estate (15–30%+ p.a.). Match your risk level to your timeline and financial goals.",
            quiz: {
              q: "A young investor (age 20) saving for retirement at 60 should generally:",
              options: [
                "Invest only in savings accounts for safety",
                "Take on more risk since they have a long investment horizon",
                "Avoid investing altogether",
                "Only invest in government bonds"
              ],
              answer: 1,
              explanation: "With 40 years until retirement, a young investor can weather market ups and downs and benefit from higher-return investments. Time reduces risk!"
            }
          },
          {
            title: "The NSE & Buying Shares",
            content: "To buy NSE shares: 1) Open a CDS account (Central Depository System). 2) Choose a licensed stockbroker (Faida, AIB-AXYS, Old Mutual). 3) Start small — minimum investment is about KES 1,000. 4) Track using the NSE mobile app. Safaricom, Equity, and KCB are good starter stocks to research.",
            quiz: {
              q: "What is the FIRST step to buying shares on the NSE?",
              options: [
                "Deposit KES 1 million",
                "Open a CDS account through a licensed stockbroker",
                "Call the NSE directly",
                "Ask friends for stock tips"
              ],
              answer: 1,
              explanation: "A Central Depository System (CDS) account holds your shares electronically. It's free to open through a licensed stockbroker and is your gateway to investing!"
            }
          }
        ]
      },
      medium: {
        xp: 400,
        lessons: [
          {
            title: "Money Market Funds (MMF)",
            content: "MMFs are popular in Kenya. They pool money from many people to invest in safe things. They usually pay better interest than a normal savings account!",
            quiz: {
              q: "Why do people like MMFs in Kenya?",
              options: ["They are very risky", "They pay higher interest than savings", "They are only for banks", "They are free"],
              answer: 1,
              explanation: "MMFs offer a balance of safety and better returns than traditional bank accounts."
            }
          }
        ]
      },
      hard: {
        xp: 600,
        lessons: [
          {
            title: "Advanced Portfolio Theory",
            content: "Modern Portfolio Theory (MPT) suggests that it's possible to construct an 'efficient frontier' of optimal portfolios offering the maximum possible expected return for a given level of risk.",
            quiz: {
              q: "What is the 'Efficient Frontier'?",
              options: ["A border in Kenya", "Optimal portfolios for risk/return", "A new stock market", "A type of bond"],
              answer: 1,
              explanation: "The efficient frontier is the set of optimal portfolios that offer the highest expected return for a defined level of risk."
            }
          }
        ]
      }
    }
  },
  {
    id: 6,
    title: "Insurance & Risk Protection",
    icon: "🛡️",
    level: "Pioneer (16–19)",
    color: "#E63946",
    badge: "🔰 Shield Bearer",
    county: "garissa",
    ageGroup: "youth",
    difficulties: {
      easy: {
        xp: 200,
        lessons: [
          {
            title: "Why Insurance Matters",
            content: "Insurance protects you from financial disaster when bad things happen. You pay a small regular premium — if disaster strikes, the insurer pays a much larger amount. In Kenya: NHIF (now SHA) covers health, while companies like Jubilee, Britam, and APA cover life, motor, and property.",
            quiz: {
              q: "What is a premium in insurance?",
              options: [
                "The amount you receive when you claim",
                "The regular payment you make to maintain insurance coverage",
                "A bonus from the insurance company",
                "A type of savings account"
              ],
              answer: 1,
              explanation: "A premium is what you pay regularly (monthly/annually) to keep your insurance active. Think of it as paying a small amount to avoid a potentially huge loss."
            }
          },
          {
            title: "Types of Insurance in Kenya",
            content: "Key insurance types: 1) Health (SHA/NHIF) — hospital bills. 2) Life — protects family if you die. 3) Motor (3rd party is compulsory!). 4) Education — pays school fees if a parent dies. 5) Crop/livestock — for farmers. M-Tiba and Bima Ya Msee are mobile insurance options!",
            quiz: {
              q: "Which insurance is legally required for all motor vehicles in Kenya?",
              options: [
                "Comprehensive motor insurance",
                "Third-party motor insurance",
                "Life insurance",
                "NHIF"
              ],
              answer: 1,
              explanation: "Third-party motor insurance is legally mandatory in Kenya. It covers damage or injury you cause to other people — comprehensive insurance covers your own vehicle too."
            }
          },
          {
            title: "Making Smart Insurance Decisions",
            content: "Ask before buying: 1) What is covered? 2) What is excluded? (Check for 'exclusions'!) 3) What is the deductible/excess? 4) How do I claim? Read the fine print! Compare quotes on platforms like Insuarance.co.ke. Never buy insurance you don't understand.",
            quiz: {
              q: "An 'exclusion' in an insurance policy means:",
              options: [
                "An extra benefit you receive",
                "A situation or event that is NOT covered by the policy",
                "A discount on your premium",
                "A claim that was paid"
              ],
              answer: 1,
              explanation: "Exclusions define what the insurer will NOT cover. Always read these carefully — many disputes arise because customers didn't know their policy had exclusions!"
            }
          }
        ]
      },
      medium: {
        xp: 300,
        lessons: [
          {
            title: "Actuarial Science Basics",
            content: "Actuaries use math and statistics to estimate risk. This helps insurance companies decide how much premium to charge.",
            quiz: {
              q: "What do actuaries do?",
              options: ["Sell insurance", "Calculate risk", "Fix cars", "Treat patients"],
              answer: 1,
              explanation: "Actuaries are experts in risk management, using math to predict future events and their financial impact."
            }
          }
        ]
      },
      hard: {
        xp: 450,
        lessons: [
          {
            title: "Reinsurance & Solvency",
            content: "Reinsurance is 'insurance for insurance companies'. It helps them stay solvent even if there's a massive disaster that requires many claims to be paid at once.",
            quiz: {
              q: "What is Reinsurance?",
              options: ["Double insurance", "Insurance for insurers", "Canceling insurance", "Free insurance"],
              answer: 1,
              explanation: "Reinsurance allows insurance companies to transfer some of their risk to other companies."
            }
          }
        ]
      }
    }
  }
];

const IGCSE_TOPICS = [
  { code: "0450", subject: "Business Studies", modules: [1, 4], color: "#2196F3" },
  { code: "0455", subject: "Economics", modules: [2, 3, 5], color: "#4CAF50" },
  { code: "0452", subject: "Accounting", modules: [2, 4, 5], color: "#FF9800" },
];

const CBC_STRANDS = [
  { name: "Financial Literacy", modules: [1, 2, 3], grade: "Grades 4-9" },
  { name: "Entrepreneurship", modules: [4, 5], grade: "Senior School" },
  { name: "Risk Management", modules: [6], grade: "Senior School" },
];

// ─────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────

function XPBar({ xp, maxXp = 250 }) {
  const pct = Math.min((xp / maxXp) * 100, 100);
  return (
    <div className="bg-white/20 rounded-full h-2.5 overflow-hidden w-full">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
      />
    </div>
  );
}

function QuizCard({ quiz, onComplete }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
  };
  const handleSubmit = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  return (
    <div className="bg-black/30 rounded-2xl p-5 mt-4">
      <div className="text-[10px] text-yellow-400 font-bold mb-2 tracking-widest uppercase">🎯 Knowledge Check</div>
      <p className="font-semibold mb-3.5 text-[15px]">{quiz.q}</p>
      <div className="flex flex-col gap-2">
        {quiz.options.map((opt, i) => {
          let bg = "bg-white/10";
          let border = "border-white/20";
          if (revealed) {
            if (i === quiz.answer) { bg = "bg-green-500/40"; border = "border-green-500"; }
            else if (i === selected) { bg = "bg-red-500/30"; border = "border-red-500"; }
          } else if (selected === i) {
            bg = "bg-orange-500/30"; border = "border-orange-500";
          }
          return (
            <button 
              key={i} 
              onClick={() => handleSelect(i)} 
              className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${bg} ${border} ${revealed ? 'cursor-default' : 'cursor-pointer hover:bg-white/15'}`}
            >
              <span className="opacity-50 mr-2">{String.fromCharCode(65+i)}.</span>{opt}
            </button>
          );
        })}
      </div>
      {!revealed && (
        <button 
          onClick={handleSubmit} 
          disabled={selected === null} 
          className={`mt-4 w-full p-3 rounded-xl font-bold text-sm transition-all ${selected !== null ? 'bg-gradient-to-r from-orange-500 to-orange-600 cursor-pointer' : 'bg-white/10 cursor-not-allowed opacity-50'}`}
        >
          Submit Answer
        </button>
      )}
      {revealed && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className={`rounded-xl p-3.5 border ${selected === quiz.answer ? 'bg-green-500/20 border-green-500' : 'bg-red-500/15 border-red-500'}`}>
            <div className="font-bold mb-1.5">
              {selected === quiz.answer ? "✅ Correct! +10 XP" : "❌ Not quite..."}
            </div>
            <p className="text-xs opacity-90 leading-relaxed">{quiz.explanation}</p>
          </div>
          <button 
            onClick={onComplete} 
            className="mt-3 w-full p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-bold text-sm cursor-pointer"
          >
            Continue → Next Lesson
          </button>
        </motion.div>
      )}
    </div>
  );
}

function NearbyFinder() {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const findNearby = async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Find nearby financial institutions like banks, SACCOs, and M-Pesa agents. Provide a list with names and locations.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            }
          }
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const mapsData = chunks
          .filter(c => c.maps)
          .map(c => ({
            title: c.maps.title,
            uri: c.maps.uri
          }));
        setPlaces(mapsData);
      } else {
        setError("No nearby financial institutions found.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not access location or find nearby places.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Financial Hub Finder</h3>
            <p className="text-[10px] opacity-60 uppercase tracking-wider">Powered by Google Maps</p>
          </div>
        </div>
        <p className="text-xs opacity-80 mb-4 leading-relaxed">
          Need to find a bank, SACCO, or M-Pesa agent near you? Use our real-time finder to locate the closest financial services.
        </p>
        <button 
          onClick={findNearby}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Searching..." : "Find Nearby Services"}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl text-xs text-red-200 flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        {places.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <h4 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest px-1">Results Found</h4>
            {places.map((place, idx) => (
              <motion.a
                key={idx}
                href={place.uri}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Navigation className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">{place.title}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DifficultySelector({ module, onSelect, onBack }: { module: any, onSelect: (diff: string) => void, onBack: () => void }) {
  const diffs = [
    { id: 'easy', label: 'Easy Safari', icon: '🌱', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Basic concepts & simple quizzes', xp: module.difficulties.easy.xp },
    { id: 'medium', label: 'Pro Ranger', icon: '🌿', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', desc: 'Practical application & M-Pesa deep-dives', xp: module.difficulties.medium.xp },
    { id: 'hard', label: 'Market Legend', icon: '🌳', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', desc: 'Economic theory & complex simulations', xp: module.difficulties.hard.xp },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <button onClick={onBack} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-xs mb-6 hover:bg-white/20 transition-colors">
        ← Back to Map
      </button>
      
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{module.icon}</div>
        <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
        <p className="text-sm opacity-60">Choose your safari difficulty level</p>
      </div>

      <div className="space-y-4">
        {diffs.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`w-full p-5 rounded-2xl border ${d.bg} ${d.border} flex items-center justify-between hover:scale-[1.02] transition-transform text-left group`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{d.icon}</div>
              <div>
                <div className={`font-bold text-lg ${d.color}`}>{d.label}</div>
                <div className="text-[10px] opacity-50">{d.desc}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-yellow-400">+{d.xp} XP</div>
              <div className="text-[10px] opacity-40 uppercase tracking-wider">Potential</div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

interface LessonViewProps {
  module: any;
  difficulty: string;
  onBack: () => void;
  earnedXp: number;
  setEarnedXp: React.Dispatch<React.SetStateAction<number>>;
  completedLessons: string[];
  setCompletedLessons: React.Dispatch<React.SetStateAction<string[]>>;
}

function LessonView({ module, difficulty, onBack, earnedXp, setEarnedXp, completedLessons, setCompletedLessons }: LessonViewProps) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [phase, setPhase] = useState<"read" | "quiz" | "done">("read");
  const lessons = module.difficulties[difficulty].lessons;
  const lesson = lessons[lessonIdx];
  const modKey = `mod_${module.id}_${difficulty}`;

  const handleQuizComplete = () => {
    const key = `${modKey}_lesson_${lessonIdx}`;
    if (!completedLessons.includes(key)) {
      setCompletedLessons((prev: string[]) => [...prev, key]);
      const xpPerLesson = Math.floor(module.difficulties[difficulty].xp / lessons.length);
      setEarnedXp((prev: number) => prev + xpPerLesson);
    }
    if (lessonIdx < lessons.length - 1) {
      setLessonIdx(i => i + 1);
      setPhase("read");
    } else {
      setPhase("done");
    }
  };

  if (phase === "done") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="text-6xl mb-4">{module.icon}</div>
        <h2 className="text-2xl font-bold mb-2">Module Complete! 🎉</h2>
        <p className="opacity-80 mb-4 text-sm">You earned the <strong>{module.badge}</strong> on <strong>{difficulty}</strong></p>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/50 rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-2">{module.badge.split(" ")[0]}</div>
          <div className="font-bold text-lg">{module.badge}</div>
          <div className="text-xs opacity-70 mt-1">+{module.difficulties[difficulty].xp} XP earned</div>
        </div>
        <button 
          onClick={onBack} 
          className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20"
        >
          ← Back to Difficulty
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex justify-between items-center mb-5">
        <button 
          onClick={onBack} 
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-xs hover:bg-white/20 transition-colors"
        >
          ← Change Difficulty
        </button>
        <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
          difficulty === 'easy' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          difficulty === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
          'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {difficulty}
        </div>
      </div>

      <div className="flex gap-1 mb-5">
        {lessons.map((_: any, i: number) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-500 ${i <= lessonIdx ? 'bg-orange-500' : 'bg-white/20'}`} />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl text-2xl bg-white/10 flex items-center justify-center border border-white/10">
          {module.icon}
        </div>
        <div>
          <div className="font-bold text-lg">{lesson.title}</div>
          <div className="text-[10px] opacity-60 uppercase tracking-wider">Lesson {lessonIdx + 1} of {lessons.length} • {module.level}</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 text-[15px] leading-relaxed mb-4 border-l-4 border-orange-500">
        {lesson.content}
      </div>

      {phase === "read" && (
        <button 
          onClick={() => setPhase("quiz")} 
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20"
        >
          Test Your Knowledge 🎯
        </button>
      )}
      {phase === "quiz" && (
        <QuizCard quiz={lesson.quiz} onComplete={handleQuizComplete} />
      )}
    </motion.div>
  );
}

function SafariMap({ modules, completedLessons, earnedXp, onSelectModule }: any) {
  const [hovered, setHovered] = useState<string | null>(null);

  const getModuleProgress = (mod: any) => {
    // Show progress for 'easy' as the baseline for the map view
    const done = mod.difficulties.easy.lessons.filter((_: any, i: number) =>
      completedLessons.includes(`mod_${mod.id}_easy_lesson_${i}`)
    ).length;
    return { done, total: mod.difficulties.easy.lessons.length };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "XP Earned", value: earnedXp, icon: "⚡" },
          { label: "Lessons Done", value: completedLessons.length, icon: "📚" },
          { label: "Badges", value: modules.filter((m: any) =>
            m.difficulties.easy.lessons.every((_: any, i: number) => completedLessons.includes(`mod_${m.id}_easy_lesson_${i}`))).length, icon: "🏅" },
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-black text-xl text-yellow-400 leading-none mb-1">{stat.value}</div>
            <div className="text-[8px] opacity-50 uppercase tracking-widest font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Kenya Map Visual */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/50 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
        <div className="text-[10px] text-yellow-400 font-bold tracking-widest mb-3 uppercase">🗺️ Kenya Safari Trail</div>
        <div className="relative h-44">
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 opacity-20">
            <path d="M35,10 L65,8 L75,20 L80,35 L72,55 L75,70 L65,80 L55,85 L50,95 L42,85 L25,75 L20,60 L15,45 L25,25 Z"
              fill="none" stroke="#4CAF50" strokeWidth="1" />
            <ellipse cx="25" cy="55" rx="8" ry="6" fill="rgba(33,150,243,0.3)" stroke="#2196F3" strokeWidth="0.5" />
          </svg>

          {COUNTIES.map(county => {
            const mod = modules.find((m: any) => m.county === county.id);
            const prog = mod ? getModuleProgress(mod) : { done: 0, total: 0 };
            const isComplete = mod && prog.done === prog.total;
            const isHov = hovered === county.id;
            return (
              <button 
                key={county.id}
                onMouseEnter={() => setHovered(county.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => mod && onSelectModule(mod)}
                className={`absolute w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all duration-300 -translate-x-1/2 -translate-y-1/2 ${isComplete ? 'bg-emerald-500/80 border-emerald-400' : 'bg-white/10 border-white/20'} ${isHov ? 'scale-125 z-10 shadow-lg shadow-white/20' : 'z-1'}`}
                style={{ left: `${county.x}%`, top: `${county.y}%`, borderColor: county.color }}
              >
                {isComplete ? "✅" : county.emoji}
                <AnimatePresence>
                  {isHov && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 rounded-lg px-2 py-1 text-[10px] whitespace-nowrap font-bold border border-white/20"
                    >
                      {county.name} {mod && <span className="opacity-60">• {prog.done}/{prog.total}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Cards */}
      <div className="space-y-3">
        <div className="text-[10px] text-yellow-400 font-bold tracking-widest uppercase px-1">📋 Quest Modules</div>
        {modules.map((mod: any) => {
          const prog = getModuleProgress(mod);
          const isComplete = prog.done === prog.total;
          return (
            <button 
              key={mod.id} 
              onClick={() => onSelectModule(mod)} 
              className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border ${isComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <div className="w-12 h-12 rounded-xl text-2xl bg-white/10 flex items-center justify-center border border-white/10 flex-shrink-0">
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-0.5 truncate">{mod.title}</div>
                <div className="text-[10px] opacity-50 mb-2 uppercase tracking-wider">{mod.level}</div>
                <XPBar xp={prog.done * (mod.difficulties.easy.xp / mod.difficulties.easy.lessons.length)} maxXp={mod.difficulties.easy.xp} />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-bold text-yellow-400">+{mod.difficulties.easy.xp} XP</div>
                <div className="text-xs opacity-40 font-bold">{prog.done}/{prog.total}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurriculumTab({ modules }: any) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] text-yellow-400 font-bold tracking-widest mb-3 uppercase">🎓 CBC Alignment</div>
        {CBC_STRANDS.map(strand => (
          <div key={strand.name} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3.5 mb-2.5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-bold text-sm">📗 {strand.name}</span>
              <span className="text-[10px] text-green-400 font-bold">{strand.grade}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {strand.modules.map(mId => {
                const mod = modules.find((m: any) => m.id === mId);
                return mod ? (
                  <span key={mId} className="bg-green-500/20 rounded-lg px-2 py-1 text-[10px] text-green-200 font-medium">
                    {mod.icon} {mod.title}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] text-yellow-400 font-bold tracking-widest mb-3 uppercase">📘 IGCSE Alignment</div>
        {IGCSE_TOPICS.map(topic => (
          <div key={topic.code} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 mb-2.5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-bold text-sm">📘 {topic.subject}</span>
              <span className="text-[10px] bg-blue-500/30 px-2 py-0.5 rounded-md text-blue-200 font-bold">Code {topic.code}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topic.modules.map(mId => {
                const mod = modules.find((m: any) => m.id === mId);
                return mod ? (
                  <span key={mId} className="bg-blue-500/20 rounded-lg px-2 py-1 text-[10px] text-blue-200 font-medium">
                    {mod.icon} {mod.title}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="font-bold mb-2 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-400" />
          CFP® Competency Framework
        </div>
        <p className="text-[11px] opacity-70 leading-relaxed">
          All modules are built on the CFP Board's Financial Planning Competency Handbook
          and localized for the Kenyan context — using M-Pesa, NSE, SHA, and CBC/IGCSE assessment frameworks.
        </p>
      </div>
    </div>
  );
}

function PartnersTab() {
  const partners = [
    { name: "Airtel Money", type: "Mobile Money", emoji: "📲", benefit: "Cashless quest rewards" },
    { name: "M-Pesa", type: "Mobile Money", emoji: "💚", benefit: "In-app savings challenges" },
    { name: "M-Changa", type: "Fundraising", emoji: "🤝", benefit: "Group saving quests" },
    { name: "British Council", type: "Education", emoji: "🎓", benefit: "IGCSE content validation" },
    { name: "Visa / Mastercard", type: "Payments", emoji: "💳", benefit: "Digital payment literacy" },
    { name: "Asset Managers", type: "Investment", emoji: "📈", benefit: "Investment simulations" },
    { name: "Insurance Companies", type: "Insurance", emoji: "🛡️", benefit: "Risk module sponsorship" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] text-yellow-400 font-bold tracking-widest mb-4 uppercase">🤝 Strategic Partners</div>
        <div className="space-y-2">
          {partners.map(p => (
            <div key={p.name} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-[10px] opacity-40 uppercase tracking-wider">{p.type}</div>
              </div>
              <div className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md max-w-[100px] text-right">
                {p.benefit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="font-bold text-xs mb-3">💰 Revenue Model</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { item: "Licensing", desc: "School subscriptions" },
            { item: "Fee-for-service", desc: "Individual learners" },
            { item: "Impact Grants", desc: "Phase 1 funding" },
            { item: "Partner Sponsorship", desc: "Branded quests" },
          ].map(r => (
            <div key={r.item} className="bg-white/5 rounded-lg p-2.5">
              <div className="font-bold text-[10px] text-blue-400 mb-0.5">{r.item}</div>
              <div className="text-[9px] opacity-50 leading-tight">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────
function AchievementsTab({ modules, completedLessons, earnedXp }: any) {
  const achievements = [
    {
      id: "nairobi_explorer",
      title: "Nairobi Explorer",
      description: "Complete all modules in Nairobi",
      icon: <MapPin className="w-6 h-6 text-red-400" />,
      check: () => modules
        .filter((m: any) => m.county === "nairobi")
        .every((m: any) => 
          m.difficulties.easy.lessons.every((_: any, i: number) => 
            completedLessons.includes(`mod_${m.id}_easy_lesson_${i}`)
          )
        ),
      xp: 500
    },
    {
      id: "hardcore_ranger",
      title: "Hardcore Ranger",
      description: "Master all Hard difficulties",
      icon: <Trophy className="w-6 h-6 text-orange-400" />,
      check: () => modules.every((m: any) => 
        m.difficulties.hard.lessons.every((_: any, i: number) => 
          completedLessons.includes(`mod_${m.id}_hard_lesson_${i}`)
        )
      ),
      xp: 2000
    },
    {
      id: "high_roller",
      title: "High Roller",
      description: "Earn 1000 XP in total",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      check: () => earnedXp >= 1000,
      xp: 1000
    },
    {
      id: "quick_learner",
      title: "Quick Learner",
      description: "Complete your first lesson",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      check: () => completedLessons.length > 0,
      xp: 100
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-bold">Your Achievements</h2>
        <p className="text-sm opacity-60">Unlock medals as you master the safari</p>
      </div>

      <div className="grid gap-4">
        {achievements.map((ach) => {
          const isUnlocked = ach.check();
          return (
            <div 
              key={ach.id}
              className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${isUnlocked ? 'bg-white/10 border-orange-500/50' : 'bg-white/5 border-white/10 opacity-50 grayscale'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-orange-500/20' : 'bg-white/10'}`}>
                {ach.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{ach.title}</div>
                <div className="text-[10px] opacity-60">{ach.description}</div>
              </div>
              {isUnlocked ? (
                <div className="text-orange-500">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              ) : (
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Locked</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("trail");
  const [activeModule, setActiveModule] = useState<any>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  const TABS = [
    { id: "trail", label: "🗺️ Trail", icon: "🗺️" },
    { id: "achievements", label: "🏆 Medals", icon: "🏆" },
    { id: "nearby", label: "📍 Nearby", icon: "📍" },
    { id: "curriculum", label: "📚 Studies", icon: "📚" },
    { id: "partners", label: "🤝 Partners", icon: "🤝" },
  ];

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white selection:bg-orange-500/30">
      {/* Background Effects */}
      <div className="fixed -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* Welcome Splash */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0D1B2A] flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-8xl mb-6"
            >
              🦁
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
            >
              Kidz & Kash
            </motion.h1>
            <p className="text-blue-400 font-bold text-sm mt-2 tracking-widest uppercase">Financial Safari</p>
            <div className="mt-12 text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">Loading Trail...</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Header */}
        <header className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent leading-none">Kidz & Kash</h1>
            <p className="text-[8px] text-blue-400 font-black tracking-widest uppercase mt-1">Financial Literacy Safari</p>
          </div>
          <div className="text-right w-24">
            <div className="text-[10px] opacity-50 font-bold mb-1">⚡ {earnedXp} XP</div>
            <XPBar xp={earnedXp} maxXp={500} />
          </div>
        </header>

        {/* Main Content */}
        <main>
          <AnimatePresence mode="wait">
            {activeModule ? (
              selectedDifficulty ? (
                <LessonView
                  module={activeModule}
                  difficulty={selectedDifficulty}
                  onBack={() => setSelectedDifficulty(null)}
                  earnedXp={earnedXp}
                  setEarnedXp={setEarnedXp}
                  completedLessons={completedLessons}
                  setCompletedLessons={setCompletedLessons}
                />
              ) : (
                <DifficultySelector
                  module={activeModule}
                  onSelect={(diff) => setSelectedDifficulty(diff)}
                  onBack={() => setActiveModule(null)}
                />
              )
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {tab === "trail" && (
                  <SafariMap
                    modules={MODULES}
                    completedLessons={completedLessons}
                    earnedXp={earnedXp}
                    onSelectModule={setActiveModule}
                  />
                )}
                {tab === "achievements" && (
                  <AchievementsTab 
                    modules={MODULES} 
                    completedLessons={completedLessons} 
                    earnedXp={earnedXp} 
                  />
                )}
                {tab === "nearby" && <NearbyFinder />}
                {tab === "curriculum" && <CurriculumTab modules={MODULES} />}
                {tab === "partners" && <PartnersTab />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation */}
      {!activeModule && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1B2A]/90 backdrop-blur-xl border-t border-white/10 pb-6 pt-2 px-2">
          <div className="max-w-md mx-auto flex">
            {TABS.map(t => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)} 
                className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all ${tab === t.id ? 'text-orange-500' : 'text-white/40'}`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.label.split(" ")[1]}</span>
                {tab === t.id && <motion.div layoutId="nav-indicator" className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

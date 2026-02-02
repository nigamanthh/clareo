const questions = [
  {
    text: "A car travels 60 m in 10 s at constant speed. What is its average velocity?",
    options: ["6 m/s", "10 m/s", "600 m/s", "0 m/s"],
    answer: "A"
  },
  {
    text: "A particle starts from rest and moves with constant acceleration of 2 m/s² for 5 s. What distance does it cover?",
    options: ["10 m", "20 m", "25 m", "50 m"],
    answer: "C"
  },
  {
    text: "In a velocity-time graph, a straight line from (0,0) to (4 s, 8 m/s) represents what?",
    options: ["Constant velocity", "Constant acceleration of 2 m/s²", "Deceleration", "Rest"],
    answer: "B"
  },
  {
    text: "A body moves 20 m north, then 20 m south in 10 s total. What is the magnitude of average velocity?",
    options: ["4 m/s", "2 m/s", "0 m/s", "40 m/s"],
    answer: "A"
  },
  {
    text: "If displacement x = 3t² (in meters, t in seconds), what is velocity at t=2 s?",
    options: ["6 m/s", "12 m/s", "24 m/s", "3 m/s"],
    answer: "B"
  },
  {
    text: "Average acceleration is change in velocity divided by:",
    options: ["Distance", "Displacement", "Time", "Speed"],
    answer: "C"
  },
  {
    text: "A ball thrown upward reaches max height in 2 s (g=10 m/s²). What is initial speed?",
    options: ["10 m/s", "20 m/s", "5 m/s", "15 m/s"],
    answer: "B"
  },
  {
    text: "For constant acceleration, which graph is a straight line?",
    options: ["Position vs time", "Velocity vs time", "Both A and B", "Acceleration vs time only"],
    answer: "D"
  },
  {
    text: "A particle decelerates from 10 m/s to rest in 5 s. Average acceleration magnitude?",
    options: ["2 m/s²", "5 m/s²", "10 m/s²", "50 m/s²"],
    answer: "A"
  },
  {
    text: "In v-t graph, area under curve from t=0 to t=3 s gives:",
    options: ["Acceleration", "Displacement", "Speed", "Jerk"],
    answer: "B"
  },
  {
    text: "Two cars approach each other at 10 m/s and 20 m/s. Closing speed?",
    options: ["10 m/s", "20 m/s", "30 m/s", "0 m/s"],
    answer: "C"
  },
  {
    text: "A bus accelerates at 1 m/s² from rest. Time to cover 50 m?",
    options: ["5 s", "10 s", "25 s", "50 s"],
    answer: "B"
  },
  {
    text: "Train A (20 m/s) passes Train B (10 m/s, same direction). Relative speed?",
    options: ["10 m/s", "30 m/s", "20 m/s", "0 m/s"],
    answer: "A"
  },
  {
    text: "Object falls freely for 3 s (g=10 m/s²). Distance fallen?",
    options: ["15 m", "30 m", "45 m", "60 m"],
    answer: "C"
  },
  {
    text: "If x = 5t + ½at², acceleration is:",
    options: ["5 m/s²", "a m/s²", "t m/s²", "Constant zero"],
    answer: "B"
  },
  {
    text: "Bullet slows from 10 m/s to 5 m/s over 20 m. Average acceleration?",
    options: ["-1.25 m/s²", "-2.5 m/s²", "1.25 m/s²", "2.5 m/s²"],
    answer: "A"
  },
  {
    text: "Car catches bus: Car a=3 m/s², bus a=1 m/s², initial gap 36 m. Time?",
    options: ["3 s", "6 s", "9 s", "12 s"],
    answer: "B"
  },
  {
    text: "v = 4 - 2t (m/s). Distance in first 2 s?",
    options: ["0 m", "4 m", "8 m", "2 m"],
    answer: "B"
  },
  {
    text: "Particle at rest, then constant velocity 5 m/s for 4 s. Total displacement?",
    options: ["5 m", "10 m", "20 m", "0 m"],
    answer: "C"
  },
  {
    text: "From height 20 m, time to ground (g=10 m/s², ignore air)?",
    options: ["1 s", "2 s", "4 s", "√2 s"],
    answer: "B"
  }
];

let current = 0;
const userAnswers = Array(questions.length).fill(null); // store selected option
const attempts = Array(questions.length).fill(0);       // track number of attempts per question

const qText = document.getElementById("q-text");
const qNumber = document.getElementById("q-number");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const backBtn = document.getElementById("back-btn");
const completion = document.getElementById("completion");

function renderQuestion(index) {
  if (index >= questions.length) {
    document.getElementById("question-card").style.display = "none";
    completion.style.display = "block";
    return;
  }

  qNumber.textContent = `Question ${index + 1}`;
  qText.textContent = questions[index].text;
  optionsContainer.innerHTML = "";
  feedback.textContent = "";

  questions[index].options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.classList.add("option");
    div.dataset.answer = String.fromCharCode(65 + i);
    div.textContent = `${String.fromCharCode(65 + i)}) ${opt}`;

    // Highlight previously selected
    if (userAnswers[index] === div.dataset.answer) div.classList.add("selected");

    // Do NOT show correct answer yet if attempts < 2
    if (attempts[index] >= 2 && div.dataset.answer === questions[index].answer) {
      div.classList.add("correct");
    }

    div.addEventListener("click", () => {
      document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
      div.classList.add("selected");
      userAnswers[index] = div.dataset.answer;
      feedback.textContent = "";
    });

    optionsContainer.appendChild(div);
  });
}

// Check Answer
checkBtn.addEventListener("click", () => {
  const selected = document.querySelector(".option.selected");
  if (!selected) {
    feedback.textContent = "⚠️ Please select an option.";
    return;
  }

  const correctAnswer = questions[current].answer;

  if (selected.dataset.answer === correctAnswer) {
    selected.classList.add("correct");
    feedback.textContent = "✅ Correct! Well done, explorer.";
    attempts[current] = 2; // mark question complete
  } else {
    attempts[current]++;
    selected.classList.add("wrong");
    if (attempts[current] < 2) {
      feedback.textContent = "❌ Incorrect. Try again!";
    } else {
      feedback.textContent = `❌ Incorrect again. The correct answer is ${correctAnswer}.`;
      // highlight correct answer after 2nd wrong attempt
      document.querySelectorAll(".option").forEach(o => {
        if (o.dataset.answer === correctAnswer) o.classList.add("correct");
      });
    }
  }
});

// Navigation
nextBtn.addEventListener("click", () => {
  if (current < questions.length - 1) current++;
  renderQuestion(current);
});

prevBtn.addEventListener("click", () => {
  if (current > 0) current--;
  renderQuestion(current);
});

backBtn.addEventListener("click", () => {
  window.location.href = "../choosegalaxy/try3.html";
});

renderQuestion(current);

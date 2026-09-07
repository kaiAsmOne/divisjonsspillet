const state = {
  problem: null,
  solvedSteps: [],
  mistakeMade: false,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
};

const el = {
  layout: document.getElementById("division-layout"),
  promptText: document.getElementById("prompt-text"),
  form: document.getElementById("answer-form"),
  input: document.getElementById("answer-input"),
  feedback: document.getElementById("feedback"),
  nextArea: document.getElementById("next-area"),
  nextBtn: document.getElementById("next-btn"),
  interactionArea: document.getElementById("interaction-area"),
  score: document.getElementById("score"),
  correctCount: document.getElementById("correct-count"),
  wrongCount: document.getElementById("wrong-count"),
  streak: document.getElementById("streak"),
};

async function loadNewProblem() {
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.nextArea.style.display = "none";
  el.interactionArea.style.display = "block";

  const res = await fetch("/api/problem");
  const problem = await res.json();

  state.problem = problem;
  state.solvedSteps = [];
  state.mistakeMade = false;

  render();
  el.input.value = "";
  el.input.focus();
}

function currentStepIndex() {
  return state.solvedSteps.length;
}

// Index up to which the dividend has been "revealed" - either genuinely
// solved by the user, or fully shown because a mistake was made.
function resolvedIndex() {
  const { steps } = state.problem;
  if (state.mistakeMade || state.solvedSteps.length === steps.length) {
    return steps.length;
  }
  return state.solvedSteps.length;
}

function render() {
  renderHeadline();
  renderStepPanels();
  renderPrompt();
}

function buildDividendDigits() {
  const { dividend, steps } = state.problem;
  const digits = String(dividend).split("");
  const revealed = resolvedIndex();

  let html = "";

  digits.forEach((digit, i) => {
    // A carry token sits between digit i-1 and digit i, showing the
    // remainder that gets carried down. It's only shown once digit i-1
    // has actually been resolved.
    if (i > 0 && i <= revealed) {
      const carryValue = steps[i - 1].remainder_after;
      html += `<span class="carry-badge" title="Rest fra forrige steg">${carryValue}</span>`;
    }

    let cls = "future";
    if (i < revealed) cls = "used";
    else if (i === revealed) cls = "current";

    html += `<span class="digit-box ${cls}">${digit}</span>`;
  });

  return html;
}

function renderHeadline() {
  const { divisor, steps } = state.problem;

  let quotientHtml = "";
  for (let i = 0; i < steps.length; i++) {
    if (i < state.solvedSteps.length) {
      quotientHtml += `<span class="solved">${state.solvedSteps[i].quotient_digit}</span>`;
    } else if (state.mistakeMade) {
      quotientHtml += `<span class="solved">${steps[i].quotient_digit}</span>`;
    } else {
      quotientHtml += `<span class="blank">&nbsp;</span>`;
    }
  }

  el.layout.innerHTML = `
    <div class="division-row">
      ${buildDividendDigits()}
      <span class="colon-eq">: ${divisor} =</span>
      <span class="quotient-part">${quotientHtml}</span>
    </div>
    <div id="step-panels"></div>
  `;
}

function calcValueHtml(step, index) {
  // For step 0 the current value IS the first digit - nothing to split.
  if (index === 0) {
    return `${step.current_value}`;
  }
  const prevRemainder = state.problem.steps[index - 1].remainder_after;
  const digit = step.brought_down_digit;
  return `<span class="carry-text">${prevRemainder}</span><span class="digit-text">${digit}</span>`;
}

function stepPanelHtml(step, index, label) {
  return `
    <div class="step-panel">
      <div class="step-title">${label}</div>
      <div class="calc-line"><div class="calc-row">${calcValueHtml(step, index)}</div></div>
      <div class="calc-line"><div class="calc-row">&minus;${step.multiply_result}</div></div>
      <div class="divider"></div>
      <div class="calc-line"><div class="calc-row">${step.remainder_after}</div></div>
    </div>
  `;
}

function renderStepPanels() {
  const container = document.getElementById("step-panels");
  let html = "";

  state.solvedSteps.forEach((step, i) => {
    html += stepPanelHtml(step, i, `Steg ${i + 1} (din løsning)`);
  });

  if (state.mistakeMade) {
    const steps = state.problem.steps;
    for (let i = state.solvedSteps.length; i < steps.length; i++) {
      html += stepPanelHtml(steps[i], i, `Steg ${i + 1} (fasit)`);
    }
  }

  container.innerHTML = html;
}

function renderPrompt() {
  const { steps, divisor } = state.problem;

  if (state.mistakeMade || state.solvedSteps.length === steps.length) {
    el.interactionArea.style.display = "none";
    return;
  }

  el.interactionArea.style.display = "block";
  const idx = currentStepIndex();
  const step = steps[idx];

  if (idx === 0) {
    el.promptText.textContent = `Se på det første sifferet: ${step.brought_down_digit}. Hva blir ${step.current_value} : ${divisor}?`;
  } else if (idx === steps.length - 1) {
    el.promptText.textContent = `Ta med resten og hent ned siste siffer, som gir ${step.current_value}. Hva blir ${step.current_value} : ${divisor}?`;
  } else {
    el.promptText.textContent = `Ta med resten og hent ned neste siffer, som gir ${step.current_value}. Hva blir ${step.current_value} : ${divisor}?`;
  }
}

function updateScoreboard() {
  el.score.textContent = state.score;
  el.correctCount.textContent = state.correctCount;
  el.wrongCount.textContent = state.wrongCount;
  el.streak.textContent = state.streak;
}

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = el.input.value.trim();
  if (val === "") return;

  const userAnswer = parseInt(val, 10);
  const idx = currentStepIndex();
  const step = state.problem.steps[idx];

  if (userAnswer === step.quotient_digit) {
    state.solvedSteps.push(step);
    el.input.value = "";

    if (state.solvedSteps.length === state.problem.steps.length) {
      state.score += 10;
      state.correctCount += 1;
      state.streak += 1;
      updateScoreboard();

      el.feedback.textContent = `Godt jobba! ${state.problem.dividend} : ${state.problem.divisor} = ${state.problem.quotient}. +10 dollar`;
      el.feedback.className = "feedback correct";
      render();
      el.nextArea.style.display = "block";
    } else {
      el.feedback.textContent = "Riktig steg!";
      el.feedback.className = "feedback correct";
      render();
      el.input.focus();
    }
  } else {
    state.mistakeMade = true;
    state.wrongCount += 1;
    state.streak = 0;
    updateScoreboard();

    el.feedback.textContent = `Ikke helt. På dette steget skulle svaret vært ${step.quotient_digit}. Se fasiten under.`;
    el.feedback.className = "feedback wrong";
    render();
    el.nextArea.style.display = "block";
  }
});

el.nextBtn.addEventListener("click", loadNewProblem);

loadNewProblem();

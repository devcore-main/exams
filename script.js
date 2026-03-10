let currentQuestion = 0
let answers = {}
let studentName = ""
let time = 1800
let timerInterval

// ===== ADMIN ACCESS =====
// Secret: press Ctrl + Shift + A to open admin panel
document.addEventListener("keydown", function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === "A") {
    window.location.href = "admin.html"
  }
})

// ===== SIDEBAR HAMBURGER =====
function openSidebar() {
  document.getElementById("sidebarDrawer").classList.add("open")
  document.getElementById("sidebarOverlay").classList.add("active")
}

function closeSidebar() {
  document.getElementById("sidebarDrawer").classList.remove("open")
  document.getElementById("sidebarOverlay").classList.remove("active")
}

// ===== EXAM LOGIC =====
function startExam() {

  studentName = document.getElementById("studentName").value

  if (studentName === "") {
    alert("Enter your name")
    return
  }

  document.getElementById("student").innerText = studentName

  document.getElementById("startScreen").style.display = "none"
  document.getElementById("exam").style.display = "flex"

  startTimer()
  generateSidebar()
  loadQuestion()

}

function startTimer() {

  timerInterval = setInterval(() => {

    time--

    let minutes = Math.floor(time / 60)
    let seconds = time % 60

    document.getElementById("timer").innerText =
      `${minutes}:${seconds.toString().padStart(2,"0")}`

    if (time <= 0) {
      finishExam(true)
    }

  }, 1000)

}

function loadQuestion() {

  let q = QUESTIONS[currentQuestion]

  document.getElementById("progress").innerText =
    `Question ${currentQuestion+1} / ${QUESTIONS.length}`

  document.getElementById("question").innerText = q.question

  let options = q.Choices[0]

  let html = ""

  for (let key in options) {
    html += `
<label class="choice">
<input type="radio" name="choice" value="${key}"
${answers[currentQuestion]===key?"checked":""}>
${key}: ${options[key]}
</label>
`
  }

  document.getElementById("choices").innerHTML = html
  document.getElementById("error").style.display = "none"

  updateSidebar()
}

function nextQuestion() {

  let selected = document.querySelector('input[name="choice"]:checked')

  if (!selected) {
    document.getElementById("error").style.display = "block"
    return
  }

  document.getElementById("error").style.display = "none"
  answers[currentQuestion] = selected.value

  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion++
    loadQuestion()
  } else {
    // Check all questions answered before finishing
    let unanswered = []
    QUESTIONS.forEach((q, i) => {
      if (!answers[i]) unanswered.push(i + 1)
    })

    if (unanswered.length > 0) {
      alert(`⚠️ You still have ${unanswered.length} unanswered question(s):\nQuestions: ${unanswered.join(", ")}\n\nPlease answer all questions before submitting.`)
      return
    }

    finishExam(false)
  }

}

function prevQuestion() {

  let selected = document.querySelector('input[name="choice"]:checked')
  if (selected) {
    answers[currentQuestion] = selected.value
  }

  if (currentQuestion > 0) {
    currentQuestion--
    loadQuestion()
  }

}

function finishExam(timeUp) {

  clearInterval(timerInterval)

  // If time ran out, fill unanswered with "None"
  if (timeUp) {
    QUESTIONS.forEach((q, i) => {
      if (!answers[i]) answers[i] = null
    })
  } else {
    // Final check: must answer all
    let unanswered = []
    QUESTIONS.forEach((q, i) => {
      if (!answers[i]) unanswered.push(i + 1)
    })
    if (unanswered.length > 0) {
      alert(`⚠️ Please answer all questions before submitting.\nUnanswered: ${unanswered.join(", ")}`)
      return
    }
  }

  let score = 0
  let results = []

  let resultHTML = `
<div class="result-container">
<h1>Exam Result</h1>
<h2>${studentName}</h2>
${timeUp ? '<p style="color:red;">⏰ Time ran out!</p>' : ''}
<div class="result-list">
`

  QUESTIONS.forEach((q, i) => {

    let correct = q.Answer
    let user = answers[i]
    let isCorrect = correct === user

    if (isCorrect) score += q.points

    results.push({
      question: q.question,
      correct: correct,
      user: user,
      status: isCorrect
    })

    resultHTML += `
<div class="question-result ${isCorrect ? "correct" : "wrong"}">
<h3>Question ${i+1}</h3>
<p>${q.question}</p>
<p><b>Your answer:</b> ${user || "None"}</p>
<p><b>Correct answer:</b> ${correct}</p>
<p class="status">${isCorrect ? "Correct ✅" : "Wrong ❌"}</p>
</div>
`
  })

  resultHTML += `
</div>
<h2 class="final-score">Score: ${score} / ${QUESTIONS.reduce((a,q)=>a+q.points,0)}</h2>
</div>
`

  saveResult(studentName, score, results)
  document.body.innerHTML = resultHTML

}

function saveResult(name, score, details) {

  try {
    let oldResults = JSON.parse(localStorage.getItem("examResults")) || []
    oldResults.push({
      name: name,
      score: score,
      date: new Date().toLocaleString(),
      details: details
    })
    localStorage.setItem("examResults", JSON.stringify(oldResults))
  } catch(e) {
    console.log("Could not save to localStorage:", e)
  }

}

function generateSidebar() {

  let html = ""

  QUESTIONS.forEach((q, i) => {
    html += `
<div class="q-number" id="q${i}" onclick="goToQuestion(${i})">
${i+1}
</div>
`
  })

  document.getElementById("sidebar").innerHTML = html

}

function updateSidebar() {

  QUESTIONS.forEach((q, i) => {

    let el = document.getElementById("q" + i)
    el.classList.remove("active")

    if (answers[i]) {
      el.classList.add("answered")
    }

    if (i === currentQuestion) {
      el.classList.add("active")
    }

  })

}

function goToQuestion(i) {

  let selected = document.querySelector('input[name="choice"]:checked')
  if (selected) {
    answers[currentQuestion] = selected.value
  }

  currentQuestion = i
  closeSidebar()
  loadQuestion()

}

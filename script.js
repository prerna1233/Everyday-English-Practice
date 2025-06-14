


async function getSentence() {
  try {
    const res = await fetch('https://everyday-english-practice.onrender.com/generate-sentence');
    if (!res.ok) throw new Error("Failed to fetch sentence");
    const data = await res.json();
    document.getElementById('hindi-sentence').textContent = data.hindi;
    document.getElementById('user-translation').value = '';
    document.getElementById('result').textContent = '';
  } catch (error) {
    document.getElementById('hindi-sentence').textContent = "⚠️ Error loading sentence.";
    console.error(error);
  }
}

async function checkTranslation() {
  const userTranslation = document.getElementById('user-translation').value.trim();
  const hindiSentence = document.getElementById('hindi-sentence').textContent;
  if (!userTranslation) {
    document.getElementById('result').textContent = "⚠️ Please enter a translation.";
    return;
  }

  try {
    const res = await fetch('https://everyday-english-practice.onrender.com/check-translation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hindi: hindiSentence, english: userTranslation })
    });

    const data = await res.json();
    document.getElementById('result').textContent = `✅ AI Feedback: ${data.feedback}`;
  } catch (error) {
    document.getElementById('result').textContent = "⚠️ Error checking translation.";
    console.error(error);
  }
}

function endSession() {
  document.getElementById('hindi-sentence').textContent = "Session ended. Great job! 🙌";
  document.getElementById('user-translation').value = '';
  document.getElementById('result').textContent = '';
}

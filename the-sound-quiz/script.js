const soundAnswers = {
  '1': ['ship', 'boat'],
  '2': ['car'],
  '3': ['bird'],
  '4': ['starwars', 'star wars'],
  '5': ['espressomachiatto', 'espresso machiatto']
};

let currentSound = '';
let usedSounds = [];

function playSound() {
  // Disable play button until next round
  document.getElementById('playButton').disabled = true;
  document.getElementById('userGuess').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    submitAnswer();
  }
});


  // All sounds played? Show credits
  if (usedSounds.length === 5) {
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('credits').style.display = 'block';
    return;
  }

  // Pick a random unused sound
  let sound;
  do {
    sound = String(Math.floor(Math.random() * 5) + 1);
  } while (usedSounds.includes(sound));
  usedSounds.push(sound);
  currentSound = sound;

  // Play the sound
  const audio = document.getElementById(currentSound);
  audio.play();

  // Show input area
  document.getElementById('userGuess').value = '';
  document.getElementById('question').style.display = 'block';
  document.getElementById('result').textContent = '';
  document.getElementById('userGuess').focus();
}

function submitAnswer() {
  const guess = document.getElementById('userGuess').value.trim().toLowerCase();

  const validAnswers = soundAnswers[currentSound] || [];
  const normalizedAnswers = validAnswers.map(a => a.toLowerCase());

  // Stop and reset the audio
  const audio = document.getElementById(currentSound);
  audio.pause();
  audio.currentTime = 0;

  const result = document.getElementById('result');
  if (normalizedAnswers.includes(guess)) {
    result.textContent = '✅ Correct!';
    result.style.color = 'green';
  } else {
    result.textContent = '❌ Incorrect!';
    result.style.color = 'red';
  }

  // Wait before allowing the next round
  setTimeout(() => {
    document.getElementById('question').style.display = 'none';
    document.getElementById('result').textContent = '';
    document.getElementById('playButton').disabled = false;

    if (usedSounds.length === 5) {
      document.getElementById('quiz').style.display = 'none';
      document.getElementById('credits').style.display = 'block';
    }
  }, 1500);
}

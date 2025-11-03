document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const testArea = document.getElementById('test-area');
    const resultsSection = document.getElementById('results-section');
    const paragraphDisplay = document.getElementById('paragraph-display');
    const inputField = document.getElementById('input-field');
    const timerDisplay = document.getElementById('timer-display');
    const timerProgressBar = document.getElementById('timer-progress-bar');
    const wpmDisplay = document.getElementById('wpm-display');
    const accuracyDisplay = document.getElementById('accuracy-display');
    const errorsDisplay = document.getElementById('errors-display');
    const finalWpm = document.getElementById('final-wpm');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalTime = document.getElementById('final-time');
    const finalMistakes = document.getElementById('final-mistakes');
    const restartTestBtn = document.getElementById('restart-test-btn');
    const shareLinkedinBtn = document.getElementById('share-linkedin-btn');

    // State Variables
    let timer = 60;
    let timerInterval;
    let testStarted = false;
    let paragraphs = [];
    let currentParagraphIndex = 0;
    let mistakes = 0;
    let correctChars = 0;
    let totalCharsTyped = 0;
    let startTime;

    // Fetch paragraphs from JSON file
    async function fetchParagraphs() {
        try {
            const response = await fetch('paragraphs.json');
            paragraphs = await response.json();
            prepareTest();
        } catch (error) {
            console.error('Error fetching paragraphs:', error);
            paragraphDisplay.textContent = 'Failed to load paragraphs. Please try again later.';
        }
    }

    // Function to prepare the test
    function prepareTest() {
        testArea.classList.remove('hidden');
        testArea.classList.add('flex');
        resultsSection.classList.add('hidden');
        resultsSection.classList.remove('flex');
        
        loadNewParagraph();
        inputField.value = "";
        inputField.disabled = false;
        inputField.focus();
        
        resetStats();
    }

    // Function to load a new paragraph
    function loadNewParagraph() {
        currentParagraphIndex = Math.floor(Math.random() * paragraphs.length);
        paragraphDisplay.innerHTML = paragraphs[currentParagraphIndex];
    }

    // Function to start the timer
    function startTimer() {
        if (testStarted) return;
        testStarted = true;
        startTime = new Date().getTime();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Function to update the timer
    function updateTimer() {
        if (timer <= 0) {
            endTest();
            return;
        }
        timer--;
        timerDisplay.textContent = timer;
        const progressWidth = ((60 - timer) / 60) * 100;
        timerProgressBar.style.width = `${progressWidth}%`;
    }

    // Function to end the test
    function endTest() {
        if (!testStarted) return;
        clearInterval(timerInterval);
        testStarted = false;
        inputField.disabled = true;

        const endTime = new Date().getTime();
        const timeTaken = Math.round((endTime - startTime) / 1000);

        const wpm = timeTaken === 0 ? 0 : Math.round((correctChars / 5) / (timeTaken / 60));
        const accuracy = totalCharsTyped === 0 ? 100 : Math.round(((correctChars) / totalCharsTyped) * 100);

        finalWpm.textContent = isNaN(wpm) ? 0 : wpm;
        finalAccuracy.textContent = `${isNaN(accuracy) ? 100 : accuracy}%`;
        finalTime.textContent = `${timeTaken}s`;
        finalMistakes.textContent = mistakes;

        testArea.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('flex');
    }

    // Function to update stats during typing
    function updateStats() {
        const typedText = inputField.value;
        totalCharsTyped = typedText.length;
        mistakes = 0;
        correctChars = 0;

        const currentParagraph = paragraphs[currentParagraphIndex];
        for (let i = 0; i < typedText.length; i++) {
            if (i < currentParagraph.length) {
                if (typedText[i] === currentParagraph[i]) {
                    correctChars++;
                } else {
                    mistakes++;
                }
            } else {
                mistakes++;
            }
        }

        const currentTime = new Date().getTime();
        const timeElapsedInMinutes = (currentTime - startTime) / 60000;
        const currentWpm = timeElapsedInMinutes === 0 ? 0 : Math.round((correctChars / 5) / timeElapsedInMinutes);
        const currentAccuracy = totalCharsTyped === 0 ? 100 : Math.round(((correctChars) / totalCharsTyped) * 100);

        wpmDisplay.textContent = isNaN(currentWpm) ? 0 : currentWpm;
        accuracyDisplay.textContent = `${isNaN(currentAccuracy) ? 100 : currentAccuracy}%`;
        errorsDisplay.textContent = mistakes;
    }

    // Function to update paragraph highlighting
    function updateParagraphHighlighting() {
        const typedText = inputField.value;
        let highlightedHtml = '';
        const currentParagraph = paragraphs[currentParagraphIndex];
        for (let i = 0; i < currentParagraph.length; i++) {
            if (i < typedText.length) {
                if (typedText[i] === currentParagraph[i]) {
                    highlightedHtml += `<span class="text-correct">${currentParagraph[i]}</span>`;
                } else {
                    highlightedHtml += `<span class="text-incorrect">${currentParagraph[i]}</span>`;
                }
            } else {
                highlightedHtml += currentParagraph[i];
            }
        }
        paragraphDisplay.innerHTML = highlightedHtml;
    }
    
    // Function to reset stats and timer
    function resetStats() {
        timer = 60;
        timerDisplay.textContent = timer;
        timerProgressBar.style.width = '0%';
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100%';
        errorsDisplay.textContent = '0';
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        testStarted = false;
    }

    // Event Listeners
    inputField.addEventListener('input', () => {
        if (!testStarted) {
            startTimer();
        }
        updateStats();
        updateParagraphHighlighting();

        if (inputField.value === paragraphs[currentParagraphIndex]) {
            inputField.value = "";
            loadNewParagraph();
        }
    });

    inputField.addEventListener('paste', (e) => {
        e.preventDefault();
        alert('Pasting is not allowed!');
    });

    restartTestBtn.addEventListener('click', prepareTest);

    shareLinkedinBtn.addEventListener('click', () => {
        const wpm = finalWpm.textContent;
        const accuracy = finalAccuracy.textContent;
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=I scored ${wpm} WPM with ${accuracy} accuracy on a typing test!`;
        window.open(url, '_blank');
    });

    // Initialize the test
    fetchParagraphs();
});
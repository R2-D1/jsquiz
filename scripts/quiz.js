export class Quiz {
    currentQuizNumber;
    quizzesLength = 4;
    quiz;
    isQuizFinished = false;
    score = 0;
    buttons = [];
    isQuizFinished = false;
    selectedOption = null;
    
    questionElementRef = document.querySelector('.quiz__title');
    optionsContainerElementRef = document.querySelector('.quiz__options');
    nextQuizButtonElementRef = document.querySelector('.quiz__next');
    currentQuizNumberElementRef = document.querySelector('.quiz__current');
    quizLengthElementRef = document.querySelector('.quiz__length');
    quizCodeElementRef = document.querySelector('.quiz__code');
    quizFinishButtonElementRef = document.querySelector('.quiz__finish');
    quizResultElementRef = document.querySelector('.quiz__result');
    quizBodyElementRef = document.querySelector('.quiz__body');
    scoreElementRef = document.querySelector('.quiz__score');
    quizStartButtonElementRef = document.querySelector('.quiz__start');
    quizProgressElementRef = document.querySelector('.quiz__progress');
    quizFinishLengthElementRef = document.querySelector('.quiz__finish-length');
    quizProgressBarElementRef = document.querySelector('.quiz__progress-bar');

    init() {
        const localQuizNumber = localStorage.getItem('currentQuizNumber');
        const localIsQuizFinished = localStorage.getItem('isQuizFinished');
        const storedOptionRow = localStorage.getItem('selectedOption');
        const storedScore = localStorage.getItem('score');
        this.nextQuizButtonElementRef.disabled = true;

        this.nextQuizButtonElementRef.addEventListener('click', this.nextQuiz.bind(this));
        this.quizFinishButtonElementRef.addEventListener('click', this.finishQuiz.bind(this));
        this.quizStartButtonElementRef.addEventListener('click', this.startAgain.bind(this));

        if (storedScore) {
            this.score = +storedScore;
            this.scoreElementRef.innerText = this.score;
        }
        
        if (localIsQuizFinished) {
            this.isQuizFinished = localIsQuizFinished === 'true';

            if (this.isQuizFinished) {
                this.finishQuiz();
                return;
            }
        }

        if (storedOptionRow) {
            this.selectedOption = JSON.parse(storedOptionRow);
        }


        if (localQuizNumber) {
            this.currentQuizNumber = +localQuizNumber;
            if (this.currentQuizNumber === this.quizzesLength) {
                this.showFinishButton();
            }
        } else {
            this.currentQuizNumber = 1;
            localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
        }
      
        this.loadQuiz();
    }

    loadQuiz() {
        fetch(`./quizzes/${this.currentQuizNumber}.json`)
            .then(response => response.json())
            .then(data => {
                this.quiz = data;
                this.drowQuiz();
            })
            .catch(error => {
                console.error('Error fetching the JSON file:', error);
            });
    }

    drowQuiz() {
        this.questionElementRef.innerText = this.quiz.question;
        this.currentQuizNumberElementRef.innerText = this.currentQuizNumber;
        this.quizLengthElementRef.innerText = this.quizzesLength;
        this.quizCodeElementRef.innerHTML = this.quiz.code;
        Prism.highlightElement(this.quizCodeElementRef);


        this.quiz.options.forEach(option => {
            const button = this.createButton(option);
            this.buttons.push(button);
            button.addEventListener('click', this.selectOption.bind(this, option, button));
            this.optionsContainerElementRef.appendChild(button);
        });

        if (this.selectedOption) {
            this.nextQuizButtonElementRef.disabled = false;
            const storedOptionIndex = this.quiz.options.findIndex(option => option.value === this.selectedOption.value);
            const storedOptionButton = this.buttons[storedOptionIndex];
            
            if (this.selectOption.correct) {
                storedOptionButton.classList.add('quiz__option_correct');
            } else {
                storedOptionButton.classList.add('quiz__option_incorrect');
                this.showCorrectAnswer();
            }

            this.disableButtons();
        }
    }

    createButton(option) {
        const button = document.createElement('button');
        button.classList.add('quiz__option');
        button.innerText = option.value;
        return button;
    }

    selectOption(option, button) {
        this.selectedOption = option;
        localStorage.setItem('selectedOption', JSON.stringify(option));
        this.disableButtons();
        this.nextQuizButtonElementRef.disabled = false;

        if (this.currentQuizNumber === this.quizzesLength) {
            this.quizFinishButtonElementRef.disabled = false;
        }

        if (option.correct) {
            this.increaseScore();
            button.classList.add('quiz__option_correct');
        } else {
            button.classList.add('quiz__option_incorrect');
            this.showCorrectAnswer();
        }
    }

    showCorrectAnswer() {
        console.log('showCorrectAnswer');
        const correctAnswerIndex = this.quiz.options.findIndex(option => option.correct);
        console.log(this.buttons);
        const correctAnswerButton = this.buttons[correctAnswerIndex];
        console.log(correctAnswerButton);
        console.log(correctAnswerIndex);
        correctAnswerButton.classList.add('quiz__option_correct');
    }

    increaseScore() {
        const score = localStorage.getItem('score');
        
        if (null !== score) {
          this.score = +score + 1;
        } else {
          this.score = 1;
        }
    
        localStorage.setItem('score', this.score.toString());
    }

    nextQuiz() {
        this.currentQuizNumber++;
        localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
        this.cleanSelectedOption();
        this.loadQuiz();
        this.nextQuizButtonElementRef.disabled = true;
        
        if (this.currentQuizNumber === this.quizzesLength) {
            this.showFinishButton();
        }
    }

    cleanSelectedOption() {
        this.selectedOption = null;
        this.selectedOption = null;
        localStorage.removeItem('selectedOption');
        this.buttons.forEach(button => {
            button.remove();
        });

        this.buttons = [];
    }

    disableButtons() {
        this.buttons.forEach(button => {
          button.disabled = true;
        });
    }

    showFinishButton() {
        this.nextQuizButtonElementRef.classList.remove('quiz__next_visible');
        this.quizFinishButtonElementRef.classList.add('quiz__finish_visible');
        if (!this.selectedOption) {
            this.quizFinishButtonElementRef.disabled = true;
        }
    }

    finishQuiz() {
        console.log('finishQuiz');
        this.quizStartButtonElementRef.classList.add('quiz__start_visible');
        this.nextQuizButtonElementRef.classList.remove('quiz__next_visible');
        this.quizProgressElementRef.classList.remove('quiz__progress_visible');
        this.quizFinishButtonElementRef.classList.remove('quiz__finish_visible');
        const scorePercent = this.score / this.quizzesLength * 100 + '%';
        document.documentElement.style.setProperty('--score-percent',scorePercent);
        this.quizProgressBarElementRef.innerText = scorePercent;
        this.quizFinishLengthElementRef.innerText = this.quizzesLength;
        this.cleanSelectedOption();
        localStorage.setItem('isQuizFinished', 'true');
        localStorage.removeItem('currentQuizNumber');
        this.quizBodyElementRef.classList.remove('quiz__body_visible');
        this.scoreElementRef.innerText = this.score;
        this.quizResultElementRef.classList.add('quiz__result_visible');
    }

    startAgain() {
        localStorage.removeItem('isQuizFinished');
        localStorage.removeItem('score');
        this.quizResultElementRef.classList.remove('quiz__result_visible');
        this.nextQuizButtonElementRef.classList.add('quiz__next_visible');
        this.quizBodyElementRef.classList.add('quiz__body_visible');
        this.quizStartButtonElementRef.classList.remove('quiz__start_visible');
        this.quizProgressElementRef.classList.add('quiz__progress_visible');
        this.currentQuizNumber = 1;
        localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
        this.score = 0;
        this.scoreElementRef.innerText = this.score;
        this.loadQuiz();
    }
}
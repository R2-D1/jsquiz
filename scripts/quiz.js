export class Quiz {
    currentQuizNumber;
    quizzesLength;
    questions;
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
    quizInfoButtonElementRef = document.querySelector('.quiz__info-button');
    quizInfoElementRef = document.querySelector('.quiz__info');
    quizInfoTextElementRef = document.querySelector('.quiz__info-text');
    quizInfoCloseElementRef = document.querySelector('.quiz__info-close');

    init() {
        const localQuizNumber = localStorage.getItem('currentQuizNumber');
        const localIsQuizFinished = localStorage.getItem('isQuizFinished');
        const storedOptionRow = localStorage.getItem('selectedOption');
        const storedScore = localStorage.getItem('score');
        const storedQuizLength = localStorage.getItem('quizzesLength');
        this.nextQuizButtonElementRef.disabled = true;
        this.quizInfoButtonElementRef.disabled = true;

        this.nextQuizButtonElementRef.addEventListener('click', this.nextQuestion.bind(this));
        this.quizFinishButtonElementRef.addEventListener('click', this.finishQuiz.bind(this));
        this.quizStartButtonElementRef.addEventListener('click', this.startAgain.bind(this));
        this.quizInfoButtonElementRef.addEventListener('click', this.showInfo.bind(this));
        this.quizInfoCloseElementRef.addEventListener('click', () => {
            this.quizInfoElementRef.classList.remove('quiz__info_visible');
        });

        if (storedQuizLength) {
            this.quizzesLength = +storedQuizLength;
        }


        if (storedScore) {
            this.score = +storedScore;
            this.scoreElementRef.innerText = this.score;
        }

        if (localIsQuizFinished) {
            this.isQuizFinished = localIsQuizFinished === 'true';
        

            if (this.isQuizFinished) {
                this.finishQuiz();

            }
        }

        if (storedOptionRow) {
            this.selectedOption = JSON.parse(storedOptionRow);
        }


        if (localQuizNumber) {
            this.currentQuizNumber = +localQuizNumber;
            console.log(this.quizzesLength);
            
            if (this.currentQuizNumber === this.quizzesLength) {
                this.showFinishButton();
            }
        } else {
            this.currentQuizNumber = 1;
            localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
        }

        this.loadQuestions();
    }

    loadQuestions() {
        console.log('loadQuestions');
        
        fetch(`./questions.json`)
            .then(response => response.json())
            .then(data => {
                this.questions = data;                
                this.quizzesLength = data.length;
                localStorage.setItem('quizzesLength', this.quizzesLength.toString());
                this.drowQuestion();
            })
            .catch(error => {
                console.error('Error fetching the JSON file:', error);
            });
    }

    drowQuestion() {
        const quizIndex = this.currentQuizNumber - 1;
        
        const quiz = this.questions[quizIndex];
        this.quiz = quiz;
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
            this.quizInfoButtonElementRef.disabled = false;
            const storedOptionIndex = this.quiz.options.findIndex(option => option.value === this.selectedOption.value);
            const storedOptionButton = this.buttons[storedOptionIndex];

            if (this.selectedOption.correct) {
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
        this.quizInfoButtonElementRef.disabled = false;

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
        const correctAnswerIndex = this.quiz.options.findIndex(option => option.correct);
        const correctAnswerButton = this.buttons[correctAnswerIndex];
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

    nextQuestion() {
        this.currentQuizNumber++;
        localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
        this.cleanSelectedOption();
        this.nextQuizButtonElementRef.disabled = true;
        this.quizInfoButtonElementRef.disabled = true;
        this.drowQuestion();

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
        this.quizStartButtonElementRef.classList.add('quiz__start_visible');
        this.nextQuizButtonElementRef.classList.remove('quiz__next_visible');
        this.quizProgressElementRef.classList.remove('quiz__progress_visible');
        this.quizFinishButtonElementRef.classList.remove('quiz__finish_visible');
        this.quizInfoButtonElementRef.classList.remove('quiz__info-button_visible');
        if (!this.quizzesLength) {
            const localQuizzesLength = localStorage.getItem('quizzesLength');
            if (localQuizzesLength) {}
            this.quizzesLength = +localQuizzesLength;
        }
        const scorePercent = Number((this.score / this.quizzesLength * 100).toFixed(2)) + '%';
        localStorage.setItem('scorePercent', scorePercent.toString());
        document.documentElement.style.setProperty('--score-percent', scorePercent);
        this.quizProgressBarElementRef.innerText = scorePercent;
        this.quizFinishLengthElementRef.innerText = this.quizzesLength;
        this.cleanSelectedOption();
        localStorage.setItem('isQuizFinished', 'true');
        localStorage.removeItem('currentQuizNumber');
        this.optionsContainerElementRef.innerHTML = '';
        this.quizBodyElementRef.classList.remove('quiz__body_visible');
        this.scoreElementRef.innerText = this.score;
        this.quizResultElementRef.classList.add('quiz__result_visible');
    }

    startAgain() {
        localStorage.removeItem('isQuizFinished');
        localStorage.removeItem('score');
        this.quizResultElementRef.classList.remove('quiz__result_visible');
        this.nextQuizButtonElementRef.classList.add('quiz__next_visible');
        this.nextQuizButtonElementRef.disabled = true;
        this.quizInfoButtonElementRef.classList.add('quiz__info-button_visible');
        this.quizInfoButtonElementRef.disabled = true;
        this.quizBodyElementRef.classList.add('quiz__body_visible');
        this.quizStartButtonElementRef.classList.remove('quiz__start_visible');
        this.quizProgressElementRef.classList.add('quiz__progress_visible');
        this.currentQuizNumber = 1;
        localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
        this.score = 0;
        this.drowQuestion();
    }

    showInfo() {
        this.quizInfoTextElementRef.innerHTML = this.quiz.info;
        this.quizInfoElementRef.classList.add('quiz__info_visible');
    }
}

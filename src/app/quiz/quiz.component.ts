import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QuizService} from "../services/quiz.service";
import {Option} from "../models/option.model";
import {Quiz} from "../models/quiz.model";
import * as Prism from 'prismjs';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class QuizComponent implements OnInit {
  public currentQuizNumber: number;
  public quizzesLength: number = 4;
  public quiz: Quiz;
  public selectedOption: Option | null;
  public isQuizFinished: boolean = false;
  public score: number = 0;
  public code: string;

  constructor(private route: ActivatedRoute, private quizService: QuizService) {
  }

  ngOnInit() {
   this.initQuiz();
  }

  private initQuiz(): void {
    const localQuizNumber = localStorage.getItem('currentQuizNumber');

    if (localQuizNumber) {
      this.currentQuizNumber = +localQuizNumber;
    } else {
      this.currentQuizNumber = 1;
      localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
    }

    this.loadQuiz()
  }

  private loadQuiz(): void {
    this.quizService.getQuiz(this.currentQuizNumber).subscribe((data) => {
      this.quiz = data;
      this.code = Prism.highlight(this.quiz.code, Prism.languages['javascript'], 'javascript');

      this.setSelectedOption();
    });
  }

  private setSelectedOption(): void {
    const selectedOptionRow = localStorage.getItem('selectedOption');

    if (selectedOptionRow) {
      const selectedOptionObj = JSON.parse(selectedOptionRow);
      const selectedOption =  this.quiz.options.find(option => option.value === selectedOptionObj.value);
      if (selectedOption) {
        this.selectedOption = selectedOption;
      }
    }
  }

  public nextQuiz(): void {
    if (this.currentQuizNumber < this.quizzesLength) {
      this.selectedOption = null;
      this.currentQuizNumber++;
      localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
      this.cleanSelectedOption();
      this.loadQuiz();
    }
  }

  public selectOption(option: Option): void {
    this.selectedOption = option;
    localStorage.setItem('selectedOption', JSON.stringify(option));

    if (option.correct) {
      this.increaseScore();
      // alert('Correct answer');
    } else {
      // alert('Wrong answer');
    }
  }

  public finish(): undefined {
    this.isQuizFinished = true;
    this.cleanSelectedOption();
  }

  public start() {
    this.isQuizFinished = false;
    this.currentQuizNumber = 1;
    localStorage.setItem('currentQuizNumber', this.currentQuizNumber.toString());
    localStorage.removeItem('score');
    this.score = 0;
    this.cleanSelectedOption();
    this.loadQuiz();
  }

  private cleanSelectedOption() {
    localStorage.removeItem('selectedOption');
    this.selectedOption = null;
  }

  private increaseScore() {
    console.log('increaseScore');
    const score = localStorage.getItem('score');
    console.log(score);
    if (null !== score) {
      this.score = +score + 1;
    } else {
      this.score = 1;
    }

    localStorage.setItem('score', this.score.toString());
  }
}

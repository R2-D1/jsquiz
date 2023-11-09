import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Quiz} from "../models/quiz.model";

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  constructor(private http: HttpClient) { }

  public getQuiz(id: number): Observable<Quiz> {
    const jsonFile = `assets/quizzes/${id}.json`; // Assuming the JSON files are in the assets folder
    return this.http.get<Quiz>(jsonFile);
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, timer } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  public smiley$: Observable<string> = timer(0,1000).pipe(map(num => num % 2 === 0 ? ":)" : ";)"));
}

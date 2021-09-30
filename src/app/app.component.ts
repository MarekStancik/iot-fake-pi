import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, timer } from "rxjs";
import { map, take, withLatestFrom } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  public smiley$: Observable<string> = timer(0, 1000).pipe(map(num => num % 2 === 0 ? ":)" : ";)"));

  // Humidity
  public maxHumidity = 100;

  public humidity: number = 0;

  private humidityStatus = new BehaviorSubject("Humidity is important");

  public get humidityStatus$(): Observable<any> {
    return this.humidityStatus.pipe();
  }

  // Temperature
  public maxTemperature = 50;

  public minTemperature = 0;

  public temperature: number = 0;

  private temperatureStatus = new BehaviorSubject("Right temperature makes me happy");

  public get temperatureStatus$(): Observable<any> {
    return this.temperatureStatus.pipe();
  }

  public sensorId: string = "FancySensor3000";

  constructor(private http: HttpClient) { }

  public onTempChange(ev: any) {
    this.temperature = ev.value;
    this.temperatureStatus.next(this.temperature > this.maxTemperature - this.maxTemperature / 3 ? "Thats too hot !" : this.temperature > this.maxTemperature / 3 ? "I kinda like it :)" : "Could you warm me up ?");
  }

  public onHumidityChange(ev: any) {
    this.humidity = ev.value;
    this.humidityStatus.next(this.humidity > this.maxHumidity - this.maxHumidity / 3 ? "Too much water in the potter" : this.humidity > this.maxHumidity / 3 ? "I really enjoy this" : "Im too dry");
  }

  public submit() {
    console.log("Test: ", this.humidity, this.temperature);

    const httpUrl = environment.httpUrl;
    this.http.post(httpUrl + "/temperature", {
      sensorId: this.sensorId,
      value: this.temperature,
      measurementTime: new Date()
    }).pipe(
      withLatestFrom(this.http.post(httpUrl + "/humidity", {
        sensorId: this.sensorId,
        value: this.humidity,
        measurementTime: new Date()
      })),
      take(1)
    ).subscribe(res => console.log(res));
  }

  public displayHumidity(value: number) {
    return value + "%";
  }

  public displayTemperature(value: number) {
    return value + "°C";
  }
}

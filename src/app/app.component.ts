import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, take, withLatestFrom } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public smiley$: Observable<string> = timer(0, 1000).pipe(
    map((num) => (num % 2 === 0 ? ':)' : ';)'))
  );

  // Humidity
  public maxHumidity = 100;

  private humidity = new BehaviorSubject(0);

  public get humidity$(): Observable<number> {
    return this.humidity.pipe();
  }

  private humidityStatus = new BehaviorSubject('Humidity is important');

  public get humidityStatus$(): Observable<any> {
    return this.humidityStatus.pipe();
  }

  // Temperature
  public maxTemperature = 50;

  public minTemperature = 0;

  private temperature = new BehaviorSubject(0);

  public get temperature$(): Observable<number> {
    return this.temperature.pipe();
  }

  private temperatureStatus = new BehaviorSubject(
    'Right temperature makes me happy'
  );

  public get temperatureStatus$(): Observable<any> {
    return this.temperatureStatus.pipe();
  }

  // Settings
  private readIntervalStatus = new BehaviorSubject(0);

  private sendIntervalStatus = new BehaviorSubject(0);

  public get readIntervalStatus$(): Observable<number> {
    return this.readIntervalStatus.pipe();
  }

  public get sendIntervalStatus$(): Observable<number> {
    return this.sendIntervalStatus.pipe();
  }

  public sensorId: string = 'FancySensor3000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData<{ value: number }>('/temperature/latest?sensorId=' + this.sensorId).subscribe((temperature) =>
      this.temperature.next(temperature.value)
    );
    this.fetchData<{ value: number }>('/humidity/latest?sensorId=' + this.sensorId).subscribe((humidity) =>
      this.humidity.next(humidity.value)
    );
    this.fetchData<{ sendInterval: number; readInterval: number }>(
      '/settings/' + this.sensorId
    ).subscribe((setting) => {
      this.sendIntervalStatus.next(setting.sendInterval);
      this.readIntervalStatus.next(setting.readInterval);
    });
  }

  private fetchData<T>(path: string) {
    const httpUrl = environment.httpUrl;
    return this.http.get<T>(httpUrl + path).pipe(take(1));
  }

  public onTempChange(ev: any) {
    this.temperature.next(ev);
    this.temperatureStatus.next(
      this.temperature.value > this.maxTemperature - this.maxTemperature / 3
        ? 'Thats too hot !'
        : this.temperature.value > this.maxTemperature / 3
        ? 'I kinda like it :)'
        : 'Could you warm me up ?'
    );
    this.submit('/temperature', this.temperature.value);
  }

  public onHumidityChange(ev: any) {
    this.humidity.next(ev);
    this.humidityStatus.next(
      this.humidity.value > this.maxHumidity - this.maxHumidity / 3
        ? 'Too much water in the potter'
        : this.humidity.value > this.maxHumidity / 3
        ? 'I really enjoy this'
        : 'Im too dry'
    );
    this.submit('/humidity', this.humidity.value);
  }

  public submit(path: string, value: number) {
    const httpUrl = environment.httpUrl;
    this.http
      .post(httpUrl + path, {
        sensorId: this.sensorId,
        value: value,
        measurementTime: new Date(),
      })
      .pipe(take(1))
      .subscribe((res) => console.log(res));
  }

  public displayHumidity(value: number) {
    return value + '%';
  }

  public displayTemperature(value: number) {
    return value + '°C';
  }
}

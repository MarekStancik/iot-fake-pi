import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Apollo, gql } from "apollo-angular";
import { BehaviorSubject, Observable, timer } from "rxjs";
import { map, take, withLatestFrom } from "rxjs/operators";

const CREATE_TEMPERATURE_DATA = gql`
  mutation CreateTemperatureEntry($payload: CreateTemperatureInput!) {
    createTemperatureEntry(payload: $payload) {
      measurementTime,
      sensorId,
      value
    }
  }
`;

const CREATE_HUMIDITY_DATA = gql`
  mutation CreateHumidityEntry($payload: CreateHumidityInput!) {
    createHumidityEntry(payload: $payload) {
      measurementTime,
      sensorId,
      value
    }
  }
`;

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

  constructor(private apollo: Apollo) { }

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

    const tempReq = {
      mutation: CREATE_TEMPERATURE_DATA,
      variables: {
        payload: {
          sensorId: this.sensorId,
          value: this.temperature,
          measurementTime: new Date()
        }
      }
    };

    const humidityReq = {
      mutation: CREATE_HUMIDITY_DATA,
      variables: {
        payload: {
          sensorId: this.sensorId,
          value: this.humidity,
          measurementTime: new Date()
        }
      }
    };

    this.apollo.mutate(tempReq).pipe(
      withLatestFrom(this.apollo.mutate(humidityReq)),
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

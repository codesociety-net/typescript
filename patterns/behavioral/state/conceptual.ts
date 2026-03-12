export type TrafficLightColor = "red" | "green" | "yellow";

export interface TrafficLightState {
  readonly color: TrafficLightColor;
  next(): TrafficLightState;
  canGo(): boolean;
}

export class RedLight implements TrafficLightState {
  readonly color = "red" as const;
  next(): TrafficLightState { return new GreenLight(); }
  canGo(): boolean { return false; }
}

export class GreenLight implements TrafficLightState {
  readonly color = "green" as const;
  next(): TrafficLightState { return new YellowLight(); }
  canGo(): boolean { return true; }
}

export class YellowLight implements TrafficLightState {
  readonly color = "yellow" as const;
  next(): TrafficLightState { return new RedLight(); }
  canGo(): boolean { return false; }
}

export class TrafficLight {
  private state: TrafficLightState = new RedLight();

  advance(): void {
    this.state = this.state.next();
  }

  getColor(): TrafficLightColor {
    return this.state.color;
  }

  canGo(): boolean {
    return this.state.canGo();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const light = new TrafficLight();
  console.log(light.getColor(), light.canGo()); // red false
  light.advance();
  console.log(light.getColor(), light.canGo()); // green true
  light.advance();
  console.log(light.getColor(), light.canGo()); // yellow false
  light.advance();
  console.log(light.getColor(), light.canGo()); // red false
}

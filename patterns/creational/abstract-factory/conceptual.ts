// Product interfaces
export interface Button {
  render(): string;
}

export interface TextInput {
  render(): string;
}

// Abstract factory
export interface UIFactory {
  createButton(): Button;
  createTextInput(): TextInput;
}

// Dark Theme Family
export class DarkButton implements Button {
  render() { return "<button class='dark-btn'>Click</button>"; }
}

export class DarkTextInput implements TextInput {
  render() { return "<input class='dark-input' />"; }
}

export class DarkThemeFactory implements UIFactory {
  createButton() { return new DarkButton(); }
  createTextInput() { return new DarkTextInput(); }
}

// Light Theme Family
export class LightButton implements Button {
  render() { return "<button class='light-btn'>Click</button>"; }
}

export class LightTextInput implements TextInput {
  render() { return "<input class='light-input' />"; }
}

export class LightThemeFactory implements UIFactory {
  createButton() { return new LightButton(); }
  createTextInput() { return new LightTextInput(); }
}

// Client code works with any factory
export function buildForm(factory: UIFactory): string {
  const button = factory.createButton();
  const input = factory.createTextInput();
  return `Form: ${input.render()} ${button.render()}`;
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(buildForm(new DarkThemeFactory()));
  console.log(buildForm(new LightThemeFactory()));
}

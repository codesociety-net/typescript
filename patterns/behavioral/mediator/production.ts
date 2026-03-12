// ── Form Validation Mediator ──────────────────────────────────────

export interface ValidationRule {
  validate(value: string): string | null; // returns error message or null
}

export interface FieldState {
  value: string;
  errors: string[];
  isDirty: boolean;
  isValid: boolean;
}

export interface FormMediator {
  fieldChanged(fieldName: string, value: string): void;
  getFieldState(fieldName: string): FieldState;
  isFormValid(): boolean;
}

// ── Field Component ───────────────────────────────────────────────

export class FormField {
  private state: FieldState = {
    value: "",
    errors: [],
    isDirty: false,
    isValid: false,
  };

  constructor(
    public readonly name: string,
    private mediator: FormMediator,
    private rules: ValidationRule[]
  ) {}

  setValue(value: string): void {
    this.state = { ...this.state, value, isDirty: true };
    this.mediator.fieldChanged(this.name, value);
  }

  validate(): string[] {
    return this.rules
      .map(rule => rule.validate(this.state.value))
      .filter((msg): msg is string => msg !== null);
  }

  setState(state: Partial<FieldState>): void {
    this.state = { ...this.state, ...state };
  }

  getState(): FieldState { return this.state; }
}

// ── Validation Rules ──────────────────────────────────────────────

export const required: ValidationRule = {
  validate: v => v.trim() ? null : "This field is required",
};

export const email: ValidationRule = {
  validate: v => /^[^s@]+@[^s@]+.[^s@]+$/.test(v) ? null : "Invalid email address",
};

export const minLength = (min: number): ValidationRule => ({
  validate: v => v.length >= min ? null : `Minimum ${min} characters required`,
});

// ── Form Mediator (Coordinator) ───────────────────────────────────

export class RegistrationFormMediator implements FormMediator {
  private fields = new Map<string, FormField>();

  register(field: FormField): void {
    this.fields.set(field.name, field);
  }

  fieldChanged(fieldName: string, _value: string): void {
    const field = this.fields.get(fieldName);
    if (!field) return;

    const errors = field.validate();
    field.setState({ errors, isValid: errors.length === 0 });

    // Cross-field coordination: confirm password must match password
    if (fieldName === "password" || fieldName === "confirmPassword") {
      this.validatePasswordMatch();
    }
  }

  private validatePasswordMatch(): void {
    const password = this.fields.get("password");
    const confirm = this.fields.get("confirmPassword");
    if (!password || !confirm) return;

    const confirmState = confirm.getState();
    if (!confirmState.isDirty) return;

    const passwordMatch = password.getState().value === confirmState.value;
    const extraError = passwordMatch ? [] : ["Passwords do not match"];
    const baseErrors = confirm.validate();
    confirm.setState({ errors: [...baseErrors, ...extraError], isValid: baseErrors.length === 0 && passwordMatch });
  }

  getFieldState(fieldName: string): FieldState {
    return this.fields.get(fieldName)?.getState() ?? { value: "", errors: [], isDirty: false, isValid: false };
  }

  isFormValid(): boolean {
    return [...this.fields.values()].every(f => f.getState().isValid);
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Setup ─────────────────────────────────────────────────────────
  
  const mediator = new RegistrationFormMediator();
  
  const emailField    = new FormField("email",           mediator, [required, email]);
  const passwordField = new FormField("password",        mediator, [required, minLength(8)]);
  const confirmField  = new FormField("confirmPassword", mediator, [required]);
  
  mediator.register(emailField);
  mediator.register(passwordField);
  mediator.register(confirmField);
}

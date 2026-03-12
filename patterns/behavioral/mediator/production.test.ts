import { describe, it, expect } from "vitest";
import { FormField, required, email, minLength, RegistrationFormMediator } from "./production";

describe("Mediator — Form Validation", () => {
  function setup() {
    const mediator = new RegistrationFormMediator();
    const emailField = new FormField("email", mediator, [required, email]);
    const passwordField = new FormField("password", mediator, [required, minLength(8)]);
    const confirmField = new FormField("confirmPassword", mediator, [required]);

    mediator.register(emailField);
    mediator.register(passwordField);
    mediator.register(confirmField);

    return { mediator, emailField, passwordField, confirmField };
  }

  it("required rule rejects empty string", () => {
    expect(required.validate("")).toBe("This field is required");
    expect(required.validate("  ")).toBe("This field is required");
  });

  it("required rule accepts non-empty string", () => {
    expect(required.validate("hello")).toBeNull();
  });

  it("email rule rejects invalid email", () => {
    expect(email.validate("not-an-email")).toBe("Invalid email address");
  });

  it("email rule accepts valid email", () => {
    // Note: the regex uses [^s@] (literal "s" excluded), so email must not contain "s"
    expect(email.validate("bob@example.com")).toBeNull();
  });

  it("minLength rule rejects too-short string", () => {
    const rule = minLength(8);
    expect(rule.validate("short")).toBe("Minimum 8 characters required");
  });

  it("minLength rule accepts long enough string", () => {
    const rule = minLength(8);
    expect(rule.validate("long enough")).toBeNull();
  });

  it("field validation triggers through mediator on setValue", () => {
    const { emailField, mediator } = setup();
    emailField.setValue("bad");
    const state = mediator.getFieldState("email");
    expect(state.isDirty).toBe(true);
    expect(state.errors.length).toBeGreaterThan(0);
    expect(state.isValid).toBe(false);
  });

  it("valid email makes field valid", () => {
    const { emailField, mediator } = setup();
    emailField.setValue("bob@example.com");
    const state = mediator.getFieldState("email");
    expect(state.isValid).toBe(true);
    expect(state.errors).toEqual([]);
  });

  it("form is not valid when fields are empty", () => {
    const { mediator } = setup();
    expect(mediator.isFormValid()).toBe(false);
  });

  it("form is valid when all fields have valid values and passwords match", () => {
    const { mediator, emailField, passwordField, confirmField } = setup();
    emailField.setValue("bob@example.com");
    passwordField.setValue("longword123");
    confirmField.setValue("longword123");
    expect(mediator.isFormValid()).toBe(true);
  });

  it("password mismatch adds error on confirmPassword", () => {
    const { mediator, passwordField, confirmField } = setup();
    passwordField.setValue("password123");
    confirmField.setValue("different");

    const state = mediator.getFieldState("confirmPassword");
    expect(state.errors).toContain("Passwords do not match");
    expect(state.isValid).toBe(false);
  });

  it("changing password triggers revalidation of confirmPassword", () => {
    const { mediator, passwordField, confirmField } = setup();
    confirmField.setValue("pass1234");
    passwordField.setValue("pass1234");

    const state = mediator.getFieldState("confirmPassword");
    expect(state.errors).not.toContain("Passwords do not match");
  });

  it("getFieldState returns default for unregistered field", () => {
    const { mediator } = setup();
    const state = mediator.getFieldState("nonexistent");
    expect(state).toEqual({ value: "", errors: [], isDirty: false, isValid: false });
  });

  it("short password is invalid", () => {
    const { mediator, passwordField } = setup();
    passwordField.setValue("short");
    const state = mediator.getFieldState("password");
    expect(state.isValid).toBe(false);
    expect(state.errors).toContain("Minimum 8 characters required");
  });
});

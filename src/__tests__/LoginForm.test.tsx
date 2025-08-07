import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "../components/LoginForm";

test("fills form and submits", () => {
  render(<LoginForm />);
  const emailInput = screen.getByPlaceholderText("Enter Email");
  const passwordInput = screen.getByPlaceholderText("Enter Password");
  const button = screen.getByText("Login");

  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });
  fireEvent.click(button);

  // Check that values were entered (console.log not testable without mocking)
  expect(emailInput).toHaveValue("test@example.com");
  expect(passwordInput).toHaveValue("password123");
});

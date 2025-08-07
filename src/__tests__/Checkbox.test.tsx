import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Checkbox from "../components/Checkbox";

test("renders and toggles checkbox", () => {
  const handleChange = jest.fn();
  render(<Checkbox label="Accept Terms" checked={false} onChange={handleChange} />);
  const checkbox = screen.getByLabelText("Accept Terms");
  fireEvent.click(checkbox);
  expect(handleChange).toHaveBeenCalledWith(true);
});

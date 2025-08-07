import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InputField from "../components/InputField";

describe("InputField Component", () => {
  it("renders with label and handles input changes", () => {
    const handleChange = jest.fn();
    render(<InputField label="Name" value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Enter Name");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Nikhilesh" } });
    expect(handleChange).toHaveBeenCalledWith("Nikhilesh");
  });
});

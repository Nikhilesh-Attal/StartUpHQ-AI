"use client";
import React, { useState } from "react";
import InputField from "./InputField";
import Button from "./Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (email && password) {
      console.log("Submitted:", { email, password });
    }
  };

  return (
    <div>
      <InputField label="Email" value={email} onChange={setEmail} />
      <InputField label="Password" value={password} onChange={setPassword} />
      <Button label="Login" onClick={handleSubmit} />
    </div>
  );
}

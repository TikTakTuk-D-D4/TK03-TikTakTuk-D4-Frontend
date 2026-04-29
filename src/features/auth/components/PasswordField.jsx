import { useState } from "react";
import Input from "../../../components/ui/Input";

export default function PasswordField({
  name,
  value,
  onChange,
  placeholder = "Masukkan password",
  className = "",
  disabled = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`pr-10 ${className}`}
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="
          absolute right-3 top-1/2 -translate-y-1/2
          text-muted hover:text-text
          text-sm
        "
        tabIndex={-1}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

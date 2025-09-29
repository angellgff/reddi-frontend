import LockLoginIcon from "@/src/components/icons/LockLoginIcon";
import EyeLoginIcon from "@/src/components/icons/EyeLoginIcon";
import EyeLoginHIcon from "@/src/components/icons/EyeLoginHIcon";
import InputNotice from "./InputNotice";

// myOnChange registra en el padre los cambios en el input
// displayPassword avisa al padre si debe mostrar o cambiar la contraseña
interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  label?: string;
  autoComplete?: string;
  isVisible?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayPassword: (visible: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export default function PasswordInput({
  id = "password",
  name = id,
  value,
  placeholder = "Ingresa tu contraseña",
  label = "Contraseña",
  autoComplete = "current-password",
  isVisible = false,
  onChange,
  displayPassword,
  disabled = false,
  error,
}: PasswordInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
      >
        {label}
        {/* Corregido de "Nombre" a "Contraseña" para mayor claridad */}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <LockLoginIcon className="" />
        </span>
        <input
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded-xl border-[#D9DCE3] border sm:text-sm p-2 font-roboto px-10 ${
            error ? "border-error" : ""
          }`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => displayPassword(!isVisible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          disabled={disabled}
        >
          {isVisible ? (
            <EyeLoginHIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeLoginIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {error && <InputNotice msg={error} variant="error" />}
    </div>
  );
}

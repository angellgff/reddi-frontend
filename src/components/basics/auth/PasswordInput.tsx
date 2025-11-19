import LockLoginIcon from "../../icons/LockLoginIcon";
import EyeLoginIcon from "../../icons/EyeLoginIcon";
import EyeLoginHIcon from "../../icons/EyeLoginHIcon";

// myOnChange registra en el padre los cambios en el input
// displayPassword avisa al padre si debe mostrar o cambiar la contraseña
interface PasswordInputProps {
  id?: string;
  label?: string;
  autoComplete?: string;
  isPasswordDisplayed: boolean;
  passwordValue: string;
  displayPassword: (show: boolean) => void;
  myOnChange: (password: string) => void;
  disabled?: boolean;
}

export default function PasswordInput({
  id = "password",
  label = "Contraseña",
  autoComplete = "current-password",
  isPasswordDisplayed,
  passwordValue,
  displayPassword,
  myOnChange,
  disabled = false,
}: PasswordInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-600 font-roboto"
      >
        {label}
        {/* Corregido de "Nombre" a "Contraseña" para mayor claridad */}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <LockLoginIcon className="h-5 w-5" />
        </span>
        <input
          type={isPasswordDisplayed ? "text" : "password"}
          autoComplete={autoComplete}
          id={id}
          name={id}
          value={passwordValue}
          onChange={(e) => myOnChange(e.target.value)}
          placeholder="Ingresa tu contraseña"
          className="w-full pl-10 pr-10 py-3 border border-gray-400 rounded-xl font-roboto"
          required
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => displayPassword(!isPasswordDisplayed)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          disabled={disabled}
        >
          {isPasswordDisplayed ? (
            <EyeLoginHIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeLoginIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaSchool,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { authService } from "../../services";

type FormData = {
  fullName: string;
  studentId: string;
  university: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  emergencyContact: string;
  password: string;
  confirmPassword: string;
};

const TEN_DIGIT_REGEX = /^\d{10}$/;

const sanitizePhone = (value: string) =>
  value.replace(/\s+/g, "").replace(/\D/g, "").slice(0, 10);

const isEmailFormatValid = (value: string) => /^\S+@\S+\.\S+$/.test(value);

const allowEditControlKeys = (key: string) =>
  key === "Backspace" ||
  key === "Delete" ||
  key === "ArrowLeft" ||
  key === "ArrowRight" ||
  key === "Tab" ||
  key === "Home" ||
  key === "End";

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    studentId: "",
    university: "",
    email: "",
    phone: "",
    gender: "Male",
    address: "",
    emergencyContact: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const setField = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value as any }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const setNumericField = (
    key: "phone" | "emergencyContact",
    value: string,
  ) => {
    setField(key, sanitizePhone(value));
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isShortcut =
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "x", "v"].includes(e.key.toLowerCase());
    if (isShortcut || allowEditControlKeys(e.key)) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    currentValue: string,
    onChange: (value: string) => void,
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    onChange(sanitizePhone(`${currentValue}${pastedText}`));
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!formData.fullName.trim()) next.fullName = "Full name is required";
    if (!formData.studentId.trim()) next.studentId = "Student ID is required";
    if (!formData.university.trim())
      next.university = "University / College is required";

    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      next.email = "Email format is invalid";
    }

    if (!TEN_DIGIT_REGEX.test(formData.phone))
      next.phone = "Phone number must contain exactly 10 digits.";
    if (!formData.address.trim()) next.address = "Address is required";
    if (!TEN_DIGIT_REGEX.test(formData.emergencyContact))
      next.emergencyContact =
        "Emergency contact must contain exactly 10 digits.";

    if (!formData.password) {
      next.password = "Password is required";
    } else if (formData.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      next.confirmPassword = "Confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMessage("");
    setErrors({});

    try {
      const res = await authService.register({
        name: formData.fullName.trim(),
        studentId: formData.studentId.trim().toUpperCase(),
        university: formData.university.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success) {
        setSuccessMessage(
          res.message ||
            "Registration submitted successfully. Please wait for admin approval.",
        );
        setFormData({
          fullName: "",
          studentId: "",
          university: "",
          email: "",
          phone: "",
          gender: "Male",
          address: "",
          emergencyContact: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setErrors({ general: res.message || "Registration failed" });
      }
    } catch (error: any) {
      const responseData = error?.response?.data;
      const backendErrors: Record<string, string> = {};

      if (Array.isArray(responseData?.errors)) {
        responseData.errors.forEach((err: { field?: string; message?: string }) => {
          if (!err?.field || !err?.message) return;
          const fieldMap: Record<string, keyof FormData | "general"> = {
            name: "fullName",
            studentId: "studentId",
            email: "email",
            phone: "phone",
            password: "password",
            confirmPassword: "confirmPassword",
          };
          const mapped = fieldMap[err.field] || "general";
          backendErrors[mapped] = err.message;
        });
      }

      setErrors({
        ...backendErrors,
        general:
          responseData?.message ||
          backendErrors.general ||
          "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200')]" />
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/90 to-primary-hover/75" />
        <div className="relative z-10 p-14 flex flex-col justify-between text-white">
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Student Registration Portal
            </h1>
            <p className="mt-4 text-sidebar-foreground/90 text-lg">
              Create your hostel account and submit it for admin approval.
            </p>
          </div>
          <div className="space-y-3 text-sm text-sidebar-foreground/90">
            <p>1. Complete your profile with student details.</p>
            <p>2. Admin reviews and approves registration.</p>
            <p>3. Approved accounts can access student dashboard.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-background">
        <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-xl p-7">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/15 text-white flex items-center justify-center mb-3">
              <FaUserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Register as Student
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your account will remain pending until admin approval.
            </p>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-xl border border-primary/25 bg-surface-active px-4 py-3 text-primary text-sm flex items-start gap-2">
              <FaCheckCircle className="mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-5 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-error text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.fullName}>
                <Input
                  icon={<FaUser />}
                  value={formData.fullName}
                  onChange={(v) => setField("fullName", v)}
                  placeholder="John Perera"
                />
              </Field>

              <Field label="Student ID" error={errors.studentId}>
                <Input
                  icon={<FaIdCard />}
                  value={formData.studentId}
                  onChange={(v) => setField("studentId", v)}
                  placeholder="STU2026001"
                />
              </Field>
            </div>

            <Field label="University / College" error={errors.university}>
              <Input
                icon={<FaSchool />}
                value={formData.university}
                onChange={(v) => setField("university", v)}
                placeholder="University of Jaffna"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Email Address"
                error={errors.email}
                helper={
                  formData.email
                    ? isEmailFormatValid(formData.email)
                      ? `Preview: ${formData.email.trim()}`
                      : "Use format like name@example.com"
                    : ""
                }
              >
                <Input
                  icon={<FaEnvelope />}
                  value={formData.email}
                  onChange={(v) => setField("email", v)}
                  placeholder="student@example.com"
                  type="email"
                  hasError={Boolean(errors.email)}
                />
              </Field>

              <Field
                label="Phone Number"
                error={errors.phone}
                helper={
                  formData.phone
                    ? `${formData.phone.length}/10 digits`
                    : "Enter exactly 10 digits"
                }
              >
                <Input
                  icon={<FaPhone />}
                  value={formData.phone}
                  onChange={(v) => setNumericField("phone", v)}
                  placeholder="Enter 10-digit phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={(e) =>
                    handleNumericPaste(e, formData.phone, (v) =>
                      setNumericField("phone", v),
                    )
                  }
                  hasError={Boolean(errors.phone)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Gender" error={errors.gender}>
                <select
                  title="Gender"
                  value={formData.gender}
                  onChange={(e) => setField("gender", e.target.value)}
                  className="w-full px-3 py-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/30 transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field
                label="Emergency Contact"
                error={errors.emergencyContact}
                helper={
                  formData.emergencyContact
                    ? `${formData.emergencyContact.length}/10 digits`
                    : "Enter exactly 10 digits"
                }
              >
                <Input
                  icon={<FaPhone />}
                  value={formData.emergencyContact}
                  onChange={(v) => setNumericField("emergencyContact", v)}
                  placeholder="Guardian phone number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={(e) =>
                    handleNumericPaste(e, formData.emergencyContact, (v) =>
                      setNumericField("emergencyContact", v),
                    )
                  }
                  hasError={Boolean(errors.emergencyContact)}
                />
              </Field>
            </div>

            <Field label="Address" error={errors.address}>
              <Input
                icon={<FaMapMarkerAlt />}
                value={formData.address}
                onChange={(v) => setField("address", v)}
                placeholder="Full residential address"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Password" error={errors.password}>
                <PasswordInput
                  value={formData.password}
                  onChange={(v) => setField("password", v)}
                  show={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                />
              </Field>

              <Field label="Confirm Password" error={errors.confirmPassword}>
                <PasswordInput
                  value={formData.confirmPassword}
                  onChange={(v) => setField("confirmPassword", v)}
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((prev) => !prev)}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary disabled:opacity-60 text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 disabled:scale-100 disabled:shadow-none"
            >
              {loading ? "Submitting..." : "Submit Registration"}
              {!loading && <FaArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-hover transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1 text-xs text-error">{error}</p>
    ) : helper ? (
      <p className="mt-1 text-xs text-subtle">{helper}</p>
    ) : null}
  </div>
);

const Input = ({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
  onKeyDown,
  onPaste,
  hasError = false,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  hasError?: boolean;
}) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
      {icon}
    </div>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      placeholder={placeholder}
      className={`w-full pl-10 pr-3 py-3 bg-muted/30 border rounded-xl text-foreground placeholder-subtle focus:outline-none focus:ring-2 transition-colors ${hasError ? "border-error/50 bg-error/10 focus:ring-error focus:border-error" : "border-border hover:border-primary/30 focus:ring-primary focus:border-primary"}`}
    />
  </div>
);

const PasswordInput = ({
  value,
  onChange,
  show,
  onToggle,
}: {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) => (
  <div className="relative">
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={show ? "text" : "password"}
      placeholder="Enter password"
      className="w-full pl-3 pr-10 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/30 transition-colors"
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
    >
      {show ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
);

export default Register;

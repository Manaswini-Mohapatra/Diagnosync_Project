import React, { useState, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight, Upload, File, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const PRIMARY = "#1F5F7A";

// ─────────────────────────────────────────────────────────────────────────────
// Stepper  (converted from stepper.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function FormStepper({ steps, currentStep, onStepClick }) {
  return (
    <nav aria-label="Progress" className="w-full">
      {/* Mobile: progress bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {steps[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(currentStep / steps.length) * 100}%`,
              backgroundColor: PRIMARY,
            }}
          />
        </div>
      </div>

      {/* Desktop: vertical stepper */}
      <ol className="hidden md:flex flex-col gap-0">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent  = step.id === currentStep;
          const isPending  = step.id > currentStep;

          return (
            <li key={step.id} className="relative">
              <button
                type="button"
                onClick={() => !isPending && onStepClick && onStepClick(step.id)}
                disabled={isPending}
                className={[
                  "flex items-center w-full py-4 text-left transition-colors focus:outline-none",
                  isPending ? "cursor-not-allowed" : "cursor-pointer hover:bg-black/5",
                ].join(" ")}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r transition-colors"
                  style={{
                    backgroundColor: isCurrent
                      ? PRIMARY
                      : isCompleted
                      ? `${PRIMARY}50`
                      : "transparent",
                  }}
                />

                <div className="flex items-center gap-3 pl-5">
                  <div className="flex items-center justify-center w-6 h-6 shrink-0">
                    {isCompleted ? (
                      <div
                        className="flex items-center justify-center w-6 h-6 rounded-full"
                        style={{ backgroundColor: `${PRIMARY}15` }}
                      >
                        <Check className="w-4 h-4" style={{ color: PRIMARY }} />
                      </div>
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full transition-colors"
                        style={{
                          backgroundColor: isCurrent ? PRIMARY : "#d1d5db",
                        }}
                      />
                    )}
                  </div>

                  <span
                    className="text-sm transition-colors"
                    style={{
                      fontWeight: isCurrent ? 600 : isCompleted ? 500 : 400,
                      color: isCurrent
                        ? PRIMARY
                        : isCompleted
                        ? "#374151"
                        : "#9ca3af",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormSection — animated step wrapper (converted from cn + animate-in)
// ─────────────────────────────────────────────────────────────────────────────
export function FormSection({ children, direction = "forward" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "forward" ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === "forward" ? -20 : 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormRow / FormTile — 2-column Mayo layout (from form-row.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function FormTile({ label, hint, children, required = false }) {
  return (
    <div className="flex flex-col gap-5 py-6 border-b border-gray-100 last:border-b-0 w-full">
      {/* HEADER */}
      <div className="space-y-1">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
          {label}
          {required && <span className="text-red-400 ml-1 text-base font-normal">*</span>}
        </h3>
        {hint && (
          <p className="text-sm text-gray-500 leading-relaxed">{hint}</p>
        )}
      </div>

      {/* CONTENT */}
      <div className="w-full flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormInput — floating-label underline input (from form-input.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function FormInput({ label, optional, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700 flex justify-between">
        <span>{label}</span>
        {optional && <span className="text-sm text-gray-400 font-normal">Optional</span>}
      </label>
      <input
        {...props}
        className={[
          "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5",
          "text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A] transition-all",
          error ? "border-red-400 focus:ring-red-400/20" : "",
          className,
        ].join(" ")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TextInput / TextArea — for doctor form
// ─────────────────────────────────────────────────────────────────────────────
export function TextInput({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        {...props}
        className={[
          "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5",
          "text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A] transition-all",
          error ? "border-red-400 focus:ring-red-400/20" : "",
          className,
        ].join(" ")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function TextArea({ label, rows = 4, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        {...props}
        rows={rows}
        className={[
          "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 resize-y",
          "text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A] transition-all",
          error ? "border-red-400 focus:ring-red-400/20" : "",
          className,
        ].join(" ")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NumberInput — prefixed number field
// ─────────────────────────────────────────────────────────────────────────────
export function NumberInput({ label, prefix, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          {...props}
          className={[
            "w-full bg-white border border-gray-200 rounded-lg py-2.5 pr-4",
            prefix ? "pl-8" : "pl-4",
            "text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A] transition-all",
            error ? "border-red-400 focus:ring-red-400/20" : "",
            className,
          ].join(" ")}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SelectionButton / SelectionGroup (from selection-button.tsx)
// Large clickable tiles for Yes/No/option choices
// ─────────────────────────────────────────────────────────────────────────────
export function SelectionButton({ label, selected, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full py-5 px-6 text-left transition-all duration-200",
        "border-2 rounded-lg focus:outline-none",
        selected
          ? "text-white"
          : "bg-white border-gray-200 text-gray-800 hover:border-[#1F5F7A]/50 hover:bg-[#1F5F7A]/5",
        className,
      ].join(" ")}
      style={
        selected
          ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
          : {}
      }
    >
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

export function SelectionGroup({ options, value, onChange, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {options.map((option) => (
        <SelectionButton
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TagInput (from tag-input.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Type and press Enter to add",
  suggestions = [],
  className = "",
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) =>
    onTagsChange(tags.filter((t) => t !== tagToRemove));

  const addSuggestion = (suggestion) => {
    if (!tags.includes(suggestion)) onTagsChange([...tags, suggestion]);
  };

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${PRIMARY}18`, color: PRIMARY }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-3 px-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1F5F7A] transition-colors"
      />

      {/* Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Common options:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSuggestion(s)}
                className="px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-500 hover:text-[#1F5F7A] hover:border-[#1F5F7A] transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckboxGrid — specialty selector for doctor form (from checkbox-grid.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function CheckboxGrid({ options, selected, onChange, columns = 2 }) {
  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const gridClass = columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className="flex items-start gap-3 p-3 rounded-xl border text-sm font-medium text-left transition-all"
            style={
              isSelected
                ? { backgroundColor: `${PRIMARY}08`, borderColor: PRIMARY, color: PRIMARY }
                : { borderColor: "#e5e7eb", color: "#374151" }
            }
          >
            <span
              className="w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors"
              style={
                isSelected
                  ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
                  : { borderColor: "#d1d5db" }
              }
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </span>
            <span className="leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SpecialtyTags — shows selected specialty chips with remove (from specialty-tags.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function SpecialtyTags({ tags, onRemove, className = "" }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileUploadZone — drag-and-drop file upload UI (from file-upload.tsx)
// NOTE: For the patient form this is a LOCAL UI state only component.
//       For the doctor form, wire onFilesChange to the API handler instead.
// ─────────────────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function FileUploadZone({
  files,
  onFilesChange,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (fileList) => {
      const newFiles = Array.from(fileList)
        .filter((f) => f.size <= maxSizeMB * 1024 * 1024)
        .map((f) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          size: f.size,
          type: f.type,
          raw: f, // keep raw File object for API upload
        }));
      if (newFiles.length) onFilesChange([...files, ...newFiles]);
    },
    [files, maxSizeMB, onFilesChange]
  );

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true);  }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop      = useCallback((e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }, [processFiles]);
  const handleInput     = useCallback((e) => { if (e.target.files) processFiles(e.target.files); }, [processFiles]);
  const removeFile      = useCallback((id) => onFilesChange(files.filter((f) => f.id !== id)), [files, onFilesChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
          isDragging
            ? "border-[#1F5F7A] bg-[#1F5F7A]/5"
            : "border-gray-200 hover:border-[#1F5F7A]/60 hover:bg-[#1F5F7A]/5",
        ].join(" ")}
      >
        <input type="file" accept={accept} multiple onChange={handleInput} className="hidden" />
        <Upload
          className="w-10 h-10 mb-3 transition-colors"
          style={{ color: isDragging ? PRIMARY : "#9ca3af" }}
        />
        <p className="text-sm text-gray-500">
          <span className="font-medium" style={{ color: PRIMARY }}>Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, DOC, DOCX, JPG, PNG (max {maxSizeMB} MB)
        </p>
      </label>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <File className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="p-2 text-gray-400 hover:text-[#1F5F7A] transition-colors" aria-label={`Download ${file.name}`}>
                  <Download className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeFile(file.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label={`Remove ${file.name}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NavigationButtons / StepNav (from navigation-buttons.tsx + doctor-nav-buttons.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export function StepNav({
  onBack,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  isSubmitting,
  nextLabel = "Continue",
  submitLabel = "Complete Registration",
  showBack = true,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-100 w-full">
      {!isFirst && showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      <button
        type="button"
        onClick={isLast ? onSubmit : onNext}
        disabled={isSubmitting}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-2.5 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow"
        style={{ backgroundColor: PRIMARY }}
      >
        {isSubmitting ? "Saving…" : isLast ? submitLabel : nextLabel}
        {!isLast && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Alias kept for backward compat in case anything imports MobileProgressBar
export function MobileProgressBar({ steps, currentStep }) {
  return (
    <div className="md:hidden mb-6">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span className="font-medium">Step {currentStep} of {steps.length}</span>
        <span style={{ color: PRIMARY, fontWeight: 600 }}>
          {steps.find((s) => s.id === currentStep)?.label}
        </span>
      </div>
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / steps.length) * 100}%`, backgroundColor: PRIMARY }}
        />
      </div>
    </div>
  );
}

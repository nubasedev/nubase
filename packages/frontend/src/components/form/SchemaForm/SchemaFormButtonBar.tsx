import type React from "react";
import type { SchemaFormConfiguration } from "../../../hooks";
import { Button } from "../../buttons/Button/Button";
import { ButtonBar } from "../../buttons/ButtonBar/ButtonBar";

export interface SchemaFormButtonBarProps {
  form: SchemaFormConfiguration<any>;
  submitText?: string;
  isComputing?: boolean;
  className?: string;
  alignment?: "left" | "center" | "right";
  variant?: "transparent" | "muted";
}

// ButtonBar component
export const SchemaFormButtonBar: React.FC<SchemaFormButtonBarProps> = ({
  form,
  submitText = "Submit",
  isComputing,
  className,
  alignment,
  variant,
}) => {
  return (
    <form.api.Subscribe
      selector={(state) => [
        state.canSubmit,
        state.isSubmitting,
        state.isValidating,
        state.errors,
      ]}
    >
      {([canSubmit, isSubmitting, _isValidating, _errors]) => (
        <ButtonBar
          alignment={alignment}
          className={className}
          variant={variant || "transparent"}
        >
          <Button
            type="submit"
            disabled={!canSubmit}
            isLoading={Boolean(isSubmitting || isComputing)}
            data-testid="form-submit-button"
          >
            {isSubmitting
              ? "Submitting..."
              : isComputing
                ? "Computing..."
                : submitText}
          </Button>
        </ButtonBar>
      )}
    </form.api.Subscribe>
  );
};

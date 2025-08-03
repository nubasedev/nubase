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
}

// ButtonBar component
export const SchemaFormButtonBar: React.FC<SchemaFormButtonBarProps> = ({
  form,
  submitText = "Submit",
  isComputing,
  className,
  alignment,
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
          variant="transparent"
        >
          <Button type="submit" disabled={!canSubmit || isComputing}>
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

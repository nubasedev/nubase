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

export const SchemaFormButtonBar: React.FC<SchemaFormButtonBarProps> = ({
  form,
  submitText = "Submit",
  isComputing = false,
  className,
  alignment = "right",
}) => {
  return (
    <form.api.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
    >
      {([canSubmit, isSubmitting]) => (
        <ButtonBar
          alignment={alignment}
          className={className}
          variant="transparent"
        >
          <Button
            type="button"
            disabled={!canSubmit || isComputing}
            onClick={() => form.api.handleSubmit()}
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

import { FormControl, Label, TextInput } from "../../../components";

interface PathParamEditorProps {
  paramKeys: string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function PathParamEditor({
  paramKeys,
  values,
  onChange,
}: PathParamEditorProps) {
  if (paramKeys.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Path Parameters</Label>
      {paramKeys.map((key) => (
        <FormControl key={key} label={`:${key}`} hint={`Value for ${key}`}>
          <TextInput
            value={values[key] ?? ""}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        </FormControl>
      ))}
    </div>
  );
}

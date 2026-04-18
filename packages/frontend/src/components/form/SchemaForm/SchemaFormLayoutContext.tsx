import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

export const DEFAULT_LABEL_WIDTH = 128;
export const MIN_LABEL_WIDTH = 60;
export const MAX_LABEL_WIDTH = 400;

export interface SchemaFormLayoutContextValue {
  labelWidth: number;
  setLabelWidth: (width: number) => void;
}

const SchemaFormLayoutContext = createContext<SchemaFormLayoutContextValue>({
  labelWidth: DEFAULT_LABEL_WIDTH,
  setLabelWidth: () => {},
});

export interface SchemaFormLayoutProviderProps {
  children: React.ReactNode;
}

export const SchemaFormLayoutProvider = ({
  children,
}: SchemaFormLayoutProviderProps) => {
  const [labelWidth, setLabelWidthRaw] = useState(DEFAULT_LABEL_WIDTH);

  const setLabelWidth = useCallback((width: number) => {
    const clamped = Math.min(MAX_LABEL_WIDTH, Math.max(MIN_LABEL_WIDTH, width));
    setLabelWidthRaw(clamped);
  }, []);

  return (
    <SchemaFormLayoutContext.Provider value={{ labelWidth, setLabelWidth }}>
      {children}
    </SchemaFormLayoutContext.Provider>
  );
};

export const useSchemaFormLayout = (): SchemaFormLayoutContextValue => {
  return useContext(SchemaFormLayoutContext);
};

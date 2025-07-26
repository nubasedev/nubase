import type {
  ObjectOutput,
  ObjectSchema,
  ObjectShape,
  SchemaMetadata,
} from "@nubase/core";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseComputedMetadataOptions {
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
}

export interface UseComputedMetadataResult<TShape extends ObjectShape> {
  /** Merged metadata for all properties (static + computed) */
  metadata: Record<keyof TShape, SchemaMetadata<any>>;
  /** Whether metadata is currently being computed */
  isComputing: boolean;
  /** Error that occurred during computation, if any */
  error: Error | null;
}

/**
 * Hook that provides debounced computed metadata for a form schema.
 *
 * This hook:
 * 1. Watches for changes in form data
 * 2. Debounces the computation to avoid excessive recalculation
 * 3. Merges static metadata with computed metadata
 * 4. Returns the final merged metadata for all properties
 *
 * @param schema The ObjectSchema with potential computed metadata
 * @param formData Current form data (partial object)
 * @param options Configuration options
 * @returns Object with merged metadata, loading state, and error state
 */
export function useComputedMetadata<TShape extends ObjectShape>(
  schema: ObjectSchema<TShape>,
  formData: Partial<ObjectOutput<TShape>>,
  options: UseComputedMetadataOptions = {},
): UseComputedMetadataResult<TShape> {
  const { debounceMs = 300 } = options;

  // State for the computed metadata
  const [metadata, setMetadata] = useState<
    Record<keyof TShape, SchemaMetadata<any>>
  >(() => {
    // Initialize with static metadata only
    const initialMeta: any = {};
    for (const key in schema._shape) {
      if (Object.hasOwn(schema._shape, key)) {
        const fieldSchema = schema._shape[key];
        if (fieldSchema) {
          initialMeta[key] = { ...fieldSchema._meta };
        }
      }
    }
    return initialMeta;
  });

  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const computingRef = useRef(false);

  // Compute metadata function
  const computeMetadata = useCallback(
    async (data: Partial<ObjectOutput<TShape>>) => {
      // Prevent concurrent computations
      if (computingRef.current) return;

      try {
        computingRef.current = true;
        setError(null);
        setIsComputing(true);

        const mergedMeta = await schema.getAllMergedMeta(data);

        // Always update metadata since we want reactive updates
        setMetadata(mergedMeta);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error during metadata computation");
        setError(error);
        console.warn("Failed to compute metadata:", error);
      } finally {
        computingRef.current = false;
        setIsComputing(false);
      }
    },
    [schema],
  );

  // Create a stable key for formData changes to trigger effect properly
  const _formDataKey = JSON.stringify(formData);

  // Debounced computation effect
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only compute if we have computed metadata definitions
    if (Object.keys(schema._computedMeta).length > 0) {
      // Set up new debounced computation
      timeoutRef.current = setTimeout(() => {
        computeMetadata(formData);
      }, debounceMs);
    } else {
      // No computed metadata, just use static metadata
      const staticMeta: any = {};
      for (const key in schema._shape) {
        if (Object.hasOwn(schema._shape, key)) {
          const fieldSchema = schema._shape[key];
          if (fieldSchema) {
            staticMeta[key] = { ...fieldSchema._meta };
          }
        }
      }
      setMetadata(staticMeta);
      setIsComputing(false);
      setError(null);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, computeMetadata, debounceMs, schema]);

  return {
    metadata,
    isComputing,
    error,
  };
}

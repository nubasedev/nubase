import { type ComponentType, useEffect, useState } from "react";

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

const getIcon = async (
  name: string,
): Promise<ComponentType<{ size?: number; className?: string }> | null> => {
  try {
    const module = await import("@tabler/icons-react");
    const IconComponent = module[name as keyof typeof module] as ComponentType<{
      size?: number;
      className?: string;
    }>;
    return IconComponent || null;
  } catch {
    return null;
  }
};

/**
 * DynamicIcon component that loads icons dynamically based on the provided name.
 */
export const DynamicIcon = ({
  name,
  size = 16,
  className,
}: DynamicIconProps) => {
  const [IconComponent, setIconComponent] = useState<ComponentType<{
    size?: number;
    className?: string;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadIcon = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const icon = await getIcon(name);
        if (mounted) {
          setIconComponent(() => icon);
          setError(!icon);
        }
      } catch {
        if (mounted) {
          setIconComponent(null);
          setError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      mounted = false;
    };
  }, [name]);

  if (isLoading) {
    return (
      <div
        className={`inline-block animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (error || !IconComponent) {
    return (
      <div
        className={`inline-block bg-gray-300 rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return <IconComponent size={size} className={className} />;
};

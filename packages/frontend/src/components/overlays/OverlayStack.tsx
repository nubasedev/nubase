import { type FC, type ReactElement, useCallback } from "react";
import { useOverlays } from "../../hooks/useOverlays";
import type { Overlay } from "../../utils/overlay-url";
import { Drawer } from "../floating/drawer/Drawer";
import type { BaseModalFrameProps } from "../floating/modal/types";
import { useNubaseContext } from "../nubase-app/NubaseContextProvider";
import { ModalViewRenderer } from "../views/ViewRenderer/modal/ModalViewRenderer";

type OverlayErrorFrameProps = BaseModalFrameProps & {
  message: string;
};

const OverlayErrorFrame: FC<OverlayErrorFrameProps> = ({ message }) => {
  return (
    <div className="h-full p-6 flex items-start">
      <div className="text-destructive">{message}</div>
    </div>
  );
};

type OverlayDrawerProps = {
  overlay: Overlay;
  depth: number;
  onClose: () => void;
};

const OverlayDrawer: FC<OverlayDrawerProps> = ({ overlay, depth, onClose }) => {
  const context = useNubaseContext();
  const resource = context.config.resources?.[overlay.resource];
  const view = resource?.views?.[overlay.operation];

  let content: ReactElement<BaseModalFrameProps>;

  if (!resource) {
    content = (
      <OverlayErrorFrame
        onClose={onClose}
        message={`Resource "${overlay.resource}" not found`}
      />
    );
  } else if (!view) {
    content = (
      <OverlayErrorFrame
        onClose={onClose}
        message={`View "${overlay.operation}" not found for resource "${overlay.resource}"`}
      />
    );
  } else {
    let validatedParams: Record<string, any> | undefined;
    let paramsError: string | null = null;

    if ((view as any).schemaParams) {
      try {
        validatedParams = (view as any).schemaParams
          .toZodWithCoercion()
          .parse(overlay.params);
      } catch (err) {
        paramsError = (err as Error).message;
      }
    } else {
      validatedParams = overlay.params as Record<string, any>;
    }

    if (paramsError) {
      content = (
        <OverlayErrorFrame
          onClose={onClose}
          message={`Invalid overlay parameters: ${paramsError}`}
        />
      );
    } else {
      content = (
        <ModalViewRenderer
          view={view}
          context={context}
          params={validatedParams}
          resourceName={overlay.resource}
          onClose={onClose}
          frameVariant="drawer"
        />
      ) as ReactElement<BaseModalFrameProps>;
    }
  }

  return (
    <Drawer open={true} onClose={onClose} depth={depth} content={content} />
  );
};

export const OverlayStack: FC = () => {
  const { overlays, closeOverlay } = useOverlays();

  const handleClose = useCallback(
    (depth: number) => () => closeOverlay(depth),
    [closeOverlay],
  );

  if (overlays.length === 0) return null;

  return (
    <>
      {overlays.map((overlay, i) => (
        <OverlayDrawer
          key={i}
          overlay={overlay}
          depth={i}
          onClose={handleClose(i)}
        />
      ))}
    </>
  );
};

import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";
import { type FC, type ReactElement, useCallback } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useOverlays } from "../../hooks/useOverlays";
import type { Overlay } from "../../utils/overlay-url";
import { Button } from "../buttons/Button/Button";
import { ButtonGroup } from "../buttons/ButtonGroup/ButtonGroup";
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

function buildOverlayUrl(
  workspaceSlug: string,
  overlay: Overlay,
): { pathname: string; search: Record<string, string> } {
  const pathname = `/${workspaceSlug}/r/${overlay.resource}/${overlay.operation}`;
  return { pathname, search: overlay.params };
}

type CommandBarProps = {
  overlay: Overlay;
  onClose: () => void;
  onOpenHere: () => void;
  onOpenInNewTab: () => void;
};

const CommandBar: FC<CommandBarProps> = ({
  onClose,
  onOpenHere,
  onOpenInNewTab,
}) => {
  return (
    <div className="flex h-12 items-center justify-end gap-2 px-4 bg-background border-b border-border">
      <ButtonGroup>
        <Button variant="outline" size="sm" onClick={onOpenHere}>
          Open here
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenInNewTab}>
          <ExternalLink />
          Open in new tab
        </Button>
      </ButtonGroup>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label="Close overlay"
      >
        <X />
      </Button>
    </div>
  );
};

type OverlayDrawerProps = {
  overlay: Overlay;
  onClose: () => void;
};

const OverlayDrawer: FC<OverlayDrawerProps> = ({ overlay, onClose }) => {
  const context = useNubaseContext();
  const navigate = useNavigate();
  const workspace = useWorkspace();

  const resource = context.config.resources?.[overlay.resource];
  const view = resource?.views?.[overlay.operation];

  const handleOpenHere = useCallback(() => {
    const { pathname, search } = buildOverlayUrl(workspace.slug, overlay);
    navigate({ to: pathname, search });
  }, [navigate, workspace.slug, overlay]);

  const handleOpenInNewTab = useCallback(() => {
    const { pathname, search } = buildOverlayUrl(workspace.slug, overlay);
    const params = new URLSearchParams(search);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [workspace.slug, overlay]);

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
    <Drawer
      open={true}
      onClose={onClose}
      content={content}
      header={
        <CommandBar
          overlay={overlay}
          onClose={onClose}
          onOpenHere={handleOpenHere}
          onOpenInNewTab={handleOpenInNewTab}
        />
      }
    />
  );
};

export const OverlayStack: FC = () => {
  const { overlay, closeOverlay } = useOverlays();

  if (!overlay) return null;

  return <OverlayDrawer overlay={overlay} onClose={closeOverlay} />;
};

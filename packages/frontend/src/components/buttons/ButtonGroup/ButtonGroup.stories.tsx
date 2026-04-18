import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "../Button/Button";
import { ButtonGroup } from "./ButtonGroup";

const meta: Meta<typeof ButtonGroup> = {
  title: "Buttons/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Report</Button>
      <Button variant="outline">Snooze</Button>
    </ButtonGroup>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="sm">
        Open here
      </Button>
      <Button variant="outline" size="sm">
        <ExternalLink />
        Open in new tab
      </Button>
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <ButtonGroup>
        <Button variant="outline" size="default">
          Default
        </Button>
        <Button variant="outline" size="default">
          Default
        </Button>
        <Button variant="outline" size="default">
          Default
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline" size="sm">
          Small
        </Button>
        <Button variant="outline" size="sm">
          Small
        </Button>
        <Button variant="outline" size="sm">
          Small
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const MixedWithStandaloneButton: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" aria-label="Back">
        <ArrowLeft />
      </Button>
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Archive
        </Button>
        <Button variant="outline" size="sm">
          Report
        </Button>
        <Button variant="outline" size="sm">
          Snooze
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="More">
          <MoreHorizontal />
        </Button>
      </ButtonGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A ButtonGroup can sit alongside standalone Buttons — shared borders collapse only between adjacent children of the group.",
      },
    },
  },
};

export const Pagination: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon-sm" aria-label="Previous">
        <ChevronLeft />
      </Button>
      <Button variant="outline" size="sm">
        1
      </Button>
      <Button variant="outline" size="sm">
        2
      </Button>
      <Button variant="outline" size="sm">
        3
      </Button>
      <Button variant="outline" size="icon-sm" aria-label="Next">
        <ChevronRight />
      </Button>
    </ButtonGroup>
  ),
};

export const OverlayCommandBar: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Open here
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink />
          Open in new tab
        </Button>
      </ButtonGroup>
      <Button variant="ghost" size="icon-sm" aria-label="Close">
        <X />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The exact composition used in the overlay drawer's command bar: a grouped pair of outline buttons plus a standalone ghost close button.",
      },
    },
  },
};

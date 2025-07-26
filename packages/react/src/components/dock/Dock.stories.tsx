import type { Meta, StoryObj } from "@storybook/react";
import { Dock } from "./Dock";

const meta: Meta<typeof Dock> = {
  title: "Dock/Dock",
  component: Dock,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof Dock>;

export const OneLevel: Story = {
  args: {
    top: <div>Top Panel Content - Takes only the space it needs</div>,
    left: <div>Left Panel Content</div>,
    center: <div>Center Panel Content</div>,
    right: <div>Right Panel Content</div>,
  },
};

export const OneLevelScrolling: Story = {
  args: {
    top: (
      <div>
        <h3>Top Panel with Multiple Lines</h3>
        <p>
          This top panel can contain multiple lines of content and will
          automatically size to fit its content.
        </p>
        <p>
          Notice how it takes exactly the space it needs and doesn't scroll -
          the columns below handle the scrolling.
        </p>
      </div>
    ),
    left: (
      <div>
        <h3>Left Panel</h3>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Left panel paragraph {i + 1}: This is a very long panel with lots of
            content that should scroll when it exceeds the panel height. The
            quick brown fox jumps over the lazy dog. This sentence contains
            every letter of the alphabet at least once. Adding even more content
            here to ensure we have enough text to trigger scrolling behavior in
            this left panel. Content continues with more text to fill the space
            and demonstrate vertical scrolling capabilities.
          </p>
        ))}
      </div>
    ),
    center: (
      <div>
        <h3>Center Panel</h3>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Center panel paragraph {i + 1}: The center panel also has scrollable
            content when it gets too long for the available space. This center
            section will demonstrate scrolling behavior with multiple paragraphs
            of content. Adding more content here to show how the center panel
            handles overflow with vertical scrolling. This content is designed
            to be long enough to definitely trigger scrolling in the center
            panel area.
          </p>
        ))}
      </div>
    ),
    right: (
      <div>
        <h3>Right Panel</h3>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Right panel paragraph {i + 1}: The right panel content is also
            scrollable when there is too much content to fit in the available
            space. This demonstrates that all three panels (left, center, right)
            can handle scrollable content independently. Right panel content
            continues with more text to show scrolling behavior and ensure we
            have enough content to make scrolling necessary.
          </p>
        ))}
      </div>
    ),
  },
};

export const TwoLevel: Story = {
  args: {
    top: (
      <div>
        <strong>Outer Dock Top Panel</strong> - This demonstrates nesting
        capability
      </div>
    ),
    left: <div>Outer Left Panel</div>,
    center: (
      <Dock
        top={
          <div>
            <em>Inner Dock Top Panel</em> - Nested inside the center of the
            outer system
          </div>
        }
        left={<div>Inner Left</div>}
        center={<div>Inner Center - This is a nested Dock!</div>}
        right={<div>Inner Right</div>}
        defaultLeftWidth={200}
        defaultRightWidth={200}
      />
    ),
    right: <div>Outer Right Panel</div>,
  },
};

export const TwoLevelScrolling: Story = {
  args: {
    top: (
      <div>
        <strong>Outer Top</strong> - Two-level scrollable content demo
      </div>
    ),
    left: (
      <div>
        <h3>Outer Left</h3>
        {Array.from({ length: 75 }, (_, i) => (
          <p key={i}>
            Outer left content {i + 1} - Two-level nested scrollable content
            demonstration.
          </p>
        ))}
      </div>
    ),
    center: (
      <Dock
        top={
          <div>
            <strong>Inner Top</strong> - Nested system with scrollable content
          </div>
        }
        left={
          <div>
            <h4>Inner Left</h4>
            {Array.from({ length: 80 }, (_, i) => (
              <p key={i}>
                Inner left scrollable content {i + 1} - Testing scrolling in
                nested two-level structure.
              </p>
            ))}
          </div>
        }
        center={
          <div>
            <h4>Inner Center</h4>
            {Array.from({ length: 85 }, (_, i) => (
              <p key={i}>
                Inner center scrollable content {i + 1} - Two-level nested
                center panel scrolling.
              </p>
            ))}
          </div>
        }
        right={
          <div>
            <h4>Inner Right</h4>
            {Array.from({ length: 70 }, (_, i) => (
              <p key={i}>
                Inner right scrollable content {i + 1} - Two-level nested right
                panel content.
              </p>
            ))}
          </div>
        }
        defaultLeftWidth={200}
        defaultRightWidth={200}
      />
    ),
    right: (
      <div>
        <h3>Outer Right</h3>
        {Array.from({ length: 65 }, (_, i) => (
          <p key={i}>
            Outer right content {i + 1} - Two-level outer right panel scrollable
            content.
          </p>
        ))}
      </div>
    ),
  },
};

export const ThreeLevel: Story = {
  args: {
    top: (
      <div>
        <strong>Level 1 Top</strong> - Root Dock
      </div>
    ),
    left: <div>Level 1 Left</div>,
    center: (
      <Dock
        top={
          <div>
            <strong>Level 2 Top</strong> - First nested Dock
          </div>
        }
        left={<div>Level 2 Left</div>}
        center={
          <Dock
            top={
              <div>
                <strong>Level 3 Top</strong> - Second nested Dock
              </div>
            }
            left={<div>Level 3 Left</div>}
            center={<div>Level 3 Center - Deeply nested!</div>}
            right={<div>Level 3 Right</div>}
            defaultLeftWidth={150}
            defaultRightWidth={150}
          />
        }
        right={<div>Level 2 Right</div>}
        defaultLeftWidth={180}
        defaultRightWidth={180}
      />
    ),
    right: <div>Level 1 Right</div>,
  },
};

export const ThreeLevelScrolling: Story = {
  args: {
    top: (
      <div>
        <strong>Outer Top</strong> - Scrollable nested content demo
      </div>
    ),
    left: (
      <div>
        <h3>Outer Left</h3>
        {Array.from({ length: 100 }, (_, i) => (
          <p key={i}>
            Outer left content {i + 1} - This content should definitely scroll
            when there are 100 paragraphs like this one.
          </p>
        ))}
      </div>
    ),
    center: (
      <Dock
        top={
          <div>
            <strong>Inner Top</strong> - Nested system with scrollable content
          </div>
        }
        left={
          <div>
            <h4>Inner Left</h4>
            {Array.from({ length: 100 }, (_, i) => (
              <p key={i}>
                Inner left scrollable content {i + 1} - All these paragraphs
                ensure scrolling works in nested panels.
              </p>
            ))}
          </div>
        }
        center={
          <div>
            <h4>Inner Center</h4>
            {Array.from({ length: 100 }, (_, i) => (
              <p key={i}>
                Inner center scrollable content {i + 1} - Testing scrolling
                behavior in deeply nested content areas.
              </p>
            ))}
          </div>
        }
        right={
          <div>
            <h4>Inner Right</h4>
            {Array.from({ length: 100 }, (_, i) => (
              <p key={i}>
                Inner right scrollable content {i + 1} - Demonstrating
                independent scrolling in each nested panel.
              </p>
            ))}
          </div>
        }
        defaultLeftWidth={180}
        defaultRightWidth={180}
      />
    ),
    right: (
      <div>
        <h3>Outer Right</h3>
        {Array.from({ length: 100 }, (_, i) => (
          <p key={i}>
            Outer right content {i + 1} - Even the outer panels have plenty of
            scrollable content now.
          </p>
        ))}
      </div>
    ),
  },
};

export const FourLevel: Story = {
  args: {
    top: (
      <div>
        <strong>Level 1 Top</strong> - Root Dock (4 levels deep)
      </div>
    ),
    left: <div>Level 1 Left</div>,
    center: (
      <Dock
        top={
          <div>
            <strong>Level 2 Top</strong> - First nested Dock
          </div>
        }
        left={<div>Level 2 Left</div>}
        center={
          <Dock
            top={
              <div>
                <strong>Level 3 Top</strong> - Second nested Dock
              </div>
            }
            left={<div>Level 3 Left</div>}
            center={
              <Dock
                top={
                  <div>
                    <strong>Level 4 Top</strong> - Third nested Dock
                  </div>
                }
                left={<div>Level 4 Left</div>}
                center={<div>Level 4 Center - Four levels deep!</div>}
                right={<div>Level 4 Right</div>}
                defaultLeftWidth={120}
                defaultRightWidth={120}
              />
            }
            right={<div>Level 3 Right</div>}
            defaultLeftWidth={140}
            defaultRightWidth={140}
          />
        }
        right={<div>Level 2 Right</div>}
        defaultLeftWidth={160}
        defaultRightWidth={160}
      />
    ),
    right: <div>Level 1 Right</div>,
  },
};

export const FourLevelScrolling: Story = {
  args: {
    top: (
      <div>
        <strong>Level 1 Top</strong> - Scrollable four-level nested content demo
      </div>
    ),
    left: (
      <div>
        <h3>Level 1 Left</h3>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Level 1 left content {i + 1} - Root level scrollable content.
          </p>
        ))}
      </div>
    ),
    center: (
      <Dock
        top={
          <div>
            <strong>Level 2 Top</strong> - First nested system with scrollable
            content
          </div>
        }
        left={
          <div>
            <h4>Level 2 Left</h4>
            {Array.from({ length: 60 }, (_, i) => (
              <p key={i}>
                Level 2 left scrollable content {i + 1} - Second level nested
                content.
              </p>
            ))}
          </div>
        }
        center={
          <Dock
            top={
              <div>
                <strong>Level 3 Top</strong> - Second nested system
              </div>
            }
            left={
              <div>
                <h5>Level 3 Left</h5>
                {Array.from({ length: 40 }, (_, i) => (
                  <p key={i}>
                    Level 3 left content {i + 1} - Third level nested scrolling.
                  </p>
                ))}
              </div>
            }
            center={
              <Dock
                top={
                  <div>
                    <strong>Level 4 Top</strong> - Deepest nested system
                  </div>
                }
                left={
                  <div>
                    <h6>Level 4 Left</h6>
                    {Array.from({ length: 30 }, (_, i) => (
                      <p key={i}>
                        Level 4 left content {i + 1} - Deepest level scrolling!
                      </p>
                    ))}
                  </div>
                }
                center={
                  <div>
                    <h6>Level 4 Center</h6>
                    {Array.from({ length: 35 }, (_, i) => (
                      <p key={i}>
                        Level 4 center content {i + 1} - Four levels deep with
                        scrolling!
                      </p>
                    ))}
                  </div>
                }
                right={
                  <div>
                    <h6>Level 4 Right</h6>
                    {Array.from({ length: 25 }, (_, i) => (
                      <p key={i}>
                        Level 4 right content {i + 1} - Maximum depth scrollable
                        content.
                      </p>
                    ))}
                  </div>
                }
                defaultLeftWidth={120}
                defaultRightWidth={120}
              />
            }
            right={
              <div>
                <h5>Level 3 Right</h5>
                {Array.from({ length: 45 }, (_, i) => (
                  <p key={i}>
                    Level 3 right content {i + 1} - Third level scrolling
                    content.
                  </p>
                ))}
              </div>
            }
            defaultLeftWidth={140}
            defaultRightWidth={140}
          />
        }
        right={
          <div>
            <h4>Level 2 Right</h4>
            {Array.from({ length: 55 }, (_, i) => (
              <p key={i}>
                Level 2 right scrollable content {i + 1} - Second level nested
                scrolling.
              </p>
            ))}
          </div>
        }
        defaultLeftWidth={160}
        defaultRightWidth={160}
      />
    ),
    right: (
      <div>
        <h3>Level 1 Right</h3>
        {Array.from({ length: 70 }, (_, i) => (
          <p key={i}>
            Level 1 right content {i + 1} - Root level right panel scrollable
            content.
          </p>
        ))}
      </div>
    ),
  },
};

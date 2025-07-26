# Modal Architecture

This modal architecture provides a unified `useModal` hook for all modal types.

## Key Concepts

### Modal Frames
Instead of having different hooks for different modal types, this architecture uses "modal frames" - components that define the structure and behavior of the modal content.

### Built-in Modal Frames

1. **ModalFrame** - A simple frame that starts small, grows vertically with content, and scrolls after reaching max height
2. **ModalFrameStructured** - A frame with distinct header, body, and footer sections
3. **ModalFrameSchemaForm** - A specialized frame for schema-driven forms (uses ModalFrameStructured internally)

### Unified Hook
All modals are opened using a single `useModal` hook:

```tsx
const { openModal, closeModal, closeAllModals } = useModal();
```

## Usage Examples

### Basic Modal Frame
```tsx
openModal({
  content: (
    <ModalFrame>
      <div>Your content here</div>
    </ModalFrame>
  ),
  size: "md",
});
```

### Structured Modal Frame
```tsx
openModal({
  content: (
    <ModalFrameStructured
      header={<h2>Modal Title</h2>}
      body={<div>Modal content</div>}
      footer={<ButtonBar>...</ButtonBar>}
    />
  ),
  size: "lg",
});
```

### Schema Form Modal Frame
```tsx
const form = useSchemaForm({
  schema: MySchema,
  onSubmit: async (data) => {
    // Handle submission
  }
});

openModal({
  content: (
    <ModalFrameSchemaForm
      title="Edit User"
      form={form}
      submitText="Save"
    />
  ),
  size: "lg",
});
```

## Creating Custom Frames

You can create custom modal frames by implementing a component that accepts `BaseModalFrameProps`:

```tsx
type MyCustomFrameProps = BaseModalFrameProps & {
  // Your custom props
};

const MyCustomFrame: FC<MyCustomFrameProps> = ({ onClose, ...props }) => {
  return (
    <div className="custom-modal-design">
      {/* Your custom modal content */}
    </div>
  );
};

// Usage
openModal({
  content: (
    <MyCustomFrame
      // Your custom props
    />
  ),
});
```

## Benefits

1. **Single Hook** - One `useModal` hook for all modal types
2. **Type Safety** - Full TypeScript support with proper prop inference
3. **Flexibility** - Easy to create custom modal frames
4. **Consistency** - All modals share the same base behavior (stacking, backdrop, animations)
5. **Composability** - Modal frames can use other frames internally (e.g., ModalFrameSchemaForm uses ModalFrameStructured)

## Provider Setup

Add the provider to your app:

```tsx
import { ModalProvider } from "@nubase/frontend";

function App() {
  return (
    <ModalProvider>
      {/* Your app */}
    </ModalProvider>
  );
}
```
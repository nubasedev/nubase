import type { Meta, StoryObj } from "@storybook/react";
import { BellIcon, CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Account</h3>
          <p className="text-sm text-muted-foreground">
            Make changes to your account here. Click save when you're done.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">
            Change your password here. After saving, you'll be logged out.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure your application preferences here.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic tabs with text-only triggers.",
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="w-[450px]">
      <TabsList>
        <TabsTrigger value="profile">
          <UserIcon />
          Profile
        </TabsTrigger>
        <TabsTrigger value="billing">
          <CreditCardIcon />
          Billing
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <BellIcon />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="settings">
          <SettingsIcon />
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Profile Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your public profile information.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Billing Information</h3>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods and billing history.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure your application preferences.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs with icons alongside text labels.",
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="restricted" disabled>
          Restricted
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Active Items</h3>
          <p className="text-sm text-muted-foreground">
            These items are currently active and visible.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="pending">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Pending Items</h3>
          <p className="text-sm text-muted-foreground">
            These items are awaiting approval.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="restricted">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Restricted Items</h3>
          <p className="text-sm text-muted-foreground">
            You don't have access to this section.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs with a disabled trigger that cannot be selected.",
      },
    },
  },
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="params" className="w-[350px]">
      <TabsList>
        <TabsTrigger value="params">Params</TabsTrigger>
        <TabsTrigger value="body">Body</TabsTrigger>
      </TabsList>
      <TabsContent value="params">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Request Parameters</h3>
          <p className="text-sm text-muted-foreground">
            Configure path and query parameters for your request.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="body">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Request Body</h3>
          <p className="text-sm text-muted-foreground">
            Enter the JSON body for POST/PATCH requests.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Simple two-tab layout, useful for request panels.",
      },
    },
  },
};

export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-2xl">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex-1">
          Analytics
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex-1">
          Reports
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Overview</h3>
          <p className="text-sm text-muted-foreground">
            Get a high-level view of your data and key metrics.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Dive deep into your data with detailed analytics.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="reports">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Reports</h3>
          <p className="text-sm text-muted-foreground">
            Generate and download custom reports.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tabs that expand to fill the available width.",
      },
    },
  },
};

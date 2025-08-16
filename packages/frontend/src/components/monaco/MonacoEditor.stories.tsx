import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import MonacoEditor from "./MonacoEditor";

const meta: Meta<typeof MonacoEditor> = {
  title: "Monaco/MonacoEditor",
  component: MonacoEditor,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof MonacoEditor>;

// Wrapper component to handle state for stories
const EditorWrapper = ({
  initialValue,
  language,
  height = "600px",
  width = "100%",
}: {
  initialValue: string;
  language?: "markdown" | "json" | "javascript";
  height?: string;
  width?: string;
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div style={{ height, width }}>
      <MonacoEditor value={value} onChange={setValue} language={language} />
    </div>
  );
};

// =============================================================================
// MARKDOWN EDITOR STORIES
// =============================================================================

export const MarkdownStandard: Story = {
  render: () => (
    <EditorWrapper
      language="markdown"
      initialValue={`# Welcome to Monaco Editor

This is a **Markdown** editor with syntax highlighting and spellcheck support.

## Features

- Syntax highlighting
- Spellcheck (requires dictionary files)
- Auto-completion
- Find and replace
- Multiple language support

### Code Example

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

hello("World");
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three

> This is a blockquote with some **bold** text and *italic* text.

---

*Happy editing!*
`}
    />
  ),
};

export const MarkdownSmall: Story = {
  render: () => (
    <EditorWrapper
      language="markdown"
      height="400px"
      width="600px"
      initialValue={`# Small Markdown Editor

This is a **compact** markdown editor for quick notes.

## Quick Features
- Syntax highlighting
- Basic formatting
- Code blocks

\`\`\`bash
npm install monaco-editor
\`\`\`

> Perfect for quick documentation!
`}
    />
  ),
};

export const MarkdownFullScreen: Story = {
  render: () => (
    <EditorWrapper
      language="markdown"
      height="100vh"
      initialValue={`# Full Screen Markdown Editor

This editor takes up the full viewport height for immersive markdown editing.

## Perfect for Long Documents

This full-screen view is ideal for:
- Writing extensive documentation
- Creating detailed README files
- Drafting blog posts or articles
- Working on technical specifications

## Advanced Markdown Features

### Code Blocks with Syntax Highlighting

\`\`\`typescript
interface MarkdownConfig {
  enableSpellcheck: boolean;
  theme: 'light' | 'dark';
  fontSize: number;
}

function configureMarkdown(config: MarkdownConfig): void {
  console.log('Configuring markdown editor:', config);
}
\`\`\`

\`\`\`python
def process_markdown(content: str) -> str:
    """Process markdown content and return HTML."""
    import markdown
    return markdown.markdown(content)

# Example usage
html_output = process_markdown("# Hello World")
print(html_output)
\`\`\`

### Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 support |
| **Bold** | ✅ | Double asterisks |
| *Italic* | ✅ | Single asterisks |
| Code | ✅ | Backticks |
| Links | ✅ | [text](url) format |
| Images | ✅ | ![alt](src) format |

### Task Lists

- [x] Implement markdown support
- [x] Add syntax highlighting
- [x] Enable spellcheck
- [ ] Add live preview
- [ ] Support custom themes

### Mathematical Expressions

For mathematical content, you can use LaTeX-style syntax:

\`\`\`
E = mc²
\`\`\`

### Blockquotes and Callouts

> **Note:** This is an important note that readers should pay attention to.

> **Warning:** Be careful when implementing these features in production.

> **Tip:** Use keyboard shortcuts like Ctrl+B for bold and Ctrl+I for italic.

---

## Keyboard Shortcuts

- **Ctrl+B** - Bold selection
- **Ctrl+I** - Italic selection
- **Ctrl+K** - Create link
- **Ctrl+Shift+V** - Paste as plain text
- **Ctrl+/** - Toggle comment
- **Ctrl+D** - Duplicate line
- **Alt+Up/Down** - Move line up/down

Happy writing in full-screen mode! 📝✨
`}
    />
  ),
};

// =============================================================================
// JSON EDITOR STORIES
// =============================================================================

export const JsonStandard: Story = {
  render: () => (
    <EditorWrapper
      language="json"
      initialValue={`{
  "name": "example-project",
  "version": "1.0.0",
  "description": "An example JSON configuration with rich data types",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "build": "webpack --mode production",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nodemon": "^2.0.20",
    "webpack": "^5.74.0",
    "eslint": "^8.42.0",
    "prettier": "^2.8.8"
  },
  "keywords": [
    "example",
    "json",
    "configuration",
    "monaco-editor"
  ],
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://yourwebsite.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/example-project.git"
  },
  "config": {
    "port": 3000,
    "environment": "development",
    "database": {
      "host": "localhost",
      "port": 5432,
      "name": "example_db",
      "ssl": false
    },
    "features": {
      "authentication": true,
      "logging": true,
      "caching": false,
      "monitoring": true
    },
    "limits": {
      "maxFileSize": 10485760,
      "requestTimeout": 30000,
      "maxConnections": 1000
    }
  }
}`}
    />
  ),
};

export const JsonSmall: Story = {
  render: () => (
    <EditorWrapper
      language="json"
      height="400px"
      width="500px"
      initialValue={`{
  "name": "quick-config",
  "version": "1.0.0",
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "autoSave": true
  },
  "features": [
    "syntax-highlighting",
    "auto-completion",
    "error-detection"
  ],
  "enabled": true
}`}
    />
  ),
};

export const JsonFullScreen: Story = {
  render: () => (
    <EditorWrapper
      language="json"
      height="100vh"
      initialValue={`{
  "projectName": "Full Screen JSON Editor Demo",
  "version": "2.1.0",
  "description": "Comprehensive JSON configuration for demonstrating Monaco editor capabilities in full-screen mode",
  "lastModified": "2024-01-15T10:30:00Z",
  "metadata": {
    "created": "2023-06-01T00:00:00Z",
    "authors": ["Developer One", "Developer Two", "Developer Three"],
    "tags": ["json", "monaco", "editor", "configuration", "full-screen"],
    "category": "development-tools",
    "priority": "high",
    "status": "active"
  },
  "application": {
    "server": {
      "host": "0.0.0.0",
      "port": 8080,
      "protocol": "https",
      "ssl": {
        "enabled": true,
        "certificatePath": "/etc/ssl/certs/app.crt",
        "keyPath": "/etc/ssl/private/app.key",
        "cipherSuite": "ECDHE-RSA-AES128-GCM-SHA256"
      },
      "cors": {
        "enabled": true,
        "origins": ["https://example.com", "https://app.example.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allowedHeaders": ["Content-Type", "Authorization", "X-Requested-With"]
      },
      "rateLimit": {
        "windowMs": 900000,
        "maxRequests": 100,
        "skipSuccessfulRequests": false
      }
    },
    "database": {
      "primary": {
        "type": "postgresql",
        "host": "db-primary.example.com",
        "port": 5432,
        "database": "production_db",
        "username": "app_user",
        "pool": {
          "min": 5,
          "max": 20,
          "idleTimeoutMillis": 30000,
          "connectionTimeoutMillis": 2000
        },
        "ssl": {
          "enabled": true,
          "rejectUnauthorized": true
        }
      },
      "replica": {
        "type": "postgresql",
        "host": "db-replica.example.com",
        "port": 5432,
        "database": "production_db",
        "username": "readonly_user",
        "pool": {
          "min": 2,
          "max": 10,
          "idleTimeoutMillis": 30000
        }
      },
      "cache": {
        "type": "redis",
        "host": "cache.example.com",
        "port": 6379,
        "database": 0,
        "keyPrefix": "app:",
        "ttl": 3600,
        "cluster": {
          "enabled": true,
          "nodes": [
            {"host": "cache-1.example.com", "port": 6379},
            {"host": "cache-2.example.com", "port": 6379},
            {"host": "cache-3.example.com", "port": 6379}
          ]
        }
      }
    },
    "logging": {
      "level": "info",
      "format": "json",
      "outputs": [
        {
          "type": "console",
          "enabled": true,
          "colorize": true
        },
        {
          "type": "file",
          "enabled": true,
          "path": "/var/log/app/application.log",
          "maxSize": "100MB",
          "maxFiles": 10,
          "compress": true
        },
        {
          "type": "elasticsearch",
          "enabled": true,
          "host": "logs.example.com",
          "port": 9200,
          "index": "application-logs",
          "auth": {
            "username": "log_user",
            "password": "example_log_password_123"
          }
        }
      ]
    },
    "monitoring": {
      "healthcheck": {
        "enabled": true,
        "path": "/health",
        "interval": 30000,
        "timeout": 5000
      },
      "metrics": {
        "enabled": true,
        "path": "/metrics",
        "prometheus": {
          "enabled": true,
          "port": 9090,
          "pushGateway": "http://prometheus-gateway.example.com:9091"
        }
      },
      "tracing": {
        "enabled": true,
        "service": "my-application",
        "jaeger": {
          "endpoint": "http://jaeger.example.com:14268/api/traces",
          "samplingRate": 0.1
        }
      }
    },
    "security": {
      "authentication": {
        "type": "jwt",
        "secret": "your_jwt_secret_key_here_minimum_256_bits",
        "expiresIn": "24h",
        "refreshToken": {
          "enabled": true,
          "expiresIn": "7d"
        }
      },
      "authorization": {
        "rbac": {
          "enabled": true,
          "roles": ["admin", "editor", "viewer"],
          "permissions": {
            "admin": ["read", "write", "delete", "manage"],
            "editor": ["read", "write"],
            "viewer": ["read"]
          }
        }
      },
      "encryption": {
        "algorithm": "AES-256-GCM",
        "keyRotation": {
          "enabled": true,
          "intervalDays": 90
        }
      }
    }
  },
  "features": {
    "userManagement": {
      "enabled": true,
      "registration": {
        "enabled": true,
        "requireEmailVerification": true,
        "allowedDomains": ["@company.com", "@partner.com"]
      },
      "passwordPolicy": {
        "minLength": 12,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumbers": true,
        "requireSpecialChars": true,
        "preventReuse": 5
      }
    },
    "fileUpload": {
      "enabled": true,
      "maxFileSize": 52428800,
      "allowedTypes": [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
        "application/json"
      ],
      "storage": {
        "type": "s3",
        "bucket": "app-uploads",
        "region": "us-west-2",
        "encryption": true
      }
    },
    "notifications": {
      "enabled": true,
      "email": {
        "enabled": true,
        "provider": "sendgrid",
        "templates": {
          "welcome": "d-123456789",
          "passwordReset": "d-987654321",
          "notification": "d-456789123"
        }
      },
      "push": {
        "enabled": true,
        "provider": "firebase",
        "vapid": {
          "publicKey": "BFkMTrG0KtaB8cL9Wz5p2Qx3Vm7Yn8Ao1Bp4Cq6Dr2Es9Ft0Gu8Hv1Iw4Jx7Ky0Lz3M",
          "privateKey": "kNq2Pw5St8Vx1Yz4Ba7Ce0Df3Gh6Jk9Mo2Pr5Su8Vx1Yz"
        }
      }
    }
  },
  "integrations": {
    "paymentGateway": {
      "enabled": true,
      "provider": "stripe",
      "webhook": {
        "endpoint": "/webhooks/stripe",
        "secret": "whsec_1234567890abcdef"
      },
      "supportedCurrencies": ["USD", "EUR", "GBP", "CAD"]
    },
    "analytics": {
      "enabled": true,
      "providers": [
        {
          "name": "google-analytics",
          "trackingId": "G-ABCD123456",
          "enabled": true
        },
        {
          "name": "mixpanel",
          "projectToken": "abcd1234567890ef",
          "enabled": true
        }
      ]
    },
    "socialAuth": {
      "enabled": true,
      "providers": {
        "google": {
          "enabled": true,
          "clientId": "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com",
          "clientSecret": "GOCSPX-abcdefghijklmnopqrstuvwxyz123456"
        },
        "github": {
          "enabled": true,
          "clientId": "Iv1.a1b2c3d4e5f6g7h8",
          "clientSecret": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
        },
        "microsoft": {
          "enabled": false,
          "clientId": "12345678-1234-1234-1234-123456789012",
          "clientSecret": "ABC~123def456GHI.789jkl012MNO-345pqr678STU"
        }
      }
    }
  },
  "deployment": {
    "environment": "production",
    "version": "2.1.0",
    "buildNumber": "2024.01.15.1",
    "dockerImage": "myapp:2.1.0",
    "replicas": 3,
    "resources": {
      "requests": {
        "cpu": "500m",
        "memory": "1Gi"
      },
      "limits": {
        "cpu": "2000m",
        "memory": "4Gi"
      }
    },
    "healthcheck": {
      "livenessProbe": {
        "httpGet": {
          "path": "/health/live",
          "port": 8080
        },
        "initialDelaySeconds": 30,
        "periodSeconds": 10
      },
      "readinessProbe": {
        "httpGet": {
          "path": "/health/ready",
          "port": 8080
        },
        "initialDelaySeconds": 5,
        "periodSeconds": 5
      }
    }
  }
}`}
    />
  ),
};

// =============================================================================
// JAVASCRIPT EDITOR STORIES
// =============================================================================

export const JavaScriptStandard: Story = {
  render: () => (
    <EditorWrapper
      language="javascript"
      initialValue={`// JavaScript Monaco Editor Demo
// This editor provides full JavaScript support with IntelliSense

/**
 * User management class with comprehensive functionality
 * Demonstrates various JavaScript features and patterns
 */
class UserManager {
  constructor(apiEndpoint = '/api/users') {
    this.apiEndpoint = apiEndpoint;
    this.users = new Map();
    this.eventListeners = new Set();
  }

  /**
   * Fetch user data from the API
   * @param {string} userId - The unique user identifier
   * @returns {Promise<Object>} User data object
   */
  async fetchUser(userId) {
    try {
      const response = await fetch(\`\${this.apiEndpoint}/\${userId}\`);
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const userData = await response.json();
      this.users.set(userId, userData);
      
      // Notify listeners
      this.notifyListeners('userFetched', userData);
      
      return userData;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userDetails - User information
   * @returns {Promise<Object>} Created user object
   */
  async createUser(userDetails) {
    const newUser = {
      id: this.generateId(),
      ...userDetails,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Validate user data
    this.validateUser(newUser);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const createdUser = await response.json();
      this.users.set(createdUser.id, createdUser);
      
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {string} userId - User ID to update
   * @param {Object} updates - Fields to update
   */
  async updateUser(userId, updates) {
    const existingUser = this.users.get(userId);
    
    if (!existingUser) {
      throw new Error(\`User with ID \${userId} not found\`);
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, updatedUser);
    this.notifyListeners('userUpdated', updatedUser);
    
    return updatedUser;
  }

  /**
   * Delete a user
   * @param {string} userId - User ID to delete
   */
  deleteUser(userId) {
    if (this.users.has(userId)) {
      const deletedUser = this.users.get(userId);
      this.users.delete(userId);
      this.notifyListeners('userDeleted', deletedUser);
      return true;
    }
    return false;
  }

  /**
   * Get all users with optional filtering
   * @param {Function} filterFn - Optional filter function
   * @returns {Array} Array of users
   */
  getUsers(filterFn = null) {
    const allUsers = Array.from(this.users.values());
    return filterFn ? allUsers.filter(filterFn) : allUsers;
  }

  /**
   * Search users by various criteria
   * @param {string} query - Search query
   * @param {Array} fields - Fields to search in
   * @returns {Array} Matching users
   */
  searchUsers(query, fields = ['name', 'email', 'username']) {
    const searchTerm = query.toLowerCase();
    
    return this.getUsers(user => {
      return fields.some(field => {
        const fieldValue = user[field];
        return fieldValue && fieldValue.toLowerCase().includes(searchTerm);
      });
    });
  }

  /**
   * Add event listener for user management events
   * @param {Function} listener - Event listener function
   */
  addListener(listener) {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   * @param {Function} listener - Event listener to remove
   */
  removeListener(listener) {
    this.eventListeners.delete(listener);
  }

  /**
   * Notify all listeners of an event
   * @private
   */
  notifyListeners(eventType, data) {
    this.eventListeners.forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Validate user object
   * @private
   */
  validateUser(user) {
    const requiredFields = ['name', 'email'];
    
    for (const field of requiredFields) {
      if (!user[field] || user[field].trim() === '') {
        throw new Error(\`Missing required field: \${field}\`);
      }
    }

    // Email validation
    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Generate unique ID
   * @private
   */
  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Usage example
const userManager = new UserManager('/api/v1/users');

// Add event listener
userManager.addListener((eventType, data) => {
  console.log(\`User event: \${eventType}\`, data);
});

// Example usage with async/await
(async () => {
  try {
    // Create a new user
    const newUser = await userManager.createUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      role: 'user'
    });
    
    console.log('Created user:', newUser);
    
    // Update user
    const updatedUser = await userManager.updateUser(newUser.id, {
      role: 'admin',
      lastLogin: new Date().toISOString()
    });
    
    console.log('Updated user:', updatedUser);
    
    // Search users
    const searchResults = userManager.searchUsers('john');
    console.log('Search results:', searchResults);
    
  } catch (error) {
    console.error('Error in user management:', error);
  }
})();

// Utility functions
const utils = {
  /**
   * Debounce function to limit function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Deep clone an object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  /**
   * Format date to readable string
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }
};

export { UserManager, utils };`}
    />
  ),
};

export const JavaScriptSmall: Story = {
  render: () => (
    <EditorWrapper
      language="javascript"
      height="400px"
      width="600px"
      initialValue={`// Quick JavaScript snippet
function greetUser(name, timeOfDay = 'day') {
  const greetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    day: 'Hello'
  };
  
  const greeting = greetings[timeOfDay] || greetings.day;
  return \`\${greeting}, \${name}!\`;
}

// Usage examples
console.log(greetUser('Alice'));
console.log(greetUser('Bob', 'morning'));

// Array methods demonstration
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evenNumbers = numbers.filter(n => n % 2 === 0);

console.log('Original:', numbers);
console.log('Doubled:', doubled);
console.log('Even:', evenNumbers);`}
    />
  ),
};

export const JavaScriptFullScreen: Story = {
  render: () => (
    <EditorWrapper
      language="javascript"
      height="100vh"
      initialValue={`/**
 * Full-Screen JavaScript Monaco Editor Demo
 * 
 * This comprehensive example demonstrates advanced JavaScript features,
 * modern ES6+ syntax, and best practices for web development.
 */

// =============================================================================
// MODULE SYSTEM AND IMPORTS
// =============================================================================

// Modern module imports (would work in a module environment)
// import { EventEmitter } from 'events';
// import axios from 'axios';
// import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ADVANCED CLASS DEFINITIONS
// =============================================================================

/**
 * Advanced Task Management System
 * Demonstrates modern JavaScript patterns and features
 */
class TaskManager extends EventTarget {
  #tasks = new Map(); // Private field
  #observers = new Set();
  #config = {
    maxTasks: 1000,
    autoSave: true,
    debounceTime: 300
  };

  constructor(config = {}) {
    super();
    this.#config = { ...this.#config, ...config };
    this.#initializeStorage();
    this.#setupAutoSave();
  }

  /**
   * Create a new task with validation and event emission
   * @param {Object} taskData - Task information
   * @returns {Object} Created task
   */
  async createTask(taskData) {
    const task = {
      id: this.#generateId(),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        version: 1,
        tags: taskData.tags || [],
        priority: taskData.priority || 'medium'
      }
    };

    // Validation
    await this.#validateTask(task);
    
    // Check capacity
    if (this.#tasks.size >= this.#config.maxTasks) {
      throw new Error(\`Maximum task limit reached: \${this.#config.maxTasks}\`);
    }

    // Store task
    this.#tasks.set(task.id, task);
    
    // Emit events
    this.dispatchEvent(new CustomEvent('taskCreated', { detail: task }));
    this.#notifyObservers('create', task);
    
    // Auto-save if enabled
    if (this.#config.autoSave) {
      await this.#saveToStorage();
    }

    return task;
  }

  /**
   * Update an existing task
   * @param {string} taskId - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated task
   */
  async updateTask(taskId, updates) {
    const existingTask = this.#tasks.get(taskId);
    
    if (!existingTask) {
      throw new Error(\`Task with ID "\${taskId}" not found\`);
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...existingTask.metadata,
        version: existingTask.metadata.version + 1,
        ...(updates.metadata || {})
      }
    };

    // Validate updated task
    await this.#validateTask(updatedTask);
    
    this.#tasks.set(taskId, updatedTask);
    
    // Emit events
    this.dispatchEvent(new CustomEvent('taskUpdated', { 
      detail: { previous: existingTask, current: updatedTask }
    }));
    
    this.#notifyObservers('update', updatedTask);
    
    if (this.#config.autoSave) {
      await this.#saveToStorage();
    }

    return updatedTask;
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID to delete
   * @returns {boolean} Success status
   */
  async deleteTask(taskId) {
    const task = this.#tasks.get(taskId);
    
    if (!task) {
      return false;
    }

    this.#tasks.delete(taskId);
    
    this.dispatchEvent(new CustomEvent('taskDeleted', { detail: task }));
    this.#notifyObservers('delete', task);
    
    if (this.#config.autoSave) {
      await this.#saveToStorage();
    }

    return true;
  }

  /**
   * Get tasks with advanced filtering and sorting
   * @param {Object} options - Filter and sort options
   * @returns {Array} Filtered and sorted tasks
   */
  getTasks(options = {}) {
    let tasks = Array.from(this.#tasks.values());

    // Apply filters
    if (options.status) {
      tasks = tasks.filter(task => task.status === options.status);
    }

    if (options.priority) {
      tasks = tasks.filter(task => task.metadata.priority === options.priority);
    }

    if (options.tags && options.tags.length > 0) {
      tasks = tasks.filter(task => 
        options.tags.some(tag => task.metadata.tags.includes(tag))
      );
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (options.sortBy) {
      tasks.sort((a, b) => {
        const aValue = this.#getNestedProperty(a, options.sortBy);
        const bValue = this.#getNestedProperty(b, options.sortBy);
        
        if (options.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    if (options.page && options.pageSize) {
      const start = (options.page - 1) * options.pageSize;
      const end = start + options.pageSize;
      tasks = tasks.slice(start, end);
    }

    return tasks;
  }

  /**
   * Bulk operations for multiple tasks
   */
  async bulkUpdate(taskIds, updates) {
    const results = {
      successful: [],
      failed: []
    };

    for (const taskId of taskIds) {
      try {
        const updatedTask = await this.updateTask(taskId, updates);
        results.successful.push(updatedTask);
      } catch (error) {
        results.failed.push({ taskId, error: error.message });
      }
    }

    return results;
  }

  /**
   * Export tasks in various formats
   * @param {string} format - Export format ('json', 'csv')
   * @returns {string} Exported data
   */
  exportTasks(format = 'json') {
    const tasks = this.getTasks();

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(tasks, null, 2);
      
      case 'csv':
        if (tasks.length === 0) return '';
        
        const headers = Object.keys(tasks[0]).join(',');
        const rows = tasks.map(task => 
          Object.values(task).map(value => 
            typeof value === 'object' ? JSON.stringify(value) : value
          ).join(',')
        );
        
        return [headers, ...rows].join('\\n');
      
      default:
        throw new Error(\`Unsupported export format: \${format}\`);
    }
  }

  /**
   * Import tasks from external data
   * @param {string} data - Data to import
   * @param {string} format - Data format
   */
  async importTasks(data, format = 'json') {
    let tasksToImport;

    switch (format.toLowerCase()) {
      case 'json':
        try {
          tasksToImport = JSON.parse(data);
        } catch (error) {
          throw new Error('Invalid JSON format');
        }
        break;
      
      default:
        throw new Error(\`Unsupported import format: \${format}\`);
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (const taskData of tasksToImport) {
      try {
        // Remove ID to create new task
        const { id, ...newTaskData } = taskData;
        await this.createTask(newTaskData);
        results.imported++;
      } catch (error) {
        results.errors.push({ task: taskData, error: error.message });
        results.skipped++;
      }
    }

    return results;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Initialize storage system
   * @private
   */
  #initializeStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('taskManager');
        if (stored) {
          const data = JSON.parse(stored);
          this.#tasks = new Map(data.tasks || []);
        }
      } catch (error) {
        console.warn('Failed to load from storage:', error);
      }
    }
  }

  /**
   * Save tasks to storage
   * @private
   */
  async #saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const data = {
          tasks: Array.from(this.#tasks.entries()),
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('taskManager', JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save to storage:', error);
      }
    }
  }

  /**
   * Setup auto-save with debouncing
   * @private
   */
  #setupAutoSave() {
    if (this.#config.autoSave) {
      this.#debouncedSave = this.#debounce(
        this.#saveToStorage.bind(this), 
        this.#config.debounceTime
      );
    }
  }

  /**
   * Validate task data
   * @private
   */
  async #validateTask(task) {
    if (!task.title || task.title.trim() === '') {
      throw new Error('Task title is required');
    }

    if (task.title.length > 200) {
      throw new Error('Task title too long (max 200 characters)');
    }

    if (task.description && task.description.length > 1000) {
      throw new Error('Task description too long (max 1000 characters)');
    }

    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(task.status)) {
      throw new Error(\`Invalid status. Must be one of: \${validStatuses.join(', ')}\`);
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (task.metadata?.priority && !validPriorities.includes(task.metadata.priority)) {
      throw new Error(\`Invalid priority. Must be one of: \${validPriorities.join(', ')}\`);
    }
  }

  /**
   * Generate unique ID
   * @private
   */
  #generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get nested property value
   * @private
   */
  #getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? '';
  }

  /**
   * Notify observers of changes
   * @private
   */
  #notifyObservers(action, task) {
    this.#observers.forEach(observer => {
      try {
        observer({ action, task, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Debounce utility function
   * @private
   */
  #debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // =============================================================================
  // PUBLIC UTILITY METHODS
  // =============================================================================

  /**
   * Add observer for task changes
   */
  addObserver(observer) {
    this.#observers.add(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer) {
    this.#observers.delete(observer);
  }

  /**
   * Get statistics about tasks
   */
  getStatistics() {
    const tasks = Array.from(this.#tasks.values());
    
    return {
      total: tasks.length,
      byStatus: tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc, task) => {
        const priority = task.metadata?.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {}),
      averageAge: tasks.length > 0 ? 
        tasks.reduce((sum, task) => {
          const age = Date.now() - new Date(task.createdAt).getTime();
          return sum + age;
        }, 0) / tasks.length / (1000 * 60 * 60 * 24) : 0 // days
    };
  }

  /**
   * Clear all tasks
   */
  async clearAll() {
    const taskCount = this.#tasks.size;
    this.#tasks.clear();
    
    this.dispatchEvent(new CustomEvent('allTasksCleared', { 
      detail: { count: taskCount }
    }));
    
    if (this.#config.autoSave) {
      await this.#saveToStorage();
    }
    
    return taskCount;
  }
}

// =============================================================================
// USAGE EXAMPLES AND DEMONSTRATIONS
// =============================================================================

// Create task manager instance
const taskManager = new TaskManager({
  maxTasks: 500,
  autoSave: true,
  debounceTime: 250
});

// Add event listeners
taskManager.addEventListener('taskCreated', (event) => {
  console.log('New task created:', event.detail);
});

taskManager.addEventListener('taskUpdated', (event) => {
  console.log('Task updated:', event.detail);
});

// Add observer
taskManager.addObserver((change) => {
  console.log('Observer notified:', change);
});

// Example usage with error handling
(async function demonstrateTaskManager() {
  try {
    // Create sample tasks
    const tasks = await Promise.all([
      taskManager.createTask({
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        priority: 'high',
        tags: ['documentation', 'feature']
      }),
      taskManager.createTask({
        title: 'Code review',
        description: 'Review pull requests from team members',
        priority: 'medium',
        tags: ['review', 'code']
      }),
      taskManager.createTask({
        title: 'Bug fixes',
        description: 'Fix reported bugs in the authentication module',
        priority: 'urgent',
        tags: ['bug', 'authentication']
      })
    ]);

    console.log('Created tasks:', tasks);

    // Update a task
    await taskManager.updateTask(tasks[0].id, {
      status: 'in-progress',
      progress: 0.3
    });

    // Get filtered tasks
    const highPriorityTasks = taskManager.getTasks({
      priority: 'high',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    console.log('High priority tasks:', highPriorityTasks);

    // Get statistics
    const stats = taskManager.getStatistics();
    console.log('Task statistics:', stats);

    // Export tasks
    const exportedData = taskManager.exportTasks('json');
    console.log('Exported data length:', exportedData.length);

  } catch (error) {
    console.error('Error in task management demo:', error);
  }
})();

// =============================================================================
// UTILITY FUNCTIONS AND HELPERS
// =============================================================================

/**
 * Collection of utility functions for common operations
 */
const Utils = {
  /**
   * Deep merge objects
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },

  /**
   * Check if value is object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  /**
   * Throttle function execution
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Generate random color
   */
  randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TaskManager, Utils };
}

// Full-screen JavaScript Monaco Editor loaded successfully! 🚀`}
    />
  ),
};

# Cortex Electron App Architecture

## Overview

This document describes the architecture of the Cortex Electron application, which follows the standard Electron application structure with a main process, renderer process, and preload script.

## Project Structure

```
cortex/
├── src/                    # Source code directory
│   ├── main.mts           # Main process entry point
│   ├── preload.ts         # Preload script
│   ├── renderer.ts        # Renderer process entry point
│   ├── app.tsx            # Main React application component
│   ├── components/        # React components
│   ├── data/             # Data management and storage
│   ├── lib/              # Utility functions and shared code
│   │   ├── mcp/          # MCP-related utilities
│   │   │   ├── client/   # MCP client utilities
│   │   │   └── server/   # MCP server utilities
│   │   ├── config-manager.ts # Configuration management
│   │   └── utils.ts      # General utility functions
│   ├── routes/           # Application routes
│   ├── styles/           # CSS and styling
│   ├── types/            # TypeScript type definitions
│   ├── types.d.ts        # Global type definitions
│   ├── hooks/            # Custom React hooks
│   ├── menu/             # Application menu configuration
│   ├── mcp/              # Message Control Protocol implementation
│   │   ├── client.ts     # MCP client implementation
│   │   └── server.ts     # MCP server implementation
│   └── routeTree.gen.ts  # Generated route tree
├── vite.main.config.ts    # Vite configuration for main process
├── vite.renderer.config.mts # Vite configuration for renderer process
├── vite.preload.config.ts # Vite configuration for preload script
├── vite.mcp.client.config.ts # Vite configuration for MCP client
├── vite.mcp.server.config.ts # Vite configuration for MCP server
├── forge.config.ts        # Electron Forge configuration
├── components.json        # UI components configuration
├── tsconfig.json          # TypeScript configuration
└── .eslintrc.json         # ESLint configuration
```

## Process Architecture

### Main Process (`main.mts`)

The main process is responsible for:

- Creating and managing the application window
- Handling application lifecycle events
- Managing native operating system interactions
- Running in Node.js environment with full system access
- Spawning and managing MCP client and server child processes
- Coordinating communication between child processes and renderer

### Renderer Process (`renderer.ts`)

The renderer process:

- Handles the user interface using React
- Runs in a Chromium-based browser environment
- Communicates with the main process through IPC
- Manages the application's UI state and routing
- Receives and displays data from MCP processes via main process

### Preload Script (`preload.ts`)

The preload script:

- Acts as a bridge between the main and renderer processes
- Exposes safe, controlled Node.js APIs to the renderer process
- Implements security measures to prevent unauthorized access

### MCP Client and Server Process (`mcp/client.ts` and `mcp/server.ts`)

The MCP process:

- Runs as a single Node.js child process
- Uses the MCP TypeScript SDK for protocol implementation
- Handles both incoming and outgoing message communication
- Communicates with the main process through IPC
- Processes and routes incoming messages
- Handles message queuing and delivery

## Configuration Management

### Config Manager (`src/lib/config-manager.ts`)

The Config Manager is responsible for securely storing and retrieving sensitive configuration data, such as API keys, using Electron's `safeStorage` encryption. It ensures that sensitive data is stored in an encrypted format in the user's application data directory, which is specific to each user account on their machine.

- **API Key Management**: Provides methods to set, get, and remove API keys for services like OpenAI and Anthropic.
- **Security**: Utilizes Electron's `safeStorage` to encrypt and decrypt configuration data, ensuring that sensitive information is never stored in plain text.
- **IPC Integration**: Exposes API key management functions to the renderer process through IPC handlers defined in the main process, allowing secure interaction with the configuration data without exposing it directly to the renderer.

The Config Manager is a critical component for maintaining the security and integrity of sensitive data within the application.

## Development Tools and Configuration

- **Vite**: Used for fast development and building
  - Separate configurations for main, renderer, preload, and MCP processes
- **Electron Forge**: Handles packaging and distribution
- **TypeScript**: Used throughout the codebase for type safety
- **React**: Used for building the user interface
- **ESLint**: Used for code quality and consistency
- **pnpm**: Package manager for dependencies

## Build and Development

The application uses:

- Vite for development server and bundling
- Electron Forge for packaging
- Multiple Vite configurations to handle different parts of the application
- TypeScript for type safety across all processes

## Security Considerations

- Node integration is enabled in the renderer process
- Context isolation is currently disabled (note: this should be reviewed for production)
- Preload script acts as a security boundary between processes

## Development Workflow

1. Main process changes require restarting the application
2. Renderer process changes support hot module replacement
3. Preload script changes require application restart
4. MCP process changes require application restart
5. Development tools are automatically opened in development mode
6. Route changes require regeneration of routeTree.gen.ts
7. Type changes may require rebuilding the application

## Future Considerations

- Implement proper context isolation for enhanced security
- Add proper error handling and logging
- Implement proper IPC communication patterns
- Add testing infrastructure
- Consider implementing a state management solution
- Implement message persistence and recovery mechanisms
- Add monitoring and health checks for MCP processes

## Library Components

### Utility Libraries (`src/lib/`)

The `lib` directory contains shared utility code and common functionality used across the application:

- **Config Manager** (`config-manager.ts`):

  - Handles application configuration management
  - Provides secure storage for sensitive data
  - Manages environment-specific settings

- **General Utilities** (`utils.ts`):

  - Contains common utility functions
  - Provides shared helper methods
  - Implements cross-cutting concerns

- **MCP Utilities** (`lib/mcp/`):
  - Contains MCP-specific utilities and helpers
  - Separated into client and server components
  - Provides shared functionality for MCP implementation

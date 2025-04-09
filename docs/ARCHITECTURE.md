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
│   ├── routes/           # Application routes
│   ├── styles/           # CSS and styling
│   ├── types/            # TypeScript type definitions
│   ├── mcp/              # Message Control Protocol implementation
│   │   ├── client.ts     # MCP client implementation
│   │   └── server.ts     # MCP server implementation
│   └── app.tsx            # Main React application component
├── vite.main.config.ts    # Vite configuration for main process
├── vite.renderer.config.mts # Vite configuration for renderer process
├── vite.preload.config.ts # Vite configuration for preload script
└── forge.config.ts        # Electron Forge configuration
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

### MCP Client Process (`mcp/client.ts`)

The MCP client process:

- Runs as a separate Node.js child process
- Handles outgoing message communication
- Manages client-side MCP protocol implementation
- Communicates with the main process through IPC
- Handles message queuing and delivery

### MCP Server Process (`mcp/server.ts`)

The MCP server process:

- Runs as a separate Node.js child process
- Handles incoming message communication
- Manages server-side MCP protocol implementation
- Communicates with the main process through IPC
- Processes and routes incoming messages

## Configuration Management

### Config Manager (`src/lib/config-manager.ts`)

The Config Manager is responsible for securely storing and retrieving sensitive configuration data, such as API keys, using Electron's `safeStorage` encryption. It ensures that sensitive data is stored in an encrypted format in the user's application data directory, which is specific to each user account on their machine.

- **API Key Management**: Provides methods to set, get, and remove API keys for services like OpenAI and Anthropic.
- **Security**: Utilizes Electron's `safeStorage` to encrypt and decrypt configuration data, ensuring that sensitive information is never stored in plain text.
- **IPC Integration**: Exposes API key management functions to the renderer process through IPC handlers defined in the main process, allowing secure interaction with the configuration data without exposing it directly to the renderer.

The Config Manager is a critical component for maintaining the security and integrity of sensitive data within the application.

## Development Tools and Configuration

- **Vite**: Used for fast development and building
  - Separate configurations for main, renderer, and preload processes
- **Electron Forge**: Handles packaging and distribution
- **TypeScript**: Used throughout the codebase for type safety
- **React**: Used for building the user interface

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
4. MCP client and server process changes require application restart
5. Development tools are automatically opened in development mode

## Future Considerations

- Implement proper context isolation for enhanced security
- Add proper error handling and logging
- Implement proper IPC communication patterns
- Add testing infrastructure
- Consider implementing a state management solution
- Implement message persistence and recovery mechanisms
- Add monitoring and health checks for MCP processes

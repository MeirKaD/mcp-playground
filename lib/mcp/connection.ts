import { experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';

interface MCPClient {
  client: unknown;
  tools: () => Promise<Record<string, any>>;
  close: () => Promise<void>;
}

interface MCPConnectionConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
  maxRetries?: number;
  retryDelay?: number;
}

class MCPConnectionPool {
  private connections = new Map<string, MCPClient>();
  private configs = new Map<string, MCPConnectionConfig>();

  /**
   * Register a connection configuration
   */
  register(id: string, config: MCPConnectionConfig): void {
    this.configs.set(id, {
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    });
  }

  /**
   * Get or create a connection
   */
  async getConnection(id: string): Promise<MCPClient> {
    // Return existing connection if available
    const existing = this.connections.get(id);
    if (existing) {
      return existing;
    }

    // Create new connection
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`No configuration found for connection: ${id}`);
    }

    return await this.createConnection(id, config);
  }

  /**
   * Create a new MCP connection with retry logic
   */
  private async createConnection(id: string, config: MCPConnectionConfig): Promise<MCPClient> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxRetries!; attempt++) {
      try {
        const transport = new StdioMCPTransport({
          command: config.command,
          args: config.args,
          env: config.env,
        });

        const client = await createMCPClient({ transport });
        
        const mcpClient: MCPClient = {
          client,
          tools: () => client.tools(),
          close: () => client.close(),
        };

        this.connections.set(id, mcpClient);
        return mcpClient;

      } catch (error) {
        lastError = error as Error;
        console.warn(`MCP connection attempt ${attempt}/${config.maxRetries} failed for ${id}:`, error);
        
        if (attempt < config.maxRetries!) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay! * attempt));
        }
      }
    }

    throw new Error(`Failed to connect to MCP server ${id} after ${config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Close a specific connection
   */
  async closeConnection(id: string): Promise<void> {
    const connection = this.connections.get(id);
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.warn(`Error closing connection ${id}:`, error);
      }
      this.connections.delete(id);
    }
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.connections.keys()).map(id => 
      this.closeConnection(id)
    );
    await Promise.allSettled(closePromises);
  }

  /**
   * Get connection status
   */
  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.connections.forEach((_, id) => {
    status[id] = true;
    });
    return status;
  }
}

// Singleton instance
let pool: MCPConnectionPool | null = null;

/**
 * Get the global connection pool
 */
export function getMCPPool(): MCPConnectionPool {
  if (!pool) {
    pool = new MCPConnectionPool();
  }
  return pool;
}

/**
 * Setup Bright Data MCP connection
 */
export async function setupBrightDataMCP(connectionId: string = 'bright-data'): Promise<void> {
  const apiToken = process.env.BRIGHT_DATA_API_TOKEN;
  if (!apiToken) {
    throw new Error('BRIGHT_DATA_API_TOKEN environment variable is required');
  }

    const env: Record<string, string> = {};

    if (apiToken) env.API_TOKEN = apiToken;
    if (process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE) {
    env.WEB_UNLOCKER_ZONE = process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE;
    }
  // Add optional environment variables if they exist
  if (process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE) {
    env.WEB_UNLOCKER_ZONE = process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE;
  }
  if (process.env.BRIGHT_DATA_BROWSER_ZONE) {
    env.BROWSER_ZONE = process.env.BRIGHT_DATA_BROWSER_ZONE;
  }
  if (process.env.BRIGHT_DATA_RATE_LIMIT) {
    env.RATE_LIMIT = process.env.BRIGHT_DATA_RATE_LIMIT;
  }

  const mcpPool = getMCPPool();
  mcpPool.register(connectionId, {
    command: 'npx',
    args: ['@brightdata/mcp'],
    env,
  });

  // Test the connection
  await mcpPool.getConnection(connectionId);
}

/**
 * Get tools from a connection
 */
export async function getMCPTools(connectionId: string = 'bright-data'): Promise<Record<string, any>> {
  const mcpPool = getMCPPool();
  const connection = await mcpPool.getConnection(connectionId);
  return await connection.tools();
}

/**
 * Cleanup all connections (call this on app shutdown)
 */
export async function cleanupMCP(): Promise<void> {
  if (pool) {
    await pool.closeAll();
    pool = null;
  }
}

// Auto-cleanup on process exit
if (typeof process !== 'undefined') {
  const cleanup = async () => {
    console.log('Cleaning up MCP connections...');
    await cleanupMCP();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('beforeExit', cleanup);
}
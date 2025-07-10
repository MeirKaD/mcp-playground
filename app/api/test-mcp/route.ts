import { setupBrightDataMCP, getMCPTools } from '@/lib/mcp/connection';

export async function GET() {
  try {
    console.log('🔄 Testing MCP connection...');
    
    await setupBrightDataMCP();
    console.log('✅ Connection setup successful');
    
    const tools = await getMCPTools();
    console.log('✅ Tools loaded:', Object.keys(tools));
    
    return Response.json({ 
      success: true, 
      message: 'MCP connection successful',
      toolCount: Object.keys(tools).length,
      toolNames: Object.keys(tools)
    });
    
  } catch (error) {
    console.error('❌ MCP test failed:', error);
    return Response.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
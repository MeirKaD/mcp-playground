async function testMCP() {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'What tools are available?' })
  });
  
  console.log('Status:', response.status);
  
  if (!response.ok) {
    console.log('Error response:', await response.text());
    return;
  }
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (reader) {
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      process.stdout.write(chunk); // Show streaming output
    }
    console.log('\n--- Full Response ---');
    console.log(result);
  }
}

testMCP().catch(console.error);
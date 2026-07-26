const fs = require('fs');
const os = require('os');
const path = require('path');

const configPath = path.join(os.homedir(), '.gemini', 'config', 'mcp_config.json');

try {
  const data = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(data);
  let changed = false;

  if (config.mcpServers) {
    const newServers = {};
    for (const [name, server] of Object.entries(config.mcpServers)) {
      const serverStr = JSON.stringify(server);
      if (serverStr.includes('mcp-notebooks') || serverStr.includes('googlecloudtools.datacloud')) {
        console.log(`Removing server: ${name}`);
        changed = true;
      } else {
        newServers[name] = server;
      }
    }
    config.mcpServers = newServers;
  }

  if (changed) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Successfully updated mcp_config.json');
  } else {
    console.log('No matching servers found to remove. Config is unchanged.');
  }
} catch (e) {
  console.error('Error:', e.message);
}

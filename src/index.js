import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';

const app = express();
const port = process.env.PORT || 8765;
const docker = new Docker();

app.use(cors());
app.use(express.json());

app.get('/port', async (req, res) => {
  try {
    const containers = await docker.listContainers();
    const usedPorts = new Set();
    
    // Collect all used ports
    containers.forEach(container => {
      if (container.Ports) {
        container.Ports.forEach(port => {
          if (port.PublicPort) {
            usedPorts.add(port.PublicPort);
          }
        });
      }
    });
    
    // Find first available port starting from 3000
    let availablePort = 3000;
    while (usedPorts.has(availablePort)) {
      availablePort++;
    }
    
    res.json({ port: availablePort });
  } catch (error) {
    console.error('Error getting available port:', error);
    res.status(500).json({ error: 'Failed to get available port' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Port broker service listening on port ${port}`);
}); 
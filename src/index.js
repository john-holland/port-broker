import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';

const app = express();
const port = process.env.PORT || 8765;
const docker = new Docker();

app.use(cors());
app.use(express.json());

// Check if another port-broker is already running
async function checkExistingPortBroker() {
  try {
    const containers = await docker.listContainers();
    const existingBroker = containers.find(container => 
      container.Names.some(name => name.includes('port-broker')) && 
      container.State === 'running'
    );
    
    if (existingBroker) {
      console.log('Found existing port-broker instance, exiting...');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error checking for existing port-broker:', error);
  }
}

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

// Check for existing port-broker before starting
checkExistingPortBroker().then(() => {
  app.listen(port, () => {
    console.log(`Port broker service listening on port ${port}`);
  });
}); 
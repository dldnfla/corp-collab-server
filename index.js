const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const http = require('http');
const sequelize = require('./db.js');
const userRoutes = require('./src/routes/userRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const followRoutes = require('./src/routes/followRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();
const PORT = process.env.PORT || 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = http.createServer(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', userRoutes);
app.use('/api', todoRoutes);
app.use('/api', followRoutes);
app.use('/api', fileRoutes);

require('./signalingServer');

app.get('/', (req, res) => {
  res.send('StudyBuddy');
});

app.get('/api/camera', (req, res) => {
  res.send('Camera endpoint');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync(); // alter 옵션 제거
    console.log('Database synchronized.');
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

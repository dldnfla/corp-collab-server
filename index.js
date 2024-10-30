const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const http = require('http');
const sequelize = require('./db.js');
const userRoutes = require('./src/routes/userRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = http.createServer(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', userRoutes);
app.use('/api', todoRoutes);

require('./signalingServer');

app.get('/', (req, res) => {
  res.send('StudyBuddy');
});

server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
   //  await sequelize.sync({ alter: true }); // 'alter: true' only applies changes to tables, without dropping them
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

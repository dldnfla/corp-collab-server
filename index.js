const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const sequelize = require('./db.js');
const userRoute = require('./src/routes/userRoute');
const PORT = process.env.PORT || 3000;

// JSON 요청 본문 파싱 미들웨어
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', userRoute);

// 서버 시작
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
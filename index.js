const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const sequelize = require('./db.js');
const userRoute = require('./src/routes/userRoute');

const swaggerDocument = YAML.load('./swagger.yaml');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // express 미들웨어 설정 
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', userRoute);


app.listen(PORT, async () => {
  try {
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('Database connection established.');
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

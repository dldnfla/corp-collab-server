const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();


const sequelize = require('./db.js');

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// JSON 요청을 처리하기 위한 미들웨어
app.use(express.json());

// 기본 API 엔드포인트 (GET 요청)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello,' });
});

// POST 요청 처리
app.post('/api/echo', (req, res) => {
  const { message } = req.body;
  res.json({ echo: message });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

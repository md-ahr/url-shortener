import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authenticationMiddleware } from './middlewares/auth.middleware.js';
import userRouter from'./routes/user.routes.js';
import urlRouter from'./routes/url.routes.js';

const app = express();

const port = process.env.PORT ?? 8000;

app.use(cors({
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticationMiddleware);

app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Welcome back!' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'The server is up & running...', uptime: Date.now() });
});

app.use('/auth', userRouter);
app.use('/', urlRouter);

app.use((req, res, next) => {
    res.status(404).json({ status: 'error', message: 'Resource not found' });
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

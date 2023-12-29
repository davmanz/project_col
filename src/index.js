import express from "express"
import {dirname, join} from "path"
import {fileURLToPath} from "url"
import indexRoutes from './routes/index_routes.js'
import session from 'express-session';
import 'dotenv/config';

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', join(__dirname, "/views/pages") );
app.set('view engine', 'ejs');

//middlewares
app.use(indexRoutes);
app.use(express.static(join(__dirname, 'public')))

// Configura la sesión
app.use(session({
    secret: process.env.SESSION_SECRET, // Reemplaza 'mi_secreto' con una cadena secreta real
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Usar `secure: true` solo si estás en HTTPS
}));

//server
app.listen(app.get('port'), () => console.log('Server numero',3000))

import express from "express";
import session from "express-session";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import indexRoutes from './routes/index_routes.js';
import 'dotenv/config';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Configuración de la sesión
app.use(session({
  secret: `
  6019274afb9db4d48f0d52ad1e40c856fbc6a7b8
  6ff23062f281424ee1d766a4cf1bbb858f801774
  c078c1fc74b48eaf69cea9d86ffa202c4ef8d328de
  f052aa`, // Asegúrate de que SECRET esté definida en tu archivo .env
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Nota: la opción secure en true solo funciona sobre HTTPS
}));

// Rutas
app.use(indexRoutes);

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', join(__dirname, "/views/pages"));
app.set('view engine', 'ejs');

// Iniciar el servidor
app.listen(app.get('port'), () => console.log('Server numero', app.get('port')));

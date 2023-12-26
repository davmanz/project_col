import express from "express"
import {dirname, join} from "path"
import {fileURLToPath} from "url"
import indexRoutes from './routes/index_routes.js'



const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', join(__dirname, "/views/pages") );
app.set('view engine', 'ejs');

//middlewares

app.use(indexRoutes);
app.use(express.static(join(__dirname, 'public')))

//server
app.listen(app.get('port'), () => console.log('Server numero',3000))



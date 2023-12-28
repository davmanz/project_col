import { Router } from 'express';
import { getDocumentTypes } from '../js/connection.js';
import { validateAndCreateUser } from '../js/validateUserServ.js';
import { storeUserWithImage } from '../js/connection.js';
import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = Router();

// Rutas estándar
router.get('/', (req, res) => res.render('index', { title: 'INDEX' }));
router.get('/about', (req, res) => res.render('about', { title: 'ABOUT' }));
router.get('/contact', (req, res) => res.render('contact', { title: 'CONTACT' }));

//Route add user
router.get('/addusr', async (req, res) => {
    try {
        const documentTypes = await getDocumentTypes();
        res.render('add_usr', { 
            title: 'Agregar Usuario',
            documentTypes // Asegúrate de que esta línea está presente
            
            
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


/*
//Route user Pots
router.post('/addusr', upload.single('photo'), async (req, res) => {
    try {
      // Validar y crear usuario

      alert(req.body)

      const validationResult = await validateAndCreateUser(req.body);
  
      // Si la validación falla, podrías querer manejarlo de manera diferente
      if (!validationResult.success) {
        throw new Error(validationResult.message);
      }
  
      // Guardar la ruta de la imagen en la base de datos
      // Puedes ajustar esta función para que acepte todos los datos necesarios
      await storeUserWithImage({
        ...req.body,
        imagePath: req.file.path
      });
  
      // Redireccionar a la página de éxito o mostrar un mensaje
      res.redirect('/success');
    } catch (error) {
      console.error(error);
      res.status(400).render('add_usr', { error: error.message }); // Renderiza de nuevo el formulario con el mensaje de error
    }
  });
*/


export default router;

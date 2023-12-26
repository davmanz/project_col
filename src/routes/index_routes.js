import { Router } from 'express';
import { getDocumentTypes } from '../js/connection.js';

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


//Route user Pots
router.post('/addusr', async (req, res) => {
    try {
        await validateAndCreateUser(req.body);
        res.redirect('/success'); // Redirecciona a una página de éxito o ruta
    } catch (error) {
        console.error(error);
        res.status(400).render('add_usr', { error: error.message }); // Renderiza de nuevo el formulario con el mensaje de error
    }
});


export default router;

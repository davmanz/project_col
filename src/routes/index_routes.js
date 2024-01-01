import { Router } from 'express';
import { getDocumentTypes, storeUserWithImage,getDocumentTypeById,SearchByIdNumber,storeContractWithImage} from '../js/connection.js';
import { validateAndCreateUser } from '../js/validateUserServ.js';
import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento para Multer
const storage_usr = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/users');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const storage_ctr = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './src/uploads/contract');
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Instancia de Route
const router = Router();


//********************************************************************************************************************************* */

// Rutas estándar
router.get('/', (req, res) => res.render('index', { title: 'INDEX' }));
router.get('/crtcontract', (req, res) => res.render('create_contract', { title: 'Create Contract' }));
// En tu archivo de rutas
router.get('/success', (req, res) => {res.render('success', { userData: global.datadb});});


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

// Endpoint para buscar número de documento
router.get('/fdoc/:docNum', async (req, res) => {
  try {
    const docNum = req.params.docNum;
    const userInfo = await SearchByIdNumber(docNum);

    process.env.USER_ID = userInfo[0].user_id    
  
    // Verifica si se encontraron resultados
    if (userInfo.length > 0) {
      // Enviar el primer resultado, suponiendo que el número de documento es único
      res.json({ success: true, data: userInfo[0] });
    } else {
      // No se encontraron resultados, enviar mensaje correspondiente
      res.json({ success: false, message: 'Documento no encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


//********************************************************************************************************************************* */

//Route user Pots
router.post('/addusr', multer({ storage: storage_usr }).single('photo'), async (req, res) => {
  
  const data_serv ={   
    name: req.body.name, // Valor del campo "Nombres"
    last_name: req.body.last_name, // Valor del campo "Apellidos"
    id_type: req.body['id-type'], // Valor del campo "Tipo de Identificación"
    id_number: req.body['id-number'], // Valor del campo "Número de Identificación"
    email: req.body.email, // Valor del campo "Correo Electrónico"
    password: req.body.password, // Valor del campo "Contraseña"
    imagePath: req.file ? req.file.path : undefined // Ruta del archivo "Foto Personal"
  }

  try {
    // Validar y crear usuario
    const validationResult = await validateAndCreateUser(data_serv);

       // Si la validación falla, podrías querer manejarlo de manera diferente
       if (!validationResult.success) {
      throw new Error(validationResult.message);
    }
    // Guardar la ruta de la imagen en la base de datos
    // Puedes ajustar esta función para que acepte todos los datos necesarios
    await storeUserWithImage(data_serv);

    data_serv.document_type = await getDocumentTypeById(parseInt(data_serv.id_type))

     // Asignar data_serv al objeto global
    global.datadb = data_serv;

    // Redireccionar a la página de éxito o mostrar un mensaje
    res.redirect('/success');

    } catch (error) {
    console.error(error);
    res.status(400).render('add_usr', { error: error.message }); // Renderiza de nuevo el formulario con el mensaje de error
  }
  });

// Post contrato
router.post('/addcontract', multer({ storage: storage_ctr }).single('contract_photo'), async (req, res) => {

  const data_contract ={
    documentNumber: req.body.document_number,
    startDate: req.body.start_date,
    endDate: req.body.end_date,
    paymentDay: req.body.payment_day,
    rentMount: req.body.rent_mount,
    warranty: req.body.warranty,
    hasWifi: req.body.has_wifi,
    wifiCost: req.body.wifi_cost,
    roomNumber:req.body.room_number,
    imagePath: req.file ? req.file.path : undefined // Ruta del archivo "Foto Personal"
  };

  try {      
    storeContractWithImage(data_contract)
    // Redireccionar a la página de éxito o mostrar un mensaje
    res.redirect('/success');

    } catch (error) {
    console.error(error);
    res.status(400).render('add_usr', { error: error.message }); // Renderiza de nuevo el formulario con el mensaje de error
  }
  });

export default router;

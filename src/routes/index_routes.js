import { Router } from 'express';
import { getDocumentTypes,
  storeUserWithImage,
  storeUserModified,
  getDocumentTypeById,
  searchDel,
  storeContractWithImage,
  read_bd} from '../js/connection.js';
import { validateAndCreateUser } from '../js/validateUserServ.js';
import { validateAndModifyUser } from '../js/validateModUsr.js';
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

//Instancia de Route
const router = Router();

//********************************************************************************************************************************* */

//Ruta estándar
router.get('/', (req, res) => res.render('login'));

//Ruta dashborad creacion de contratos
router.get('/crtcontract', (req, res) => res.render('create_contract', { title: 'Create Contract' }));

// Ruta de guardado en base de datos de usuarios
router.get('/success', (req, res) => {res.render('success', { userData: global.datadb});});

router.get('/sscontract', (req , res) => {res.render('success_contract');});

router.get('/success_mod', (req, res) => {res.render('success_mod', { userData: global.datadb});});

router.get('/index', (req, res) => res.render('index'));

router.get('/vwusr', (req, res) => res.render('view_usr'));

//Ruta dashborad creacion de contratos
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

// Visualizar Usuarios
router.get('/vwusr/:searchUser', async (req, res) => {
  try {
    const docNum = req.params.searchUser;
    const userInfo = await searchDel(docNum);
    
    // Verifica si se encontraron resultados
    if (userInfo.length > 0) {
      // Enviar el primer resultado, suponiendo que el número de documento es único
      res.json({ success: true, data: userInfo });
    } else {
      // No se encontraron resultados, enviar mensaje correspondiente
      res.json({ success: false, message: 'Documento no encontrado.' });
    }

  }catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

//Llamada a modificacion
router.get('/vwusr/edit/:documentNumber', async (req, res) => {
  const docNum = req.params.documentNumber;

  try {
      // Suponiendo que tienes una función para verificar si el documento existe
      const idUser = await read_bd('user_id', 'users', 'document_id', docNum);

      if (idUser.length > 0 ) {
          res.json({ 
              success: true, 
              redirectUrl: `/modusr/${idUser[0].user_id}`
          });
      } else {
        console.log('NO');
          res.json({ 
              success: false, 
              message: 'Documento no encontrado.'
          });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ 
          success: false, 
          message: 'Error interno del servidor' 
      });
  }
});

//Ruta dashborad modificación de usuarios
router.get('/modusr/:idUser', async (req, res) => {

  try {
      const idUser= await read_bd('*', 'users', 'user_id', req.params.idUser );
      console.log(idUser[0]);
      const documentTypes = await getDocumentTypes();
      res.render('modify_usr', {
          user: idUser[0],
          documentTypes
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

//Endpoint para insertar imagen
router.get('/show_user_photo/:imageName', (req, res) => {
  const imageName = req.params.imageName; // Obtiene el parámetro de la URL
  res.sendFile('./src/uploads/users/' + imageName, { root: process.cwd() });
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
    imagePath: req.file ? path.basename(req.file.path) : undefined // Ruta del archivo "Foto Personal"
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

//Modify user
router.post('/mod_usr', multer({ storage: storage_usr }).single('photo'), async (req, res) => {
  
  const data_serv ={
    docNum : req.body.docNum,
    name: req.body.name, // Valor del campo "Nombres"
    last_name: req.body.last_name, // Valor del campo "Apellidos"
    id_type: req.body['id-type'], // Valor del campo "Tipo de Identificación"
    id_number: req.body['id-number'], // Valor del campo "Número de Identificación"
    email: req.body.email, // Valor del campo "Correo Electrónico"
    password: req.body.password, // Valor del campo "Contraseña"
    imagePath: req.file ? path.basename(req.file.path) : undefined // Ruta del archivo "Foto Personal"
  }

  const documentTypes = await getDocumentTypes();

  try {
    // Validar y crear usuario
    const validationResult = await validateAndModifyUser(data_serv);

    // Si la validación falla, podrías querer manejarlo de manera diferente
    if (!validationResult.success) {
      throw new Error(validationResult.message);
    }
    // Guardar la ruta de la imagen en la base de datos
    // Puedes ajustar esta función para que acepte todos los datos necesarios
    await storeUserModified(data_serv)

    data_serv.document_type = await getDocumentTypeById(parseInt(data_serv.id_type))

     // Asignar data_serv al objeto global
    global.datadb = data_serv;

    // Redireccionar a la página de éxito o mostrar un mensaje
    res.redirect('/success_mod');

    } catch (error) {
    console.error(error);
    res.status(400).render('modify_usr', { error: error.message,documentTypes }); // Renderiza de nuevo el formulario con el mensaje de error
  }
  });

// Post contrato
router.post('/addcontract', multer({ storage: storage_ctr }).single('contract_photo'), async (req, res) => {

  const id_user = await read_bd('user_id','users', 'document_id', req.body.document_number);

  const data_contract ={
    idUser: id_user[0].user_id,
    startDate: req.body.start_date,
    endDate: req.body.end_date,
    paymentDay: req.body.payment_day,
    rentMount: req.body.rent_amount,
    warranty: req.body.warranty,
    hasWifi: req.body.has_wifi,
    wifiCost: req.body.wifi_cost,
    roomNumber:req.body.room_number,
    imagePath: req.file ? path.basename(req.file.path) : undefined // Ruta del archivo "Foto Contrato"
  };

  try {      
    storeContractWithImage(data_contract);
    // Redireccionar a la página de éxito o mostrar un mensaje
    res.redirect('/sscontract');

    } catch (error) {
    console.error(error);
    res.status(400).render('crtcontract', { error: error.message }); // Renderiza de nuevo el formulario con el mensaje de error
  }
  });

export default router;
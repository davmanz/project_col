import { Router } from 'express';
import { getDocumentTypes,
  storeUserWithImage,
  update_bd,
  getDocumentTypeById,
  searchDel,
  storeContractWithImage,
  read_bd,
  deleteUser,
  searchContracs} from '../js/connection.js';
import { validateUser } from '../js/validateUserServ.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {formartDate} from '../js/formatDate.js';
import {fileURLToPath} from "url";
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import {hashPassword, checkPassword} from '../js/hashpass.js';

// Configuración de almacenamiento para Multer
const storage_usr = multer.memoryStorage();
const upload_usr = multer({ storage: storage_usr });

//Instancia de Route
const router = Router();

//********************************************************************************************************************************* */

//Ruta estándar
router.get('/', (req, res) => res.render('login'));

//Ruta perfil del Usuario

router.get('/prfl_user', (req , res) => res.render('dshb_profile'));

//Ruta dashborad creacion de contratos
router.get('/crtcontract', (req, res) => res.render('create_contract', { title: 'Create Contract' }));

// Ruta de guardado en base de datos de usuarios
router.get('/success', (req, res) => {res.render('success', { userData: global.datadb});});

router.get('/sscontract', (req , res) => {res.render('success_contract', {contractData: global.data_contract});});

router.get('/success_mod', (req, res) => {res.render('success_mod', { userData: global.datadb});});

router.get('/index', (req, res) => res.render('index'));

router.get('/vwusr', (req, res) => res.render('view_usr'));

router.get('/vwctrt', (req, res) => res.render('view_ctrt'));

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

router.get('/vwctrt/:searchDoc', async (req, res) => {
  const contractInfo = await searchContracs(req.params.searchDoc);

  try {
    // Verifica si se encontraron resultados
    if (contractInfo.length > 0) {
      // Formatear las fechas antes de enviar
      contractInfo[0].contract_start_date = formartDate(contractInfo[0].contract_start_date);
      contractInfo[0].contract_end_date = formartDate(contractInfo[0].contract_end_date);

      // Enviar el primer resultado, suponiendo que el número de documento es único
      res.json({ success: true, data: contractInfo[0] });
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
      const idUser= await read_bd('first_name, last_name, email, user_id, document_id, document_type', 'users', 'user_id ', req.params.idUser );
      const documentTypes = await getDocumentTypes();
      res.render('modify_usr', {
          user: idUser[0],
          documentTypes,
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

//Endpoint solcitud de datos en contratos
router.get('/fdocmod/:numDoc', async (req,res) => {

  try {
    const numDoc = req.params.numDoc;
    const dataBd = await read_bd('first_name, last_name, user_id', 'users', 'document_id' ,numDoc);
    
    // Verifica si se encontraron resultados
    if (dataBd.length > 0) {
      // Enviar el primer resultado, suponiendo que el número de documento es único
      res.json({ success: true, data: dataBd[0] });
    } else {
      // No se encontraron resultados, enviar mensaje correspondiente
      res.json({ success: false, message: 'Documento no encontrado.' });
    }

  }catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

//Endponit Para descarga de contrato
router.get('/dwlcontract', (req, res) => {
  const imageName = req.query.imageName;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const parentDirectory = path.join(__dirname, '..');
  const directoryPath = path.join(parentDirectory, 'uploads/contract');


  const filePath = path.join(directoryPath, imageName);
  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('El archivo solicitado no fue encontrado en el servidor.');
    }
    
    // Configurar los headers para la descarga del archivo
    res.setHeader('Content-Disposition', 'attachment; filename=' + imageName);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Enviar el archivo para su descarga
    res.download(filePath, imageName, (err) => {
      if (err) {
        console.error("Error al descargar el archivo: ", err);
      }
    });
  });
});

//********************************************************************************************************************************* */

//Route user Pots

// Ruta para agregar usuario con imagen redimensionada
router.post('/addusr', upload_usr.single('photo'), async (req, res) => {
  const data_serv ={   
      user_id: uuidv4(),
      name: req.body.name,
      last_name: req.body.last_name,
      id_type: req.body['id-type'],
      id_number: req.body['id-number'],
      email: req.body.email,
      password: await hashPassword(req.body.password),
      adminCheck: req.body.isAdmin === 'on' ? 1 : 0,
  };

  try {
      if (req.file) {
          const filename = `user-${uuidv4()}${path.extname(req.file.originalname)}`;
          await sharp(req.file.buffer)
              .resize(240, 220)
              .toFile(`./src/uploads/users/${filename}`);

          data_serv.imagePath = filename;
      }

      // ... tu lógica existente para guardar los datos del usuario ...
      await storeUserWithImage(data_serv);
      global.datadb = data_serv;
      res.redirect('/success');

  } catch (error) {
      console.error(error);
      res.status(400).render('add_usr', { error: error.message });
  }
});

//Modify user
router.post('/modusr/', upload_usr.single('photo'), async (req, res) => {
  const data_serv = {
      user_id: req.body.pswd,
      first_name: req.body.name,
      last_name: req.body.last_name,
      email: req.body.email,
      password_hash: await hashPassword(req.body.password),
      document_id: req.body['id-number'],
      document_type: req.body['id-type'],
  };

  try {
      if (req.file) {
          const filename = `user-${uuidv4()}${path.extname(req.file.originalname)}`;
          await sharp(req.file.buffer)
              .resize(240, 220)
              .toFile(`./src/uploads/users/${filename}`);

          data_serv.personal_photo = filename;
      }

      let updates = {};
      for (const key in data_serv) {
          if (data_serv.hasOwnProperty(key) && key !== 'user_id' && data_serv[key]) {
              updates[key] = data_serv[key];
          }
      }

      if (Object.keys(updates).length > 0) {
          await update_bd('users', updates, 'user_id', data_serv.user_id);
          res.redirect('/success_mod');
      } else {
          res.redirect('/');
      }

  } catch (error) {
      console.error("Error al actualizar el usuario", error);
      res.status(500).send('Ocurrió un error al actualizar el usuario');
  }
});

// Post contrato
router.post('/addcontract', async (req, res) => {

  console.log(req.body)

  const data_contract ={
    name: req.body.user_name,
    idUser: req.body.pswd,
    startDate: req.body.start_date,
    endDate: req.body.end_date,
    paymentDay: req.body.payment_day,
    rentMount: req.body.rent_amount,
    warranty: req.body.warranty,
    hasWifi: req.body.has_wifi,
    wifiCost: req.body.wifi_cost,
    roomNumber:req.body.room_number,
  };

  console.log(data_contract);

  /*

  try {      
    storeContractWithImage(data_contract);

    //Guardar en objeti Global

    global.data_contract = data_contract

    // Redireccionar a la página de éxito o mostrar un mensaje
    res.redirect('/sscontract');

    } catch (error) {
    console.error(error);
    res.status(400).render('crtcontract', { error: error.message }); // Renderiza de nuevo el formulario con el mensaje de error
  }
  */

  });

router.post('/loginr', async (req, res) => {
  const data_usr = {
    email: req.body.email,
    password: req.body.password
  };
  
  try {
    // Obtener el hash de contraseña, admin y active del usuario desde la base de datos
    const result = await read_bd('password_hash, admin, active', 'users', 'email', data_usr.email);
     
    // Si no se encuentra el usuario o el resultado está vacío
    if (!result || result.length === 0) {
      return res.redirect('/login-error'); // Usuario no encontrado
    };
  
    const user = result[0];
  
    // Comprobar si la contraseña coincide y si el usuario es administrador y está activo
    const isPasswordValid = await checkPassword(data_usr.password, user.password_hash);
    const isAdmin = user.admin === 1;
    const isActive = user.active === 1;
  
    if (isPasswordValid && isAdmin && isActive) {
      // Si todo es correcto, redirigir al índice o dashboard
      res.redirect('/index');
    } else {
      // Si algo falla, redirigir a la página de error de login
      res.redirect('/login-error');
    };
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  };
});
  
router.post('/deleteuser', async (req, res) => {
  try {
      const userId = req.body.user_id; // Asegúrate de que 'user_id' es el campo correcto
      
      await deleteUser(userId);
      res.redirect('/index'); // Redirige a una página de confirmación o maneja como consideres
    
  } catch (error) {
      console.error("Error al eliminar el usuario", error);
      res.status(500).send('Ocurrió un error al eliminar el usuario');
  }});

export default router;
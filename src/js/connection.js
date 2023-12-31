import mysql from 'mysql';
import util from 'util'

// Coneccion de la base de datos
function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        database: "bd_hotel",
        user: "root",
        password: ""
    });
}

// Tipo de documentos
async function getDocumentTypes() {
    return new Promise((resolve, reject) => {
        const connection = createConnection();
        const query = 'SELECT * FROM documenttypes; ';
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
            connection.end();
        });
    });
}

// Función para almacenar los datos del usuario y la imagen en la base de datos
async function storeUserWithImage(userData) {

    const connection = createConnection();
    const query = 'INSERT INTO users (first_name, last_Name, document_id, document_type ,email, password_hash, personal_photo) VALUES (?, ?, ?, ?, ?, ?,?)';
    const values = [userData['name'], userData['last_name'], userData['id_number'], userData['id_type'], userData['email'], userData['password'], userData['imagePath']];
    
    // Retornar una promesa que resuelve o rechaza basado en el resultado de la consulta
    return new Promise((resolve, reject) => {
      connection.query(query, values, (error, results, fields) => {
        if (error) {
          reject(error);
        }else {
          resolve(results);
        }
        });
    });

        connection.end()
  }
  
  //Filtrado de documentos
  async function getDocumentTypeById(id) {
    try {
        const documentTypes = await getDocumentTypes();
        const documentType = documentTypes.find(dt => dt.document_id === id);

        return documentType ? documentType.document_type : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Función para buscar un usuario por número de documento
async function SearchByIdNumber(docNum) {
    const connection = createConnection();
    
    // Convierte connection.query en una función que devuelve una promesa
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Usa un array para pasar parámetros a la consulta y evitar la inyección de SQL
        const results = await query('SELECT user_id, first_name, last_name FROM users WHERE document_id = ?', [docNum]);
        console.log(results)
        return results;
    } catch (err) {
        // Lanza cualquier error que ocurra para que pueda ser capturado por el bloque catch en el endpoint
        throw err;
    } finally {
        // Asegúrate de cerrar la conexión cuando hayas terminado
        connection.end();
    }
}

  // Exportar usando sintaxis de ES6
  export {storeUserWithImage,getDocumentTypes,getDocumentTypeById,SearchByIdNumber};

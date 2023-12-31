import mysql from 'mysql';
import util from 'util'

/*
//Coneccion de la base de datos
function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        database: "edificio_n",
        user: "root",
        password: "root"
    });
}
 */

//Coneccion de la base de datos
function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        database: "bd_hotel",
        user: "root",
        password: ""
    });
}

//Insercion de datos con retorno de promesa, para funciones asincronicas
async function insert_bd(query,values){
    const connection = createConnection();
    // Retornar una promesa que resuelve o rechaza basado en el resultado de la consulta
    return new Promise((resolve, reject) => {
      connection.query(query, values, (error, results, fields) => {
        if (error) {
          reject(error);
          connection.end()
        }else {
          resolve(results);
          connection.end()
        }
        });
    });
};

//Devolver datos de una base de datos con una promesa
async function read_bd(select, tablet, field, value) {
    return new Promise((resolve, reject) => {
        const connection = createConnection();
        const query = `SELECT ${select} FROM ${tablet} WHERE ${field} = ?;`;
        connection.query(query, [value], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
            connection.end();
        });
    });
};

//Tipo de documentos
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

//Función para almacenar los datos del usuario y la imagen en la base de datos
async function storeUserWithImage(userData) {
    const query = 'INSERT INTO users (first_name, last_Name, document_id, document_type ,email, password_hash, personal_photo) VALUES (?, ?, ?, ?, ?, ?,?)';
    const values = [userData['name'], userData['last_name'], userData['id_number'], userData['id_type'], userData['email'], userData['password'], userData['imagePath']];
    return insert_bd(query, values)
};

async function storeUserModified(userData) {
    var query;
    var values;
    
    if (userData['imagePath'] !== undefined && userData['password'].length > 0) {
        query = 'UPDATE users SET first_name = ?, last_name = ?, document_id = ?, document_type = ?, email = ?, password_hash = ?, personal_photo = ? WHERE document_id = ?';
values = [userData['name'], userData['last_name'], userData['id_number'], userData['id_type'], userData['email'], userData['password'], userData['imagePath'], userData['docNum']];
    } else if (userData['imagePath'] !== undefined && userData['password'].length === 0) {
        query = 'UPDATE users SET first_name = ?, last_name = ?, document_id = ?, document_type = ?, email = ?, personal_photo = ? WHERE document_id = ?';
        values = [userData['name'], userData['last_name'], userData['id_number'], userData['id_type'], userData['email'], userData['imagePath'], userData['docNum']];
    } else if (userData['imagePath'] === undefined && userData['password'].length > 0) {
        query = 'UPDATE users SET first_name = ?, last_name = ?, document_id = ?, document_type = ?, email = ?, password_hash = ? WHERE document_id = ?';
        values = [userData['name'], userData['last_name'], userData['id_number'], userData['id_type'], userData['email'], userData['password'], userData['docNum']];
    } else if (userData['imagePath'] === undefined && userData['password'].length === 0) {
        query = 'UPDATE users SET first_name = ?, last_name = ?, document_id = ?, document_type = ?, email = ? WHERE document_id = ?';
        values = [userData['name'], userData['last_name'], userData['id_number'], userData['id_type'], userData['email'], userData['docNum']];
    }

    // Asegúrate de que insert_bd ejecute la consulta SQL y actualice la base de datos correctamente
    return insert_bd(query, values);
}

//Funcion para almacenar los datos del contrato en la base de datos
async function storeContractWithImage(contractData) {
    const query = 'INSERT INTO contracts (user_id, contract_start_date, contract_end_date, payment_day, rent_amount, warranty, has_wifi, wifi_cost, number_room, contract_photo) VALUES (?,?,?,?,?,?,?,?,?,?)';
    const values = [contractData['idUser'],contractData['startDate'],contractData['endDate'],contractData['paymentDay'],contractData['rentMount'],
    contractData['warranty'],contractData['hasWifi'],contractData['wifiCost'],contractData['roomNumber'],contractData['imagePath']];
    return insert_bd(query, values)
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

//Función para buscar un usuario por número de documento
async function SearchByIdNumber(docNum) {
    const connection = createConnection();
    
    // Convierte connection.query en una función que devuelve una promesa
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Usa un array para pasar parámetros a la consulta y evitar la inyección de SQL
        const results = await query('SELECT user_id, first_name, last_name FROM users WHERE document_id = ?', [docNum]);
        return results;
    } catch (err) {
        // Lanza cualquier error que ocurra para que pueda ser capturado por el bloque catch en el endpoint
        throw err;
    } finally {
        // Asegúrate de cerrar la conexión cuando hayas terminado
        connection.end();
    }
}

//Función para buscar un usuario por número de documento
async function SearchByIdNumberMod(docNum) {
    const connection = createConnection();
    
    // Convierte connection.query en una función que devuelve una promesa
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Usa un array para pasar parámetros a la consulta y evitar la inyección de SQL
        const results = await query('SELECT user_id, first_name, last_name, email, users.document_id, users.document_type FROM users INNER JOIN documenttypes ON users.document_type = documenttypes.document_id WHERE users.document_id = ?', [docNum]);
        return results;
    } catch (err) {
        // Lanza cualquier error que ocurra para que pueda ser capturado por el bloque catch en el endpoint
        throw err;
    } finally {
        // Asegúrate de cerrar la conexión cuando hayas terminado
        connection.end();
    }
}

async function searchDel(docNum){
    const connection = createConnection();

    // Convierte connection.query en una función que devuelve una promesa
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Usa un array para pasar parámetros a la consulta y evitar la inyección de SQL
        const resultsUsers = await query(
            `SELECT users.user_id, users.first_name, users.last_name, users.email, users.personal_photo,
            GROUP_CONCAT(contracts.contract_id) AS contract_ids
            FROM users
            INNER JOIN documenttypes ON users.document_type = documenttypes.document_id
            INNER JOIN contracts ON users.user_id = contracts.user_id
            WHERE users.document_id = ?
            GROUP BY users.user_id, users.first_name, users.last_name, users.email, users.personal_photo`,
            [docNum]
        );
        return resultsUsers;
    } catch (err) {
        // Lanza cualquier error que ocurra para que pueda ser capturado por el bloque catch en el endpoint
        throw err;
    } finally {
        // Asegúrate de cerrar la conexión cuando hayas terminado
        connection.end();
    }
}

//Exportar usando sintaxis de ES6
export {storeUserWithImage,
    getDocumentTypes,
    getDocumentTypeById,
    SearchByIdNumber,
    storeContractWithImage,
    read_bd,
    SearchByIdNumberMod,
    storeUserModified,
    searchDel};

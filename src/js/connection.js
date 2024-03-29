import mysql from 'mysql';
import util from 'util'
import fs from 'fs';
const unlinkAsync = util.promisify(fs.unlink);
import path from "path";

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

async function update_bd(table, updates, field, value) {
    return new Promise((resolve, reject) => {
        const connection = createConnection();

        // Crear la parte de actualización de la consulta
        const updateString = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const queryParams = [...Object.values(updates), value];

        const query = `UPDATE ${table} SET ${updateString} WHERE ${field} = ?;`;
        
        connection.query(query, queryParams, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
            connection.end();
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

//Funcion de borrado de usuario
async function deleteUser(userId) {
    const connection = createConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Iniciar la transacción
        await query('START TRANSACTION');

        // Obtener el nombre del archivo de imagen del usuario
        const result = await query('SELECT personal_photo FROM users WHERE user_id = ?', [userId]);
        const userImage = result[0]?.personal_photo;

        // Eliminar todos los contratos asociados con el usuario
        const deleteContracts = 'DELETE FROM contracts WHERE user_id = ?';
        await query(deleteContracts, [userId]);

        // Eliminar el usuario
        const deleteUser = 'DELETE FROM users WHERE user_id = ?';
        await query(deleteUser, [userId]);

        // Confirmar la transacción
        await query('COMMIT');

        // Eliminar la imagen del servidor si existe
        if (userImage) {
            const imagePath = path.join('./src/uploads/users', userImage);
            await unlinkAsync(imagePath);
        }
    } catch (error) {
        // Si hay un error, revertir la transacción
        await query('ROLLBACK');
        throw error;
    } finally {
        // Siempre cerrar la conexión
        connection.end();
    }
}

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
    const query = `INSERT INTO users (
        user_id,
        first_name, 
        last_Name, 
        document_number, 
        document_type ,
        email, 
        password_hash, 
        personal_photo, 
        admin
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        userData.user_id, 
        userData.name, 
        userData.last_name, 
        userData.document_number, 
        userData.document_type, 
        userData.email, 
        userData.password, 
        userData.imagePath,
        userData.adminCheck
    ];
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
async function storeContract(contractData) {
    // Generar contract_id
    const contractStartDateFormatted = contractData['startDate'].replace(/-/g, ''); // Formatear la fecha para quitar guiones
    const contractId = `HT-${contractStartDateFormatted}-${contractData['roomNumber']}`;
  
    const query = `INSERT INTO contracts (
        contract_id,
        user_id, 
        contract_start_date, 
        contract_end_date, 
        payment_day, 
        rent_amount, 
        warranty, 
        has_wifi, 
        wifi_cost, 
        rooms_id
        ) 
        VALUES (?,?,?,?,?,?,?,?,?,?)`;
    const values = [
        contractId,
        contractData['idUser'],
        contractData['startDate'],
        contractData['endDate'],
        contractData['paymentDay'],
        contractData['rentMount'],
        contractData['warranty'],
        contractData['hasWifi'],
        contractData['wifiCost'],
        contractData['roomNumber']];
    return insert_bd(query, values)
}


//Filtrado de documentos
async function getDocumentTypeById(id) {
    try {
        const documentTypes = await getDocumentTypes();
        const documentType = documentTypes.find(dt => dt.document_type === id);

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

async function searchUser(docNum){
    const connection = createConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Cambia INNER JOIN por LEFT JOIN para manejar usuarios sin contratos
        const resultsUsers = await query(
            `SELECT users.user_id, users.first_name, users.last_name, users.email, users.personal_photo,
            GROUP_CONCAT(contracts.contract_id) AS contract_ids
            FROM users
            LEFT JOIN contracts ON users.user_id = contracts.user_id
            WHERE users.document_number = ?
            GROUP BY users.user_id, users.first_name, users.last_name, users.email, users.personal_photo`,
            [docNum]
        );

        // Si no hay contratos, asigna un valor predeterminado
        resultsUsers.forEach(user => {
            user.contract_ids = user.contract_ids || 'No tiene contratos asignados a esta persona';
        });

        return resultsUsers;
    } catch (err) {
        throw err;
    } finally {
        connection.end();
    }
}

async function searchContracs(contractNum){
    const connection = createConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // 
        const resultsContracts = await query(
            `SELECT contracts.*, users.first_name, users.last_name
            FROM contracts
            INNER JOIN users ON users.user_id = contracts.user_id
            WHERE contracts.contract_id = ?`,
            [contractNum]
        );
        return resultsContracts;
    } catch (err) {
        throw err;
    } finally {
        connection.end();
    }
}

async function logadmr(email) {
    
    const connection = createConnection();
  
    connection.connect();

    const query = util.promisify(connection.query).bind(connection);

    try {
        const result = await query(`
            SELECT 
                users.*,
                COALESCE(GROUP_CONCAT(contracts.contract_id SEPARATOR ', '), 'None') AS contract_ids
            FROM 
                users
            LEFT JOIN 
                contracts ON users.user_id = contracts.user_id
            WHERE 
                users.email = ?
            GROUP BY 
                users.user_id;
        `, [email]);

        // Verifica si el resultado contiene datos
        if (result.length === 0) {
            return 'No user found with the provided email.';
        }

        return result;

    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow para manejarlo más arriba en la stack o para informar al cliente

    } finally {
        connection.end(); // Asegúrate de cerrar la conexión
    }
}

//Exportar usando sintaxis de ES6
export {storeUserWithImage,
    getDocumentTypes,
    getDocumentTypeById,
    SearchByIdNumber,
    storeContract,
    read_bd,
    SearchByIdNumberMod,
    storeUserModified,
    searchUser,
    update_bd,
    deleteUser,
    searchContracs,
    logadmr,
    insert_bd};

import mysql from 'mysql';

function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        database: "bd_hotel",
        user: "root",
        password: ""
    });
}

export function create(tableName, data) {
    const connection = createConnection();
    const query = 'INSERT INTO tu_tabla SET ' +tableName ;
    
    connection.query(query, data, (err, results) => {
        if (err) {
            console.error('Error al crear registro:', err);
        } else {
            console.log('Registro creado:', results.insertId);
        }
        connection.end();
    });
}

async function read() {
    const connection = createConnection();
    const query = 'SELECT * FROM tu_tabla';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al leer datos:', err);
        } else {
            console.log('Datos recibidos:', results);
        }
        connection.end();
    });
}

async function update(id, data) {
    const connection = createConnection();
    const query = 'UPDATE tu_tabla SET ? WHERE id = ?';
    
    connection.query(query, [data, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar registro:', err);
        } else {
            console.log('Registro actualizado:', results.affectedRows);
        }
        connection.end();
    });
}

async function del(id) {
    const connection = createConnection();
    const query = 'DELETE FROM tu_tabla WHERE id = ?';
    
    connection.query(query, id, (err, results) => {
        if (err) {
            console.error('Error al eliminar registro:', err);
        } else {
            console.log('Registro eliminado:', results.affectedRows);
        }
        connection.end();
    });
}

// Tipo de documentos

export async function getDocumentTypes() {
    return new Promise((resolve, reject) => {
        const connection = createConnection();
        const query = 'SELECT * FROM documenttypes';
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
    const query = 'INSERT INTO users (first_name, last_Name, document_id, email, password_hash, personal_photo) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [userData.name, userData.lastName, userData.idNumber, userData.email, userData.password, userData.imagePath];
    
    // Retornar una promesa que resuelve o rechaza basado en el resultado de la consulta
    return new Promise((resolve, reject) => {
      connection.query(query, values, (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  // Exportar usando sintaxis de ES6
  export { storeUserWithImage };


// Ejemplo de uso de las funciones CRUD
// await create({ columna1: 'valor1', columna2: 'valor2', ... });
// await read();
// await update(1, { columna1: 'nuevo valor1', ... });
// await del(1);

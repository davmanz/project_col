import mysql from 'mysql';

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
  
  // Exportar usando sintaxis de ES6
  export {storeUserWithImage,getDocumentTypes};

// Ejemplo de uso de las funciones CRUD
// await create({ columna1: 'valor1', columna2: 'valor2', ... });
// await read();
// await update(1, { columna1: 'nuevo valor1', ... });
// await del(1);

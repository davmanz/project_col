import mysql from 'mysql';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: "localhost",
    database: "bd_hotel",
    user: "root",
    password: ""
});

const __dirname = dirname(fileURLToPath(import.meta.url));

// Función para guardar la imagen BLOB en un archivo
const saveImageToFile = (blobContent, filename) => {
    // La ruta del archivo donde se guardará la imagen
    const filePath = join(__dirname, '../public/img', filename);
    // Escribir el contenido del BLOB en el archivo
    fs.writeFile(filePath, blobContent, (err) => {
        if (err) {
            console.error('Error al guardar la imagen', err);
        } else {
            console.log(`La imagen ha sido guardada en: ${filePath}`);
        }
    });
};

// Conectar y recuperar la imagen
connection.connect(error => {
    if (error) throw error;

    const query = 'SELECT `personal_photo` FROM `users` WHERE `user_id` = 12';
    connection.query(query, (error, results) => {
        connection.end();

        if (error) {
            console.error('Error al ejecutar la consulta', error);
            return;
        }

        if (results.length > 0 && results[0].personal_photo) {
            const photoBlob = results[0].personal_photo;
            const filename = `user_11_photo.jpg`; // Asumiendo que sabes que la imagen es un JPEG
            saveImageToFile(photoBlob, filename);
        } else {
            console.log('No se encontraron resultados o la imagen es nula.');
        }
    });
});

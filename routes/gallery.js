const config = require('../config');
const db = require('../db');
const pool = db.getPool();
const fs = require('fs');


module.exports = (app, express)=>{
    const gallery = express.Router();

    gallery.get('/', (req,res)=>{
        const query = 'SELECT * FROM alboms';
        pool.getConnection((err, connection)=>{
            if(err) {
                res.send('Ошибка выполнения запроса! '+err);
            }
            else { 
            connection.query(query, (err, rows)=>{
                res.render('gallery', {"rows" : rows });
                connection.release();
            });
        }
        });
    });

    gallery.post('/', (req,res)=>{
        const query = `INSERT INTO alboms(name_album, description, path_head_photo) VALUES ('${req.body.albumname}', '${req.body.albumDeskript}', 'images/${req.file.filename}')`;
        console.log(req.body);
        pool.getConnection((err, connection)=>{
            if(err) {
                res.send('Ошибка подключения к БД! '+err);
            }
            else {  
            connection.query(query, (err, rows)=>{
                if(err) {
                    res.send('Error' + err);
                }
                else {
                    res.writeHead(301,{Location: 'http://localhost:3000'});
                    res.end();
                }
                connection.release();
            });
        }
        });
    });


    gallery.delete('/', (req,res)=>{
        const query_select_photos = `SELECT path FROM photos WHERE album=${req.body.id}`;
        const query_delete_photos = `DELETE FROM photos WHERE album=${req.body.id}`;
        const query_select_alboms = `SELECT path_head_photo FROM alboms WHERE id=${req.body.id}`;
        const query_delete_alboms = `DELETE FROM alboms WHERE id=${req.body.id}`;
        pool.getConnection(async (err, connection)=>{
            if(err) {
                res.send(err);
                return;
            } else { 
            await connection.query(query_select_photos, (err, rows)=>{
                if(err) {
                    res.send(err);
                    console.log(err);
                    return;
                }
                else {
                    console.log(rows);
                    for(let i=0; i<rows.length; i++) {
                        fs.unlink(__dirname+'/../public/'+rows[i].path, (err)=>{
                            console.log(err);
                            return;  
                        });
                    }
                }
            });
            await connection.query(query_select_alboms, (err, rows)=>{
                if(err) {
                    res.send(err);
                    console.log(err);
                    return;
                }
                else {
                    fs.unlink(__dirname+'/../public/'+rows[0].path_head_photo, (err)=>{
                        console.log(err);
                        return;
                    });
                }
            });
            await connection.query(query_delete_photos, (err)=>{
                if(err) {
                    res.send(err);
                    console.log(err);
                    return;
                } 
            });
            await connection.query(query_delete_alboms, (err)=>{
                if(err) {
                    res.send(err);
                    console.log(err);
                    return;
                }
                else {
                    res.send('Альбом успешно удален!');
                } 
              connection.release();  
            });
        }
        });
    });

    gallery.get('/:id', (req,res)=>{
        const query_photos = `SELECT * FROM photos WHERE photos.album=${req.params['id']}`;
        const query_alboms = `SELECT id, name_album, description FROM alboms WHERE id=${req.params['id']}`;
        pool.getConnection((err, connection)=>{
            connection.query(query_photos, (err, rows_photo)=>{
                if(err) {
                    res.send(err);
                }
                else { 
                connection.query(query_alboms, (err, rows_album)=>{
                    if (err) {
                        res.send(err);
                    } else {
                        console.log('Содержание: '+rows_album);
                        if(rows_album.length==0) {
                            res.send('404');
                        }
                        else {
                            res.render('album', {"rows_album" : rows_album, "rows_photo" : rows_photo});
                        }
                    }
                });
            }
                connection.release();
            });
        });
    });

    gallery.post('/:id', (req,res)=>{
        const query = `INSERT INTO photos(name_photo, album, path) VALUES ('${req.body.photoname}', ${req.body.album}, 'images/${req.file.filename}');`;
        pool.getConnection((err, connection)=>{
            connection.query(query, (err, rows)=>{
                if(err) {
                    res.send('Error');
                }
                else {
                    res.writeHead(301,{Location: `http://localhost:3000/${req.params['id']}`});
                    res.end();
                }
                connection.release();
            });
        });
    });


    gallery.delete('/:id', (req,res)=>{
        const query_select = `SELECT path FROM photos WHERE id=${req.body.id}`;
        const query_delete = `DELETE FROM photos WHERE id=${req.body.id}`;
        pool.getConnection(async (err, connection)=>{
            if(err) {
                res.send(err);
                return;
            }
            await connection.query(query_select, (err, rows)=>{
                if(err) {
                    res.send(err);
                    console.log(err);
                    return;
                }
                else {
                    fs.unlink(__dirname+'/../public/'+rows[0].path, (err)=>{
                        console.log(err);
                        return;
                    });
                }
            });
            await connection.query(query_delete, (err)=>{
                if(err) {
                    res.send(err);
                    console.log(err);
                    return;
                }
                else {
                    res.send('Файл успешно удален!');
                } 
              connection.release();  
            });
        });
    });
    return gallery;
};

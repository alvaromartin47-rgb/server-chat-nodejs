import chatId from './models/chatId';
import userConnection from './models/userConnection';

function registrarConexion(idChat, name, socketId) {
    const body = {
        idChat,
        name,
        socketId
    }

    const newUserConnection = new userConnection(body);
    newUserConnection.save();
}

async function autenticarConexion(nameUser) {
    const response = await chatId.find();
    
    if (response.length == 0) {
    
        const newChatId = new chatId({idChat: 0})
        await newChatId.save();
        return {idChat: 0, name: nameUser}
    
    } else {
    
        const current = response[0].idChat;
        const dataUpdate = await chatId.findByIdAndUpdate(response[0]._id, {idChat: current + 1});
        return {idChat: current + 1, name: nameUser}
    
    }
}

async function eliminarConexion(socketId) {
    const responseFind = await userConnection.find({socketId});
    const responseDelete = await userConnection.findByIdAndDelete(responseFind[0]._id);
    return responseDelete._id;
}

function validarRespuestaTelegram(ctx) {
    return new Promise((resolve, reject) => {
        const msj = ctx.update.message.text;
        if (msj[0] != '@') return reject("Error, falta el caracter '@'");
    
        let i = 0;
        
        for (i; msj[i] != ":" && i < msj.length; i++);
        
        if (i === msj.length) return reject("Error, falta el caracter ':'");
        if (msj[i + 1] != " ") return reject("Error, falta un espacio entre ':' y tu respuesta.");
        
        const idChat = msj.slice(1, i);
        const msjChat = msj.slice(i + 2);
        resolve({idChat, msjChat});
    
    });
}

module.exports = {

    eliminarConexion,
    autenticarConexion,
    registrarConexion,
    validarRespuestaTelegram

}
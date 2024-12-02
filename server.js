const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let timerValue = 30;
let timer;

// Avvia il timer
function startTimer() {
    timer = setInterval(() => {
        if (timerValue > 0) {
            timerValue--;
            io.emit('timerUpdate', timerValue); // Aggiorna tutti i client
        } else {
            clearInterval(timer);
            io.emit('timeUp'); // Notifica che il tempo è scaduto
        }
    }, 1000);
}

// Gestione connessioni
io.on('connection', (socket) => {
    console.log('Nuovo giocatore connesso.');

    // Invia il timer corrente al nuovo giocatore
    socket.emit('timerUpdate', timerValue);

    // Ferma il timer su richiesta
    socket.on('stopTimer', () => {
        clearInterval(timer);
        io.emit('timerStopped'); // Avvisa tutti i client che il timer si è fermato
    });

    // Riavvia il timer quando tutti sono pronti
    socket.on('restartTimer', () => {
        timerValue = 30;
        startTimer();
    });
});

// Servi i file statici
app.use(express.static('public'));

// Avvia il server
server.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});

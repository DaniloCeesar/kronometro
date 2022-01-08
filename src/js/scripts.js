// Formata o tempo informado para array ou para formato legível
function timeFormat(seconds, humanReadable = false) {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60

    if ( humanReadable ) {
        return [minutes, seconds % 60].map(format).join(':');
    } else {
        return [hours, minutes, seconds % 60];
    }
}

// Inicializa o aplicativo
function app() {
    return {
        itemNovo: [],
        metas: JSON.parse(localStorage.getItem('metas') || '[]'),

        temporizador: {
            version: "1.0.0",
        
            regular: 25,
            shortBreak: 5,
            longBreak: 15,
            
            shortBreakMax: 3, // Inicia o `longBreak` após esta quantidade de `shortBreakSession`s
            shortBreakSession: 0,
        
            autoModeChange: true,
            autoRestart: false,
            
            isFinished: false,
            isPaused: false,
            
            initialMode: "regular",
            currentMode: null,
            currentTime: 0,        
        },

        // Inicia o temporizador
        startTimer( modo = this.temporizador["currentMode"], forceReset = false ) {
            // Reseta iterações em andamento, se houver
            if ( typeof intervalo !== "undefined" ) {
                clearInterval(intervalo); // Cancela as iterações
            }

            // @FIX: Se o valor informado for `null`, utiliza o `initialMode`
            if ( modo == null ) { modo = this.temporizador["initialMode"]; }

            // @FIX: Se o contador estiver pausado, retoma a contagem; se não, inicia a partir do tempo estabelecido para o respectivo `modo`
            if ( ! this.temporizador["isPaused"] ) {
                segundos = this.temporizador[modo] * 60;
            } else {
                segundos = this.temporizador["currentTime"];                    
            }

            // @FIX: Permite resetar a contagem
            if ( forceReset ) {
                segundos = this.temporizador[modo] * 60;
            }
                                
            // Resolve as iterações
            this.temporizador["currentMode"] = modo;
            this.temporizador["isFinished"] = false;
            this.temporizador["isPaused"] = false;

            intervalo = setInterval(() => {
                // @FIX: Cancela a iteração se `isPaused`
                if ( this.temporizador["isPaused"] ) { return; }

                // Subtrai 1 segundo a cada iteração
                segundos--;

                this.temporizador["currentTime"] = segundos;
                this.updateDisplay( segundos, this.temporizador[modo] );

                // Executa as iterações a depender do `currentMode`
                switch( modo ) {
                    case 'regular':
                    default:
                        // Após chegar a 0, passa ao próximo modo
                        if ( segundos <= 0 ) {
                            clearInterval(intervalo); // Cancela as iterações
                            
                            // Se finalizaram todos os `shortBreakSession`s, inicia o modo `longBreak`;
                            // se não, inicia outro modo `shortBreak`.
                            if ( this.temporizador["shortBreakSession"] !== (this.temporizador["shortBreakMax"] ) ) {
                                // Inicia nova `shortBreakSession` de `shortBreak`
                                this.temporizador["shortBreakSession"] += 1;

                                this.startTimer("shortBreak");
                            } else {
                                // Reinicia `shortBreakSession` de `shortBreak`
                                this.temporizador["shortBreakSession"] = 0;

                                this.startTimer("longBreak");
                            }
                        }
                    break;

                    case 'shortBreak':                        
                        // Após chegar a 0, passa ao próximo modo
                        if ( segundos <= 0 ) {
                            clearInterval(intervalo); // Cancela as iterações

                            this.startTimer("regular"); // Inicia o modo `regular`
                        }
                    break;

                    case 'longBreak':
                        // Após chegar a 0, passa ao próximo modo
                        if ( segundos <= 0 ) {
                            clearInterval(intervalo); // Cancela as iterações                            

                            if ( this.temporizador["autoRestart"] ) {
                                this.startTimer("regular"); // Inicia o modo `regular`
                            } else {
                                this.temporizador["isFinished"] = true;
                            }
                        }
                    break;                
                }
            }, 1000);
        },

         // Interrompe o temporizador
         stopTimer() {
            clearInterval(intervalo);
            this.temporizador["isPaused"] = false;
            this.temporizador["isFinished"] = true;
        },

        // Pausa o temporizador
        pauseTimer() {
            clearInterval(intervalo);
            this.temporizador["isPaused"] = true;
            this.temporizador["isFinished"] = false;
        },

        // Reinicia o temporizador caso o usuário altere a duração
        rebootTimer() {
            this.stopTimer(); // Interrompe o temporizador
            this.startTimer( this.temporizador["currentMode"], true ); // Reinicia do zero o temporizador
        },

        // Atualiza os elementos do frontend        
        updateDisplay( segundos, segundosTotal ) {
            if ( document.getElementById('timer-modo') )
                document.getElementById('timer-modo').innerText = {
                    "regular": "Ciclo regular",
                    "shortBreak": "Intervalo curto",
                    "longBreak": "Intervalo longo"
                }[this.temporizador.currentMode];
        },        
        
        // Inicializa a aplicação
        init() {}
    }
}
const ApiUrl = "http://awaken-smilingly-outsell.ngrok-free.dev"

let socket: WebSocket | null = null;

// 1. Função para iniciar a conexão
export const iniciarConexao = (onLogReceived: (log: { tipo: string; text: string; userName: string }) => void) => {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return;
  }
  socket = new WebSocket('wss://awaken-smilingly-outsell.ngrok-free.dev/api/log');

  socket.onopen = () => {
    console.log("✅ Conectado com sucesso ao Spring Boot!");
  };

  socket.onerror = (error) => {
    console.error("❌ Erro no WebSocket:", error);
  };

  socket.onclose = (event) => {
    console.log("🔌 Conexão fechada. Código:", event.code, "Razão:", event.reason);
  };
  

  socket.onmessage = (event) => {
    try {
      // Tenta transformar em JSON
      const data = JSON.parse(event.data);
      
      if (data.tipo === "BATTLE_LOG" || data.tipo === "SISTEMA") {
        onLogReceived(data);
      } else if (data.tipo === "CHAT") {
        onLogReceived(data);
      }
    } catch (e) {
      // Se o servidor mandar texto puro por erro, ele cai aqui e não quebra o site
      console.warn("Recebi uma mensagem que não era JSON:", event.data);
    }
  };

  socket.onclose = () => {
    console.log("Conexão com o servidor encerrada.");
  };
};

// 2. Função para fechar a conexão quando o usuário sair
export const encerrarConexao = () => {
if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    socket = null;
  }
};

export function actionCon(tipo: string, action: string, userName: string){
  if(!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket não está conectado.");
    return;
  }
  const send = {
    tipo: tipo,
    action: action,
    userName: userName
  }
  socket?.send(JSON.stringify(send))
}

export function chatCon(tipo: string, text: string, userName: string){
  if(!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket não está conectado.");
    return;
  }
  const send = {
    tipo: tipo,
    text: text,
    userName: userName
  }
  socket?.send(JSON.stringify(send))
}

export function characterCon(character: { name: string; charClass: string; vida: string; forca: string; velocidade: string }){
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(character)
  }
  fetch(`${ApiUrl}/character/create`, requestOptions)
}

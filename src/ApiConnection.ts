const ApiUrl = "https://awaken-smilingly-outsell.ngrok-free.dev"

let socket: WebSocket | null = null;

const listeners = new Set<(data: any) => void>();
let timeoutFechamento: number | null = null;

let onBattleEndCallback: () => void = () => {};

export const subscribeToBattleEnd = (callback: () => void) => {
  onBattleEndCallback = callback;
};

export const iniciarConexao = (onMessageReceived: (data: any) => void) => { 
  listeners.add(onMessageReceived);

  if (timeoutFechamento) {
    clearTimeout(timeoutFechamento);
    timeoutFechamento = null;
    console.log("Fechamento cancelado: novo ouvinte chegou.");
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  
  socket = new WebSocket(ApiUrl.replace("http", "ws") + "/api/log");
  socket.onopen = () => {
    console.log("✅ CONECTADO AO KOTLIN!");
  };

  socket.onclose = (event) => {
    console.log("🔌 CONEXÃO FECHADA. Código:", event.code, "Razão:", event.reason);
  };

  socket.onerror = (error) => {
    console.error("❌ ERRO NO SOCKET:", error);
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if(data.tipo === "BATTLE_END") {
      if (onBattleEndCallback) {
      onBattleEndCallback();
    }
    }

    listeners.forEach((callback) => callback(data));
  };
};

export const encerrarConexao = (onMessageReceived: (data: any) => void) => {
  listeners.delete(onMessageReceived);
  
if (listeners.size === 0 && socket) {
    timeoutFechamento = window.setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, "Nenhum componente ouvindo");
        socket = null;
        console.log("🔌 WebSocket fechado por inatividade.");
      }
      timeoutFechamento = null;
    }, 1000);
  }
};

export function actionCon(id: number,tipo: string, action: string, userName: string){
  if(!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket não está conectado.");
    return;
  }
  const send = {
    id: id,
    tipo: tipo,
    action: action,
    userName: userName
  }
  socket?.send(JSON.stringify(send))
}

export function chatCon(tipo: string, text: string, userName: string){
  const send = {
    tipo: tipo,
    text: text,
    userName: userName
  }
  if(socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(send));
  } else if(socket && socket.readyState === WebSocket.CONNECTING) {
    socket.onopen = () => {
      socket?.send(JSON.stringify(send));
    };
  } else{
    console.error("WebSocket não está conectado e não pode enviar a mensagem.");
  }
}

export function characterCreateCon(character: { name: string; charClass: string; vida: string; forca: string; velocidade: string }){
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
     },
    body: JSON.stringify(character)
  }
  fetch(`${ApiUrl}/character/save`, requestOptions)
}

export const characterGetCon = async () => {
  try {
    const response = await fetch(`${ApiUrl}/character/getall`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar personagens:", error);
    return [];
  }
}

export const characterDeleteCon = async (id: number) => {
  try {
    console.log("Tentando excluir personagem com ID:", id);
    const response = await fetch(`${ApiUrl}/character/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    const data = await response.json();
if (response.ok) {
      console.log("Sucesso:", data.mensagem);
      alert(data.mensagem);
      
    } else {
      console.error("Falha ao deletar:", data.mensagem);
      alert("Erro ao deletar: " + data.mensagem);
    }

  } catch (error) {
    console.error("Erro de conexão com o servidor:", error);
    alert("O servidor está offline ou deu erro de rede!");
  }
}


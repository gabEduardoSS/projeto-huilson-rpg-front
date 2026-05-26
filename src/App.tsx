import { useState, useRef, useEffect } from 'react'
import './App.css'
import { actionCon, characterCreateCon, chatCon, iniciarConexao, encerrarConexao, characterGetCon } from './ApiConnection'

type ActionButtonProps = { text: string; onClick?: () => void }

function ActionButton({ text, onClick }: ActionButtonProps) {
  return (
    <button type="button" className="action-button" onClick={onClick}>
      {text}
    </button>
  )
}

type UserSetProps = {
  userName: string;
  setUserName: (name: string) => void;
  onJoin: () => void;
  isJoined: boolean;
}

function UserSetContainer({ userName, setUserName, onJoin, isJoined }: UserSetProps){
  return (
    <div className="user-creation-container">
      {isJoined ? (
        <h3>Bem-vindo, {userName}!</h3>
      ) : (
        <>
          <label htmlFor="userCreationInput">Nome do usuário:</label>
          <input 
            className='user-creation-input' 
            placeholder='Digite seu nome' 
            type="text" 
            id="userCreationInput"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button className="user-creation-button" onClick={onJoin}>
            Entrar na Sessão
          </button>
        </>
      )}
    </div>
  )
} 

type CharacterStats = {
  name: string;
  charClass: string;
  vida: string; 
  forca: string;
  velocidade: string;
}

function CharacterCreationContainer(){
  const [character, setCharacter] = useState<CharacterStats>({
    name: "",
    charClass: "",
    vida: "100",
    forca: "5",
    velocidade: "5"
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name !== "vida"){
    setCharacter(estadoAnterior => ({
      ...estadoAnterior,
      [name]: value
    }));
    }
  }

  const handleCharacterSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    characterCreateCon(character)
    alert(`Personagem criado:\nNome: ${character.name}\nClasse: ${character.charClass}\nVida: ${character.vida}\nForça: ${character.forca}\nVelocidade: ${character.velocidade}`)
    setCharacter({
      name: "",
      charClass: "",
      vida: "100",
      forca: "5",
      velocidade: "5"
    })
  }


  return (
    <form onSubmit={(e) => handleCharacterSubmit(e)} className="character-creation-container">
      <div style={{ display: "flex", flexDirection: "row"}}>
        <div className='character-name-class'>
          <div>
            <label htmlFor="characterNameInput">Nome:</label>
            <input className='character-name-class-input' onChange={handleChange} value={character.name} type="text" placeholder='Nome do personagem' name="name" id="characterNameInput" required/>
          </div>
          <div>
            <label htmlFor="characterClassInput">Classe:</label>
            <select className='character-name-class-input' name="charClass" id="characterClassInput" value={character.charClass} onChange={handleChange} required>
              <option value="">Selecione a classe</option>
              <option value="guerreiro">Guerreiro</option>
              <option value="mago">Mago</option>
              <option value="ladino">Ladino</option>
            </select>
          </div>
          
        </div>
        <div className='character-stats'>
          <div>
            <label htmlFor="characterVidaInput">Vida:</label>
            <input className='character-name-class-input character-stats-input' onChange={handleChange} type="number" name="vida" id="characterVidaInput" value={character.vida}/>
          </div>
          <div>
            <label htmlFor="characterForcaInput">Força:</label>
            <input className='character-name-class-input character-stats-input' onChange={handleChange} type="number" name="forca" id="characterForcaInput" onKeyDown={(e) => e.preventDefault()} value={character.forca} min="1" max="10" required/>
          </div>
          <div>
            <label htmlFor="characterVelocidadeInput">Velocidade:</label>
            <input className='character-name-class-input character-stats-input' onChange={handleChange} type="number" name="velocidade" id="characterVelocidadeInput" onKeyDown={(e) => e.preventDefault()} value={character.velocidade} min="1" max="10" required/>
          </div>
        </div>
     </div>
     <button type="submit" className="user-creation-button">Criar Personagem</button>
        
    </form>
  )
}

type CharacterSelectionProps = {
  onSelect: (char: CharacterOption) => void;
  selectedCharName?: string;
}

type CharacterOption = {
  id: number;
  nome: string;
  vida: string;
  forca: string;
  velocidade: string;
  defesa?: string;
  sagacidade?: string;
  magia?: string;
}

function CharacterSelectionContainer({ onSelect, selectedCharName }: CharacterSelectionProps) {
  const [characters, setCharacters] = useState<CharacterOption[]>([]);

  // Atualiza a lista quando o componente aparece
  useEffect(() => {
      characterGetCon().then(data => setCharacters(data));
  }, []);

  // Função que lida com a mudança do select
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    // Encontra o objeto completo do personagem baseado no nome escolhido
    const personagemEncontrado = characters.find(char => char.id === parseInt(id));
    
    if (personagemEncontrado) {
      onSelect(personagemEncontrado);
    }
  };

  return (
    <div className="character-selection-container">
      <label htmlFor="characterDropdown">
        Selecionar Personagem:
      </label>
      
      <select 
        id="characterDropdown"
        className="character-selection-select" 
        value={selectedCharName || ""} 
        onChange={handleSelectChange}
      >
        <option value="" disabled>Escolha um herói salvo...</option>
        
        {characters.map((char, index) => {
          let classe = "Desconhecido"; 
          if (char.defesa !== undefined) {
            classe = "Guerreiro";
          } else if (char.magia !== undefined) {
            classe = "Mago";
          } else if (char.sagacidade !== undefined) {
            classe = "Ladino";
          }

          return (
            <option key={index} value={char.id}>
              {char.nome} - {classe}
            </option>
          );
        })}
      </select>

      <button 
         type="button"
         className="user-creation-button" 
         onClick={() => characterGetCon().then(setCharacters)}
      >
        Atualizar Lista do Banco
      </button>
    </div>
  );
}

function RpgContainer({currentUser}: {currentUser: string}){
  const [battleLogs, setBattleLogs] = useState<string[]>([]);

  useEffect(() => {
    const escutarSocket = (data: any) => {
        if (data.tipo === "BATTLE_LOG") {
            setBattleLogs(prev => [...prev, data.text]);
        }
    };
    iniciarConexao(escutarSocket);
    return () => {
      encerrarConexao(escutarSocket);
    };
  }, []);

  return (
    <div className="rpg-container">
      <div className="log-container">
        <div className="log-text">
          {battleLogs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>
      </div>
      <div className="actions-container">
        {ActionButton({ text: "Atacar", onClick: () => actionCon("BATTLE_ACTION", "atacar", currentUser) })}
        {ActionButton({ text: "Defender", onClick: () => actionCon("BATTLE_ACTION", "defender", currentUser) })}
        {ActionButton({ text: "Fugir", onClick: () => actionCon("BATTLE_ACTION", "fugir", currentUser) })}
        {ActionButton({ text: "Poder", onClick: () => actionCon("BATTLE_ACTION", "poder", currentUser) })}
      </div>
    </div>
  )
}

type Message = {
  sender: string;
  text: string;
}

function ChatContainer({ currentUser }: { currentUser: string }){
  const chatTextInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [text, setText] = useState("")
  const [textHistory, setTextHistory] = useState<Message[]>([])

  useEffect(() => {
    const escutarSocket = (data: any) => {
        if (data.tipo === "CHAT") {
            setTextHistory(prev => [...prev, { sender: data.userName, text: data.text }]);
        }
    };
    iniciarConexao(escutarSocket);
    return () => {
      encerrarConexao(escutarSocket);
    };

  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [textHistory])

  const handleTextChange = (event: any) => {
    setText(event.target.value)
  }

  const handleTextSubmit = () => {
    chatTextInputRef.current?.focus()
  }

  return (
      <div className="text-container">
        <div className="text-history-container">
            <div className="text-history-text">
              {textHistory.map((msg, index) => (
                <p key={index}><strong>[{msg.sender}]:</strong> {msg.text}</p>
              ))}
              <div ref={messagesEndRef} />
            </div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault()
          handleTextSubmit()
          if(text.trim() === "") return
          chatCon("CHAT", text, currentUser !== "" ? currentUser : "Anônimo")
          setText("")
        }} className="text-input-container">
            <input type="text" ref={chatTextInputRef} name="chat-text-input" id="chatTextInput" className="text-input" value={text} onChange={handleTextChange}/>
            <button type="submit" id="chatTextSubmit" className="text-input-button" onClick={handleTextSubmit}>Enviar</button>
        </form>
      </div> 
  )
}

function App() {
  const [userName, setUserName] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption | null>(null)
  const [isInArena, setIsInArena] = useState(false)

  const handleJoinSession = () => {
    if (userName.trim() !== "") {
      setIsJoined(true)
    }
  }

  const canEnterArena = selectedCharacter !== null;

  const handleEnterArena = () => {
    if (canEnterArena) {
      setIsInArena(true)
      actionCon("BATTLE_LOG", "entrou na arena", selectedCharacter.nome)
    }
  }

  const currentEntityName = selectedCharacter ? selectedCharacter.nome : (userName !== "" ? userName : "Anônimo");

  return (
    <div className="main-container">
      
      <div className="creation-container" style={{ alignItems: 'flex-start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '500px', gap: '20px' }}>
            <UserSetContainer 
              userName={userName} 
              setUserName={setUserName} 
              onJoin={handleJoinSession}
              isJoined={isJoined}
            />
            
            <CharacterSelectionContainer 
              onSelect={(char) => {
                setSelectedCharacter(char);
                setIsInArena(false);
              }} 
              selectedCharName={selectedCharacter?.nome} 
            />

            {/* BOTÃO DE ENTRAR NA ARENA REFORMULADO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button 
                    className="user-creation-button"
                    onClick={handleEnterArena}
                    disabled={!canEnterArena}
                    style={{ 
                        width: '100%', 
                        marginLeft: '0',
                        height: '50px', 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: isInArena ? '#28a745' : 'transparent',
                        color: isInArena ? 'white' : 'white',
                        borderColor: isInArena ? '#28a745' : 'white',
                        opacity: !canEnterArena ? 0.5 : 1,
                        cursor: !canEnterArena ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isInArena ? "✓ NA ARENA" : "ENTRAR NA ARENA"}
                </button>
                
                {!canEnterArena && (
                    <span style={{ color: '#ff4d4d', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>
                        {!selectedCharacter ? "Selecione um personagem!" : ""}
                    </span>
                )}
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '500px' }}>
            <CharacterCreationContainer/>
        </div>

      </div>

    <div className="system-container">
        
        <ChatContainer currentUser={userName !== "" ? userName : "Anônimo"}/>

        <div style={{ position: 'relative' }}>
            {!isInArena && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '10px',
                    backdropFilter: 'blur(3px)'
                }}>
                    <h2 style={{ color: '#095184', textShadow: '1px 1px 2px white', fontSize: '28px', textAlign: 'center' }}>
                        BLOQUEADO <br/> Entre na Arena
                    </h2>
                </div>
            )}
            
            <RpgContainer currentUser={currentEntityName}/>
        </div>

      </div>

    </div>
  )
}

export default App
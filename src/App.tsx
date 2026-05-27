import { useState, useRef, useEffect } from 'react'
import './App.css'
import { actionCon, characterCreateCon, chatCon, iniciarConexao, encerrarConexao, characterGetCon, characterDeleteCon, subscribeToBattleEnd } from './ApiConnection'

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

function CharacterCreationContainer() {
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
      <div style={{ display: "flex", flexDirection: "row", justifyContent: 'space-between', width: '100%' }}>
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
  selectedCharId?: string;
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

function CharacterSelectionContainer({ onSelect, selectedCharId }: CharacterSelectionProps) {
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
        value={selectedCharId || ""} 
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
         id="refreshCharacterListButton"
      >
        Atualizar Lista do Banco
      </button>
    </div>
  );
}

function CharacterUpdateContainer({onSelect, selectedCharId}: CharacterSelectionProps) {
  return (
    <div className="character-update-container">
      <button 
         type="button"
         className="user-creation-button character-delete-button"
          onClick={() => {
            if (selectedCharId) {
              characterDeleteCon(parseInt(selectedCharId))
                .then(() => {
                  onSelect({ id: 0, nome: "", vida: "", forca: "", velocidade: "" });
                  document.getElementById("refreshCharacterListButton")?.click();
                })
            }
          }}
        >
        Excluir Personagem
      </button>
    </div>
  )
}

function RpgContainer({currentUser, id}: {currentUser: string, id: number}) {
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
        {ActionButton({ text: "Atacar", onClick: () => actionCon(id, "BATTLE_ACTION", "atacar", currentUser) })}
        {ActionButton({ text: "Defender", onClick: () => actionCon(id, "BATTLE_ACTION", "defender", currentUser) })}
        {ActionButton({ text: "Poder", onClick: () => actionCon(id, "BATTLE_ACTION", "poder", currentUser) })}
        {ActionButton({ text: "Fugir", onClick: () => actionCon(id, "BATTLE_ACTION", "fugir", currentUser) })}
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

useEffect(() => {
    subscribeToBattleEnd(() => {
      console.log("A batalha terminou! Liberando o botão de entrar na arena...");
      setIsInArena(false);
    });
  }, []);

  const handleJoinSession = () => {
    if (userName.trim() !== "") {
      setIsJoined(true)
    }
  }

  const canEnterArena = selectedCharacter !== null;

  const handleEnterArena = () => {
    if (canEnterArena) {
      setIsInArena(true)
      actionCon(selectedCharacter.id, "BATTLE_JOIN", "entrou na arena", selectedCharacter.nome)
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
              selectedCharId={selectedCharacter?.id.toString()}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <button 
                    className="user-creation-button user-selection-button"
                    onClick={handleEnterArena}
                    disabled={!canEnterArena}
                    style={{ 
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
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '500px', gap: '20px', justifyContent: 'space-between' }}>
            <CharacterCreationContainer/>
            <div style={{ position: 'relative'}}>
                {(!selectedCharacter || isInArena) && (
                    <div className="lock-overlay" style={{top: '20px'}}>
                        <h2 style={{ color: '#095184', textShadow: '1px 1px 2px white', fontSize: '28px', textAlign: 'center' }}>
                            {isInArena ? "PERSONAGEM NA ARENA" : ""}
                            {!selectedCharacter ? "SELECIONE UM PERSONAGEM" : ""}
                        </h2>
                    </div>
                )}
                
            <CharacterUpdateContainer
              onSelect={(char) => {
                setSelectedCharacter(null);
              }} 
              selectedCharId={selectedCharacter?.id.toString()}
            />
            </div>
        </div>

      </div>

    <div className="system-container">
        
        <ChatContainer currentUser={userName !== "" ? userName : "Anônimo"}/>

        <div style={{ position: 'relative'}}>
            {!isInArena && (
                <div className="lock-overlay" style={{top: '700px', borderRadius: '0 0 10px 10px'}}>
                    <h2 style={{ color: '#095184', textShadow: '1px 1px 2px white', fontSize: '20px', textAlign: 'center' }}>
                        BLOQUEADO <br/> Entre na Arena
                    </h2>
                </div>
            )}
            
          <RpgContainer currentUser={currentEntityName} id={selectedCharacter?.id == undefined ? 0 : selectedCharacter.id}/>
        </div>

      </div>

    </div>
  )
}

export default App
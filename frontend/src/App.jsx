import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TransformedItems } from './dropdown';
import { io } from 'socket.io-client';
import backgroundImage from './assets/bgimg.jpg';
import send_svg from './assets/send.svg';

const socket = io('http://127.0.0.1:5000');

function App() {
  const [text, setText] = useState('');
  const [initialData, setInitialData] = useState(true);
  const [chatMessage, setChatMessage] = useState([
    {
      message: "Hey there! I'm your adventure companion. Please provide your full name, email, and mobile number to get started.",
      self: false,
    },
  ]);
  const chatContainerRef = useRef(null);

  const dropdownItems = useMemo(() => TransformedItems(), []);

  const socketEmit = () => {
    let temp = {
      message: text,
      self: true,
    };
    setChatMessage((prev) => [...prev, temp]);
    if (initialData) {
      if (text.includes('@')) {
        socket.emit('initial_message', {
          message: text,
        });
        setInitialData(false);
        let thank = {
          message: 'Thank You! Please proceed',
          self: false,
        };
        setChatMessage((prev) => [...prev, thank]);
      } else {
        let error = {
          message: 'Invalid input, make sure to include an "@" in the email',
          self: false,
        };
        setChatMessage((prev) => [...prev, error]);
      }
    } else {
      socket.emit('message', {
        message: text,
      });
    }

    setText('');
  };

  useEffect(() => {
    socket.on('recv_message', (data) => {
      let temp = {
        message: data,
        self: false,
      };
      setChatMessage((prev) => [...prev, temp]);
    });

    return () => {
      socket.off('recv_message');
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat container
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessage]);

  return (
    <div className="App flex flex-col w-full h-screen items-center text-white" 
         style={{ 
           backgroundImage: `url(${backgroundImage})`, 
           backgroundPosition: 'center',
           backgroundSize: 'cover',
           backgroundRepeat: 'no-repeat',
           backdropFilter: 'blur(20px)',
           margin: 0,
           padding: 0
         }}
    >
      <header className="flex items-center justify-between w-full h-16 p-4 bg-brown-500 text-white shadow-md">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">TrekMate</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="flex flex-col w-full flex-grow overflow-auto p-4 space-y-4">
        <section id="chatscreen" ref={chatContainerRef} className="flex flex-col w-full h-full overflow-auto">
          {chatMessage.map((item, key) => (
            <div
              key={key}
              className={`max-w-3/4 py-2 px-4 font-poppins text-lg rounded-3xl ${
                item.self ? 'bg-gray-300 text-black ml-auto' : 'bg-gray-300 text-black mr-auto'
              } my-3`}
            >
              {item.message}
            </div>
          ))}
        </section>
      </main>

      <footer className="flex relative w-full h-16 justify-center items-end p-4 bg-brown-500 text-white shadow-md">
        <input
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              socketEmit();
            }
          }}
          placeholder='Enter message'
          className='rounded-full w-3/4 bg-gray-800 py-2 px-4 border-2 border-gray-700 text-white focus:outline-none'
          onChange={(e) => setText(e.target.value)}
          type='text'
          value={text}
        />
        <button
          className='text-xl bg-indigo-500 py-2 px-4 flex justify-center items-center rounded-full font-bebas ml-2 text-white focus:outline-none'
          onClick={socketEmit}
        >
          <img className='w-6' src={send_svg} alt="Send Icon" />
        </button>
      </footer>
    </div>
  );
}

export default App;
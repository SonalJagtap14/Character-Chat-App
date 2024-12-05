import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  X,
  Minus,
  Maximize2,
  Search,
  Send,
  SunMoon,
  Moon,
  Sun,
} from "lucide-react";

const App = () => {
  // State Management
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const messagesEndRef = useRef(null);

  const formatMessage = (text) => {
    return text
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>'
      )
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /```([\s\S]*?)```/g,
        (_, code) =>
          `<pre class="bg-gray-800 p-2 rounded"><code>${code.trim()}</code></pre>`
      )
      .replace(
        /`([^`]+)`/g,
        "<code class='bg-gray-700 px-1 rounded'>$1</code>"
      );
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const characters = [
    {
      id: 1,
      name: "Sherlock Holmes",
      background: `Sherlock Holmes, the legendary detective from 221B Baker Street, London, is a master of deduction and logical reasoning. His brilliance lies in his ability to notice minute details and solve the most perplexing mysteries. He is often accompanied by his loyal friend Dr. John Watson, who documents their adventures.`,
      personality: `Sherlock speaks in a sharp, precise, and often condescending British tone, frequently accompanied by dry wit and intellectual arrogance. His sentences are verbose, reflecting his complex thought processes, and he often interrupts others to provide corrections or insights. Example responses:
      - "Really, Watson? I thought even a child could deduce that the mud on his boots came from Hampstead Heath."
      - "Do try to keep up; my brain operates at a pace you might find... challenging."
      - "You see, the world is full of obvious things which nobody by any chance ever observes."`,
      traits: {
        wit: "Dry humor",
        tone: "Verbose, analytical",
        quirks: ["Interrupts others", "Obsessed with minute details"],
      },
    },
    {
      id: 2,
      name: "Tony Stark (Iron Man)",
      background: `Tony Stark, a genius billionaire, playboy, and philanthropist, became Iron Man after inventing a powered suit to save his own life. He uses his intelligence and resources to protect the world from threats while balancing his egotistical personality and genuine heroism.`,
      personality: `Tony is sharp-witted, sarcastic, and supremely confident. He speaks with a rapid, quippy style, often blending humor with profound insights. His speech often reflects his arrogance, but also his vulnerabilities and growth as a person. Example responses:
      - "Genius, billionaire, playboy, philanthropist. What more could you want?"
      - "Don’t let someone who’s done nothing tell you how to do anything."
      - "Part of the journey is the end. But hey, why dwell? Let’s fix the problem instead of whining about it."
      - "If you’re nothing without the suit, you shouldn’t have it. Trust me, I’ve been there."
      - "My bond is with the people. I will serve this great nation at the pleasure of myself—after all, no one pleasures me better."`,
      traits: {
        humor: "Quippy with a mix of self-deprecation",
        vulnerability: "Occasional introspection",
        quirks: ["Breaks tension with humor", "Overuses tech analogies"],
      },
    },
    {
      id: 3,
      name: "Captain America",
      background: `Steve Rogers, better known as Captain America, is a man out of time. Born in Brooklyn during the Great Depression, he was transformed into a super-soldier to fight in World War II. As a leader of the Avengers, he represents integrity, resilience, and the fight for justice.`,
      personality: `Captain America speaks with unwavering sincerity and humility in a classic American accent. He’s a natural leader and often delivers motivational speeches, emphasizing values like bravery and teamwork. He occasionally shows his 'man-out-of-time' confusion, which adds charm. Example responses:
      - "I can do this all day."
      - "The price of freedom is high, but it’s a price I’m willing to pay."
      - "Language! And by the way, Stark, this isn’t about politics—it’s about doing what’s right."`,
      traits: {
        leadership: "Natural leader",
        integrity: "Highly principled",
        quirks: ["Man-out-of-time confusion", "Patriotic speeches"],
      },
    },
    {
      id: 4,
      name: "Thor",
      background: `Thor, the Norse God of Thunder, is the mighty protector of Asgard and wielder of the enchanted hammer, Mjolnir. Born as the son of Odin, Thor’s journey has been one of transformation—from a brash and impulsive prince to a wise and self-aware hero who fights for justice across the Nine Realms.`,
      personality: `Thor speaks with Asgardian grandeur, often in formal and poetic language, reflecting his royal upbringing. His tone can be dramatic and commanding, but his attempts at humor—especially on Earth—can be naive and endearing. Example responses:
      - "You people are so petty… and tiny."
      - "By Odin’s beard! This mortal drink… it’s quite… delightful! Another!"
      - "I am Thor, son of Odin! And I will not let my realm or this Earth fall to darkness."`,
      traits: {
        tone: "Formal, grandiose",
        quirks: ["Naive humor", "Royal dramatics"],
      },
    },
    {
      id: 5,
      name: "Lucifer Morningstar",
      background: `Lucifer Morningstar, the Devil, abandoned his throne in Hell to live in Los Angeles, where he owns a nightclub called Lux. Known for his charm, wit, and knack for unearthing people’s deepest desires, Lucifer often grapples with his identity and complex relationship with humanity.`,
      personality: `Lucifer speaks with a British accent and a devilish charm, often laced with sarcasm, philosophical musings, and seductive undertones. His tone shifts between playful and deeply introspective, depending on the conversation. Example responses:
      - "Oh my God—sorry, I mean, oh my Lucifer!"
      - "Careful. Too much tequila, and you might just bring out your inner Devil."
      - "People don’t have power over us. We give it to them. Now, isn’t that delightfully twisted?"`,
      traits: {
        wit: "Philosophical humor",
        quirks: ["Seductive undertones", "Self-aware commentary"],
      },
    },
    {
      id: 6,
      name: "Deadpool",
      background: `Wade Wilson, aka Deadpool, is a wisecracking anti-hero with a healing factor that makes him nearly immortal. Once a special forces operative, he became Deadpool after a rogue experiment left him disfigured but enhanced. He is known for his irreverent humor, chaotic antics, and tendency to break the fourth wall, often poking fun at both his own story and the superhero genre as a whole.`,
      personality: `Deadpool is chaotic, unpredictable, and hilariously self-aware. He talks in rapid-fire quips, blending sarcasm, pop culture references, and outright absurdity. His penchant for breaking the fourth wall makes him a unique and interactive character, often addressing the audience directly. Example responses:
        - "Hey there! Yeah, you in the front row. Don't worry, I'll be gentle—this time."
        - "You think I’m gonna let a little thing like death stop me? Been there, done that."
        - "Fourth wall? What fourth wall? I broke that ages ago. Now, let’s break something else!"`,
      traits: {
        humor: "Irreverent, self-aware, chaotic",
        quirks: [
          "Breaks the fourth wall",
          "Uses swords as punchlines",
          "Pop culture addict",
        ],
      },
    },
    {
      id: 11,
      name: "Munna Bhai",
      background: `Murli Prasad Sharma, affectionately called Munna Bhai, is a larger-than-life gangster from Mumbai. Despite his tough exterior, Munna is deeply empathetic and often uses his street-smart wisdom to help people in unconventional ways. His belief in spreading joy and love through his iconic 'jadoo ki jhappi' (magical hug) has endeared him to everyone around him.`,
      personality: `Munna speaks in a warm, humorous, and relatable Mumbaiya Hinglish. He uses street slang and heartfelt simplicity to connect with people, often disarming tense situations with humor and charm. Example responses:
        - "Aye mamu, life mein tension ka kya kaam? Tension lene ka nahi, dene ka!"
        - "Bole toh, ek 'jadoo ki jhappi' mein sab tension ka the end, mamu!"
        - "Tension mat le, apun hai na! Ab ek chai leke baith aur dekh kaise zindagi set hoti hai."`,
      traits: {
        tone: "Friendly, humorous, street-smart",
        quirks: [
          "Says 'mamu' often",
          "Solves problems with hugs",
          "Street slang",
        ],
      },
    },
    {
      id: 12,
      name: "Baburao Ganpatrao Apte",
      background: `Baburao Ganpatrao Apte, or Babu Bhaiya, is a lovable and hilariously naive landlord from the cult classic Hera Pheri. Struggling to manage his finances, he gets caught up in absurd schemes, creating chaotic yet humorous situations. His comic timing and unique style of speech make him unforgettable.`,
      personality: `Baburao speaks in Marathi-accented Hinglish with exaggerated emotions and hilarious misunderstandings. His naivety and comic brilliance make every interaction a laugh riot. Example responses:
        - "Arre Shyam, paisa dena ka hai ya lene ka? Main confuse ho gaya!"
        - "Yeh toh ultimate gadbad ho gaya hai, mereko kya maloom tha?!" 
        - "Utha le, mere ko nahi, in dono ko utha le!"`,
      traits: {
        humor: "Unintentional, situational, slapstick",
        quirks: [
          "Confuses basic situations",
          "Overreacts hilariously",
          "Unintended wit",
        ],
      },
    },
    {
      id: 13,
      name: "Lord Krishna",
      background: `The divine figure from the Mahabharata, Krishna is revered for his wisdom, compassion, and strategic brilliance. As the speaker of the Bhagavad Gita, Krishna offers timeless teachings on life's purpose, morality, and spirituality. Known for his charm and divine playfulness, he balances his divine duties with his human connections.`,
      personality: `Krishna's speech is calm, poetic, and deeply philosophical, often layered with metaphors and universal truths. He blends intellect with compassion, guiding others with wisdom. Example responses:
        - "Karma karo, phal ki chinta mat karo. Vastav mein, karm hi mukti ka marg hai."
        - "Yadi tumhare hriday mein dharma ka sthaan hai, to Ishwar tumhara saath hamesha dega."
        - "Jo moh aur bhay ke bandhan ko todo, wahi asli veer hai."`,
      traits: {
        tone: "Philosophical, calm, authoritative",
        quirks: [
          "Speaks in metaphors",
          "Radiates calm wisdom",
          "Balances playfulness with divinity",
        ],
      },
    },
  ];

  // Theme Toggle
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  // Scroll to bottom effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Character filtering
  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Character Selection Handler
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsSidebarOpen(false);
  };

  // Theme Components
  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );

  // Character Card Component
  const CharacterCard = ({ character, isActive, onSelect }) => (
    <div
      className={`
         p-4 rounded-lg cursor-pointer transition-all duration-200 
         ${
           isActive
             ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
             : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
         } 
         border border-transparent hover:border-blue-300 dark:hover:border-blue-700
       `}
      onClick={() => onSelect(character)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
          {getInitials(character.name)}
        </div>
        <div>
          <h3 className="font-semibold text-sm dark:text-white">
            {character.name}
          </h3>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
        {character.background}
      </p>
    </div>
  );

  // Chat Message Component
  const ChatMessage = ({ message, sender, character }) => (
    <div
      className={`flex flex-col max-w-[80%] ${
        sender === "user" ? "self-end" : "self-start"
      }`}
    >
      <div
        className={`
           p-3 rounded-lg shadow-sm 
           ${
             sender === "user"
               ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
               : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
           }
         `}
      >
        <div className="font-semibold text-xs opacity-70">
          {sender === "user" ? "You" : character.name}
        </div>
        <div
          className="message-content"
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />
      </div>
      <span className="text-xs text-gray-500 mt-1 text-right">
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );

  // Window Controls Component
  const WindowControls = () => (
    <div className="flex space-x-2 items-center">
      <button className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition"></button>
      <button className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition"></button>
      <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition"></button>
    </div>
  );

  // Typing Indicator
  const TypingIndicator = () => (
    <div className="flex space-x-1 items-center bg-gray-200 dark:bg-gray-700 p-2 rounded-lg self-start">
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: `${dot * 0.2}s` }}
        />
      ))}
    </div>
  );

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter) return;

    const userMessage = {
      sender: "user",
      text: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `
        You are ${
          selectedCharacter.name
        }, a character with the following background and personality traits:
        
        **Background**: 
        ${selectedCharacter.background}
        
        **Personality**: 
        ${selectedCharacter.personality}
        
        **Traits**: 
        - **Tone**: ${selectedCharacter.traits.tone || ""}
        - **Humor**: ${selectedCharacter.traits.humor || ""}
        - **Quirks**: ${selectedCharacter.traits.quirks?.join(", ") || ""}
        
        Your task is to respond to users in a way that fully embodies this character’s unique voice, personality, and mannerisms. Always stay in character, maintaining their signature tone, humor, and quirks. Your responses should reflect their specific traits, ensuring they are authentic and immersive. Use markdown where appropriate to enhance readability.
        
        For example:
        - Be verbose and analytical if the character is intellectual, like Sherlock Holmes.
        - Be humorous and quippy if the character is lighthearted, like Deadpool.
        - Use metaphors and philosophical wisdom if the character is Krishna.
        
        Always adapt your language, tone, and depth to the character's profile. If humor is a key trait, ensure humor is woven into your response. Similarly, use cultural or contextual nuances if applicable (e.g., "Mumbaiya Hinglish" for Munna Bhai or "British elegance" for Sherlock).`,
              },
              ...messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
              })),
              {
                role: "user",
                content: inputMessage,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.choices[0].message.content,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I apologize, but I'm having trouble responding right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`
        flex h-screen overflow-hidden 
        bg-gray-50 dark:bg-gray-900 
        text-gray-900 dark:text-white
        transition-colors duration-300
      `}
    >
      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full w-80 
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <WindowControls />
          <ThemeToggle />
        </div>

        {/* Search Area */}
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2 rounded-lg 
                bg-gray-100 dark:bg-gray-700 
                border border-gray-200 dark:border-gray-600
                focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
        </div>

        {/* Character List */}
        <div className="overflow-y-auto p-2 space-y-2">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isActive={selectedCharacter?.id === character.id}
              onSelect={handleCharacterSelect}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div
          className="
            p-4 border-b border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800 
            flex items-center relative
          "
        >
          {/* Mobile Back Button */}
          {selectedCharacter && (
            <button
              onClick={() => setSelectedCharacter(null)}
              className="md:hidden mr-4"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Chat Title */}
          <h2 className="text-xl font-bold flex-1 text-center">
            {selectedCharacter
              ? `Chat with ${selectedCharacter.name}`
              : "Select a character to start chatting"}
          </h2>

          {/* Theme Toggle for Desktop */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="
            flex-1 overflow-y-auto p-4 space-y-4 
            bg-white dark:bg-gray-900
          "
        >
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.text}
              sender={msg.sender}
              character={selectedCharacter}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div
          className="
            p-4 border-t border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800
          "
        >
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!selectedCharacter}
              className="
                flex-1 
                bg-gray-100 dark:bg-gray-700 
                border border-gray-200 dark:border-gray-600
                rounded-lg p-2 min-h-[80px] resize-none 
                focus:ring-2 focus:ring-blue-500
              "
            />
            <button
              onClick={sendMessage}
              disabled={!selectedCharacter || !inputMessage.trim()}
              className="
                bg-blue-500 text-white 
                p-2 rounded-lg 
                hover:bg-blue-600 
                disabled:opacity-50 
                transition flex items-center justify-center
              "
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="
            fixed inset-0 bg-black bg-opacity-50 z-30 
            md:hidden
          "
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Hamburger Menu */}
      {!selectedCharacter && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="
            md:hidden absolute top-4 left-4 z-50 
            bg-white dark:bg-gray-800 
            p-2 rounded-lg shadow-md
          "
        >
          {isSidebarOpen ? <X size={24} /> : <Search size={24} />}
        </button>
      )}
    </div>
  );
};

export default App;

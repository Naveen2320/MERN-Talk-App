import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from "axios";
import './style.css';
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile ,BsSend } from 'react-icons/bs'; // For the emoji icon button


//const ENDPOINT = "http://localhost:9000";
const ENDPOINT = "https://mern-talk-app-7.onrender.com";


var socket, selectedChatcompare;

function SingleChat({ fetchAgain, setFetchAgain }) {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        renderSettings: {
            PreserveAspectRatio :  "xMidYMid slice",
        },
    }

    const { selectedChat, setSelectedChat, user ,notification, setNotification} = ChatState();
    const toast = useToast();

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true);
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            console.log(messages);

            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);

        } catch (error) {
            toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
            });
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
        
    }, []);


    useEffect(() => {
        fetchMessages();

        selectedChatcompare = selectedChat;
    }, [selectedChat]);

   // console.log(notification, "-----------");


    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (!selectedChatcompare || selectedChatcompare._id !== newMessageRecieved.chat._id) {
                // give notification
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain); // fetch all the chats again
                }

            }
            else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    })

    // const sendMessage = async(event) => {
    //     if (event.key === "Enter" && newMessage) {
    //         socket.emit("stop typing", selectedChat._id);
    //         try {
    //             const config = {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${user.token}`,
    //                 },
    //             };
    //             setNewMessage("");
    //             const { data } = await axios.post("/api/message", {
    //                 content: newMessage,
    //                 chatId: selectedChat._id,
    //             }, config
    //             );

    //             //console.log(data);

    //             socket.emit("new message", data);
    //             setMessages([...messages, data]);
    //     }
    //         catch (error) {
    //         toast({
    //       title: "Error Occured!",
    //       description: "Failed to send the Message",
    //       status: "error",
    //       duration: 5000,
    //       isClosable: true,
    //       position: "bottom",
    //     });
    //         }
    //     }
    // };
    const sendMessage = async () => {
    if (newMessage.trim()) { // Check if the message is not empty or just whitespace
        socket.emit("stop typing", selectedChat._id);
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setNewMessage("");
            const { data } = await axios.post("/api/message", {
                content: newMessage,
                chatId: selectedChat._id,
            }, config);

            socket.emit("new message", data);
            setMessages([...messages, data]);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to send the Message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }
    };
    
    // Call sendMessage on key press
    const handleKeyDown = (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // Prevents the default behavior of the Enter key
        sendMessage();
    }
};


    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        // typing indicator logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
    };

    // const onEmojiClick = (event, emojiObject) => {
    // setNewMessage(prevInput => prevInput + emojiObject.emoji);
    // };

      const onEmojiClick = (event, emojiObject) => {
        console.log("Emoji Object:", emojiObject);
        if (emojiObject && emojiObject.emoji) {
            setNewMessage(prevInput => {
                console.log("Previous Input:", prevInput);
                console.log("New Input:", prevInput + emojiObject.emoji);
                return prevInput + emojiObject.emoji;
            });
        } else {
            console.error("Emoji object is undefined or missing 'emoji' property");
        }
};

    return (
        <>
            {selectedChat ? (
            <>
            <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            >
            <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={()=>setSelectedChat("")}
            />
                  {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
                    </Text>
                    <Box
                       display="flex"
                       flexDir="column"
                       justifyContent="flex-end"
                       p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="91%"
                        overflowY="hidden"
                        
                        borderRadius="lg"
                        >
                        {loading ? (
                            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto"/>
                        ) : (<div className='messages'>
                                <ScrollableChat messages={messages} />
                             
                            </div>
                                
                        )} 
                         {/* onKeyDown={sendMessage} */}
                        <FormControl isRequired mt={3}>
                            {isTyping ? <div>
                                <Lottie
                                options = {defaultOptions}
                                width={70} style={{ marginBottom: 15, marginLeft: 0 }} />
                                
                            </div> : <></>}
                               <Box display="flex" alignItems="center">
                                <IconButton
                                    icon={<BsEmojiSmile />}
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    variant="ghost"
                                    size="lg"
                                    aria-label="Show emoji picker"
                                    mr={2}
                                />
                                {showEmojiPicker && (
                                    <Box position="absolute" bottom="60px" zIndex="1000">
                                        <EmojiPicker onEmojiClick={onEmojiClick} />
                                    </Box>
                                )}
                                <Input placeholder="Enter a message.."
                                variant="filled" bg="#E0E0E0"
                                onChange={typingHandler}
                                    value={newMessage}
                                    flex="1" mr={2}
                                    onKeyDown={handleKeyDown} // Handle Enter key press
                                />
                                 <IconButton
                                    icon={<BsSend />}
                                    onClick={sendMessage}
                                    variant="solid"
                                    colorScheme="blue"
                                    aria-label="Send message"
                                />
                                
                            </Box>
                            
                        </FormControl>


                    </Box>

                      
                </>) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" pb={3} color ="green" fontFamily={"work sans"}>
                            Click on a Friend to start Chatting
                        </Text>
                    </Box> 

        //               <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        //     {/* Display only on small screens */}
        //     <Box display={["block", "block", "none"]}>
        //         <Text fontSize="3xl" pb={3} fontFamily={"work sans"}>
        //             Click on a Friend to start Chatting
        //         </Text>
        //     </Box>

        //     {/* Display on medium and larger screens */}
        //     <Box display={["none", "none", "block"]}>
        //         <Text fontSize="3xl" pb={3} fontFamily={"work sans"}>
        //             Click on a Friend to start Chatting
        //         </Text>
        //         {/* Render the Chats */}
        //         {/* Example: <Chats /> */}
        //     </Box>
        // </Box>

                    
                
            )}
        </>
  )
}

export default SingleChat
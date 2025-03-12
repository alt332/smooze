import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import {
  GiftedChat,
  IMessage,
  Bubble,
  Send,
  BubbleProps,
} from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ChatScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Hey there! 😎 I'm 'Smooze', your AI wingman ready to make your day awesome! What dating adventures can I help you with today? Let's make some magic happen! ✨",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "Bot",
      },
    },
  ]);

  const renderBubble = (props: BubbleProps<IMessage>) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#4A90E2",
          marginBottom: 16,
          padding: 8,
          marginRight: 8,
        },
        left: {
          backgroundColor: "#2A2A2A",
          marginBottom: 16,
          padding: 8,
          marginLeft: 8,
        },
      }}
      textStyle={{
        right: {
          color: "#FFFFFF",
        },
        left: {
          color: "#FFFFFF",
        },
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send
      {...props}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        height: 44,
        width: 44,
      }}
    >
      <Ionicons name="send" size={20} color="black" />
    </Send>
  );

  const generateAIResponse = async (newMessage: IMessage[]) => {
    try {
      // First, get a summary of previous conversations
      const conversationHistory = messages
        .map((msg) => {
          const role = msg.user._id === 1 ? "User" : "Bot";
          return `${role}: ${msg.text}`;
        })
        .join("\n");

      const summaryPrompt = `Please provide a brief summary of the following conversation that captures the key points and tone. Keep it concise:

${conversationHistory}`;

      const summaryResponse = await model.generateContent(summaryPrompt);
      const conversationSummary = `Here's the summary of the conversation history: <conversation_summary>${summaryResponse.response.text()}</conversation_summary>`;

      const basePrompt = `You are an AI assistant designed to help users craft flirty and engaging responses for online dating conversations on platforms like Tinder or Snapchat. Your goal is to generate charming and helpful replies based on the conversation history and the latest message.

${conversationSummary}

Here's the new message you need to respond to:

<user_message>
${newMessage[0].text}
</user_message>

Instructions:
1. Analyze the context and tone of the conversation.
2. Generate a response that is:
   - Flirty and charming
   - Short and concise (aim for 2-3 sentences)
   - Engaging and interesting
   - Helpful and informative when appropriate
   - Fun and lightly humorous

3. Adapt your writing style to match typical messaging platform conversations:
   - Use a casual, conversational tone
   - Incorporate occasional short messages or sentence fragments
   - Use common acronyms and abbreviations sparingly (e.g., "lol", "tbh", "rn")
   - Balance between longer and shorter messages to maintain a natural flow

4. Include smooth pickup lines when there's a natural opportunity, but use them sparingly to avoid being cringy.

5. Before crafting your final response, analyze the conversation and plan your approach by wrapping your analysis inside <conversation_analysis> tags. In this section:
   - Quote key phrases from the user's message
   - Identify the emotional tone and any specific interests mentioned
   - Determine the current stage of the conversation (e.g., initial contact, getting to know each other, making plans)
   - Brainstorm 3 potential directions for the response, listing pros and cons for each
   - Choose the best direction and outline key points to include in the response
   - Identify any potential risks or pitfalls to avoid in the response
   - Plan how to incorporate messaging platform style elements

6. Present your final response in <response> tags.

Example output structure:

<conversation_analysis>
[Thorough analysis of the conversation and strategic planning of the response]
</conversation_analysis>

<response>
Hey! 😊 That's so cool you're into [shared interest]. Wanna swap favorite [related topic] sometime? Could be fun!
</response>

Remember to maintain a balance between being flirty and authentic. Your goal is to be a smooth-talking wingman without overdoing it. Now, please proceed with your analysis and response.
      `;

      // Now use the base prompt with the summary
      const { response } = await model.generateContent(basePrompt);

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
          {
            _id: messages.length + 1,
            text:
              response
                .text()
                .match(/<response>(.*?)<\/response>/s)?.[1]
                ?.trim() || response.text(),
            createdAt: new Date(),
            user: { _id: 2, name: "Bot" },
          },
        ]),
      );
    } catch (error) {
      console.error("Error generating AI response:", error);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
          {
            _id: messages.length + 1,
            text: "Sorry, I couldn't process that. Please try again.",
            createdAt: new Date(),
            user: { _id: 2, name: "Bot" },
          },
        ]),
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <GiftedChat
        messages={messages}
        onSend={(messages) => {
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, messages),
          );
          generateAIResponse(messages);
        }}
        user={{
          _id: 1,
          name: "User",
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderAvatar={null}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        alwaysShowSend
        infiniteScroll
        timeTextStyle={{
          right: { color: "#FFFFFF" },
          left: { color: "#7F7F7F" },
        }}
        textInputProps={{
          className: "px-4 text-gray-900",
        }}
        renderUsernameOnMessage
        messagesContainerStyle={{
          backgroundColor: "#121212",
          marginBottom: 16,
        }}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;

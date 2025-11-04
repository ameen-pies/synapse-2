import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const conversations = [
  {
    id: 1,
    name: "Marie Dubois",
    role: "Instructeur Python",
    avatar: "",
    lastMessage: "Merci pour votre question! Voici la réponse...",
    time: "10:30",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Thomas Bernard",
    role: "Instructeur ML",
    avatar: "",
    lastMessage: "Le prochain cours commence demain",
    time: "Hier",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Sophie Martin",
    role: "Instructeur Business",
    avatar: "",
    lastMessage: "Excellent travail sur le dernier projet!",
    time: "Mar 15",
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: "Jean Dupont",
    role: "Instructeur Maths",
    avatar: "",
    lastMessage: "Les exercices sont disponibles maintenant",
    time: "Mar 14",
    unread: 0,
    online: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "Marie Dubois",
    content: "Bonjour! Comment puis-je vous aider avec Python?",
    time: "10:15",
    isOwn: false,
  },
  {
    id: 2,
    sender: "Vous",
    content: "J'ai une question sur les fonctions lambda",
    time: "10:20",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Marie Dubois",
    content: "Merci pour votre question! Les fonctions lambda sont des fonctions anonymes courtes. Elles sont idéales pour des opérations simples.",
    time: "10:30",
    isOwn: false,
  },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // TODO: Implement message sending
      setMessageInput("");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 p-4 border-border">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des conversations..."
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedChat(conv)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat.id === conv.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conv.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {conv.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">{conv.role}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conv.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unread > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col border-border">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedChat.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedChat.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedChat.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Video className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end gap-2">
                <Button size="icon" variant="ghost" className="shrink-0">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Tapez votre message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

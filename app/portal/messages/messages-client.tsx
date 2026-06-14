"use client"

import { useState, useRef, useEffect } from "react"
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns"
import {
  MessageSquare,
  Send,
  User,
  Users,
  CheckCheck,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreatorConversation, CreatorMessage } from "@/lib/types/database"

interface MessagesClientProps {
  conversations: CreatorConversation[]
  messages: CreatorMessage[]
  clientId: string
  isDemo?: boolean
}

export function MessagesClient({ conversations, messages, clientId, isDemo }: MessagesClientProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversations[0]?.id || null
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedMessages = messages.filter(m => m.conversation_id === selectedConversation)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation, selectedMessages.length])

  const formatMessageTime = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) {
      return format(d, 'h:mm a')
    }
    if (isYesterday(d)) {
      return `Yesterday ${format(d, 'h:mm a')}`
    }
    return format(d, 'MMM d, h:mm a')
  }

  const formatConversationTime = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date)
    if (isToday(d)) {
      return format(d, 'h:mm a')
    }
    if (isYesterday(d)) {
      return 'Yesterday'
    }
    return format(d, 'MMM d')
  }

  return (
    <div className="h-[calc(100vh-6rem)] pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-purple">Messages</span>
        </h1>
        <p className="text-muted-foreground">
          Communicate with your management team.
        </p>
      </div>

      <div className="glass-card h-[calc(100%-5rem)] flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className={cn(
          "w-full md:w-80 border-r border-border/30 flex flex-col",
          selectedConversation && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-border/30">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-purple" />
              Conversations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-vespera">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-purple/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {conversations.map((conv) => {
                  const convMessages = messages.filter(m => m.conversation_id === conv.id)
                  const lastMessage = convMessages[convMessages.length - 1]
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        "w-full p-4 text-left transition-colors",
                        selectedConversation === conv.id
                          ? "bg-purple/10"
                          : "hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple to-purple-dark flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">Team Chat</p>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatConversationTime(conv.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {conv.last_message || 'No messages yet'}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-purple text-[10px] font-bold text-white mt-1">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/30 flex items-center gap-3">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-muted/30 rounded-lg"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-purple-dark flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Chat</h3>
                  <p className="text-xs text-muted-foreground">Your management team</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-vespera">
                {selectedMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <MessageSquare className="h-16 w-16 text-purple/20 mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Start a conversation with your team
                    </p>
                  </div>
                ) : (
                  selectedMessages.map((msg, idx) => {
                    const isOutbound = msg.direction === 'outbound'
                    const showTimestamp = idx === 0 || 
                      new Date(msg.created_at).getTime() - 
                      new Date(selectedMessages[idx - 1].created_at).getTime() > 300000

                    return (
                      <div key={msg.id}>
                        {showTimestamp && (
                          <div className="flex justify-center mb-4">
                            <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                              {formatMessageTime(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={cn(
                          "flex gap-3",
                          isOutbound ? "justify-end" : "justify-start"
                        )}>
                          {!isOutbound && (
                            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                              <User className="h-3 w-3 text-black" />
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2.5",
                            isOutbound 
                              ? "bg-purple text-white rounded-br-sm" 
                              : "bg-muted/50 rounded-bl-sm"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              isOutbound ? "justify-end" : "justify-start"
                            )}>
                              <span className={cn(
                                "text-[10px]",
                                isOutbound ? "text-white/60" : "text-muted-foreground"
                              )}>
                                {format(new Date(msg.created_at), 'h:mm a')}
                              </span>
                              {isOutbound && msg.read_at && (
                                <CheckCheck className="h-3 w-3 text-white/60" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message... (coming soon)"
                    disabled
                    className="flex-1 input-vespera disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button 
                    disabled
                    className="btn-purple px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Message sending will be enabled soon. View your conversation history above.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-20 w-20 text-purple/20 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the sidebar to view messages from your team.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

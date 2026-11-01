import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Send,
  Check,
  CheckCheck,
  MapPin,
  Flame,
  ShoppingCart,
  UtensilsCrossed,
  Info,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, FamilyMember } from '../types/family';
import { getReceiptSummary } from '../utils/familyLogic';
import { Avatar } from './Avatar';

export const FamilyChatView: React.FC = () => {
  const {
    chatMessages,
    sendMessage,
    currentUser,
    members,
    cylinders,
    groceries,
  } = useFamily();

  const [inputText, setInputText] = useState('');
  const [selectedMessageForInfo, setSelectedMessageForInfo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMembers = members.filter((m) => m.status === 'approved');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;
    sendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  // Quick Chat Actions
  const handleShareLocation = () => {
    if (!currentUser) return;
    sendMessage(
      `📍 My Location: I am currently at ${currentUser.location.landmark} (${currentUser.location.address}). Battery is at ${currentUser.location.batteryLevel}%.`,
      'location_share',
      {
        locationData: {
          lat: currentUser.location.lat,
          lng: currentUser.location.lng,
          landmark: currentUser.location.landmark,
        },
      }
    );
  };

  const handleShareGasAlert = () => {
    const primary = cylinders[0];
    if (!primary) return;
    sendMessage(
      `🔥 Gas Cylinder Check: ${primary.name} is currently at ${primary.currentLevelPercentage}%. Status: ${primary.status.toUpperCase()}.`,
      'gas_alert',
      { gasLevel: primary.currentLevelPercentage }
    );
  };

  const handleShareGroceryNeed = () => {
    const unbought = groceries.filter((i) => !i.isBought).slice(0, 3);
    const text =
      unbought.length > 0
        ? `🛒 Quick Reminder: We need ${unbought.map((i) => i.name).join(', ')} from the store!`
        : '🛒 Grocery list is all clear!';
    sendMessage(text, 'grocery_alert');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
            💬
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Family Group Chat
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Live & Transparent
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Visible to all family members • Click double ticks to inspect who read each message
            </p>
          </div>
        </div>

        {/* Member heads in group */}
        <div className="flex -space-x-1.5 overflow-hidden">
          {activeMembers.map((m) => (
            <Avatar
              key={m.id}
              avatar={m.avatar}
              name={m.name}
              size="sm"
              className="ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xs"
            />
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[460px] max-h-[600px] flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 pb-4">
          {/* Transparency security reminder */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 text-center text-[11px] text-slate-500">
            🔒 All family communication is transparent. Read receipts show exact member timestamps.
          </div>

          {chatMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const isSystem = msg.type === 'system';
            const receiptSummary = getReceiptSummary(msg, members, currentUser?.id || '');

            const allRead =
              receiptSummary.totalRecipients > 0 &&
              receiptSummary.readCount >= receiptSummary.totalRecipients;

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <Avatar
                    avatar={msg.senderAvatar}
                    name={msg.senderName}
                    size="sm"
                    className="mb-1 bg-slate-100 dark:bg-slate-800 shadow-2xs"
                  />
                )}

                <div
                  className={`max-w-[82%] sm:max-w-md rounded-2xl p-3.5 shadow-2xs transition-all relative group ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : msg.type === 'gas_alert'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-100 border border-red-200 dark:border-red-900 rounded-bl-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Sender Name if not me */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="text-xs font-bold truncate"
                        style={{ color: msg.senderColor || '#3B82F6' }}
                      >
                        {msg.senderName}
                      </span>
                      {msg.type === 'gas_alert' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200">
                          GAS ALERT
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message body */}
                  <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Footer: timestamp + receipts */}
                  <div
                    className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                      isMe ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Interactive Read Receipt Button */}
                    <button
                      onClick={() => setSelectedMessageForInfo(msg)}
                      title={`Click for read receipts info (${receiptSummary.readCount}/${receiptSummary.totalRecipients} read)`}
                      className="inline-flex items-center gap-0.5 hover:underline cursor-pointer p-0.5 rounded"
                    >
                      {allRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                      ) : receiptSummary.isDeliveredToAll ? (
                        <CheckCheck className="w-3.5 h-3.5 opacity-80" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-80" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Shortcuts Bar */}
        <div className="pt-2 border-t border-slate-150 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={handleShareLocation}
            className="shrink-0 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Share My Location</span>
          </button>
          <button
            onClick={handleShareGasAlert}
            className="shrink-0 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Gas Status Alert</span>
          </button>
          <button
            onClick={handleShareGroceryNeed}
            className="shrink-0 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grocery Reminder</span>
          </button>
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder={`Message family as ${currentUser?.name || 'you'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold shadow-md shadow-blue-500/25 flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Transparent Message Info Popover / Modal (Delivered & Read Status) */}
      {selectedMessageForInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">
                  Message Transparency & Receipts
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessageForInfo(null)}
                aria-label="Close message transparency dialog"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message snippet preview */}
            <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-300 line-clamp-2">
              "{selectedMessageForInfo.text}"
            </div>

            {/* Read by list */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-sky-500" />
                    <span>Read By ({selectedMessageForInfo.readBy.length})</span>
                  </div>
                </div>

                {selectedMessageForInfo.readBy.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    Not read by any family members yet
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedMessageForInfo.readBy.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-xs border border-emerald-100 dark:border-emerald-900/40"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {r.memberName}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                          Read at {r.readAt}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivered status */}
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-slate-400" />
                    <span>Delivered To</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    All {selectedMessageForInfo.deliveredTo.length} mobile devices
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMessageForInfo(null)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

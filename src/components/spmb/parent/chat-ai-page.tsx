'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, MoreVertical, Badge, Shield, HelpCircle, School, SkipForward, Database, Globe, Blend } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { AiAvatar } from '@/components/spmb/shared/ai-avatar';
import { QuickMenuGrid } from '@/components/spmb/shared/quick-menu-grid';
import type { ChatMessage, ChatActionButton, ChatStatusIndicator } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  menganalisa: 'AI sedang menganalisa pertanyaan...',
  mengecek_data: 'AI sedang mengecek data aplikasi...',
  mencari_referensi: 'AI sedang mencari referensi tambahan...',
  menyusun_jawaban: 'AI sedang menyusun jawaban...',
};

const SOURCE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  data_aplikasi: { label: 'Data Aplikasi', icon: Database, color: '#43A047' },
  google_search: { label: 'Google Search', icon: Globe, color: '#1565C0' },
  gabungan: { label: 'Gabungan', icon: Blend, color: '#F59E0B' },
};

// Typing speed in ms per character
const TYPING_SPEED: Record<string, number> = {
  lambat: 35,
  normal: 18,
  cepat: 8,
};

// Split text into bubbles of 3-5 sentences
function splitIntoBubbles(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const bubbles: string[] = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    current += sentences[i];
    if ((i + 1) % 4 === 0 || i === sentences.length - 1) {
      bubbles.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) bubbles.push(current.trim());
  return bubbles.length > 0 ? bubbles : [text];
}

export function ChatAiPage() {
  const {
    chatMessages,
    addChatMessage,
    updateChatMessage,
    clearChat,
    navigateTo,
    settings,
    schools,
    chatAISettings,
    chatStatusIndicator,
    setChatStatusIndicator,
    chatSkipAnimation,
    setChatSkipAnimation,
  } = useSpmbStore();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  // Track typing animation per message
  const [typingMessageIds, setTypingMessageIds] = useState<Set<string>>(new Set());
  // Track displayed content per message
  const [displayedContent, setDisplayedContent] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typingIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, displayedContent, chatStatusIndicator]);

  // Cleanup typing intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(typingIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // Close access menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAccessMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load chat settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/chat-settings');
        if (res.ok) {
          const data = await res.json();
          useSpmbStore.getState().setChatAISettings(data);
        }
      } catch {}
    };
    loadSettings();
  }, []);

  const startTypingAnimation = useCallback((messageId: string, fullContent: string, speed: string) => {
    if (chatSkipAnimation || !chatAISettings.aktifkanSlowTyping) {
      // Skip animation - show full content immediately
      setDisplayedContent(prev => ({ ...prev, [messageId]: fullContent }));
      setTypingMessageIds(prev => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
      return;
    }

    const speedMs = TYPING_SPEED[speed] || TYPING_SPEED.normal;
    setTypingMessageIds(prev => new Set(prev).add(messageId));
    setDisplayedContent(prev => ({ ...prev, [messageId]: '' }));

    let charIndex = 0;
    typingIntervalsRef.current[messageId] = setInterval(() => {
      charIndex += 2; // Add 2 characters at a time for more natural feel
      if (charIndex >= fullContent.length) {
        clearInterval(typingIntervalsRef.current[messageId]);
        delete typingIntervalsRef.current[messageId];
        setDisplayedContent(prev => ({ ...prev, [messageId]: fullContent }));
        setTypingMessageIds(prev => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      } else {
        setDisplayedContent(prev => ({ ...prev, [messageId]: fullContent.substring(0, charIndex) }));
      }
    }, speedMs);
  }, [chatSkipAnimation, chatAISettings.aktifkanSlowTyping]);

  const skipTypingAnimation = useCallback((messageId: string, fullContent: string) => {
    if (typingIntervalsRef.current[messageId]) {
      clearInterval(typingIntervalsRef.current[messageId]);
      delete typingIntervalsRef.current[messageId];
    }
    setDisplayedContent(prev => ({ ...prev, [messageId]: fullContent }));
    setTypingMessageIds(prev => {
      const next = new Set(prev);
      next.delete(messageId);
      return next;
    });
  }, []);

  const buildContext = () => {
    return `
Tahun Ajaran: ${settings.tahunAjaran}
Tanggal Acuan Usia: ${settings.tanggalAcuanUsia}
Usia Minimal SD: ${settings.usiaMinimalSD} tahun
Usia Prioritas SD: ${settings.usiaPrioritasSD} tahun
Status Pendaftaran: ${settings.statusPendaftaran}
Kuota Domisili: ${settings.kuotaDomisili}%
Kuota Afirmasi: ${settings.kuotaAfirmasi}%
Kuota Mutasi: ${settings.kuotaMutasi}%
Jadwal Pendaftaran: 15 Januari - 31 Januari 2026
Jadwal Verifikasi: 1 Februari - 15 Februari 2026
Jadwal Pengumuman: 1 Maret 2026
Jadwal Daftar Ulang: 2 Maret - 15 Maret 2026
Daftar Sekolah: ${schools.map((s) => `${s.namaSekolah} (Kuota: ${s.kuota}, Sisa: ${s.sisaKuota})`).join(', ')}
    `.trim();
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    // Start status indicator flow
    setChatStatusIndicator('menganalisa');

    // Simulate analysis steps
    setTimeout(() => {
      setChatStatusIndicator('mengecek_data');
    }, 800);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          context: buildContext(),
        }),
      });

      setChatStatusIndicator('menyusun_jawaban');

      const data = await response.json();

      // Create AI message with full metadata
      const aiMessageId = `msg-${Date.now()}-ai`;
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        role: 'ai',
        content: data.reply || 'Maaf, saya tidak dapat memproses pesan Anda. Silakan coba lagi.',
        timestamp: new Date().toISOString(),
        typingMode: data.typingMode || 'slow',
        typingSpeed: data.typingSpeed || 'normal',
        sourceType: data.sumberJawaban || 'data_aplikasi',
        model: data.model || 'gemini-2.0-flash',
        actionButtons: data.actionButtons || [],
        isTyping: data.typingMode === 'slow' && chatAISettings.aktifkanSlowTyping,
        displayedContent: '',
      };

      addChatMessage(aiMessage);
      setChatStatusIndicator(null);

      // Start slow typing animation if enabled
      if (data.typingMode === 'slow' && chatAISettings.aktifkanSlowTyping) {
        startTypingAnimation(aiMessageId, aiMessage.content, data.typingSpeed || 'normal');
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        content: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi atau gunakan menu cepat untuk mengakses layanan SPMB.',
        timestamp: new Date().toISOString(),
        typingMode: 'instant',
        typingSpeed: 'normal',
        sourceType: 'data_aplikasi',
      };
      addChatMessage(errorMessage);
      setChatStatusIndicator(null);
    } finally {
      setIsLoading(false);
      setChatSkipAnimation(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickMenuClick = (itemId: string) => {
    const menuMessages: Record<string, string> = {
      'info-pendaftaran': 'Saya ingin mengetahui informasi pendaftaran SPMB',
      'cek-usia': 'Saya ingin mengecek usia anak saya',
      'cek-domisili': 'Saya ingin mengecek domisili dan mencari sekolah terdekat',
      'daftar': 'Saya ingin mendaftarkan anak saya',
      'status-daftar': 'Saya ingin mengecek status pendaftaran',
      'pengumuman': 'Saya ingin melihat pengumuman hasil SPMB',
      'daftar-ulang': 'Saya ingin melakukan daftar ulang',
    };

    const message = menuMessages[itemId] || `Saya ingin informasi tentang ${itemId}`;
    sendMessage(message);
  };

  const handleActionButtonClick = (button: ChatActionButton) => {
    navigateTo(button.page as any);
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentlyTyping = (msgId: string) => typingMessageIds.has(msgId);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-md"
        style={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          borderRadius: '0 0 16px 16px',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center size-8 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <School className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white truncate">SPMB AI</h1>
            <p className="text-[10px] text-white/60">Gemini 2.0 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear chat button */}
          <button
            onClick={() => {
              Object.values(typingIntervalsRef.current).forEach(clearInterval);
              typingIntervalsRef.current = {};
              setTypingMessageIds(new Set());
              setDisplayedContent({});
              clearChat();
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Hapus chat"
            title="Hapus chat"
          >
            <Trash2 className="size-4 text-white" />
          </button>

          {/* Access menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu akses"
              title="Menu akses"
            >
              <MoreVertical className="size-4 text-white" />
            </button>

            {showAccessMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border overflow-hidden"
                style={{ borderColor: '#E5E7EB', zIndex: 100 }}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowAccessMenu(false);
                      navigateTo('petugas-login');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Badge className="size-5" style={{ color: '#1565C0' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Akses Petugas</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>Login untuk petugas SPMB</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowAccessMenu(false);
                      navigateTo('petugas-login');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="size-5" style={{ color: '#0D47A1' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Akses Admin</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>Login Google untuk admin</p>
                    </div>
                  </button>

                  <div className="border-t" style={{ borderColor: '#E5E7EB' }} />

                  <button
                    onClick={() => {
                      setShowAccessMenu(false);
                      navigateTo('bantuan');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="size-5" style={{ color: '#009688' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Bantuan</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>Pusat bantuan & FAQ</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {/* Welcome message when no chat yet */}
        {chatMessages.length === 0 && (
          <div className="flex items-start gap-3">
            <AiAvatar />
            <div
              className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[300px]"
              style={{ border: '1px solid #E5E7EB' }}
            >
              <p className="text-sm" style={{ color: '#1F2937' }}>
                Halo Bapak/Ibu! Saya siap membantu Anda terkait pendaftaran SPMB SD. Silakan pilih menu di bawah atau ketik pertanyaan Anda.
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {chatMessages.map((msg) => {
          if (chatMessages.length > 0 && msg.id === '1') return null;

          const isTyping = isCurrentlyTyping(msg.id);
          const contentToShow = isTyping
            ? (displayedContent[msg.id] || '')
            : (displayedContent[msg.id] !== undefined ? displayedContent[msg.id] : msg.content);

          // Split content into bubbles for AI messages
          const isAiWithSlowTyping = msg.role === 'ai' && msg.typingMode === 'slow' && chatAISettings.aktifkanSlowTyping;
          const bubbles = isAiWithSlowTyping && !isTyping
            ? splitIntoBubbles(contentToShow)
            : [contentToShow];

          return (
            <div key={msg.id}>
              {/* AI messages */}
              {msg.role === 'ai' && (
                <div className="space-y-2">
                  {bubbles.map((bubble, idx) => (
                    <div key={`${msg.id}-bubble-${idx}`} className="flex items-end gap-2">
                      {idx === 0 && (
                        <div className="shrink-0 mb-1">
                          <AiAvatar />
                        </div>
                      )}
                      {idx > 0 && <div className="shrink-0 size-[60px]" />}
                      <div className="max-w-[75%]">
                        <div
                          className="px-4 py-3 shadow-sm text-sm leading-relaxed rounded-2xl rounded-tl-sm"
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#1F2937',
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          {bubble}
                          {isTyping && idx === bubbles.length - 1 && (
                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-gray-400 animate-pulse" style={{ verticalAlign: 'text-bottom' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Source badge */}
                  {msg.sourceType && !isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="shrink-0 size-[60px]" />
                      <div className="max-w-[75%]">
                        {(() => {
                          const sourceInfo = SOURCE_LABELS[msg.sourceType];
                          if (!sourceInfo) return null;
                          const SourceIcon = sourceInfo.icon;
                          return (
                            <div className="flex items-center gap-1.5 mt-1 px-1">
                              <SourceIcon className="size-3" style={{ color: sourceInfo.color }} />
                              <span className="text-[10px] font-medium" style={{ color: sourceInfo.color }}>
                                {sourceInfo.label}
                              </span>
                              {msg.model && (
                                <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
                                  | {msg.model}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Skip animation button */}
                  {isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="shrink-0 size-[60px]" />
                      <div className="max-w-[75%]">
                        <button
                          onClick={() => skipTypingAnimation(msg.id, msg.content)}
                          className="flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:bg-gray-100"
                          style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
                        >
                          <SkipForward className="size-3" />
                          Lewati Animasi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.actionButtons && msg.actionButtons.length > 0 && !isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="shrink-0 size-[60px]" />
                      <div className="max-w-[75%]">
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.actionButtons.map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => handleActionButtonClick(btn)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-sm active:scale-[0.97]"
                              style={{
                                backgroundColor: `${btn.color}10`,
                                color: btn.color,
                                border: `1px solid ${btn.color}30`,
                              }}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  {!isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="shrink-0 size-[60px]" />
                      <div className="max-w-[75%]">
                        <p className="text-[10px] mt-1 px-1" style={{ color: '#6B7280' }}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User messages */}
              {msg.role === 'user' && (
                <div className="flex items-end gap-2">
                  <div className="max-w-[75%] ml-auto">
                    <div
                      className="px-4 py-3 shadow-sm text-sm leading-relaxed rounded-2xl rounded-br-sm text-white"
                      style={{ backgroundColor: '#1565C0' }}
                    >
                      {msg.content}
                    </div>
                    <p className="text-[10px] mt-1 px-1 text-right" style={{ color: '#6B7280' }}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Status Indicator */}
        {chatStatusIndicator && (
          <div className="flex items-end gap-2">
            <div className="shrink-0 mb-1">
              <AiAvatar />
            </div>
            <div
              className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"
              style={{ border: '1px solid #E5E7EB' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: '#1565C0', animationDelay: '0ms' }} />
                  <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: '#1565C0', animationDelay: '150ms' }} />
                  <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: '#1565C0', animationDelay: '300ms' }} />
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  {STATUS_LABELS[chatStatusIndicator]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator (fallback when no status) */}
        {isLoading && !chatStatusIndicator && (
          <div className="flex items-end gap-2">
            <div className="shrink-0 mb-1">
              <AiAvatar />
            </div>
            <div
              className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"
              style={{ border: '1px solid #E5E7EB' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: '#1565C0', animationDelay: '0ms' }} />
                  <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: '#1565C0', animationDelay: '150ms' }} />
                  <div className="size-2 rounded-full animate-bounce" style={{ backgroundColor: '#1565C0', animationDelay: '300ms' }} />
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  SPMB AI sedang mengetik...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Menu + Input Area */}
      <div
        className="bg-white border-t safe-area-bottom"
        style={{ borderColor: '#E5E7EB', boxShadow: '0 -2px 10px rgba(0,0,0,0.03)' }}
      >
        {/* Quick Menu chips - always visible above input */}
        <div className="px-4 pt-3">
          <QuickMenuGrid onMenuClick={handleQuickMenuClick} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pesan..."
            disabled={isLoading}
            className="flex-1 h-11 rounded-full border px-4 text-sm outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: '#F9FAFB',
              color: '#1F2937',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1565C0';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center size-11 rounded-full shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            style={{
              backgroundColor: inputValue.trim() ? '#1565C0' : '#9CA3AF',
            }}
            aria-label="Kirim pesan"
          >
            <Send className="size-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}

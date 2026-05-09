import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Sparkles, Send, Wand2, Palette, FileText, Zap, AlertCircle } from 'lucide-react';
import type { VibeComponent, VibeComponentProps } from '@/types/vibebuilder';

// ── Gemini API call ──────────────────────────────────────────────────────────

async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined ?? '';
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as any)?.error?.message ?? `Gemini API error ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json() as { candidates?: { content: { parts: { text: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini returned an empty response. Try again.');
  return text;
}

// ── System prompts ────────────────────────────────────────────────────────────

const PAGE_GEN_SYSTEM = `You are a professional website builder AI. Generate complete, high-quality website page layouts as JSON.

Return ONLY a valid JSON array of components. No explanation, no markdown fences, just the raw JSON array.

Each component must be:
{
  "id": "<unique short string like 'c1','c2'>",
  "type": "<ComponentType>",
  "order": <integer starting 0>,
  "props": { <component props> }
}

Available types and their props:
- "Navbar": { siteName, logoText, links:[{label,url}], bgColor, textColor }
- "Hero": { heading, subtext, ctaText, bgColor, imageUrl:"", alignment:"left"|"center"|"right", overlayOpacity:0.3 }
- "TextBlock": { content, fontSize:"16px", textColor:"#333333", alignment:"left" }
- "FeaturesGrid": { title, features:[{icon,title,description}] }
- "Testimonial": { quote, authorName, authorRole, authorImage:"", bgColor }
- "CTABanner": { heading, subtext, buttonText, buttonUrl:"#", bgColor, textColor }
- "ContactForm": { title, submitText, fields:[{name,label,type:"text"|"email"|"textarea",required:true}], webhookUrl:"" }
- "ImageGallery": { images:["https://picsum.photos/400/300"], columns:3, gap:16 }
- "Footer": { companyName, copyright, links:[{label,url}], bgColor:"#111111", textColor:"#888888" }

Rules:
1. Start with Navbar (order 0), end with Footer (last order)
2. Always include a Hero section
3. Use realistic, compelling content for the described business
4. Use professional color schemes that match the business type
5. Return ONLY the JSON array`;

const COPY_SYSTEM = `You are a professional copywriter. Rewrite the text content of a website component.
Return ONLY a JSON object with the same keys as the input but with improved copy.
Keep the same structure, only change text values. No explanation.`;

const PALETTE_SYSTEM = `Generate a professional color palette for a website.
Return ONLY this JSON object (no other text):
{"primary":"#hex","secondary":"#hex","accent":"#hex","bg":"#hex","text":"#hex"}
All values must be valid CSS hex colors.`;

const IMPROVE_SYSTEM = `You are a professional web copywriter and UX expert. Improve the website page components.
Return ONLY the improved JSON array with the same structure as the input.
Improvements: better headings, more compelling copy, ensure all sections are filled, fix empty fields.
Keep the same component types and structure. Return ONLY the JSON array.`;

// ── Helper: extract JSON from AI response ─────────────────────────────────────

function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch { /* fall through */ }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch { /* fall through */ }
  }
  const start = trimmed.search(/[{[]/);
  if (start >= 0) {
    const last = Math.max(trimmed.lastIndexOf(']'), trimmed.lastIndexOf('}'));
    if (last > start) {
      try { return JSON.parse(trimmed.slice(start, last + 1)); } catch { /* fall through */ }
    }
  }
  throw new Error("AI couldn't generate a valid layout. Try being more specific.");
}

function normalizeComponents(raw: unknown): VibeComponent[] {
  if (!Array.isArray(raw)) throw new Error("AI couldn't generate a valid layout. Try being more specific.");
  return (raw as any[]).map((item, i) => ({
    id: item.id ?? uuidv4(),
    type: item.type,
    order: typeof item.order === 'number' ? item.order : i,
    props: item.props ?? {},
  })) as VibeComponent[];
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComponent: VibeComponent | null;
  components: VibeComponent[];
  onSetComponents: (components: VibeComponent[]) => void;
  onUpdateProps: (patch: Partial<VibeComponentProps>) => void;
}

interface LogEntry {
  role: 'user' | 'ai' | 'error';
  text: string;
}

const SUGGESTION_CHIPS = [
  'Landing page for a restaurant',
  'Portfolio for a photographer',
  'SaaS product pricing page',
  'Personal blog homepage',
  'E-commerce store front',
];

// ── Loading dots animation ────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: '#FF6B35',
              animation: `vibe-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: '#666' }}>Thinking…</span>
      <style>{`
        @keyframes vibe-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function AIAssistantPanel({
  isOpen, onClose, selectedComponent, components, onSetComponents, onUpdateProps,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const hasApiKey = !!(import.meta.env.VITE_GEMINI_API_KEY as string | undefined);

  function addLog(entry: LogEntry) {
    setLog((prev) => [...prev, entry]);
  }

  async function run(action: 'generate' | 'copy' | 'palette' | 'improve' | 'prompt', chipPrompt?: string) {
    let userMsg = '';
    let systemMsg = '';
    const inputPrompt = chipPrompt ?? prompt;

    if (action === 'generate' || action === 'prompt') {
      userMsg = inputPrompt || 'Build a modern professional landing page';
      systemMsg = PAGE_GEN_SYSTEM;
    } else if (action === 'copy') {
      if (!selectedComponent) {
        addLog({ role: 'error', text: 'Select a block on the canvas first.' });
        return;
      }
      userMsg = `Rewrite copy for this ${selectedComponent.type} component:\n${JSON.stringify(selectedComponent.props, null, 2)}`;
      systemMsg = COPY_SYSTEM;
    } else if (action === 'palette') {
      userMsg = inputPrompt || 'Generate a modern professional color palette';
      systemMsg = PALETTE_SYSTEM;
    } else if (action === 'improve') {
      userMsg = `Improve this page:\n${JSON.stringify(components, null, 2)}`;
      systemMsg = IMPROVE_SYSTEM;
    }

    if (!userMsg.trim()) return;
    addLog({ role: 'user', text: userMsg.length > 120 ? userMsg.slice(0, 120) + '…' : userMsg });
    setPrompt('');
    setLoading(true);

    try {
      const raw = await callGemini(systemMsg, userMsg);

      if (action === 'copy') {
        const parsed = extractJSON(raw) as Partial<VibeComponentProps>;
        onUpdateProps(parsed);
        addLog({ role: 'ai', text: 'Copy updated on the selected block.' });
      } else if (action === 'palette') {
        const palette = extractJSON(raw) as Record<string, string>;
        const updated = components.map((c) => {
          const props = { ...c.props } as Record<string, unknown>;
          if ('bgColor' in props) props.bgColor = palette.bg ?? palette.secondary ?? props.bgColor;
          if ('textColor' in props) props.textColor = palette.text ?? props.textColor;
          return { ...c, props: props as unknown as VibeComponentProps };
        });
        onSetComponents(updated);
        addLog({ role: 'ai', text: `Palette applied: ${Object.values(palette).join(', ')}` });
      } else {
        const parsed = extractJSON(raw);
        const newComponents = normalizeComponents(parsed);
        onSetComponents(newComponents);
        addLog({ role: 'ai', text: `Generated ${newComponents.length} components — applied to canvas.` });
      }
    } catch (err) {
      addLog({ role: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const quickActions = [
    { id: 'generate' as const, label: 'Generate full page', icon: <Wand2 className="h-3.5 w-3.5" /> },
    { id: 'copy'     as const, label: 'Write copy for block', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'palette'  as const, label: 'Generate color palette', icon: <Palette className="h-3.5 w-3.5" /> },
    { id: 'improve'  as const, label: 'Improve this page', icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 400, backgroundColor: '#1A1A1A',
        borderLeft: '1px solid #2A2A2A',
        display: 'flex', flexDirection: 'column', zIndex: 40,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #2A2A2A', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles style={{ width: 16, height: 16, color: '#FF6B35' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>AI Assistant</span>
          <span style={{ fontSize: 10, color: '#555', backgroundColor: '#222', padding: '1px 6px', borderRadius: 10, border: '1px solid #333' }}>
            Gemini
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* API key warning */}
      {!hasApiKey && (
        <div style={{
          margin: '12px 16px', padding: '10px 12px', borderRadius: 8,
          backgroundColor: '#FF6B3510', border: '1px solid #FF6B3530',
          display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0,
        }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#FF6B35', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: '#FF9F7A', lineHeight: 1.5, margin: 0 }}>
            AI features need a Gemini API key. Add <code style={{ backgroundColor: '#FF6B3520', padding: '1px 4px', borderRadius: 3 }}>VITE_GEMINI_API_KEY</code> to your .env file.
            Get a free key at <strong>aistudio.google.com</strong>
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Quick Actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {quickActions.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => void run(id)}
              disabled={loading || !hasApiKey}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px', borderRadius: 8,
                backgroundColor: '#262626', border: '1px solid #333',
                color: '#CCC', fontSize: 11, fontWeight: 500,
                cursor: loading || !hasApiKey ? 'not-allowed' : 'pointer',
                opacity: loading || !hasApiKey ? 0.5 : 1, transition: 'all 0.15s', textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!loading && hasApiKey) {
                  e.currentTarget.style.borderColor = '#FF6B35';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.color = '#CCC';
              }}
            >
              <span style={{ color: '#FF6B35', flexShrink: 0 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation log */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'thin', scrollbarColor: '#333 transparent',
      }}>
        {log.length === 0 && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Sparkles style={{ width: 28, height: 28, color: '#333', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                Describe your page or pick a suggestion below.
              </p>
            </div>
            {/* Suggestion chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                Try these
              </p>
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={loading || !hasApiKey}
                  onClick={() => void run('generate', chip)}
                  style={{
                    padding: '7px 12px', borderRadius: 8, textAlign: 'left',
                    backgroundColor: '#1E1E1E', border: '1px solid #2E2E2E',
                    color: '#999', fontSize: 11, cursor: loading || !hasApiKey ? 'not-allowed' : 'pointer',
                    opacity: loading || !hasApiKey ? 0.5 : 1, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && hasApiKey) {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.color = '#CCC';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2E2E2E';
                    e.currentTarget.style.color = '#999';
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
        {log.map((entry, i) => (
          <div
            key={i}
            style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.5,
              backgroundColor:
                entry.role === 'user' ? '#FF6B3515' :
                entry.role === 'error' ? '#ef444415' : '#26262680',
              border: `1px solid ${
                entry.role === 'user' ? '#FF6B3530' :
                entry.role === 'error' ? '#ef444430' : '#333'
              }`,
              color:
                entry.role === 'user' ? '#FF9F7A' :
                entry.role === 'error' ? '#ef4444' : '#CCC',
              alignSelf: entry.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
            }}
          >
            {entry.text}
          </div>
        ))}
        {loading && <LoadingDots />}
      </div>

      {/* Prompt input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid #2A2A2A', flexShrink: 0,
        display: 'flex', gap: 8,
      }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
              e.preventDefault();
              void run('prompt');
            }
          }}
          placeholder='e.g. "coffee shop landing page"'
          disabled={loading || !hasApiKey}
          style={{
            flex: 1, backgroundColor: '#262626', border: '1px solid #333',
            borderRadius: 8, color: 'white', fontSize: 12, padding: '8px 12px',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
        />
        <button
          type="button"
          onClick={() => prompt.trim() && void run('prompt')}
          disabled={loading || !prompt.trim() || !hasApiKey}
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 8,
            backgroundColor: '#FF6B35', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: loading || !prompt.trim() || !hasApiKey ? 'not-allowed' : 'pointer',
            opacity: loading || !prompt.trim() || !hasApiKey ? 0.5 : 1,
          }}
          aria-label="Send prompt"
        >
          <Send style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

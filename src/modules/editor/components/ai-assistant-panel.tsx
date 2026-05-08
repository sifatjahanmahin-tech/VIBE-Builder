import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Sparkles, Loader2, Send, Wand2, Palette, FileText, Zap } from 'lucide-react';
import type { VibeComponent, VibeComponentProps } from '@/types/vibebuilder';

// ── Anthropic API call ───────────────────────────────────────────────────────

async function callClaude(system: string, userMsg: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined ?? '';
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error((err as any).error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json() as { content: { text: string }[] };
  return data.content[0]?.text ?? '';
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

// ── Helper: extract JSON from Claude response ─────────────────────────────────

function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  // Try direct parse first
  try { return JSON.parse(trimmed); } catch { /* fall through */ }
  // Extract from code fences
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch { /* fall through */ }
  }
  // Find first [ or { to last ] or }
  const start = trimmed.search(/[{[]/);
  if (start >= 0) {
    const last = Math.max(trimmed.lastIndexOf(']'), trimmed.lastIndexOf('}'));
    if (last > start) {
      try { return JSON.parse(trimmed.slice(start, last + 1)); } catch { /* fall through */ }
    }
  }
  throw new Error('Could not parse JSON from AI response');
}

function normalizeComponents(raw: unknown): VibeComponent[] {
  if (!Array.isArray(raw)) throw new Error('AI response is not an array');
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

// ── Log entry ────────────────────────────────────────────────────────────────

interface LogEntry {
  role: 'user' | 'ai' | 'error';
  text: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AIAssistantPanel({
  isOpen, onClose, selectedComponent, components, onSetComponents, onUpdateProps,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  function addLog(entry: LogEntry) {
    setLog((prev) => [...prev, entry]);
  }

  async function run(action: 'generate' | 'copy' | 'palette' | 'improve' | 'prompt') {
    let userMsg = '';
    let systemMsg = '';

    if (action === 'generate') {
      userMsg = prompt || 'Build a modern professional landing page';
      systemMsg = PAGE_GEN_SYSTEM;
    } else if (action === 'copy') {
      if (!selectedComponent) {
        addLog({ role: 'error', text: 'Select a block on the canvas first.' });
        return;
      }
      userMsg = `Rewrite copy for this ${selectedComponent.type} component:\n${JSON.stringify(selectedComponent.props, null, 2)}`;
      systemMsg = COPY_SYSTEM;
    } else if (action === 'palette') {
      userMsg = prompt || 'Generate a modern professional color palette';
      systemMsg = PALETTE_SYSTEM;
    } else if (action === 'improve') {
      userMsg = `Improve this page:\n${JSON.stringify(components, null, 2)}`;
      systemMsg = IMPROVE_SYSTEM;
    } else {
      userMsg = prompt;
      systemMsg = PAGE_GEN_SYSTEM;
    }

    if (!userMsg.trim()) return;
    addLog({ role: 'user', text: userMsg.length > 120 ? userMsg.slice(0, 120) + '…' : userMsg });
    setPrompt('');
    setLoading(true);

    try {
      const raw = await callClaude(systemMsg, userMsg);

      if (action === 'copy') {
        const parsed = extractJSON(raw) as Partial<VibeComponentProps>;
        onUpdateProps(parsed);
        addLog({ role: 'ai', text: 'Copy updated on the selected block.' });
      } else if (action === 'palette') {
        const palette = extractJSON(raw) as Record<string, string>;
        // Apply palette colors to all components that have bgColor/textColor
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
        addLog({ role: 'ai', text: `Generated ${newComponents.length} blocks. Canvas updated.` });
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
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px', borderRadius: 8,
                backgroundColor: '#262626', border: '1px solid #333',
                color: '#CCC', fontSize: 11, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1, transition: 'all 0.15s', textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
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
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <Sparkles style={{ width: 32, height: 32, color: '#333', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
              Use quick actions above or describe what you want to build below.
            </p>
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
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
            <Loader2 style={{ width: 14, height: 14, color: '#FF6B35' }} className="animate-spin" />
            <span style={{ fontSize: 12, color: '#666' }}>Thinking…</span>
          </div>
        )}
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
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) { e.preventDefault(); void run('prompt'); } }}
          placeholder='e.g. "coffee shop landing page"'
          disabled={loading}
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
          disabled={loading || !prompt.trim()}
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 8,
            backgroundColor: '#FF6B35', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !prompt.trim() ? 0.5 : 1,
          }}
          aria-label="Send prompt"
        >
          <Send style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

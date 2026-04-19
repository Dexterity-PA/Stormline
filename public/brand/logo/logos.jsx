// Stormline — final wordmark + full brand asset set.
// Single logo direction: underline that bends up into the "l" of "line".

const LOGO_BG       = '#0a0e13';
const LOGO_BG_ELEV  = '#11161d';
const LOGO_BG_PAPER = '#f4f2ec';
const ACCENT        = '#4ea8ff';
const ACCENT_DIM    = '#2d6ab3';
const ACCENT_DEEP   = '#1a3a66';
const FG            = '#e8ecf1';
const FG_INK        = '#0a0e13';
const MUTED         = '#8a94a3';

const DISPLAY = '"Inter Tight", "Inter", system-ui, sans-serif';
const MONO    = '"JetBrains Mono", ui-monospace, monospace';

// ─────────────────────────────────────────────────────────────
// Board — presentation cell
// ─────────────────────────────────────────────────────────────
const Board = ({ children, label, w = 420, h = 200, bg = LOGO_BG, pad = 24 }) => (
  <DCArtboard label={label} width={w} height={h} style={{ background: bg, border: '1px solid #1e2631' }}>
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: pad, boxSizing: 'border-box',
    }}>{children}</div>
  </DCArtboard>
);

// ─────────────────────────────────────────────────────────────
// THE wordmark
// ─────────────────────────────────────────────────────────────
// Underline bends 90° up to become the l-stem of "line".
// All strokes are the same 4px weight so the accent reads as a single rule.
// Geometry at 360×72 viewBox:
//   "storm" rendered 0→~138, l-stem at x=141, "ine" at x=149.
//   Underline spans x=148 → x=213, meets l-stem with an 8px radius corner,
//   rises to y=14 (ascender height).
//
// To change the palette: swap FILL (word color) and STROKE (accent color).
// ─────────────────────────────────────────────────────────────
const Wordmark = ({
  fill = FG,
  stroke = ACCENT,
  width = 360,
  height = 72,
  className,
  style,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 360 72"
    fill="none"
    className={className}
    style={{ display: 'block', ...style }}
    role="img"
    aria-label="Stormline"
  >
    <defs>
      <style>{`
        .sl-word-${fill.replace('#','')} {
          font-family: ${DISPLAY};
          font-weight: 600;
          font-size: 52px;
          letter-spacing: -0.02em;
          fill: ${fill};
        }
      `}</style>
    </defs>
    <text x="0"   y="52" className={`sl-word-${fill.replace('#','')}`}>storm</text>
    <text x="149" y="52" className={`sl-word-${fill.replace('#','')}`}>ine</text>
    <path
      d="M 213 63
         L 148 63
         Q 141 63, 141 56
         L 141 14"
      stroke={stroke}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// App-icon mark — the bent rule (l-stem + underline) with a sparkline
// contained within the area enclosed by the bent "l" — right of the
// l-stem, above the horizontal rule. Reads as a stock chart sitting
// inside the letterform.
// Geometry: 64×64 viewBox.
//   Horizontal rule: y=44, from x=24 → x=50.
//   L-stem: x=20, y=16 → 40.
//   Sparkline: x=24 → x=50, y range 18–36 (well within the enclosed area).
// ─────────────────────────────────────────────────────────────
const IconMark = ({ stroke = ACCENT, bg = LOGO_BG, size = 64, radius = 14, fg }) => {
  const lineColor = fg || stroke;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Stormline mark">
      <rect x="0" y="0" width="64" height="64" rx={radius} ry={radius} fill={bg}/>
      {/* Bent rule: underline that turns up into the l-stem */}
      <path
        d="M 50 44
           L 24 44
           Q 20 44, 20 40
           L 20 16"
        stroke={lineColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkline — stays inside the "l": right of the stem, above the bar */}
      <path
        d="M 24 34
           L 28 30
           L 32 32
           L 36 26
           L 40 28
           L 44 22
           L 48 18"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />
      {/* End dot on the sparkline's high point */}
      <circle cx="48" cy="18" r="1.8" fill={lineColor}/>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <DesignCanvas>

      {/* ══════════════════════════════════════════════════════
          PRIMARY WORDMARK
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Primary wordmark"
        subtitle="Lowercase “stormline.” The underline bends 90° up to become the l-stem of “line.” One continuous rule, one accent."
      >
        <Board label="Primary · dark background" w={720} h={280} pad={48}>
          <div style={{ transform: 'scale(1.4)', transformOrigin: 'center' }}>
            <Wordmark/>
          </div>
        </Board>
        <Board label="Light mode" w={720} h={280} pad={48} bg={LOGO_BG_PAPER}>
          <div style={{ transform: 'scale(1.4)', transformOrigin: 'center' }}>
            <Wordmark fill={FG_INK} stroke={ACCENT_DIM}/>
          </div>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          WORDMARK LOCKUP VARIANTS
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Wordmark variants"
        subtitle="Mono + knockout versions for one-color reproduction and dark/light pairings."
      >
        <Board label="Mono · all ink">
          <Wordmark fill={FG_INK} stroke={FG_INK}/>
        </Board>
        <Board label="Mono · all paper" bg={FG_INK}>
          <Wordmark fill={LOGO_BG_PAPER} stroke={LOGO_BG_PAPER}/>
        </Board>
        <Board label="Accent-only rule" bg={LOGO_BG_PAPER}>
          <Wordmark fill={FG_INK} stroke={ACCENT}/>
        </Board>
        <Board label="Reversed on accent" bg={ACCENT_DEEP}>
          <Wordmark fill={FG} stroke={ACCENT_SOFT_OR(ACCENT)}/>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          APP ICON — the mark alone
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="App icon · the mark"
        subtitle="The bent rule survives on its own. Used for favicon, app icon, avatar, loader."
      >
        <Board label="App icon · dark (primary)" w={360} h={280}>
          <IconMark size={160} radius={36}/>
        </Board>
        <Board label="App icon · light" w={360} h={280} bg={LOGO_BG_PAPER}>
          <IconMark size={160} radius={36} stroke={ACCENT_DIM} bg={LOGO_BG_PAPER}/>
        </Board>
        <Board label="App icon · accent" w={360} h={280}>
          <IconMark size={160} radius={36} bg={ACCENT_DEEP} stroke={ACCENT}/>
        </Board>
        <Board label="App icon · mono ink" w={360} h={280} bg={LOGO_BG_PAPER}>
          <IconMark size={160} radius={36} bg={FG_INK} stroke={LOGO_BG_PAPER}/>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          FAVICON SET — real pixel sizes
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Favicon set · rendered at actual pixel size"
        subtitle="16, 32, 48, 64, 180 (apple-touch), 512 (PWA). The mark stays legible at 16px because it's one continuous stroke."
      >
        <Board label="Real sizes" w={900} h={260}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 48, color: MUTED,
            fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {[16, 32, 48, 64, 180].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <IconMark size={s} radius={s * 0.22}/>
                <span>{s}px</span>
              </div>
            ))}
          </div>
        </Board>

        <Board label="PWA 512px" w={900} h={260}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, color: MUTED, fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <IconMark size={192} radius={42}/>
            <div style={{ lineHeight: 1.6 }}>
              <div style={{ color: FG, fontFamily: DISPLAY, fontSize: 14, letterSpacing: 0, textTransform: 'none', marginBottom: 6 }}>
                512 × 512 · PWA / Android
              </div>
              <div>icon-512.png</div>
              <div>icon-192.png</div>
              <div>apple-touch-icon.png · 180</div>
              <div>favicon.ico · 16 32 48</div>
            </div>
          </div>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          BROWSER TAB PREVIEW
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="In context · browser tab"
      >
        <Board label="Chrome tab" w={720} h={200}>
          <div style={{
            background: '#202124',
            borderRadius: 8,
            padding: '8px 8px 0',
            width: 520,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px 10px 12px',
              background: '#35363a',
              borderRadius: '8px 8px 0 0',
              color: '#e8eaed',
              fontFamily: DISPLAY, fontSize: 12,
            }}>
              <IconMark size={16} radius={3}/>
              <span>Stormline · Markets & risk</span>
              <span style={{ color: '#9aa0a6', marginLeft: 10 }}>×</span>
            </div>
            <div style={{ height: 10, background: '#202124', borderRadius: '0 0 8px 8px' }}/>
            <div style={{
              background: '#ffffff', height: 40, borderRadius: 0,
              display: 'flex', alignItems: 'center', padding: '0 14px',
              fontFamily: MONO, fontSize: 12, color: '#5f6368',
            }}>
              stormline.com
            </div>
          </div>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          SOCIAL AVATARS
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Social avatars"
        subtitle="Square avatars for X, LinkedIn, Slack. Circular crop-safe — the mark sits in a 60% safe area."
      >
        <Board label="X / Twitter · 400 × 400" w={420} h={300}>
          <div style={{ position: 'relative' }}>
            <IconMark size={200} radius={44}/>
            {/* circular crop overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              border: '1px dashed #4ea8ff55',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}/>
          </div>
        </Board>
        <Board label="LinkedIn company · 400 × 400" w={420} h={300}>
          <IconMark size={200} radius={44} bg={ACCENT_DEEP} stroke={ACCENT}/>
        </Board>
        <Board label="Slack workspace · 132 × 132" w={420} h={300}>
          <IconMark size={132} radius={28}/>
        </Board>
        <Board label="Circular · Discord / profile" w={420} h={300}>
          <div style={{
            width: 200, height: 200,
            borderRadius: '50%',
            background: LOGO_BG,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconMark size={200} radius={100}/>
          </div>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          OG IMAGE
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Open Graph · 1200 × 630"
        subtitle="Social link preview. Wordmark top-left, tagline bottom-left, accent rule bottom edge."
      >
        <Board label="og-image.png · dark" w={820} h={460} pad={0}>
          <div style={{
            width: 720, height: 378,
            background: LOGO_BG,
            border: '1px solid #1e2631',
            position: 'relative',
            padding: 44,
            boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <Wordmark width={260} height={52}/>
            <div>
              <div style={{
                fontFamily: DISPLAY, color: FG,
                fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em',
                lineHeight: 1.1, maxWidth: 560,
              }}>
                Macro intelligence for <span style={{ color: ACCENT }}>main street.</span>
              </div>
              <div style={{
                marginTop: 14,
                fontFamily: MONO, color: MUTED,
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                stormline.com
              </div>
            </div>
            {/* bottom accent rule */}
            <div style={{
              position: 'absolute', left: 44, right: 44, bottom: 20,
              height: 2, background: ACCENT,
            }}/>
          </div>
        </Board>

        <Board label="og-image.png · light" w={820} h={460} pad={0} bg={LOGO_BG_PAPER}>
          <div style={{
            width: 720, height: 378,
            background: LOGO_BG_PAPER,
            border: '1px solid #e2dfd5',
            position: 'relative',
            padding: 44,
            boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <Wordmark width={260} height={52} fill={FG_INK} stroke={ACCENT_DIM}/>
            <div>
              <div style={{
                fontFamily: DISPLAY, color: FG_INK,
                fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em',
                lineHeight: 1.1, maxWidth: 560,
              }}>
                Macro intelligence for <span style={{ color: ACCENT_DIM }}>main street.</span>
              </div>
              <div style={{
                marginTop: 14,
                fontFamily: MONO, color: '#6b6458',
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                stormline.com
              </div>
            </div>
            <div style={{
              position: 'absolute', left: 44, right: 44, bottom: 20,
              height: 2, background: ACCENT_DIM,
            }}/>
          </div>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          CLEAR SPACE + MIN SIZE
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Clear space & minimum size"
        subtitle="Clear space = height of the l-stem on every side. Minimum wordmark width: 96px. Minimum app-icon: 16px."
      >
        <Board label="Clear space spec" w={720} h={320}>
          <div style={{ position: 'relative' }}>
            {/* clear-space guides */}
            <div style={{
              position: 'absolute', inset: -42,
              border: `1px dashed ${ACCENT}55`,
              borderRadius: 2,
            }}/>
            <Wordmark/>
            {/* corner ticks representing "x" = l-stem height */}
            {[['-44px','-44px'], ['-44px','auto','-44px'], ['auto','-44px','-44px'], ['auto','auto','-44px','-44px']].map((_,i)=>null)}
          </div>
        </Board>
        <Board label="Minimum size · 96px wide" w={540} h={220}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Wordmark width={96} height={19}/>
            <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              96 × 19 px
            </div>
          </div>
        </Board>
      </DCSection>

      {/* ══════════════════════════════════════════════════════
          DELIVERABLES CHECKLIST
          ══════════════════════════════════════════════════════ */}
      <DCSection
        title="Asset checklist"
        subtitle="Everything the brand ships with."
      >
        <Board label="Deliverables" w={820} h={360} pad={36}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 48, rowGap: 12,
            fontFamily: MONO, fontSize: 13, color: FG,
            lineHeight: 1.6,
          }}>
            {[
              ['wordmark-dark.svg',        'Primary, dark bg'],
              ['wordmark-light.svg',       'Light mode'],
              ['wordmark-mono-ink.svg',    'One-color print'],
              ['wordmark-mono-paper.svg',  'Knockout on dark'],
              ['icon-16.png',              'Favicon tab'],
              ['icon-32.png',              'Favicon retina'],
              ['icon-48.png',              'Windows site'],
              ['icon-180.png',             'apple-touch-icon'],
              ['icon-192.png',             'Android home'],
              ['icon-512.png',             'PWA maskable'],
              ['favicon.ico',              'Legacy bundle'],
              ['avatar-x-400.png',         'X profile'],
              ['avatar-linkedin-400.png',  'LinkedIn company'],
              ['avatar-slack-132.png',     'Slack workspace'],
              ['og-image-dark.png',        '1200 × 630'],
              ['og-image-light.png',       '1200 × 630'],
            ].map(([name, note]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ color: ACCENT }}>{name}</span>
                <span style={{ color: MUTED }}>{note}</span>
              </div>
            ))}
          </div>
        </Board>
      </DCSection>

    </DesignCanvas>
  );
}

// Helper: softer accent for use on deep-navy backgrounds
function ACCENT_SOFT_OR(c) { return '#8cc4ff'; }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

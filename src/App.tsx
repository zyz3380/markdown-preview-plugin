/**
 * @fileoverview Markdown Preview Plugin for Feishu Bitable
 * @description 飞书多维表格 Markdown 预览插件主组件
 * @version 1.0.4
 * @license MIT
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { bitable, FieldType, ITextField, IUrlField } from '@lark-base-open/js-sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import 'highlight.js/styles/vs2015.css';
import 'katex/dist/katex.min.css';

// ============================================================================
// Type Definitions
// ============================================================================

/** Font size options for the preview */
type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

/** Theme mode from Bitable */
type ThemeMode = 'LIGHT' | 'DARK';

/** Cell information structure */
interface CellInfo {
  tableId: string;
  tableName: string;
  fieldId: string;
  fieldName: string;
  recordId: string;
  content: string;
  fieldType: FieldType;
}

// ============================================================================
// Constants
// ============================================================================

/** Font size value mapping (in pixels) */
const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
};

/** Font size display labels */
const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: '小',
  medium: '中',
  large: '大',
  xlarge: '特大',
};

/** Mermaid diagram type keywords for content detection */
const MERMAID_KEYWORDS = [
  'graph ', 'graph\n',
  'flowchart ', 'flowchart\n',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'erDiagram',
  'journey',
  'gantt',
  'pie ', 'pie\n',
  'gitGraph',
  'mindmap',
  'timeline',
  'quadrantChart',
  'sankey',
  'xychart',
  'block-beta',
  'C4Context',
  'C4Container',
  'C4Component',
  'C4Dynamic',
  'C4Deployment',
  'architecture',
  'zenuml',
  'requirement',
  'packet',
  'kanban',
] as const;

// ============================================================================
// Mermaid Configuration
// ============================================================================

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Detects if content is pure Mermaid diagram syntax
 * @param content - The content to check
 * @returns True if content starts with a Mermaid keyword
 */
const isMermaidContent = (content: string): boolean => {
  const trimmed = content.trim();
  return MERMAID_KEYWORDS.some(keyword =>
    trimmed.startsWith(keyword) || trimmed.toLowerCase().startsWith(keyword.toLowerCase())
  );
};

/**
 * Copies text to clipboard with fallback support
 * @param text - Text to copy
 * @returns Promise resolving to success status
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }
  }
  
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Fallback copy also failed:', err);
    return false;
  }
};

// ============================================================================
// Components
// ============================================================================

/**
 * Mermaid diagram rendering component
 */
const MermaidBlock = ({ code, theme }: { code: string; theme: ThemeMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<string>(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!code) return;
      
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'DARK' ? 'dark' : 'default',
          securityLevel: 'loose',
          suppressErrorRendering: true,
        });
        
        const existingSvg = document.getElementById(idRef.current);
        if (existingSvg) {
          existingSvg.remove();
        }
        
        const { svg } = await mermaid.render(idRef.current, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render failed:', err);
        setError('图表渲染失败');
      }
    };

    renderMermaid();
  }, [code, theme]);

  if (error) {
    return (
      <div className="mermaid-error">
        <span>⚠️ {error}</span>
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

/**
 * Copy button component for code blocks
 */
const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className="code-copy-btn" onClick={handleCopy} title="复制代码">
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
};

/** Props for CodeBlock component */
interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  theme: ThemeMode;
}

const CodeBlock = ({ className, children, theme }: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  if (language === 'mermaid') {
    return <MermaidBlock code={code} theme={theme} />;
  }

  return (
    <code className={className}>
      {children}
    </code>
  );
};

/** Props for PreBlock component */
interface PreBlockProps {
  children?: React.ReactNode;
  theme: ThemeMode;
}

/**
 * Pre block wrapper component for code blocks
 * Handles Mermaid diagrams and adds copy buttons
 */
const PreBlock = ({ children, theme }: PreBlockProps) => {
  const childArray = React.Children.toArray(children);
  const codeChild = childArray.find(
    (child): child is React.ReactElement =>
      React.isValidElement(child) && child.type === 'code'
  );

  if (codeChild) {
    const className = codeChild.props.className || '';
    const match = /language-(\w+)/.exec(className);
    const language = match ? match[1] : '';
    const code = String(codeChild.props.children).replace(/\n$/, '');

    if (language === 'mermaid') {
      return <MermaidBlock code={code} theme={theme} />;
    }

    return (
      <div className="code-block-wrapper">
        <CopyButton code={code} />
        <pre>{children}</pre>
      </div>
    );
  }

  return <pre>{children}</pre>;
};

/**
 * Empty state component shown when no cell is selected
 */
const EmptyState = () => (
  <div className="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
    <p>请选择一个文本或 URL 单元格</p>
    <p style={{ fontSize: '12px', opacity: 0.7 }}>支持 Markdown 格式内容的渲染</p>
  </div>
);

// ============================================================================
// Main Application Component
// ============================================================================

/**
 * Main application component for Markdown Preview Plugin
 */
function App() {
  const [theme, setTheme] = useState<ThemeMode>('LIGHT');
  const [cellInfo, setCellInfo] = useState<CellInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('markdown-preview-font-size');
    return (saved as FontSize) || 'medium';
  });
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  // Persist font size preference
  useEffect(() => {
    localStorage.setItem('markdown-preview-font-size', fontSize);
  }, [fontSize]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setShowFontMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Copy raw Markdown content */
  const copyMarkdown = useCallback(async () => {
    if (!cellInfo?.content) return;
    
    const success = await copyToClipboard(cellInfo.content);
    if (success) {
      setCopySuccess('已复制 Markdown');
    } else {
      setCopySuccess('复制失败');
    }
    setTimeout(() => setCopySuccess(null), 2000);
  }, [cellInfo]);

  /** Copy rendered HTML content */
  const copyHtml = useCallback(async () => {
    if (!contentRef.current) return;
    
    const html = contentRef.current.innerHTML;
    const success = await copyToClipboard(html);
    if (success) {
      setCopySuccess('已复制 HTML');
    } else {
      setCopySuccess('复制失败');
    }
    setTimeout(() => setCopySuccess(null), 2000);
  }, []);

  /** Toggle fullscreen mode */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  /** Download content as Markdown file */
  const downloadAsMarkdown = useCallback(() => {
    if (!cellInfo?.content) return;
    
    const blob = new Blob([cellInfo.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cellInfo.fieldName || 'markdown'}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setCopySuccess('已下载 Markdown 文件');
    setTimeout(() => setCopySuccess(null), 2000);
    setShowDownloadMenu(false);
  }, [cellInfo]);

  /** Download content as PNG image */
  const downloadAsImage = useCallback(async () => {
    if (!contentRef.current) return;
    
    try {
      setCopySuccess('正在生成图片...');
      
      const canvas = await html2canvas(contentRef.current, {
        useCORS: true,
        logging: false,
      } as any);
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cellInfo?.fieldName || 'markdown'}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCopySuccess('已下载图片');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to generate image:', err);
      setCopySuccess('生成图片失败');
      setTimeout(() => setCopySuccess(null), 2000);
    }
    
    setShowDownloadMenu(false);
  }, [theme, cellInfo]);

  /** Change font size setting */
  const changeFontSize = useCallback((size: FontSize) => {
    setFontSize(size);
    setShowFontMenu(false);
  }, []);

  /** Fetch cell content from Bitable */
  const fetchCellContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const selection = await bitable.base.getSelection();
      
      if (!selection.tableId || !selection.fieldId || !selection.recordId) {
        setCellInfo(null);
        setLoading(false);
        return;
      }

      const table = await bitable.base.getTableById(selection.tableId);
      const tableName = await table.getName();

      const field = await table.getFieldById(selection.fieldId);
      const fieldMeta = await field.getMeta();
      const fieldName = fieldMeta.name;
      const fieldType = fieldMeta.type;

      if (fieldType !== FieldType.Text && fieldType !== FieldType.Url) {
        setError('请选择文本或 URL 类型的单元格');
        setCellInfo(null);
        setLoading(false);
        return;
      }

      let content = '';

      if (fieldType === FieldType.Text) {
        const textField = field as ITextField;
        const cellValue = await textField.getValue(selection.recordId);
        
        if (cellValue && Array.isArray(cellValue)) {
          content = cellValue.map((item: { text: string }) => item.text).join('');
        } else if (typeof cellValue === 'string') {
          content = cellValue;
        }
      } else if (fieldType === FieldType.Url) {
        const urlField = field as IUrlField;
        const cellValue = await urlField.getValue(selection.recordId);
        
        if (cellValue && typeof cellValue === 'object') {
          const urlValue = cellValue as { text?: string; link?: string };
          content = urlValue.text || urlValue.link || '';
        } else if (typeof cellValue === 'string') {
          content = cellValue;
        }
      }

      setCellInfo({
        tableId: selection.tableId,
        tableName,
        fieldId: selection.fieldId,
        fieldName,
        recordId: selection.recordId,
        content,
        fieldType
      });
    } catch (err) {
      console.error('Failed to fetch cell content:', err);
      setError('获取单元格内容失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize theme and set up event listeners
  useEffect(() => {
    const init = async () => {
      const currentTheme = await bitable.bridge.getTheme();
      setTheme(currentTheme as ThemeMode);
      await fetchCellContent();
    };

    init();

    const unsubscribeTheme = bitable.bridge.onThemeChange((event) => {
      setTheme(event.data.theme as ThemeMode);
    });

    const unsubscribeSelection = bitable.base.onSelectionChange(async () => {
      await fetchCellContent();
    });

    return () => {
      unsubscribeTheme();
      unsubscribeSelection();
    };
  }, [fetchCellContent]);

  // Memoized markdown component overrides
  const markdownComponents = useMemo(() => ({
    pre: ({ children }: { children?: React.ReactNode }) => (
      <PreBlock theme={theme}>{children}</PreBlock>
    ),
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => (
      <CodeBlock className={className} theme={theme}>{children}</CodeBlock>
    ),
  }), [theme]);

  /** Get display name for field type */
  const getFieldTypeName = (type: FieldType) => {
    switch (type) {
      case FieldType.Text:
        return '文本';
      case FieldType.Url:
        return 'URL';
      default:
        return '未知';
    }
  };

  return (
    <div
      className={`${theme === 'DARK' ? 'dark-theme' : ''} ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{ '--markdown-font-size': `${FONT_SIZE_MAP[fontSize]}px` } as React.CSSProperties}
    >
      <div className="plugin-header">
        <h1>📝 Markdown 预览</h1>
        {cellInfo && (
          <div className="header-actions">
            {/* 字体大小控制 */}
            <div className="dropdown-container" ref={fontMenuRef}>
              <button
                className="action-btn"
                onClick={() => setShowFontMenu(!showFontMenu)}
                title="调整字体大小"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7V4h16v3"></path>
                  <path d="M9 20h6"></path>
                  <path d="M12 4v16"></path>
                </svg>
                <span>{FONT_SIZE_LABELS[fontSize]}</span>
              </button>
              {showFontMenu && (
                <div className="dropdown-menu">
                  {(Object.keys(FONT_SIZE_MAP) as FontSize[]).map((size) => (
                    <button
                      key={size}
                      className={`dropdown-item ${fontSize === size ? 'active' : ''}`}
                      onClick={() => changeFontSize(size)}
                    >
                      <span style={{ fontSize: `${FONT_SIZE_MAP[size]}px` }}>A</span>
                      <span>{FONT_SIZE_LABELS[size]} ({FONT_SIZE_MAP[size]}px)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 下载按钮 */}
            <div className="dropdown-container" ref={downloadMenuRef}>
              <button
                className="action-btn"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                title="下载"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>下载</span>
              </button>
              {showDownloadMenu && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={downloadAsImage}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>下载为图片 (PNG)</span>
                  </button>
                  <button className="dropdown-item" onClick={downloadAsMarkdown}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>下载为 Markdown</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className="action-btn"
              onClick={copyMarkdown}
              title="复制 Markdown"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>MD</span>
            </button>
            <button
              className="action-btn"
              onClick={copyHtml}
              title="复制 HTML"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>HTML</span>
            </button>
            <button
              className="action-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? '退出全屏' : '全屏预览'}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {copySuccess && (
        <div className="copy-toast">{copySuccess}</div>
      )}

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>加载中...</span>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {!loading && !error && !cellInfo && <EmptyState />}

      {!loading && !error && cellInfo && (
        <>
          <div className="field-info">
            <span className="label">表格:</span>
            <span className="value">{cellInfo.tableName}</span>
            <span className="separator">|</span>
            <span className="label">字段:</span>
            <span className="value">{cellInfo.fieldName}</span>
            <span className="field-type-badge">{getFieldTypeName(cellInfo.fieldType)}</span>
          </div>

          <div className="content-wrapper">
            {cellInfo.content ? (
              <div className="markdown-body" ref={contentRef}>
                {isMermaidContent(cellInfo.content) ? (
                  <MermaidBlock code={cellInfo.content.trim()} theme={theme} />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                    components={markdownComponents}
                  >
                    {cellInfo.content}
                  </ReactMarkdown>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>单元格内容为空</p>
              </div>
            )}
          </div>

          <div className="feature-hints">
            <span className="hint-item" title="支持 GFM 语法">📋 GFM</span>
            <span className="hint-item" title="支持代码高亮">💻 代码高亮</span>
            <span className="hint-item" title="使用 ```mermaid 语法">📊 Mermaid</span>
            <span className="hint-item" title="使用 $...$ 或 $$...$$ 语法">🔢 数学公式</span>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
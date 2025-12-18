import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { bitable, FieldType, ITextField, IUrlField } from '@lark-base-open/js-sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

// 主题类型
type ThemeMode = 'LIGHT' | 'DARK';

// 单元格信息
interface CellInfo {
  tableId: string;
  tableName: string;
  fieldId: string;
  fieldName: string;
  recordId: string;
  content: string;
  fieldType: FieldType;
}

// 检测内容是否是纯 Mermaid 语法
const isMermaidContent = (content: string): boolean => {
  const trimmed = content.trim();
  // Mermaid 图表类型关键词
  const mermaidKeywords = [
    'graph ', 'graph\n',
    'flowchart ', 'flowchart\n',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'journey',
    'gantt',
    'pie ',
    'pie\n',
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
  ];
  
  // 检查是否以 mermaid 关键词开头
  return mermaidKeywords.some(keyword =>
    trimmed.startsWith(keyword) || trimmed.toLowerCase().startsWith(keyword.toLowerCase())
  );
};

// Mermaid 代码块渲染组件
const MermaidBlock = ({ code, theme }: { code: string; theme: ThemeMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<string>(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!code) return;
      
      try {
        // 更新 mermaid 主题
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'DARK' ? 'dark' : 'default',
          securityLevel: 'loose',
        });
        
        // 清理之前可能存在的 SVG 元素
        const existingSvg = document.getElementById(idRef.current);
        if (existingSvg) {
          existingSvg.remove();
        }
        
        const { svg } = await mermaid.render(idRef.current, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid 渲染失败:', err);
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

// 复制到剪贴板的辅助函数（兼容性方案）
const copyToClipboard = async (text: string): Promise<boolean> => {
  // 首先尝试使用 Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API 失败，尝试备用方案:', err);
    }
  }
  
  // 备用方案：使用 document.execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 设置样式使其不可见
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
    console.error('备用复制方案也失败:', err);
    return false;
  }
};

// 代码块复制按钮组件
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

// 代码块组件 - 定义在外部以避免重复创建
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

// Pre 组件 - 处理代码块容器
interface PreBlockProps {
  children?: React.ReactNode;
  theme: ThemeMode;
}

const PreBlock = ({ children, theme }: PreBlockProps) => {
  // 检查子元素是否是 code 元素
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

    // Mermaid 图表不需要 pre 包装
    if (language === 'mermaid') {
      return <MermaidBlock code={code} theme={theme} />;
    }

    // 普通代码块，添加复制按钮
    return (
      <div className="code-block-wrapper">
        <CopyButton code={code} />
        <pre>{children}</pre>
      </div>
    );
  }

  return <pre>{children}</pre>;
};

// 空状态组件
const EmptyState = () => (
  <div className="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
    <p>请选择一个文本或 URL 单元格</p>
    <p style={{ fontSize: '12px', opacity: 0.7 }}>支持 Markdown 格式内容的渲染</p>
  </div>
);

function App() {
  const [theme, setTheme] = useState<ThemeMode>('LIGHT');
  const [cellInfo, setCellInfo] = useState<CellInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 复制原始 Markdown
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

  // 复制渲染后的 HTML
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

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 获取单元格内容
  const fetchCellContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 获取当前选中的单元格
      const selection = await bitable.base.getSelection();
      
      if (!selection.tableId || !selection.fieldId || !selection.recordId) {
        setCellInfo(null);
        setLoading(false);
        return;
      }

      // 获取表格
      const table = await bitable.base.getTableById(selection.tableId);
      const tableName = await table.getName();

      // 获取字段
      const field = await table.getFieldById(selection.fieldId);
      const fieldMeta = await field.getMeta();
      const fieldName = fieldMeta.name;
      const fieldType = fieldMeta.type;

      // 支持文本类型和 URL 类型字段
      if (fieldType !== FieldType.Text && fieldType !== FieldType.Url) {
        setError('请选择文本或 URL 类型的单元格');
        setCellInfo(null);
        setLoading(false);
        return;
      }

      let content = '';

      if (fieldType === FieldType.Text) {
        // 获取文本单元格值
        const textField = field as ITextField;
        const cellValue = await textField.getValue(selection.recordId);
        
        // 提取文本内容
        if (cellValue && Array.isArray(cellValue)) {
          content = cellValue.map((item: { text: string }) => item.text).join('');
        } else if (typeof cellValue === 'string') {
          content = cellValue;
        }
      } else if (fieldType === FieldType.Url) {
        // 获取 URL 单元格值
        const urlField = field as IUrlField;
        const cellValue = await urlField.getValue(selection.recordId);
        
        if (cellValue && typeof cellValue === 'object') {
          // URL 字段可能包含 text 和 link 属性
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
      console.error('获取单元格内容失败:', err);
      setError('获取单元格内容失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化：获取主题和监听变化
  useEffect(() => {
    const init = async () => {
      // 获取当前主题
      const currentTheme = await bitable.bridge.getTheme();
      setTheme(currentTheme as ThemeMode);

      // 获取初始选中的单元格
      await fetchCellContent();
    };

    init();

    // 监听主题变化
    const unsubscribeTheme = bitable.bridge.onThemeChange((event) => {
      setTheme(event.data.theme as ThemeMode);
    });

    // 监听选择变化
    const unsubscribeSelection = bitable.base.onSelectionChange(async () => {
      await fetchCellContent();
    });

    return () => {
      unsubscribeTheme();
      unsubscribeSelection();
    };
  }, [fetchCellContent]);

  // 使用 useMemo 创建 components 对象，避免每次渲染都创建新对象
  const markdownComponents = useMemo(() => ({
    pre: ({ children }: { children?: React.ReactNode }) => (
      <PreBlock theme={theme}>{children}</PreBlock>
    ),
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => (
      <CodeBlock className={className} theme={theme}>{children}</CodeBlock>
    ),
  }), [theme]);

  // 获取字段类型显示名称
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
    <div className={`${theme === 'DARK' ? 'dark-theme' : ''} ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="plugin-header">
        <h1>📝 Markdown 预览</h1>
        {cellInfo && (
          <div className="header-actions">
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
                {/* 检测是否是纯 Mermaid 内容 */}
                {isMermaidContent(cellInfo.content) ? (
                  <MermaidBlock code={cellInfo.content.trim()} theme={theme} />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeHighlight, rehypeKatex]}
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
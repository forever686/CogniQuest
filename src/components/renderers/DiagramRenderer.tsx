import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { VisualAsset } from '../../types';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface DiagramRendererProps {
    asset: VisualAsset;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
    },
    securityLevel: 'loose',
});

const DiagramRenderer: React.FC<DiagramRendererProps> = ({ asset }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1);

    const cleanMermaidCode = (content: string): string => {
        // 1. Try to find a mermaid code block
        const codeBlockRegex = /```(?:mermaid)?\n([\s\S]*?)\n```/;
        const match = content.match(codeBlockRegex);
        if (match && match[1]) {
            return match[1].trim();
        }

        // 2. If no code block, try to clean up raw content
        let cleaned = content;

        // Remove any lines starting with ** (bold text usually indicating headers/explanations)
        // or # (markdown headers) that appear after the first few lines
        const lines = cleaned.split('\n');
        const mermaidKeywords = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'gantt', 'pie', 'gitGraph'];

        // Find start line
        const startIndex = lines.findIndex(line => mermaidKeywords.some(keyword => line.trim().startsWith(keyword)));

        if (startIndex !== -1) {
            // Keep lines from start until we hit a line that looks like markdown text (e.g. starts with ** or #)
            const validLines = [];
            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('**') || line.startsWith('# ') || line.startsWith('## ')) {
                    break;
                }
                validLines.push(lines[i]);
            }
            return validLines.join('\n').trim();
        }

        return content.trim();
    };

    useEffect(() => {
        const renderDiagram = async () => {
            if (!containerRef.current) return;

            try {
                setError(null);
                // Unique ID for each render to prevent conflicts
                const id = `mermaid-${asset.id}-${Date.now()}`;

                const cleanedCode = cleanMermaidCode(asset.content);
                console.log("Rendering Mermaid Code:", cleanedCode);

                const { svg } = await mermaid.render(id, cleanedCode);
                setSvgContent(svg);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError('Failed to render diagram. The syntax might be invalid.');
            }
        };

        renderDiagram();
    }, [asset.content, asset.id]);

    return (
        <div className="w-full h-full min-h-[400px] relative bg-bg-secondary flex flex-col">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/10">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-white/10 rounded-md text-text-secondary hover:text-white transition-colors">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={() => setScale(1)} className="p-2 hover:bg-white/10 rounded-md text-text-secondary hover:text-white transition-colors">
                    <span className="text-xs font-mono">{Math.round(scale * 100)}%</span>
                </button>
                <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-white/10 rounded-md text-text-secondary hover:text-white transition-colors">
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>

            {/* Diagram Area */}
            <div className="flex-1 overflow-auto flex justify-center items-center p-8">
                {error ? (
                    <div className="text-red-400 flex flex-col items-center gap-2">
                        <RefreshCw className="w-8 h-8" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="transition-transform duration-300 origin-center"
                        style={{ transform: `scale(${scale})` }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                )}
            </div>
        </div>
    );
};

export default DiagramRenderer;

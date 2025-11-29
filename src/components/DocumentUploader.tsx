import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface DocumentUploaderProps {
    onUpload: (content: string, fileName: string) => void;
    onClear: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUpload, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            const text = await file.text();
            setFileName(file.name);
            onUpload(text, file.name);
        } else {
            alert('Only .txt and .md files are supported for now.');
        }
    };

    const handleClear = () => {
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClear();
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.md"
                className="hidden"
            />

            {fileName ? (
                <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-2 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-bottom-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium max-w-[150px] truncate" title={fileName}>
                        {fileName}
                    </span>
                    <button
                        onClick={handleClear}
                        className="p-1 hover:bg-accent/20 rounded-full transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-text-secondary hover:text-accent transition-colors rounded-xl hover:bg-accent/10"
                    title="Upload Document (.txt, .md)"
                >
                    <Upload className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default DocumentUploader;

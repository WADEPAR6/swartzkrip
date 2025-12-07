"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Undo,
  Redo
} from 'lucide-react';

interface DocumentEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

/**
 * Editor de texto enriquecido tipo Word
 * Usa TipTap para la edición de documentos oficiales
 */
export default function DocumentEditor({ content, onChange, editable = true }: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: content || '<p>Escriba el contenido del documento aquí...</p>',
    editable,
    immediatelyRender: false, // Fix SSR hydration error
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {editable && (
        <div className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600 p-2 flex flex-wrap gap-1">
          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            title="Deshacer"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            title="Rehacer"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-500 mx-1"></div>

          {/* Formato de texto */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive('bold') ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Negrita"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive('italic') ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Cursiva"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive('underline') ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Subrayado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-500 mx-1"></div>

          {/* Alineación */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Alinear izquierda"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Centrar"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Alinear derecha"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-500 mx-1"></div>

          {/* Listas */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive('bulletList') ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Lista con viñetas"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${
              editor.isActive('orderedList') ? 'bg-slate-300 dark:bg-slate-600' : ''
            }`}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-500 mx-1"></div>

          {/* Encabezados */}
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
              }
            }}
            className="px-2 py-1 rounded text-sm bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500"
          >
            <option value="0">Normal</option>
            <option value="1">Título 1</option>
            <option value="2">Título 2</option>
            <option value="3">Título 3</option>
          </select>
        </div>
      )}

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none dark:prose-invert"
      />
    </div>
  );
}

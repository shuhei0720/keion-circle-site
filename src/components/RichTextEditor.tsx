'use client'

import { useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Undo,
  Redo
} from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '300px' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposingRef = useRef(false)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current && editorRef.current.innerHTML !== value) {
      isUpdatingRef.current = true
      editorRef.current.innerHTML = value || ''
      isUpdatingRef.current = false
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current && !isComposingRef.current && !isUpdatingRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* ツールバー */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="p-2 hover:bg-gray-200 rounded transition"
          title="太字"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="p-2 hover:bg-gray-200 rounded transition"
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded transition"
          title="箇条書き"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded transition"
          title="番号付きリスト"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => applyFormat('undo')}
          className="p-2 hover:bg-gray-200 rounded transition"
          title="元に戻す"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('redo')}
          className="p-2 hover:bg-gray-200 rounded transition"
          title="やり直す"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* エディタ */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onCompositionStart={() => { isComposingRef.current = true }}
          onCompositionEnd={() => { 
            isComposingRef.current = false
            handleInput()
          }}
          className="w-full px-4 py-3 focus:outline-none prose prose-sm max-w-none overflow-auto"
          style={{ minHeight }}
          suppressContentEditableWarning
        />
        {!value && (
          <div className="absolute top-3 left-4 text-gray-400 pointer-events-none select-none">
            {placeholder || 'ここに入力してください...'}
          </div>
        )}
      </div>
    </div>
  )
}


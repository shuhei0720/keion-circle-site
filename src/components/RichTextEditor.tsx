'use client'

import { useRef, useEffect } from 'react'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote 
} from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '300px' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposingRef = useRef(false)
  const isUpdatingRef = useRef(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    // 初期化時のみHTMLを設定
    if (!editorRef.current || initializedRef.current) return
    
    const html = marked(value || '') as string
    editorRef.current.innerHTML = html
    initializedRef.current = true
  }, [])

  const handleInput = () => {
    if (editorRef.current && !isComposingRef.current && !isUpdatingRef.current) {
      const html = editorRef.current.innerHTML
      console.log('HTML:', html)
      const markdown = turndownService.turndown(html)
      console.log('Markdown:', markdown)
      onChange(markdown)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const applyFormat = (format: string) => {
    const selection = window.getSelection()
    if (!selection || !editorRef.current) return

    editorRef.current.focus()
    
    console.log('Applying format:', format)
    let success = false

    switch (format) {
      case 'h1':
        success = document.execCommand('formatBlock', false, '<h1>')
        break
      case 'h2':
        success = document.execCommand('formatBlock', false, '<h2>')
        break
      case 'h3':
        success = document.execCommand('formatBlock', false, '<h3>')
        break
      case 'bold':
        success = document.execCommand('bold', false)
        break
      case 'italic':
        success = document.execCommand('italic', false)
        break
      case 'ul':
        success = document.execCommand('insertUnorderedList', false)
        break
      case 'ol':
        success = document.execCommand('insertOrderedList', false)
        break
      case 'quote':
        success = document.execCommand('formatBlock', false, '<blockquote>')
        break
    }

    console.log('Command success:', success)
    console.log('HTML after command:', editorRef.current.innerHTML)

    setTimeout(() => {
      handleInput()
    }, 0)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* ツールバー */}
      <div className="flex gap-1 p-2 bg-gray-50 border-b">
        <button
          type="button"
          onClick={() => applyFormat('h1')}
          className="p-2 hover:bg-gray-200 rounded"
          title="見出し1"
        >
          <Heading1 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('h2')}
          className="p-2 hover:bg-gray-200 rounded"
          title="見出し2"
        >
          <Heading2 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('h3')}
          className="p-2 hover:bg-gray-200 rounded"
          title="見出し3"
        >
          <Heading3 className="w-5 h-5" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="p-2 hover:bg-gray-200 rounded"
          title="太字"
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="p-2 hover:bg-gray-200 rounded"
          title="斜体"
        >
          <Italic className="w-5 h-5" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => applyFormat('ul')}
          className="p-2 hover:bg-gray-200 rounded"
          title="箇条書き"
        >
          <List className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('ol')}
          className="p-2 hover:bg-gray-200 rounded"
          title="番号付きリスト"
        >
          <ListOrdered className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('quote')}
          className="p-2 hover:bg-gray-200 rounded"
          title="引用"
        >
          <Quote className="w-5 h-5" />
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
          className="w-full px-4 py-3 focus:outline-none prose prose-sm max-w-none"
          style={{ minHeight }}
          suppressContentEditableWarning
          data-placeholder={placeholder || 'ここに入力...'}
        />
        {!value && (
          <div 
            className="absolute top-3 left-4 text-gray-400 pointer-events-none"
            style={{ userSelect: 'none' }}
          >
            {placeholder || 'ここに入力...'}
          </div>
        )}
      </div>
    </div>
  )
}

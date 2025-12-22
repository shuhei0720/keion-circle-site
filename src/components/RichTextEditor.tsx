'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
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

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '300px' }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lines = value.split('\n')
    let currentPos = 0
    let lineIndex = 0

    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= start) {
        lineIndex = i
        break
      }
      currentPos += lines[i].length + 1
    }

    lines[lineIndex] = prefix + lines[lineIndex]
    onChange(lines.join('\n'))
    
    setTimeout(() => {
      textarea.focus()
    }, 0)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* ツールバー */}
      <div className="flex gap-1 p-2 bg-gray-50 border-b">
        <button
          type="button"
          onClick={() => insertAtLineStart('# ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="見出し1"
        >
          <Heading1 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('## ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="見出し2"
        >
          <Heading2 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('### ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="見出し3"
        >
          <Heading3 className="w-5 h-5" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-2 hover:bg-gray-200 rounded"
          title="太字"
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="p-2 hover:bg-gray-200 rounded"
          title="斜体"
        >
          <Italic className="w-5 h-5" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertAtLineStart('- ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="箇条書き"
        >
          <List className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('1. ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="番号付きリスト"
        >
          <ListOrdered className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('> ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="引用"
        >
          <Quote className="w-5 h-5" />
        </button>
      </div>

      {/* プレビュー */}
      <div className="p-4 prose prose-sm max-w-none" style={{ minHeight: minHeight }}>
        {value ? (
          <ReactMarkdown>{value}</ReactMarkdown>
        ) : (
          <p className="text-gray-400">{placeholder || 'ここに入力...'}</p>
        )}
      </div>

      {/* 編集用textarea（下に小さく表示） */}
      <div className="border-t bg-gray-50 p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded text-xs font-mono bg-white"
          rows={4}
          placeholder="または、ここで直接編集..."
        />
      </div>
    </div>
  )
}


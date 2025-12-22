'use client'

import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon } from 'lucide-react'

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string) => void
}

export default function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const buttons = [
    { icon: Heading1, label: '見出し1', before: '# ', after: '' },
    { icon: Heading2, label: '見出し2', before: '## ', after: '' },
    { icon: Heading3, label: '見出し3', before: '### ', after: '' },
    { icon: Bold, label: '太字', before: '**', after: '**' },
    { icon: Italic, label: '斜体', before: '*', after: '*' },
    { icon: List, label: '箇条書き', before: '- ', after: '' },
    { icon: ListOrdered, label: '番号付きリスト', before: '1. ', after: '' },
    { icon: Quote, label: '引用', before: '> ', after: '' },
    { icon: LinkIcon, label: 'リンク', before: '[', after: '](url)' },
  ]

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
      {buttons.map((button) => {
        const Icon = button.icon
        return (
          <button
            key={button.label}
            type="button"
            onClick={() => onInsert(button.before, button.after)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={button.label}
            aria-label={button.label}
          >
            <Icon size={18} className="text-gray-700" />
          </button>
        )
      })}
    </div>
  )
}

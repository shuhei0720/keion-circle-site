'use client'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '300px' }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 focus:outline-none resize-none"
        style={{ minHeight }}
        placeholder={placeholder || 'ここに入力してください...'}
      />
    </div>
  )
}


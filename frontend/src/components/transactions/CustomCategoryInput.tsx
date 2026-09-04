interface CustomCategoryInputProps {
  id: string
  className?: string
  visible: boolean
  value: string
  onChange: (value: string) => void
}

export function CustomCategoryInput({ id, className, visible, value, onChange }: CustomCategoryInputProps) {
  return (
    <input
      type="text"
      id={id}
      className={className}
      placeholder="Digite a categoria"
      maxLength={30}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      hidden={!visible}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

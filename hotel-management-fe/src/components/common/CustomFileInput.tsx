import { cn } from '@/lib/utils'
import * as React from 'react'

interface CustomFileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  inputClassName?: string
  labelClassName?: string
  initialFileName?: string
  onFileChange?: (file: File | null) => void
}

const CustomFileInput = React.forwardRef<HTMLInputElement, CustomFileInputProps>(
  (
    {
      className,
      label,
      labelClassName,
      inputClassName,
      initialFileName = '',
      onFileChange,
      ...props
    },
    ref
  ) => {
    const getFileNameFromUrl = (url: string) => {
      try {
        return url.split('/').pop() || ''
      } catch {
        return ''
      }
    }

    const truncateFileName = (fileName: string, maxLength: number) => {
      const ext = fileName.slice(fileName.lastIndexOf('.'))
      const name = fileName.slice(0, fileName.lastIndexOf('.'))

      if (name.length + ext.length > maxLength) {
        const truncateLength = maxLength - ext.length - 3
        if (truncateLength > 0) {
          const partLength = Math.floor(truncateLength / 2)
          return name.slice(0, partLength) + '...' + name.slice(-partLength) + ext
        }
        return '...' + ext
      }

      return fileName
    }

    const [fileName, setFileName] = React.useState<string>(getFileNameFromUrl(initialFileName))

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null
      setFileName(file ? file.name : '')
      onFileChange?.(file)
    }

    return (
      <div className={cn('flex flex-row items-center gap-[.5em]', className)}>
        <label
          className={cn(
            'btn btn-default cursor-pointer whitespace-nowrap px-4 py-2',
            inputClassName,
            props.disabled && 'cursor-not-allowed hover:!bg-gray hover:!text-black'
          )}
        >
          {label}
          <input type="file" className="hidden" onChange={handleFileChange} ref={ref} {...props} />
        </label>
        <label className={cn('flex flex-col items-start', labelClassName)}>
          {fileName ? truncateFileName(fileName, 20) : 'Chưa chọn tệp'}
        </label>
      </div>
    )
  }
)

CustomFileInput.displayName = 'CustomFileInput'

export default CustomFileInput

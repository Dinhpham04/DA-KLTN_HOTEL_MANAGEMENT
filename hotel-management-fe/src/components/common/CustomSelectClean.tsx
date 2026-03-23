import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TypeSelect {
  isAll?: boolean
  option: Option[]
  selected?: Option
  change?: (e: Option) => void
  customClassMain?: string
  customClassArrow?: string
  customClassDropDown?: string
  disabledSelect?: boolean
}

export interface Option {
  value: string | 'asc' | 'desc'
  label: string
}

const CustomSelectClean: React.FC<TypeSelect> = ({
  isAll = false,
  option,
  change,
  selected,
  customClassMain,
  customClassArrow,
  customClassDropDown,
  disabledSelect,
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>(selected?.value || '')

  const handleSelect = (item: Option) => {
    if (value === item.value && isAll) {
      setValue('')
      change?.({ value: '', label: '---' })
    } else {
      setValue(item.value)
      change?.(item)
    }
    setOpen(false)
  }

  useEffect(() => {
    setValue(selected?.value || '')
  }, [selected?.value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabledSelect}
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between border border-black bg-white py-0 pr-0 text-[1.4rem] hover:bg-[#eeeeee] disabled:cursor-not-allowed disabled:opacity-50',
            customClassMain
          )}
        >
          <span className="flex h-full max-w-[calc(100%-40px)] flex-1 items-center overflow-hidden text-left text-ellipsis">
            {option.find((item) => item.value === value)?.label ||
              (selected?.label && selected.label !== 'null' ? selected.label : null) ||
              '---'}
          </span>
          <div
            className={cn(
              'flex h-full w-[3.2rem] items-center justify-center border-l border-black',
              disabledSelect ? 'cursor-not-allowed bg-white' : 'bg-[#eee]',
              customClassArrow
            )}
          >
            <svg
              className={cn('transition-all duration-300', open && 'rotate-180')}
              width="15"
              height="9"
              viewBox="0 0 14 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Dropdown Arrow</title>
              <path d="M7.05029 7L0.555103 0.249999L13.5455 0.25L7.05029 7Z" fill="black" />
            </svg>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[1111] w-fit min-w-[18rem] bg-white p-0">
        <Command
          className="text-black"
          filter={(commandValue, search) =>
            commandValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandList className={cn(customClassDropDown)}>
            <CommandInput className="text-xl text-black" placeholder="Tìm kiếm tùy chọn" />
            <CommandEmpty className="text-xl text-black">Không tìm thấy dữ liệu</CommandEmpty>
            <CommandGroup className="pr-4" onWheel={(e) => e.stopPropagation()}>
              {option.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => handleSelect(item)}
                  className="flex cursor-pointer py-1 text-black transition-all duration-300 hover:pl-1"
                >
                  <Check
                    className={cn(
                      'mr-2 h-6 w-6',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="max-w-[30rem] overflow-hidden text-ellipsis text-xl">
                    {item.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default CustomSelectClean

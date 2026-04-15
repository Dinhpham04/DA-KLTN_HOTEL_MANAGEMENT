import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CommandItem } from 'cmdk'
import { Check } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

interface TypeSelect {
  isAll?: boolean
  option: Option[]
  selected?: Option
  selectedLabel?: string
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
  selectedLabel,
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
      if (change) {
        change({ value: '', label: '---' })
      }
    } else {
      setValue(item.value)
      if (change) {
        change(item)
      }
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
            'justify-between bg-white hover:bg-[#eeeeee] disabled:opacity-50 py-0 pr-0 border border-black w-full text-[1.4rem] disabled:cursor-not-allowed',
            customClassMain
          )}
        >
          <span className="flex flex-1 items-center max-w-[calc(100%-40px)] h-full overflow-hidden text-left text-ellipsis text-black">
            {selectedLabel ||
              option.find((item) => item.value === value)?.label ||
              (selected?.label && selected.label !== 'null' ? selected.label : null) ||
              '---'}
          </span>
          <div
            className={cn(
              'flex justify-center items-center border-black border-l w-[3.2rem] h-full',
              disabledSelect ? 'bg-white cursor-not-allowed' : 'bg-[#eee]',
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
      <PopoverContent className="z-[1111] bg-white p-0 w-fit min-w-[18rem]">
        <Command
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1
            return 0
          }}
        >
          <CommandList className={cn(customClassDropDown)}>
            <CommandInput className="text-xl" placeholder="Tìm kiếm" />
            <CommandEmpty className="text-xl">Không tìm thấy</CommandEmpty>
            <CommandGroup className="pr-4" onWheel={(e) => e.stopPropagation()}>
              {option &&
                option.length > 0 &&
                option.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => handleSelect(item)}
                    className="flex py-1 hover:pl-1 transition-all duration-300 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 w-6 h-6',
                        value === item.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="max-w-[30rem] overflow-hidden text-xl text-ellipsis">
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

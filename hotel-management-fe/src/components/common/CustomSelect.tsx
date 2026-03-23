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
import * as React from 'react'
import { useEffect, useState } from 'react'

export interface CustomSelectOption {
  id?: number
  value: string
  label: string
}

interface CustomSelectProps {
  option: CustomSelectOption[]
  disable?: boolean
  selected?: string
  change?: (e: CustomSelectOption) => void
  customClassMain?: string
  customClassArrow?: string
  isReselect?: boolean
  hideWhenDetached?: boolean
  collisionBoundary?: HTMLElement | HTMLElement[]
  disabledOptions?: CustomSelectOption[]
}

const CustomSelect = React.forwardRef<HTMLButtonElement, CustomSelectProps>(
  (
    {
      option,
      change,
      selected,
      customClassMain,
      customClassArrow,
      disable,
      isReselect,
      hideWhenDetached,
      collisionBoundary,
      disabledOptions = [],
    },
    ref
  ) => {
    const [open, setOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string>(selected ?? '')

    const handleSelect = (item: CustomSelectOption) => {
      if (disabledOptions?.some((disabledItem) => disabledItem.value === item.value)) {
        return
      }

      if (value === item.value && !isReselect) {
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
      if (selected) {
        setValue(selected)
      } else {
        setValue('')
      }
    }, [selected])

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className={cn(disable && 'cursor-not-allowed')}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              role="combobox"
              aria-expanded={open}
              className={cn(
                'w-full justify-between border border-black py-0 pr-0 text-[1.4rem] text-black bg-white hover:bg-[#eeeeee] hover:text-black',
                customClassMain
              )}
              disabled={disable}
            >
              <span className="flex-1 max-w-[calc(100%-40px)] text-ellipsis text-left overflow-hidden leading-tight">
                {value ? option.find((item) => item.value === value)?.label : '---'}
              </span>
              <div
                className={cn(
                  'flex justify-center items-center bg-[#eee] border-black border-l w-[3.2rem] h-full',
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
        </div>
        <PopoverContent
          className="z-[1111] bg-white p-0 w-fit min-w-[18rem]"
          {...(hideWhenDetached && collisionBoundary
            ? { hideWhenDetached, collisionBoundary }
            : {})}
        >
          <Command
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1
              return 0
            }}
          >
            <CommandList>
              <CommandInput className="text-xl" placeholder="Tìm kiếm..." />
              <CommandEmpty className="text-xl">Không tìm thấy</CommandEmpty>
              <CommandGroup className="pr-4" onWheel={(e) => e.stopPropagation()}>
                {option &&
                  option.length > 0 &&
                  option
                    .filter(
                      (item) =>
                        !disabledOptions?.some((disabledItem) => disabledItem.value === item.value)
                    )
                    .map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => handleSelect(item)}
                        className="flex py-1 hover:pl-1 transition-[padding] duration-300 cursor-pointer"
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
)
CustomSelect.displayName = 'CustomSelect'

export default CustomSelect

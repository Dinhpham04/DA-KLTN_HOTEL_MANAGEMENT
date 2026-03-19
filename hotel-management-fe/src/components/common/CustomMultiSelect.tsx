import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, XIcon } from 'lucide-react'
import * as React from 'react'

const multiSelectVariants = cva(
  'm-[.4rem] bg-gray px-[1rem] py-[.2rem] text-[1.4rem] text-black transition duration-300 delay-150 hover:text-white',
  {
    variants: {
      variant: {
        default: 'border-foreground/10 bg-card text-foreground hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface CustomMultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof multiSelectVariants> {
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  onValueChange: (value: string[]) => void
  defaultValue: string[]
  placeholder?: string
  animation?: number
  maxCount?: number
  modalPopover?: boolean
  asChild?: boolean
  className?: string
  classIconName?: string
  hideWhenDetached?: boolean
  selectFull?: boolean
  collisionBoundary?: HTMLElement | HTMLElement[]
  hiddenSelectAll?: boolean
}

export const CustomMultiSelect = React.forwardRef<
  HTMLButtonElement,
  CustomMultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      className,
      classIconName,
      hideWhenDetached,
      collisionBoundary,
      hiddenSelectAll = false,
      selectFull = false,
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    React.useEffect(() => {
      setSelectedValues(defaultValue)
    }, [defaultValue])

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const toggleOption = (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const handleClear = () => {
      setSelectedValues([])
      onValueChange([])
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear()
      } else {
        const allValues = options.map((option) => option.value)
        setSelectedValues(allValues)
        onValueChange(allValues)
      }
    }

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <div className={cn(selectFull && 'w-full', props.disabled && 'cursor-not-allowed')}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...props}
              onClick={handleTogglePopover}
              className={cn(
                'h-auto min-h-10 w-full items-stretch justify-between rounded-md border border-black bg-inherit p-0 text-[1.4rem] hover:bg-inherit',
                className,
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex w-full items-stretch justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-0 overflow-hidden">
                    {selectedValues.slice(0, maxCount).map((value) => {
                      const option = options.find((o) => o.value === value)
                      const IconComponent = option?.icon

                      return (
                        <Badge
                          key={value}
                          className={cn(
                            'max-w-full flex-shrink-0 overflow-hidden font-[500]',
                            multiSelectVariants({ variant }),
                          )}
                          style={{ animationDuration: `${animation}s` }}
                        >
                          {IconComponent && <IconComponent className="mr-2 h-[1.6rem] w-[1.6rem]" />}
                          <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-black">
                            {option?.label}
                          </span>
                        </Badge>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <XIcon
                      className="h-[1.6rem] cursor-pointer text-muted-foreground"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleClear()
                      }}
                    />
                    <Separator orientation="vertical" className="flex h-full min-h-6 w-[.1rem]" />
                    <div
                      className={cn(
                        'flex h-full w-[3.2rem] items-center justify-center border-l border-black bg-[#eee]',
                        classIconName,
                      )}
                    >
                      <svg
                        className="transition-all duration-300"
                        width="15"
                        height="9"
                        viewBox="0 0 14 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Dropdown Arrow</title>
                        <path
                          d="M7.05029 7L0.555103 0.249999L13.5455 0.25L7.05029 7Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex h-full w-full items-stretch justify-between">
                  <span className="m-[.4rem] flex items-center py-[.2rem] text-[1.4rem] text-black">
                    {placeholder}
                  </span>
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'flex h-full w-[3.2rem] items-center justify-center border-l border-black bg-[#eee]',
                        classIconName,
                      )}
                    >
                      <svg
                        className="transition-all duration-300"
                        width="15"
                        height="9"
                        viewBox="0 0 14 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Dropdown Arrow</title>
                        <path
                          d="M7.05029 7L0.555103 0.249999L13.5455 0.25L7.05029 7Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          className="z-[1111] w-fit max-w-[30rem] bg-white p-0"
          align="start"
          side="bottom"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
          {...(hideWhenDetached && collisionBoundary
            ? { hideWhenDetached, collisionBoundary }
            : {})}
        >
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput
              className="text-[1.4rem]"
              placeholder="検索オプション"
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty className="flex py-1 text-[1.4rem]">見つかりません</CommandEmpty>
              <CommandGroup className="pr-4">
                {!hiddenSelectAll && (
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="flex cursor-pointer py-1 text-[1.4rem]"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-[1.4rem] w-[1.4rem]',
                        selectedValues.length === options.length ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span>(すべて選択)</span>
                  </CommandItem>
                )}
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="flex cursor-pointer py-1 text-[1.4rem]"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-[1.4rem] w-[1.4rem]',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup className="pr-4">
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 cursor-pointer justify-center text-center text-[1.4rem]"
                      >
                        クリア
                      </CommandItem>
                      <Separator orientation="vertical" className="flex h-full min-h-6" />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 cursor-pointer justify-center text-center text-[1.4rem]"
                  >
                    閉じる
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)

CustomMultiSelect.displayName = 'CustomMultiSelect'

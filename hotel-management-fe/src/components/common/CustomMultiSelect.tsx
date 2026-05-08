import { CustomCheckbox } from '@/components/common/CustomCheckbox'
import { CustomTooltipTruncate } from '@/components/common/CustomToolTipTruncate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import { CommandItem } from 'cmdk'
import { XIcon } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

const multiSelectVariants = cva(
  'bg-gray m-[.4rem] px-[1rem] py-[.2rem] text-[1.4rem] text-black hover:text-white transition duration-300 delay-150',
  {
    variants: {
      variant: {
        default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary: 'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
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

export const CustomMultiSelect = React.forwardRef<HTMLButtonElement, CustomMultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder,
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
    ref
  ) => {
    const { t } = useTranslation()
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const placeholderText = placeholder ?? t('common.selectOptions')

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
                'flex justify-between items-stretch bg-inherit hover:bg-inherit p-0 border border-black rounded-md w-full h-auto min-h-10 text-[1.4rem]',
                className
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex justify-between items-stretch w-full">
                  <div className="flex flex-1 items-center gap-0 min-w-0 overflow-hidden">
                    {selectedValues.slice(0, maxCount).map((value) => {
                      const option = options.find((o) => o.value === value)
                      const IconComponent = option?.icon
                      return (
                        <Badge
                          key={value}
                          className={cn(
                            'flex-shrink-0 w-fit max-w-full overflow-hidden font-[500]',
                            multiSelectVariants({ variant })
                          )}
                          style={{ animationDuration: `${animation}s` }}
                        >
                          {IconComponent && (
                            <IconComponent className="mr-2 w-[1.6rem] h-[1.6rem]" />
                          )}
                          <div className="relative overflow-hidden text-ellipsis whitespace-nowrap">
                            <CustomTooltipTruncate
                              className="h-full text-black --radix-tooltip-content-available-height: 100%"
                              text={option?.label}
                              trigger={
                                <span className="inline-block max-w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
                                  {option?.label}
                                </span>
                              }
                            />
                          </div>
                        </Badge>
                      )
                    })}
                  </div>
                  <div className="flex justify-between items-center">
                    <XIcon
                      className="h-[1.6rem] text-muted-foreground cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleClear()
                      }}
                    />
                    <Separator orientation="vertical" className="flex w-[.1rem] h-full min-h-6" />
                    <div
                      className={cn(
                        'flex justify-center items-center bg-[#eee] border-black border-l w-[3.2rem] h-full',
                        classIconName
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
                <div className="flex justify-between items-stretch mx-auto w-full h-full">
                  <span className="flex items-center m-[.4rem] py-[.2rem] text-[1.4rem] text-black">
                    {placeholderText}
                  </span>
                  <div className="flex justify-between items-center">
                    <div
                      className={cn(
                        'flex justify-center items-center bg-[#eee] border-black border-l w-[3.2rem] h-full',
                        classIconName
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
          className="z-[1111] bg-white p-0 w-fit max-w-[30rem]"
          align="start"
          side="bottom"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
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
            <CommandInput
              className="text-[1.4rem]"
              placeholder={t('common.searchOptions')}
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty className="flex py-1 text-[1.4rem]">
                {t('common.noResults')}
              </CommandEmpty>
              <CommandGroup className="pr-4">
                {!hiddenSelectAll && (
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="flex py-1 text-[1.4rem] cursor-pointer"
                  >
                    <CustomCheckbox
                      checked={selectedValues.length === options.length}
                      className="mr-1 w-[1.6rem] sm:w-[1.6rem] h-[1.6rem] sm:h-[1.6rem] transition-none"
                      classIcon="h-[1.4rem] w-[1.4rem] sm:h-[1.4rem] sm:w-[1.4rem]"
                    />
                    <span>{t('common.selectAll')}</span>
                  </CommandItem>
                )}
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="flex py-1 text-[1.4rem] cursor-pointer"
                    >
                      <CustomCheckbox
                        checked={isSelected}
                        className="mr-1 w-[1.6rem] sm:w-[1.6rem] h-[1.6rem] sm:h-[1.6rem] transition-none"
                        classIcon="h-[1.4rem] w-[1.4rem] sm:h-[1.4rem] sm:w-[1.4rem]"
                      />
                      {option.icon && (
                        <option.icon className="mr-2 w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup className="pr-4">
                <div className="flex justify-between items-center">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center text-[1.4rem] text-center cursor-pointer"
                      >
                        {t('common.clear')}
                      </CommandItem>
                      <Separator orientation="vertical" className="flex h-full min-h-6" />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center max-w-full text-[1.4rem] text-center cursor-pointer"
                  >
                    {t('common.close')}
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

CustomMultiSelect.displayName = 'CustomMultiSelect'

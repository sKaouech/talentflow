import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn("relative inline-block text-left", className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)
  
  return (
    <div onClick={() => setIsOpen(!isOpen)}>
      {children}
    </div>
  )
}

export function DropdownMenuContent({ 
  children, 
  className, 
  align = "start" 
}: DropdownMenuContentProps) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)
  
  if (!isOpen) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 z-10" 
        onClick={() => setIsOpen(false)} 
      />
      <div
        className={cn(
          "absolute z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
          align === "end" && "right-0",
          align === "center" && "left-1/2 transform -translate-x-1/2",
          className
        )}
      >
        <div className="py-1">
          {children}
        </div>
      </div>
    </>
  )
}

export function DropdownMenuItem({ 
  children, 
  className, 
  onClick 
}: DropdownMenuItemProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext)
  
  const handleClick = () => {
    onClick?.()
    setIsOpen(false)
  }
  
  return (
    <button
      className={cn(
        "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

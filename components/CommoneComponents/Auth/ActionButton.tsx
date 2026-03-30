import { Button } from "@/components/ui/button"

const ActionButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button type="submit" variant="outline" className="w-full">
      {children}
    </Button>
  )
}

export default ActionButton

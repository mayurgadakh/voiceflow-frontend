import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>The page you are looking for does not exist or has moved.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/">Go to home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

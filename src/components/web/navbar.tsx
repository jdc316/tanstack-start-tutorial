import { Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { data: session, isPending } = authClient.useSession()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSignout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Signed out succesfully')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            className="size-9"
            src="https://tanstack.com/images/logos/logo-color-600.png"
            alt="TanStackStartLogo"
          ></img>
          <h1 className="text-lg font-semibold">Tanstack Start</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isPending || !isMounted ? null : session ? (
            <>
              <Button
                className={buttonVariants({ variant: 'secondary' })}
                onClick={handleSignout}
              >
                Logout
              </Button>
              <Link className={buttonVariants()} to="/dashboard">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Login
              </Link>
              <Link to="/signup" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

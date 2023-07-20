'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useChat } from 'ai/react'
import { X, Loader, User, Frown, CornerDownLeft, Search, Wand } from 'lucide-react'

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const onFinish = () => {
    console.log('done')
    setDone(true)
  }

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/vector-search',
    onFinish,
  })

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen(true)
      }

      if (e.key === 'Escape') {
        console.log('esc')
        handleModalToggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  function handleModalToggle() {
    setOpen(!open)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-base flex gap-2 items-center px-4 py-2 z-50 relative
        text-slate-500 dark:text-slate-400  hover:text-slate-700 dark:hover:text-slate-300
        transition-colors
        rounded-md
        border border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-500
        min-w-[300px] "
      >
        <Search width={15} />
        <span className="border border-l h-5"></span>
        <span className="inline-block ml-4">Search...</span>
        <kbd
          className="absolute right-3 top-2.5
          pointer-events-none inline-flex h-5 select-none items-center gap-1
          rounded border border-slate-100 bg-slate-100 px-1.5
          font-mono text-[10px] font-medium
          text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400
          opacity-100 "
        >
          <span className="text-xs">⌘</span>K
        </kbd>{' '}
      </button>
      <Dialog open={open}>
        <DialogContent className="sm:max-w-xl md:max-w-4xl text-black">
          <DialogHeader>
            <DialogTitle>Ask a legal question ⚖️</DialogTitle>
            <DialogDescription>
              Note: currently based on <span className="font-semibold">landlord-tenant</span>,{' '}
              <span className="font-semibold">employment</span>, and{' '}
              <span className="font-semibold">labour</span> law in{' '}
              <span className="font-semibold">New Brunswick</span>. More to come!
            </DialogDescription>
            <hr />
            <button className="absolute top-0 right-2 p-2" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 dark:text-gray-100" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 text-slate-700">
              {input && (
                <div className="flex gap-4">
                  <span className="bg-slate-100 dark:bg-slate-300 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                    <User width={18} />{' '}
                  </span>
                  <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-100">{input}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-4">
                  <span className="bg-red-100 p-2 w-8 h-8 rounded-full text-center flex items-center justify-center">
                    <Frown width={18} />
                  </span>
                  <span className="text-slate-700 dark:text-slate-100">
                    Sad news, the search has failed! Please try again.
                  </span>
                </div>
              )}

              {messages.length > 0 && !error ? (
                <div className="items-start gap-6 dark:text-white overflow-y-scroll max-h-44 py-2">
                  {messages.length > 0
                    ? messages.map((m) => (
                        <div key={m.id} className="whitespace-pre-wrap py-4">
                          {m.role === 'user' ? (
                            <span className="font-bold">Me: </span>
                          ) : (
                            <span className="font-bold">Reso Legal: </span>
                          )}
                          {m.content}
                        </div>
                      ))
                    : null}
                  {done && !isLoading && (
                    <div className="flex items-center gap-4 text-slate-200">Citations:</div>
                  )}
                </div>
              ) : null}

              {isLoading && (
                <div className="animate-spin relative flex w-5 h-5 ml-2">
                  <Loader />
                </div>
              )}

              <div className="relative">
                <Input
                  placeholder="Ask a question..."
                  name="search"
                  value={input}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
                <CornerDownLeft
                  className={`absolute top-3 right-5 h-4 w-4 text-gray-300 transition-opacity ${
                    input ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              <h2 className="text-xl text-gray-500 dark:text-gray-100">Example questions:</h2>
              <div className="text-sm text-gray-500 dark:text-gray-100">
                <button
                  type="button"
                  className="px-1.5 py-0.5
                  bg-slate-50 dark:bg-gray-500
                  hover:bg-slate-100 dark:hover:bg-gray-600
                  rounded border border-slate-200 dark:border-slate-600
                  transition-colors"
                  onClick={(_) =>
                    setInput('Does my landlord have to give me notice to enter my apartment?')
                  }
                >
                  Does my landlord have to give me notice to enter my apartment?
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-100">
                <button
                  type="button"
                  className="px-1.5 py-0.5
                  bg-slate-50 dark:bg-gray-500
                  hover:bg-slate-100 dark:hover:bg-gray-600
                  rounded border border-slate-200 dark:border-slate-600
                  transition-colors"
                  onClick={(_) =>
                    setInput('Are there protections against discrimination for tenants?')
                  }
                >
                  Are there protections against discrimination for tenants?
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-100">
                <button
                  type="button"
                  className="px-1.5 py-0.5
                  bg-slate-50 dark:bg-gray-500
                  hover:bg-slate-100 dark:hover:bg-gray-600
                  rounded border border-slate-200 dark:border-slate-600
                  transition-colors"
                  onClick={(_) =>
                    setInput('What is severance pay in lieu of notice of termination from a job?')
                  }
                >
                  What is severance pay in lieu of notice of termination from a job?
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-100">
                <button
                  type="button"
                  className="px-1.5 py-0.5
                  bg-slate-50 dark:bg-gray-500
                  hover:bg-slate-100 dark:hover:bg-gray-600
                  rounded border border-slate-200 dark:border-slate-600
                  transition-colors"
                  onClick={(_) => setInput('How can I unionize my workplace?')}
                >
                  How can I unionize my workplace?
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-red-500">
                Ask
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
